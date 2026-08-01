import { getDatabase } from '../database';
import { Category } from '../types';
import { TransactionType } from '../../constants/types';
import { buildUpdateQuery } from '../helpers';
import { dbTimestamp } from '../../utils/formatters';

export const categoryRepo = {
  async list(userId: number, type?: TransactionType): Promise<Category[]> {
    const db = getDatabase();
    if (type) {
      return await db.getAllAsync<Category>(
        `SELECT * FROM categories WHERE user_id = ? AND type = ? ORDER BY name`,
        userId, type
      );
    }
    return await db.getAllAsync<Category>(
      `SELECT * FROM categories WHERE user_id = ? ORDER BY name`,
      userId
    );
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
    await db.runAsync(`DELETE FROM categories WHERE id = ?`, id);
  },

  async deleteAll(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM categories');
  },

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    let sql = `SELECT COUNT(*) as count FROM categories WHERE LOWER(name) = LOWER(?)`;
    const params: (string | number)[] = [name];
    if (excludeId !== undefined) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
    return (result?.count ?? 0) > 0;
  },
};
