import { getDatabase } from '../database';
import type { Category } from '../types';
import type { TransactionType } from '../../constants/types';
import { categorySchema } from '../schemas';
import { parseRows } from '../validate';
import { buildUpdateQuery, buildNameExistsQuery } from '../helpers';
import { deleteTransactionPhotos } from '../photoCleanup';
import { dbTimestamp } from '../../utils/formatters';

export const categoryRepo = {
  async list(userId: number, type?: TransactionType): Promise<Category[]> {
    const db = getDatabase();
    const rows = type
      ? await db.getAllAsync(
          `SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY name COLLATE NOCASE`,
          userId, type
        )
      : await db.getAllAsync(
          `SELECT * FROM categories WHERE user_id = ? ORDER BY name COLLATE NOCASE`,
          userId
        );
    return parseRows(categorySchema, 'categories', rows);
  },

  async create(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO categories (user_id, name, icon, color, type) VALUES (?, ?, ?, ?, ?)`,
      data.user_id, data.name, data.icon, data.color, data.type
    );
    return { ...data, id: result.lastInsertRowId, created_at: dbTimestamp() };
  },

  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const result = buildUpdateQuery(data, ['name', 'icon', 'color', 'type']);
    if (!result) return;
    await db.runAsync(`UPDATE categories SET ${result.sets} WHERE id = ?`, ...result.values, id);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await deleteTransactionPhotos('category_id = ?', id);
    await db.withTransactionAsync(async () => {
      await db.runAsync(`DELETE FROM transactions WHERE category_id = ?`, id);
      await db.runAsync(`DELETE FROM categories WHERE id = ?`, id);
    });
  },

  async reassignAndDelete(oldCategoryId: number, newCategoryId: number): Promise<void> {
    const db = getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE transactions SET category_id = ? WHERE category_id = ?`, newCategoryId, oldCategoryId);
      await db.runAsync(`DELETE FROM categories WHERE id = ?`, oldCategoryId);
    });
  },

  async deleteAll(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM categories');
  },

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    const { sql, params } = buildNameExistsQuery('categories', name, { excludeId });
    const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
    return (result?.count ?? 0) > 0;
  },
};
