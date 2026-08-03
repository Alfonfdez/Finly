export const UNTAGGED_ID = -1;

export function isTotalAccount(account: { is_total?: number }): boolean {
  return (account.is_total ?? 0) === 1;
}

export function buildUpdateQuery(
  data: Partial<Record<string, string | number | null>>,
  columns: string[]
): { sets: string; values: (string | number | null)[] } | null {
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  for (const col of columns) {
    if (data[col] !== undefined) {
      sets.push(`${col} = ?`);
      values.push(data[col]);
    }
  }

  if (sets.length === 0) return null;

  return { sets: sets.join(', '), values };
}

type NameTable = 'accounts' | 'categories' | 'tags';

export function buildNameExistsQuery(
  table: NameTable,
  name: string,
  opts: { userId?: number; excludeId?: number } = {}
): { sql: string; params: (string | number)[] } {
  let sql = `SELECT COUNT(*) as count FROM ${table} WHERE LOWER(name) = LOWER(?)`;
  const params: (string | number)[] = [name];
  if (opts.userId !== undefined) {
    sql += ` AND user_id = ?`;
    params.push(opts.userId);
  }
  if (opts.excludeId !== undefined) {
    sql += ` AND id != ?`;
    params.push(opts.excludeId);
  }
  return { sql, params };
}
