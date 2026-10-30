import { and, eq, inArray, sql } from 'drizzle-orm';
import { getDrizzle, withTransaction, type DrizzleDb } from '../drizzle/engine';
import { categories, recurringRules, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { Category } from '../types';
import type { TransactionType } from '../../constants/types';
import { categorySchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { collectTransactionPhotos, deleteUnreferencedPhotoUris } from '../photoCleanup';
import { serializeWrites } from '../transactionQueue';
import { dbTimestamp } from '../../utils/formatters';
import { existsByName, pickDefined } from './repoHelpers';

async function moveCategoryData(
  db: DrizzleDb,
  categoryIds: number[],
  targetId: number,
): Promise<void> {
  await db
    .update(transactions)
    .set({ category_id: targetId })
    .where(inArray(transactions.category_id, categoryIds))
    .run();
  // Recurring rules are the template for the category's future transactions, so
  // moving the data must move them too (otherwise the CASCADE deletes them).
  await db
    .update(recurringRules)
    .set({ category_id: targetId })
    .where(inArray(recurringRules.category_id, categoryIds))
    .run();
}

async function deleteCategoryRows(db: DrizzleDb, categoryIds: number[]): Promise<void> {
  await db.delete(categories).where(inArray(categories.id, categoryIds)).run();
}

async function deleteCategoryData(db: DrizzleDb, categoryIds: number[]): Promise<void> {
  await db.delete(transactions).where(inArray(transactions.category_id, categoryIds)).run();
  await deleteCategoryRows(db, categoryIds);
}

const categoryRepoBase = {
  async list(userId: number, type?: TransactionType): Promise<Category[]> {
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.user_id, userId),
          type !== undefined ? eq(categories.type, type) : undefined,
        ),
      )
      .orderBy(sql`name COLLATE NOCASE`)
      .all();
    return parseRows(categorySchema, 'categories', rows);
  },

  async getById(id: number): Promise<Category | null> {
    const db = await getDrizzle();
    const row = await db.select().from(categories).where(eq(categories.id, id)).get();
    return parseRowOrNull(categorySchema, 'categories', row);
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
    const set = pickDefined(data, ['name', 'icon', 'color', 'type']);
    if (Object.keys(set).length === 0) return;
    await db.update(categories).set(set).where(eq(categories.id, id)).run();
  },

  async delete(id: number): Promise<void> {
    const uris = await collectTransactionPhotos('category_id', id);
    await withTransaction(async (db) => {
      await deleteCategoryData(db, [id]);
    });
    await deleteUnreferencedPhotoUris(uris);
  },

  async reassignAndDelete(oldCategoryId: number, newCategoryId: number): Promise<void> {
    await withTransaction(async (db) => {
      await moveCategoryData(db, [oldCategoryId], newCategoryId);
      await deleteCategoryRows(db, [oldCategoryId]);
    });
  },

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const uris = await collectTransactionPhotos('category_id', ...ids);
    await withTransaction(async (db) => {
      await deleteCategoryData(db, ids);
    });
    await deleteUnreferencedPhotoUris(uris);
  },

  async reassignManyAndDelete(ids: number[], targetId: number): Promise<void> {
    if (ids.length === 0) return;
    await withTransaction(async (db) => {
      await moveCategoryData(db, ids, targetId);
      await deleteCategoryRows(db, ids);
    });
  },

  async bulkDeleteWithTargets(items: { id: number; targetId: number | null }[]): Promise<void> {
    if (items.length === 0) return;
    const deleteIds = items.filter((item) => item.targetId === null).map((item) => item.id);
    let uris: string[] = [];
    if (deleteIds.length > 0) {
      uris = await collectTransactionPhotos('category_id', ...deleteIds);
    }
    await withTransaction(async (db) => {
      for (const item of items) {
        if (item.targetId !== null) {
          await moveCategoryData(db, [item.id], item.targetId);
        }
      }
      await deleteCategoryRows(db, items.map((item) => item.id));
    });
    await deleteUnreferencedPhotoUris(uris);
  },

  async deleteAll(): Promise<void> {
    const db = await getDrizzle();
    await db.delete(categories).run();
  },

  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    return existsByName(
      categories,
      { name: categories.name, userId: categories.user_id, id: categories.id },
      userId,
      name,
      excludeId,
    );
  },
};

export const categoryRepo = serializeWrites(categoryRepoBase, ['create', 'update', 'deleteAll']);
