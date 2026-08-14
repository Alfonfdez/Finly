import { and, eq, ne, sql } from 'drizzle-orm';
import { getDrizzle, withTransaction } from '../drizzle/engine';
import { categories, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { Category } from '../types';
import type { TransactionType } from '../../constants/types';
import { categorySchema } from '../schemas';
import { parseRows } from '../validate';
import { deleteTransactionPhotos } from '../photoCleanup';
import { dbTimestamp } from '../../utils/formatters';

export const categoryRepo = {
  async list(userId: number, type?: TransactionType): Promise<Category[]> {
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.user_id, userId),
          type !== undefined ? eq(categories.type, type) : undefined
        )
      )
      .orderBy(sql`name COLLATE NOCASE`)
      .all();
    return parseRows(categorySchema, 'categories', rows);
  },

  async create(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const db = await getDrizzle();
    const result = await db
      .insert(categories)
      .values({
        user_id: data.user_id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        type: data.type,
      })
      .run();
    return { ...data, id: runResultOf(result).lastInsertRowId, created_at: dbTimestamp() };
  },

  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDrizzle();
    const set: Partial<typeof categories.$inferInsert> = {};
    if (data.name !== undefined) set.name = data.name;
    if (data.icon !== undefined) set.icon = data.icon;
    if (data.color !== undefined) set.color = data.color;
    if (data.type !== undefined) set.type = data.type;
    if (Object.keys(set).length === 0) return;
    await db.update(categories).set(set).where(eq(categories.id, id)).run();
  },

  async delete(id: number): Promise<void> {
    await deleteTransactionPhotos('category_id = ?', id);
    await withTransaction(async (db) => {
      await db.delete(transactions).where(eq(transactions.category_id, id)).run();
      await db.delete(categories).where(eq(categories.id, id)).run();
    });
  },

  async reassignAndDelete(oldCategoryId: number, newCategoryId: number): Promise<void> {
    await withTransaction(async (db) => {
      await db
        .update(transactions)
        .set({ category_id: newCategoryId })
        .where(eq(transactions.category_id, oldCategoryId))
        .run();
      await db.delete(categories).where(eq(categories.id, oldCategoryId)).run();
    });
  },

  async deleteAll(): Promise<void> {
    const db = await getDrizzle();
    await db.delete(categories).run();
  },

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const db = await getDrizzle();
    const conditions: unknown[] = [sql`LOWER(${categories.name}) = LOWER(${name})`];
    if (excludeId !== undefined) conditions.push(ne(categories.id, excludeId));
    const rows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(categories)
      .where(and(...(conditions as Parameters<typeof and>[0][])))
      .all();
    return (rows[0]?.count ?? 0) > 0;
  },
};
