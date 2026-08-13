import { getDatabase } from '../database';
import type { Tag } from '../types';
import { tagSchema } from '../schemas';
import { parseRows } from '../validate';
import { buildUpdateQuery, buildNameExistsQuery } from '../helpers';
import { dbTimestamp } from '../../utils/formatters';

export const tagRepo = {
  async list(userId: number): Promise<Tag[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync(
      `SELECT * FROM tags WHERE user_id = ? ORDER BY id`,
      userId
    );
    return parseRows(tagSchema, 'tags', rows);
  },

  async create(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO tags (user_id, name) VALUES (?, ?)`,
      data.user_id, data.name
    );
    return { ...data, id: result.lastInsertRowId, created_at: dbTimestamp() };
  },

  async update(id: number, data: Partial<Omit<Tag, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDatabase();
    const result = buildUpdateQuery(data, ['name']);
    if (!result) return;
    await db.runAsync(`UPDATE tags SET ${result.sets} WHERE id = ?`, ...result.values, id);
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM tags WHERE id = ?`, id);
  },

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDatabase();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(`DELETE FROM tags WHERE id IN (${placeholders})`, ...ids);
  },

  async deleteAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tags');
  },

  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    const db = await getDatabase();
    const { sql, params } = buildNameExistsQuery('tags', name, { userId, excludeId });
    const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
    return (result?.count ?? 0) > 0;
  },
};
