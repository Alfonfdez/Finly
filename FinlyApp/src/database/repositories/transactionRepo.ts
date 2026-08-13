import { getDatabase } from '../database';
import type { Transaction } from '../types';
import { type TransactionType, MAX_SUGGESTIONS, UNTAGGED_LABEL } from '../../constants/types';
import { transactionSchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { UNTAGGED_ID, buildUpdateQuery } from '../helpers';
import { deleteTransactionPhotos } from '../photoCleanup';
import { dbTimestamp } from '../../utils/formatters';

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

export interface CommentUsage {
  description: string;
  count: number;
}

export const transactionRepo = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const db = await getDatabase();
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
      const hasUntagged = filters.tagIds.includes(UNTAGGED_ID);
      const regularIds = filters.tagIds.filter(id => id !== UNTAGGED_ID);

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

    const rows = await db.getAllAsync(sql, ...params);
    return parseRows(transactionSchema, 'transactions', rows);
  },

  async getById(id: number): Promise<Transaction | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync(
      `SELECT * FROM transactions WHERE id = ?`,
      id
    );
    return parseRowOrNull(transactionSchema, 'transactions', row);
  },

  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `INSERT INTO transactions (account_id, category_id, type, amount, description, photo, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      data.account_id, data.category_id, data.type, data.amount, data.description ?? null, data.photo ?? null, data.date
    );
    return { ...data, id: result.lastInsertRowId, created_at: dbTimestamp(), updated_at: null };
  },

  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const db = await getDatabase();
    const result = buildUpdateQuery(data, ['account_id', 'category_id', 'type', 'amount', 'description', 'photo', 'date']);
    if (!result) return;
    result.values.push(id);
    await db.runAsync(
      `UPDATE transactions SET ${result.sets}, updated_at = datetime('now', 'localtime') WHERE id = ?`,
      ...result.values
    );
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);
  },

  async deleteAllTransactions(): Promise<void> {
    await deleteTransactionPhotos('photo IS NOT NULL');
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM transactions');
      await db.runAsync('DELETE FROM transaction_tags');
    });
  },

  async totalByPeriod(
    accountId: number | null,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const db = await getDatabase();
    const sql = accountId !== null
      ? `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE account_id = ? AND type = ? AND date >= ? AND date <= ?`
      : `SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = ? AND date >= ? AND date <= ?`;
    const params = accountId !== null
      ? [accountId, type, startDate, endDate]
      : [type, startDate, endDate];
    const result = await db.getFirstAsync<TotalByPeriod>(sql, ...params);
    return result?.total ?? 0;
  },

  async searchComments(search: string): Promise<string[]> {
    const db = await getDatabase();
    const term = search.trim();
    if (!term) return [];
    const results = await db.getAllAsync<{ description: string }>(
      `SELECT DISTINCT TRIM(description) AS description FROM transactions
       WHERE description IS NOT NULL AND TRIM(description) <> '' AND TRIM(description) LIKE ?
       ORDER BY CASE WHEN TRIM(description) LIKE ? COLLATE NOCASE THEN 0 ELSE 1 END,
                description COLLATE NOCASE
       LIMIT ${MAX_SUGGESTIONS}`,
      `%${term}%`,
      `${term}%`
    );
    return results.map(r => r.description);
  },

  async getDistinctComments(): Promise<CommentUsage[]> {
    const db = await getDatabase();
    return await db.getAllAsync<CommentUsage>(
      `SELECT TRIM(description) AS description, COUNT(*) AS count
       FROM transactions
       WHERE description IS NOT NULL AND TRIM(description) <> ''
       GROUP BY TRIM(description)
       ORDER BY description COLLATE NOCASE`
    );
  },

  async updateComment(oldComment: string, newComment: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE transactions
       SET description = ?, updated_at = datetime('now', 'localtime')
       WHERE TRIM(description) = ?`,
      newComment.trim(),
      oldComment.trim()
    );
    return result.changes;
  },

  async deleteComment(comment: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `UPDATE transactions
       SET description = NULL, updated_at = datetime('now', 'localtime')
       WHERE TRIM(description) = ?`,
      comment.trim()
    );
    return result.changes;
  },

  async deleteComments(comments: string[]): Promise<number> {
    if (comments.length === 0) return 0;
    const db = await getDatabase();
    const placeholders = comments.map(() => '?').join(',');
    const result = await db.runAsync(
      `UPDATE transactions
       SET description = NULL, updated_at = datetime('now', 'localtime')
       WHERE TRIM(description) IN (${placeholders})`,
      ...comments.map(c => c.trim())
    );
    return result.changes;
  },

  async countByDescription(comment: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) AS count FROM transactions WHERE TRIM(description) = ?`,
      comment.trim()
    );
    return result?.count ?? 0;
  },

  async breakdownByCategoriesAndTags(
    accountId: number | null,
    categoryIds: number[],
    type: TransactionType,
    startDate: string,
    endDate: string,
    tagIds?: number[]
  ): Promise<Map<number, CategoryTagBreakdown[]>> {
    const db = await getDatabase();
    const accountClause = accountId === null ? '' : 'AND tr.account_id = ?';
    const accountParams = accountId === null ? [] : [accountId];
    const catPlaceholders = categoryIds.map(() => '?').join(',');
    const hasFilter = tagIds && tagIds.length > 0;
    const filterRegular = hasFilter ? tagIds.filter(id => id !== UNTAGGED_ID) : [];
    const filterUntagged = hasFilter ? tagIds.includes(UNTAGGED_ID) : false;

    const results = new Map<number, CategoryTagBreakdown[]>();

    if (!hasFilter || filterRegular.length > 0) {
      const tagClause = filterRegular.length > 0
        ? `AND tt.tag_id IN (${filterRegular.map(() => '?').join(',')})`
        : '';
      const tagged = await db.getAllAsync<CategoryTagBreakdown & { category_id: number }>(
        `SELECT tr.category_id, tt.tag_id, t.name, SUM(tr.amount) AS total
         FROM transactions tr
         INNER JOIN transaction_tags tt ON tr.id = tt.transaction_id
         INNER JOIN tags t ON tt.tag_id = t.id
         WHERE tr.category_id IN (${catPlaceholders})
           AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
           ${tagClause}
           ${accountClause}
         GROUP BY tr.category_id, tt.tag_id`,
        ...categoryIds, type, startDate, endDate,
        ...filterRegular,
        ...accountParams
      );
      for (const row of tagged) {
        const list = results.get(row.category_id) ?? [];
        list.push({ tag_id: row.tag_id, name: row.name, total: row.total });
        results.set(row.category_id, list);
      }
    }

    if (!hasFilter || filterUntagged) {
      const untagged = await db.getAllAsync<CategoryTagBreakdown & { category_id: number }>(
        `SELECT tr.category_id, ${UNTAGGED_ID} AS tag_id, '${UNTAGGED_LABEL}' AS name, COALESCE(SUM(tr.amount), 0) AS total
         FROM transactions tr
         WHERE tr.category_id IN (${catPlaceholders})
           AND tr.type = ? AND tr.date >= ? AND tr.date <= ?
           AND NOT EXISTS (SELECT 1 FROM transaction_tags WHERE transaction_id = tr.id)
           ${accountClause}
         GROUP BY tr.category_id
         HAVING COALESCE(SUM(tr.amount), 0) > 0`,
        ...categoryIds, type, startDate, endDate, ...accountParams
      );
      for (const row of untagged) {
        const list = results.get(row.category_id) ?? [];
        list.push({ tag_id: row.tag_id, name: row.name, total: row.total });
        results.set(row.category_id, list);
      }
    }

    return results;
  },

  async createWithTags(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
    tagIds: number[]
  ): Promise<Transaction> {
    const db = await getDatabase();
    let created: Transaction | null = null;
    await db.withTransactionAsync(async () => {
      created = await transactionRepo.create(data);
      if (tagIds.length > 0) {
        for (const tagId of tagIds) {
          await db.runAsync(
            `INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)`,
            created.id, tagId
          );
        }
      }
    });
    if (!created) throw new Error('createWithTags failed to create transaction');
    return created;
  },

  async updateWithTags(
    id: number,
    data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>,
    tagIds: number[]
  ): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
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
    });
  },

  async getTagsByTransactionId(transactionId: number): Promise<number[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ tag_id: number }>(
      `SELECT tag_id FROM transaction_tags WHERE transaction_id = ?`,
      transactionId
    );
    return rows.map(r => r.tag_id);
  },

  async getTagsByTransactionIds(transactionIds: number[]): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
    if (transactionIds.length === 0) return [];
    const db = await getDatabase();
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
    const db = await getDatabase();
    return await db.getAllAsync<CategoryUsageCount>(
      `SELECT c.id, c.name, c.icon, c.color, c.type, COUNT(t.id) AS count
       FROM categories c
       LEFT JOIN transactions t
         ON c.id = t.category_id
         AND t.date >= ?
         AND t.account_id = ?
         AND t.type = ?
       WHERE c.user_id = ? AND c.type = ?
       GROUP BY c.id
       ORDER BY count DESC, c.name COLLATE NOCASE ASC`,
      startDate, accountId, type, userId, type
    );
  },
};
