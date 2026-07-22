import { getDatabase } from '../database';
import { Account } from '../types';

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
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.initial_balance !== undefined) { fields.push('initial_balance = ?'); values.push(data.initial_balance); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
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
