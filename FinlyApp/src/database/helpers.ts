export const UNTAGGED_ID = -1;

export function isTotalAccount(account: { is_total?: number }): boolean {
  return (account.is_total ?? 0) === 1;
}

export function buildUpdateQuery(
  data: Record<string, any>,
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
