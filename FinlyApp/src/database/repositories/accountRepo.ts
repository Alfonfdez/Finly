import { and, eq, inArray, ne, sql, type SQL } from 'drizzle-orm';
import { getDrizzle, withTransaction } from '../drizzle/engine';
import { accounts, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { Account } from '../types';
import { accountSchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { deleteTransactionPhotos } from '../photoCleanup';
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
    await deleteTransactionPhotos('account_id', id);
    await withTransaction(async (db) => {
      await db.delete(transactions).where(eq(transactions.account_id, id)).run();
      await db.delete(accounts).where(and(eq(accounts.id, id), eq(accounts.is_total, 0))).run();
    });
  },

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await deleteTransactionPhotos('account_id', ...ids);
    await withTransaction(async (db) => {
      await db.delete(transactions).where(inArray(transactions.account_id, ids)).run();
      await db.delete(accounts).where(and(inArray(accounts.id, ids), eq(accounts.is_total, 0))).run();
    });
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
    const db = await getDrizzle();
    const conditions: SQL[] = [sql`LOWER(${accounts.name}) = LOWER(${name})`, eq(accounts.user_id, userId)];
    if (excludeId !== undefined) conditions.push(ne(accounts.id, excludeId));
    const rows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(accounts)
      .where(and(...conditions))
      .all();
    return (rows[0]?.count ?? 0) > 0;
  },
};
