import { getDatabase } from '../database';
import { User } from '../types';

export const userRepo = {
  async create(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO users (name, email, avatar, currency) VALUES (?, ?, ?, ?)`,
      data.name, data.email ?? null, data.avatar ?? null, data.currency
    );
    return { ...data, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async getById(id: number): Promise<User | null> {
    const db = getDatabase();
    return await db.getFirstAsync<User>(
      `SELECT * FROM users WHERE id = ?`,
      id
    );
  },

  async update(id: number, data: Partial<Omit<User, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email); }
    if (data.avatar !== undefined) { fields.push('avatar = ?'); values.push(data.avatar); }
    if (data.currency !== undefined) { fields.push('currency = ?'); values.push(data.currency); }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  },
};
