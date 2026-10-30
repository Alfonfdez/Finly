import { and, eq, ne, sql, type SQL } from 'drizzle-orm';
import type { AnySQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core';
import { getDrizzle } from '../drizzle/engine';

export interface ExistsByNameColumns {
  name: AnySQLiteColumn;
  userId: AnySQLiteColumn;
  id: AnySQLiteColumn;
}

export function pickDefined<T, K extends keyof T>(
  data: T,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  const picked: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    if (data[key] !== undefined) {
      picked[key] = data[key];
    }
  }
  return picked;
}

export async function existsByName(
  table: SQLiteTable,
  columns: ExistsByNameColumns,
  userId: number,
  name: string,
  excludeId?: number,
): Promise<boolean> {
  const db = await getDrizzle();
  const conditions: SQL[] = [sql`LOWER(${columns.name}) = LOWER(${name})`, eq(columns.userId, userId)];
  if (excludeId !== undefined) conditions.push(ne(columns.id, excludeId));
  const rows = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(table)
    .where(and(...conditions))
    .all();
  return (rows[0]?.count ?? 0) > 0;
}
