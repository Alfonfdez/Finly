import { getDatabase } from '../database';
import { Category } from '../types';
import { TransactionType } from '../../constants/types';

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
    return { ...data, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM categories WHERE id = ?`, id);
  },
};
