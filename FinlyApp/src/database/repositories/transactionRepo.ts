import { getDatabase } from '../database';
import { Transaction } from '../types';
import { TransactionType } from '../../constants/types';

interface TransactionFilters {
  account_id?: number;
  category_id?: number;
  category_ids?: number[];
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  tagIds?: number[];
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

interface CategoryTagBreakdown {
  tag_id: number;
  name: string;
  total: number;
}

interface CategoryUsageCount {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  count: number;
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
    if (filters.category_ids && filters.category_ids.length > 0) {
      sql += ` AND category_id IN (${filters.category_ids.map(() => '?').join(',')})`;
      params.push(...filters.category_ids);
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
    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasUntagged = filters.tagIds.includes(-1);
      const regularIds = filters.tagIds.filter(id => id !== -1);

      if (hasUntagged && regularIds.length > 0) {
        sql += ` AND (id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id IN (${regularIds.map(() => '?').join(',')})) OR NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = transactions.id))`;
        params.push(...regularIds);
      } else if (hasUntagged) {
        sql += ` AND NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = transactions.id)`;
      } else {
        sql += ` AND id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id IN (${regularIds.map(() => '?').join(',')}))`;
        params.push(...regularIds);
      }
    }

    sql += ` ORDER BY date DESC`;

    return await db.getAllAsync<Transaction>(sql, ...params);
  },

  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO transactions (account_id, category_id, type, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)`,
      data.account_id, data.category_id, data.type, data.amount, data.description ?? null, data.date
    );
    return { ...data, id: result.lastInsertRowId, created_at: new Date().toISOString(), updated_at: null };
  },

  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const db = getDatabase();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.account_id !== undefined) { fields.push('account_id = ?'); values.push(data.account_id); }
    if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }

    fields.push("updated_at = datetime('now', 'localtime')");

    if (fields.length === 1) return;

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

  async deleteByAccountId(accountId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM transactions WHERE account_id = ?`, accountId);
  },

  async deleteAllTransactions(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM transaction_tags');
  },

  async totalByPeriod(
    accountId: number | null,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const db = getDatabase();
    const sql = accountId !== null
      ? `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE account_id = ? AND type = ? AND date >= ? AND date <= ?`
      : `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = ? AND date >= ? AND date <= ?`;
    const params = accountId !== null
      ? [accountId, type, startDate, endDate]
      : [type, startDate, endDate];
    const result = await db.getFirstAsync<TotalByPeriod>(sql, ...params);
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
    accountId: number | null,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<CategoryBreakdown[]> {
    const db = getDatabase();
    const sql = accountId !== null
      ? `SELECT t.category_id, c.name, c.icon, c.color, SUM(t.amount) AS total
         FROM transactions t
         INNER JOIN categories c ON t.category_id = c.id
         WHERE t.account_id = ? AND t.type = ? AND t.date >= ? AND t.date <= ?
         GROUP BY t.category_id
         ORDER BY total DESC`
      : `SELECT t.category_id, c.name, c.icon, c.color, SUM(t.amount) AS total
         FROM transactions t
         INNER JOIN categories c ON t.category_id = c.id
         WHERE t.type = ? AND t.date >= ? AND t.date <= ?
         GROUP BY t.category_id
         ORDER BY total DESC`;
    const params = accountId !== null
      ? [accountId, type, startDate, endDate]
      : [type, startDate, endDate];
    return await db.getAllAsync<CategoryBreakdown>(sql, ...params);
  },

  async breakdownByCategoryAndTag(
    accountId: number,
    categoryId: number,
    type: TransactionType,
    startDate: string,
    endDate: string,
    tagIds?: number[]
  ): Promise<CategoryTagBreakdown[]> {
    const db = getDatabase();
    const hasFilter = tagIds && tagIds.length > 0;
    const filterRegular = hasFilter ? tagIds!.filter(id => id !== -1) : [];
    const filterUntagged = hasFilter ? tagIds!.includes(-1) : false;

    if (!hasFilter) {
      return await db.getAllAsync<CategoryTagBreakdown>(
        `SELECT tt.tag_id, t.name, SUM(tr.amount) AS total
         FROM transactions tr
         INNER JOIN transaction_tags tt ON tr.id = tt.transaction_id
         INNER JOIN tags t ON tt.tag_id = t.id
         WHERE tr.account_id = ? AND tr.category_id = ? AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
         GROUP BY tt.tag_id

         UNION ALL

         SELECT -1 AS tag_id, 'Untagged' AS name, SUM(tr.amount) AS total
         FROM transactions tr
         WHERE tr.account_id = ? AND tr.category_id = ? AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
           AND NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = tr.id)`,
        accountId, categoryId, type, startDate, endDate,
        accountId, categoryId, type, startDate, endDate
      );
    }

    const results: CategoryTagBreakdown[] = [];

    if (filterRegular.length > 0) {
      const placeholders = filterRegular.map(() => '?').join(',');
      const tagged = await db.getAllAsync<CategoryTagBreakdown>(
        `SELECT tt.tag_id, t.name, SUM(tr.amount) AS total
         FROM transactions tr
         INNER JOIN transaction_tags tt ON tr.id = tt.transaction_id
         INNER JOIN tags t ON tt.tag_id = t.id
         WHERE tr.account_id = ? AND tr.category_id = ? AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
           AND tt.tag_id IN (${placeholders})
         GROUP BY tt.tag_id`,
        accountId, categoryId, type, startDate, endDate,
        ...filterRegular
      );
      results.push(...tagged);
    }

    if (filterUntagged) {
      const untagged = await db.getAllAsync<CategoryTagBreakdown>(
        `SELECT -1 AS tag_id, 'Untagged' AS name, SUM(tr.amount) AS total
         FROM transactions tr
         WHERE tr.account_id = ? AND tr.category_id = ? AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
           AND NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = tr.id)`,
        accountId, categoryId, type, startDate, endDate
      );
      results.push(...untagged);
    }

    return results;
  },

  async createWithTags(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
    tagIds: number[]
  ): Promise<Transaction> {
    const db = getDatabase();
    const tx = await transactionRepo.create(data);
    if (tagIds.length > 0) {
      for (const tagId of tagIds) {
        await db.runAsync(
          `INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)`,
          tx.id, tagId
        );
      }
    }
    return tx;
  },

  async updateWithTags(
    id: number,
    data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>,
    tagIds: number[]
  ): Promise<void> {
    const db = getDatabase();
    await transactionRepo.update(id, data);
    await db.runAsync(`DELETE FROM transaction_tags WHERE transaction_id = ?`, id);
    if (tagIds.length > 0) {
      for (const tagId of tagIds) {
        await db.runAsync(
          `INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)`,
          id, tagId
        );
      }
    }
  },

  async getTagsByTransactionId(transactionId: number): Promise<number[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ tag_id: number }>(
      `SELECT tag_id FROM transaction_tags WHERE transaction_id = ?`,
      transactionId
    );
    return rows.map(r => r.tag_id);
  },

  async getTagsByTransactionIds(transactionIds: number[]): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
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

  async getCategoryUsageCounts(
    userId: number,
    type: TransactionType,
    startDate: string,
    accountId: number
  ): Promise<CategoryUsageCount[]> {
    const db = getDatabase();
    return await db.getAllAsync<CategoryUsageCount>(
      `SELECT c.id, c.name, c.icon, c.color, c.type, COUNT(t.id) AS count
       FROM categories c
       LEFT JOIN transactions t
         ON c.id = t.category_id
         AND t.date >= ?
         AND t.account_id = ?
       WHERE c.user_id = ? AND c.type = ?
       GROUP BY c.id
       ORDER BY count DESC, c.name ASC`,
      startDate, accountId, userId, type
    );
  },
};
