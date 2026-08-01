import { getDatabase } from '../database';
import { User } from '../types';
import { buildUpdateQuery } from '../helpers';
import { dbTimestamp } from '../../utils/formatters';

export const userRepo = {
  async create(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO users (name, email, avatar, currency) VALUES (?, ?, ?, ?)`,
      data.name, data.email ?? null, data.avatar ?? null, data.currency
    );
    return { ...data, id: result.lastInsertRowId, created_at: dbTimestamp() };
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
    const result = buildUpdateQuery(data, ['name', 'email', 'avatar', 'currency']);
    if (!result) return;
    await db.runAsync(`UPDATE users SET ${result.sets} WHERE id = ?`, ...result.values, id);
  },
};
