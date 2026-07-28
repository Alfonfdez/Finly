import { getDatabase } from '../database';
import { Account } from '../types';
import { buildUpdateQuery } from '../helpers';

export const accountRepo = {
  async list(userId: number): Promise<Account[]> {
    const db = getDatabase();
    return await db.getAllAsync<Account>(
      `SELECT * FROM accounts WHERE user_id = ? ORDER BY is_total DESC, name`,
      userId
    );
  },

  async create(data: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO accounts (user_id, name, initial_balance, icon, color, description) VALUES (?, ?, ?, ?, ?, ?)`,
      data.user_id, data.name, data.initial_balance, data.icon, data.color, data.description ?? ''
    );
    return { ...data, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async update(id: number, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const result = buildUpdateQuery(data, ['name', 'initial_balance', 'icon', 'color', 'description']);
    if (!result) return;
    await db.runAsync(`UPDATE accounts SET ${result.sets} WHERE id = ?`, ...result.values, id);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM accounts WHERE id = ? AND is_total = 0`, id);
  },

  async deleteAll(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM accounts');
  },

  async getCurrentBalance(id: number): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ balance: number }>(
      `SELECT a.initial_balance + COALESCE(
        (SELECT SUM(t.amount) FROM transactions t WHERE t.account_id = a.id AND t.type = 'income'), 0
      ) - COALESCE(
        (SELECT SUM(t.amount) FROM transactions t WHERE t.account_id = a.id AND t.type = 'expense'), 0
      ) AS balance
      FROM accounts a WHERE a.id = ?`,
      id
    );
    return result?.balance ?? 0;
  },

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    let sql = `SELECT COUNT(*) as count FROM accounts WHERE LOWER(name) = LOWER(?)`;
    const params: (string | number)[] = [name];
    if (excludeId !== undefined) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
    return (result?.count ?? 0) > 0;
  },
};
