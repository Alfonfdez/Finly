import { getDatabase } from '../database';
import { Transaction } from '../types';
import { TransactionType } from '../../constants/types';

interface TransactionFilters {
  account_id?: number;
  category_id?: number;
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
}

interface TotalByPeriod {
  total: number;
}

interface CategoryBreakdown {
  category_id: number;
  name: string;
  icon: string;
  color: string;
  total: number;
}

export const transactionRepo = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const db = getDatabase();
    let sql = `SELECT * FROM transactions WHERE 1=1`;
    const params: (string | number)[] = [];

    if (filters.account_id !== undefined) {
      sql += ` AND account_id = ?`;
      params.push(filters.account_id);
    }
    if (filters.category_id !== undefined) {
      sql += ` AND category_id = ?`;
      params.push(filters.category_id);
    }
    if (filters.type !== undefined) {
      sql += ` AND type = ?`;
      params.push(filters.type);
    }
    if (filters.start_date !== undefined) {
      sql += ` AND date >= ?`;
      params.push(filters.start_date);
    }
    if (filters.end_date !== undefined) {
      sql += ` AND date <= ?`;
      params.push(filters.end_date);
    }

    sql += ` ORDER BY date DESC`;

    return await db.getAllAsync<Transaction>(sql, ...params);
  },

  async create(data: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO transactions (account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)`,
      data.account_id, data.category_id, data.type, data.amount, data.description ?? null, data.date
    );
    return { ...data, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.account_id !== undefined) { fields.push('account_id = ?'); values.push(data.account_id); }
    if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }

    if (fields.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      ...values
    );
  },

  async delete(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);
  },

  async totalByPeriod(
    accountId: number,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<TotalByPeriod>(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM transactions
       WHERE account_id = ? AND type = ? AND date >= ? AND date <= ?`,
      accountId, type, startDate, endDate
    );
    return result?.total ?? 0;
  },

  async reassignCategory(oldCategoryId: number, newCategoryId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      `UPDATE transactions SET category_id = ? WHERE category_id = ?`,
      newCategoryId, oldCategoryId
    );
  },

  async searchComments(search: string): Promise<string[]> {
    const db = getDatabase();
    const results = await db.getAllAsync<{ description: string }>(
      `SELECT DISTINCT description FROM transactions
       WHERE description IS NOT NULL AND description LIKE ?
       ORDER BY description LIMIT 5`,
      `%${search}%`
    );
    return results.map(r => r.description);
  },

  async breakdownByCategories(
    accountId: number,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<CategoryBreakdown[]> {
    const db = getDatabase();
    return await db.getAllAsync<CategoryBreakdown>(
      `SELECT t.category_id, c.name, c.icon, c.color, SUM(t.amount) AS total
       FROM transactions t
       INNER JOIN categories c ON t.category_id = c.id
       WHERE t.account_id = ? AND t.type = ? AND t.date >= ? AND t.date <= ?
       GROUP BY t.category_id
       ORDER BY total DESC`,
      accountId, type, startDate, endDate
    );
  },
};
