import { and, eq, inArray, ne, sql, type SQL } from 'drizzle-orm';
import { getDrizzle } from '../drizzle/engine';
import { tags } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { Tag } from '../types';
import { tagSchema } from '../schemas';
import { parseRows } from '../validate';
import { dbTimestamp } from '../../utils/formatters';

export const tagRepo = {
  async list(userId: number): Promise<Tag[]> {
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(tags)
      .where(eq(tags.user_id, userId))
      .orderBy(tags.id)
      .all();
    return parseRows(tagSchema, 'tags', rows);
  },

  async create(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const db = await getDrizzle();
    const result = await db.insert(tags).values({ user_id: data.user_id, name: data.name }).run();
    return { ...data, id: runResultOf(result).lastInsertRowId, created_at: dbTimestamp() };
  },

  async update(id: number, data: Partial<Omit<Tag, 'id' | 'created_at'>>): Promise<void> {
    const db = await getDrizzle();
    const set: Partial<typeof tags.$inferInsert> = {};
    if (data.name !== undefined) set.name = data.name;
    if (Object.keys(set).length === 0) return;
    await db.update(tags).set(set).where(eq(tags.id, id)).run();
  },

  async delete(id: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(tags).where(eq(tags.id, id)).run();
  },

  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDrizzle();
    await db.delete(tags).where(inArray(tags.id, ids)).run();
  },

  async deleteAll(): Promise<void> {
    const db = await getDrizzle();
    await db.delete(tags).run();
  },

  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    const db = await getDrizzle();
    const conditions: SQL[] = [sql`LOWER(${tags.name}) = LOWER(${name})`, eq(tags.user_id, userId)];
    if (excludeId !== undefined) conditions.push(ne(tags.id, excludeId));
    const rows = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tags)
      .where(and(...conditions))
      .all();
    return (rows[0]?.count ?? 0) > 0;
  },
};
