import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDrizzle, withTransaction } from '../drizzle/engine';
import { accounts, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { Account } from '../types';
import { accountSchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { existsByName } from './repoHelpers';
import { collectTransactionPhotos, deletePhotoUris } from '../photoCleanup';
import { dbTimestamp } from '../../utils/formatters';
import { TRANSACTION_TYPES } from '../../constants/types';

export const accountRepo = {
  async list(userId: number): Promise<Account[]> {
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.user_id, userId))
      .orderBy(sql`is_total DESC, name COLLATE NOCASE`)
      .all();
    return parseRows(accountSchema, 'accounts', rows);
  },

  async create(data: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
    const db = await getDrizzle();
    const result = await db
      .insert(accounts)
      .values({
        user_id: data.user_id,
        name: data.name,
        initial_balance: data.initial_balance,
        icon: data.icon,
        color: data.color,
        description: data.description ?? '',
        is_total: data.is_total ?? 0,
      })
      .run();
    return { ...data, id: runResultOf(result).lastInsertRowId, created_at: dbTimestamp() };
  },

  async getById(id: number): Promise<Account | null> {
    const db = await getDrizzle();
    const row = await db.select().from(accounts).where(eq(accounts.id, id)).get();
    return parseRowOrNull(accountSchema, 'accounts', row);
  },

  async update(id: number, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDrizzle();
    const set: Partial<typeof accounts.$inferInsert> = {};
    if (data.name !== undefined) set.name = data.name;
    if (data.initial_balance !== undefined) set.initial_balance = data.initial_balance;
    if (data.icon !== undefined) set.icon = data.icon;
    if (data.color !== undefined) set.color = data.color;
    if (data.description !== undefined) set.description = data.description;
    if (Object.keys(set).length === 0) return;
    await db.update(accounts).set(set).where(eq(accounts.id, id)).run();
  },

  async delete(id: number): Promise<void> {
    const uris = await withTransaction(async (db) => {
      // Guard before touching the linked rows: deleting the pseudo-total account
      // must never delete its transactions (the account itself is not deletable).
      const account = await db
        .select({ is_total: accounts.is_total })
        .from(accounts)
        .where(eq(accounts.id, id))
        .get();
      if (!account || account.is_total === 1) return [];
      const photos = await collectTransactionPhotos('account_id', id);
      await db.delete(transactions).where(eq(transactions.account_id, id)).run();
      await db.delete(accounts).where(eq(accounts.id, id)).run();
      return photos;
    });
    await deletePhotoUris(uris);
  },

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const uris = await withTransaction(async (db) => {
      const rows = await db
        .select({ id: accounts.id })
        .from(accounts)
        .where(and(inArray(accounts.id, ids), eq(accounts.is_total, 0)))
        .all();
      const deletable = rows.map(row => row.id);
      if (deletable.length === 0) return [];
      const photos = await collectTransactionPhotos('account_id', ...deletable);
      await db.delete(transactions).where(inArray(transactions.account_id, deletable)).run();
      await db.delete(accounts).where(inArray(accounts.id, deletable)).run();
      return photos;
    });
    await deletePhotoUris(uris);
  },

  async deleteAll(): Promise<void> {
    const db = await getDrizzle();
    await db.delete(accounts).run();
  },

  async getBalances(): Promise<{ account_id: number; balance: number }[]> {
    const db = await getDrizzle();
    return await db
      .select({
        account_id: accounts.id,
        balance: sql<number>`${accounts.initial_balance} + COALESCE(SUM(CASE WHEN ${transactions.type} = ${TRANSACTION_TYPES.income} THEN ${transactions.amount} ELSE -${transactions.amount} END), 0)`,
      })
      .from(accounts)
      .leftJoin(transactions, eq(transactions.account_id, accounts.id))
      .where(eq(accounts.is_total, 0))
      .groupBy(accounts.id)
      .orderBy(accounts.id)
      .all();
  },

  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    return existsByName(
      accounts,
      { name: accounts.name, userId: accounts.user_id, id: accounts.id },
      userId,
      name,
      excludeId,
    );
  },
};
