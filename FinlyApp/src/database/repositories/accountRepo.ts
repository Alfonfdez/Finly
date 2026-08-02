import { getDatabase } from '../database';
import { Account } from '../types';
import { buildUpdateQuery, buildNameExistsQuery } from '../helpers';
import { deleteTransactionPhotos } from '../photoCleanup';
import { dbTimestamp } from '../../utils/formatters';

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
    return { ...data, id: result.lastInsertRowId, created_at: dbTimestamp() };
  },

  async getById(id: number): Promise<Account | null> {
    const db = getDatabase();
    return await db.getFirstAsync<Account>('SELECT * FROM accounts WHERE id = ?', id);
  },

  async update(id: number, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const result = buildUpdateQuery(data, ['name', 'initial_balance', 'icon', 'color', 'description']);
    if (!result) return;
    await db.runAsync(`UPDATE accounts SET ${result.sets} WHERE id = ?`, ...result.values, id);
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await deleteTransactionPhotos('account_id = ?', id);
    await db.runAsync(`DELETE FROM transactions WHERE account_id = ?`, id);
    await db.runAsync(`DELETE FROM accounts WHERE id = ? AND is_total = 0`, id);
  },

  async deleteAll(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM accounts');
  },

  async getBalances(): Promise<{ account_id: number; balance: number }[]> {
    const db = getDatabase();
    return await db.getAllAsync<{ account_id: number; balance: number }>(
      `SELECT a.id AS account_id,
              a.initial_balance + COALESCE(SUM(
                CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END
              ), 0) AS balance
       FROM accounts a
       LEFT JOIN transactions t ON t.account_id = a.id
       WHERE a.is_total = 0
       GROUP BY a.id
       ORDER BY a.id`
    );
  },

  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const db = getDatabase();
    const { sql, params } = buildNameExistsQuery('accounts', name, { excludeId });
    const result = await db.getFirstAsync<{ count: number }>(sql, ...params);
    return (result?.count ?? 0) > 0;
  },
};
