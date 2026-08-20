import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  notExists,
  or,
  sql,
  type SQL,
} from 'drizzle-orm';
import { getDrizzle } from '../drizzle/engine';
import { categories, tags, transactionTags, transactions } from '../drizzle/schema';
import type { Transaction } from '../types';
import { type TransactionType, MAX_SUGGESTIONS, UNTAGGED_LABEL } from '../../constants/types';
import { UNTAGGED_ID } from '../helpers';
import { transactionSchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { escapeLikePattern } from '../../utils/formatters';

export interface TransactionFilters {
  account_id?: number;
  category_id?: number;
  category_ids?: number[];
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  tagIds?: number[];
}

export interface CategoryTagBreakdown {
  tag_id: number;
  name: string;
  total: number;
}

export interface CategoryUsageCount {
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

export const transactionReads = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const db = await getDrizzle();
    const conditions: SQL[] = [];

    if (filters.account_id !== undefined) {
      conditions.push(eq(transactions.account_id, filters.account_id));
    }
    if (filters.category_id !== undefined) {
      conditions.push(eq(transactions.category_id, filters.category_id));
    }
    if (filters.category_ids && filters.category_ids.length > 0) {
      conditions.push(inArray(transactions.category_id, filters.category_ids));
    }
    if (filters.type !== undefined) {
      conditions.push(eq(transactions.type, filters.type));
    }
    if (filters.start_date !== undefined) {
      conditions.push(gte(transactions.date, filters.start_date));
    }
    if (filters.end_date !== undefined) {
      conditions.push(lte(transactions.date, filters.end_date));
    }
    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasUntagged = filters.tagIds.includes(UNTAGGED_ID);
      const regularIds = filters.tagIds.filter(id => id !== UNTAGGED_ID);

      if (hasUntagged && regularIds.length > 0) {
        conditions.push(
          or(
            inArray(
              transactions.id,
              db
                .select({ transaction_id: transactionTags.transaction_id })
                .from(transactionTags)
                .where(inArray(transactionTags.tag_id, regularIds))
            ),
            notExists(
              db
                .select({ one: sql`1` })
                .from(transactionTags)
                .where(eq(transactionTags.transaction_id, transactions.id))
            )
          )!
        );
      } else if (hasUntagged) {
        conditions.push(
          notExists(
            db
              .select({ one: sql`1` })
              .from(transactionTags)
              .where(eq(transactionTags.transaction_id, transactions.id))
          )
        );
      } else {
        conditions.push(
          inArray(
            transactions.id,
            db
              .select({ transaction_id: transactionTags.transaction_id })
              .from(transactionTags)
              .where(inArray(transactionTags.tag_id, regularIds))
          )
        );
      }
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.date))
      .all();
    return parseRows(transactionSchema, 'transactions', rows);
  },

  async getById(id: number): Promise<Transaction | null> {
    const db = await getDrizzle();
    const row = await db.select().from(transactions).where(eq(transactions.id, id)).get();
    return parseRowOrNull(transactionSchema, 'transactions', row);
  },

  async totalByPeriod(
    accountId: number | null,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<number> {
    const db = await getDrizzle();
    const row = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
      .from(transactions)
      .where(
        and(
          accountId !== null ? eq(transactions.account_id, accountId) : undefined,
          eq(transactions.type, type),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate)
        )
      )
      .get();
    return row?.total ?? 0;
  },

  async searchComments(search: string): Promise<string[]> {
    const db = await getDrizzle();
    const term = search.trim();
    if (!term) return [];
    const escaped = escapeLikePattern(term);
    const results = await db
      .selectDistinct({
        description: sql<string>`TRIM(${transactions.description})`,
      })
      .from(transactions)
      .where(
        and(
          isNotNull(transactions.description),
          sql`TRIM(${transactions.description}) <> ''`,
          sql`TRIM(${transactions.description}) LIKE ${`%${escaped}%`} ESCAPE '\\'`
        )
      )
      .orderBy(
        sql`CASE WHEN TRIM(${transactions.description}) LIKE ${`${escaped}%`} ESCAPE '\\' COLLATE NOCASE THEN 0 ELSE 1 END`,
        sql`${transactions.description} COLLATE NOCASE`
      )
      .limit(MAX_SUGGESTIONS)
      .all();
    return results.map(r => r.description);
  },

  async getDistinctComments(): Promise<CommentUsage[]> {
    const db = await getDrizzle();
    return await db
      .select({
        description: sql<string>`TRIM(${transactions.description})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          isNotNull(transactions.description),
          sql`TRIM(${transactions.description}) <> ''`
        )
      )
      .groupBy(sql`TRIM(${transactions.description})`)
      .orderBy(sql`${transactions.description} COLLATE NOCASE`)
      .all();
  },

  async countByDescription(comment: string): Promise<number> {
    const db = await getDrizzle();
    const row = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(sql`TRIM(${transactions.description}) = ${comment.trim()}`)
      .get();
    return row?.count ?? 0;
  },

  async countByCategoryIds(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const db = await getDrizzle();
    const row = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(inArray(transactions.category_id, ids))
      .get();
    return row?.count ?? 0;
  },

  async countByCategoryIdsMap(ids: number[]): Promise<Record<number, number>> {
    if (ids.length === 0) return {};
    const db = await getDrizzle();
    const rows = await db
      .select({ category_id: transactions.category_id, count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(inArray(transactions.category_id, ids))
      .groupBy(transactions.category_id)
      .all();
    const map: Record<number, number> = {};
    for (const row of rows) map[row.category_id] = row.count;
    return map;
  },

  async breakdownByCategoriesAndTags(
    accountId: number | null,
    categoryIds: number[],
    type: TransactionType,
    startDate: string,
    endDate: string,
    tagIds?: number[]
  ): Promise<Map<number, CategoryTagBreakdown[]>> {
    const db = await getDrizzle();
    const hasFilter = tagIds && tagIds.length > 0;
    const filterRegular = hasFilter ? tagIds.filter(id => id !== UNTAGGED_ID) : [];
    const filterUntagged = hasFilter ? tagIds.includes(UNTAGGED_ID) : false;

    const results = new Map<number, CategoryTagBreakdown[]>();

    if (!hasFilter || filterRegular.length > 0) {
      const tagged = await db
        .select({
          category_id: transactions.category_id,
          tag_id: transactionTags.tag_id,
          name: tags.name,
          total: sql<number>`SUM(${transactions.amount})`,
        })
        .from(transactions)
        .innerJoin(transactionTags, eq(transactionTags.transaction_id, transactions.id))
        .innerJoin(tags, eq(tags.id, transactionTags.tag_id))
        .where(
          and(
            inArray(transactions.category_id, categoryIds),
            eq(transactions.type, type),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            filterRegular.length > 0 ? inArray(transactionTags.tag_id, filterRegular) : undefined,
            accountId !== null ? eq(transactions.account_id, accountId) : undefined
          )
        )
        .groupBy(transactions.category_id, transactionTags.tag_id)
        .all();
      for (const row of tagged) {
        const list = results.get(row.category_id) ?? [];
        list.push({ tag_id: row.tag_id, name: row.name, total: row.total });
        results.set(row.category_id, list);
      }
    }

    if (!hasFilter || filterUntagged) {
      const untagged = await db
        .select({
          category_id: transactions.category_id,
          tag_id: sql<number>`${UNTAGGED_ID}`,
          name: sql<string>`${sql.raw(`'${UNTAGGED_LABEL}'`)}`,
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            inArray(transactions.category_id, categoryIds),
            eq(transactions.type, type),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            notExists(
              db
                .select({ one: sql`1` })
                .from(transactionTags)
                .where(eq(transactionTags.transaction_id, transactions.id))
            ),
            accountId !== null ? eq(transactions.account_id, accountId) : undefined
          )
        )
        .groupBy(transactions.category_id)
        .having(sql`COALESCE(SUM(${transactions.amount}), 0) > 0`)
        .all();
      for (const row of untagged) {
        const list = results.get(row.category_id) ?? [];
        list.push({ tag_id: row.tag_id, name: row.name, total: row.total });
        results.set(row.category_id, list);
      }
    }

    return results;
  },

  async getTagsByTransactionId(transactionId: number): Promise<number[]> {
    const db = await getDrizzle();
    const rows = await db
      .select({ tag_id: transactionTags.tag_id })
      .from(transactionTags)
      .where(eq(transactionTags.transaction_id, transactionId))
      .all();
    return rows.map(r => r.tag_id);
  },

  async getTagsByTransactionIds(transactionIds: number[]): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
    if (transactionIds.length === 0) return [];
    const db = await getDrizzle();
    return await db
      .select({
        transaction_id: transactionTags.transaction_id,
        tag_id: transactionTags.tag_id,
        name: tags.name,
      })
      .from(transactionTags)
      .innerJoin(tags, eq(tags.id, transactionTags.tag_id))
      .where(inArray(transactionTags.transaction_id, transactionIds))
      .all();
  },

  async getCategoryUsageCounts(
    userId: number,
    type: TransactionType,
    startDate: string,
    accountId: number
  ): Promise<CategoryUsageCount[]> {
    const db = await getDrizzle();
    return (await db
      .select({
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color,
        type: categories.type,
        count: sql<number>`COUNT(${transactions.id})`,
      })
      .from(categories)
      .leftJoin(
        transactions,
        and(
          eq(transactions.category_id, categories.id),
          gte(transactions.date, startDate),
          eq(transactions.account_id, accountId),
          eq(transactions.type, type)
        )
      )
      .where(and(eq(categories.user_id, userId), eq(categories.type, type)))
      .groupBy(categories.id)
      .orderBy(sql`COUNT(${transactions.id}) DESC, ${categories.name} COLLATE NOCASE ASC`)
      .all()) as unknown as CategoryUsageCount[];
  },
};
