import { getDatabase } from '../database';
import { Tag } from '../types';
import { buildUpdateQuery } from '../helpers';
import { dbTimestamp } from '../../utils/formatters';

export const tagRepo = {
  async list(userId: number): Promise<Tag[]> {
    const db = getDatabase();
    return await db.getAllAsync<Tag>(
      `SELECT * FROM tags WHERE user_id = ? ORDER BY id`,
      userId
    );
  },

  async create(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO tags (user_id, name) VALUES (?, ?)`,
      data.user_id, data.name
    );
    return { ...data, id: result.lastInsertRowId, created_at: dbTimestamp() };
  },

  async update(id: number, data: Partial<Omit<Tag, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const result = buildUpdateQuery(data, ['name']);
    if (!result) return;
    await db.runAsync(`UPDATE tags SET ${result.sets} WHERE id = ?`, ...result.values, id);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM tags WHERE id = ?`, id);
  },

  async deleteAll(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM tags');
  },

  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    let sql = `SELECT COUNT(*) as count FROM tags WHERE user_id = ? AND LOWER(name) = LOWER(?)`;
    const params: (string | number)[] = [userId, name];
    if (excludeId !== undefined) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
    return (result?.count ?? 0) > 0;
  },

  async getByTransactionIds(transactionIds: number[]): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
    if (transactionIds.length === 0) return [];
    const db = getDatabase();
    const placeholders = transactionIds.map(() => '?').join(',');
    return await db.getAllAsync<{ transaction_id: number; tag_id: number; name: string }>(
      `SELECT tt.transaction_id, tt.tag_id, t.name
       FROM transaction_tags tt
       INNER JOIN tags t ON tt.tag_id = t.id
       WHERE tt.transaction_id IN (${placeholders})`,
      ...transactionIds
    );
  },
};
