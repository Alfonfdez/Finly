import { and, asc, eq, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { getDrizzle, withTransaction } from '../drizzle/engine';
import { recurringRules, recurringRuleTags, transactionTags, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { RecurringRule } from '../types';
import { recurringRuleSchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { dbTimestamp } from '../../utils/formatters';

/** Fields needed to create a rule. `skipped_from` is derived, so it is optional. */
export type RecurringRuleInput = Omit<RecurringRule, 'id' | 'created_at' | 'updated_at' | 'skipped_from'> & {
  skipped_from?: string | null;
};

export interface GeneratedTransactionPatch {
  account_id?: number;
  category_id?: number;
  amount?: number;
  description?: string | null;
  type?: RecurringRule['type'];
  tagIds?: number[];
}

export const recurringRepo = {
  async list(userId: number): Promise<RecurringRule[]> {
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(recurringRules)
      .where(eq(recurringRules.user_id, userId))
      .orderBy(asc(recurringRules.next_due), asc(recurringRules.id))
      .all();
    return parseRows(recurringRuleSchema, 'recurring_rules', rows);
  },

  async getById(id: number): Promise<RecurringRule | null> {
    const db = await getDrizzle();
    const row = await db.select().from(recurringRules).where(eq(recurringRules.id, id)).get();
    return parseRowOrNull(recurringRuleSchema, 'recurring_rules', row);
  },

  async listDue(today: string): Promise<RecurringRule[]> {
    const db = await getDrizzle();
    const rows = await db
      .select()
      .from(recurringRules)
      .where(
        and(
          eq(recurringRules.active, 1),
          lte(recurringRules.next_due, today),
          // Ended rules (cursor past the end date) can never generate again.
          or(isNull(recurringRules.end_date), lte(recurringRules.next_due, recurringRules.end_date)),
        ),
      )
      .orderBy(asc(recurringRules.next_due), asc(recurringRules.id))
      .all();
    return parseRows(recurringRuleSchema, 'recurring_rules', rows);
  },

  async getTagIds(ruleId: number): Promise<number[]> {
    const db = await getDrizzle();
    const rows = await db
      .select({ tag_id: recurringRuleTags.tag_id })
      .from(recurringRuleTags)
      .where(eq(recurringRuleTags.rule_id, ruleId))
      .all();
    return rows.map(r => r.tag_id);
  },

  /** Number of generated transactions per rule id. */
  async countOccurrencesByRuleIds(ruleIds: number[]): Promise<Map<number, number>> {
    if (ruleIds.length === 0) return new Map();
    const db = await getDrizzle();
    const rows = await db
      .select({ rule_id: transactions.recurring_rule_id, count: sql<number>`count(*)` })
      .from(transactions)
      .where(inArray(transactions.recurring_rule_id, ruleIds))
      .groupBy(transactions.recurring_rule_id)
      .all();
    return new Map(rows.map(r => [r.rule_id as number, Number(r.count)]));
  },

  async getTagsByRuleIds(ruleIds: number[]): Promise<{ rule_id: number; tag_id: number }[]> {
    if (ruleIds.length === 0) return [];
    const db = await getDrizzle();
    return await db
      .select({ rule_id: recurringRuleTags.rule_id, tag_id: recurringRuleTags.tag_id })
      .from(recurringRuleTags)
      .where(inArray(recurringRuleTags.rule_id, ruleIds))
      .all();
  },

  async createWithTags(data: RecurringRuleInput, tagIds: number[]): Promise<RecurringRule> {
    const skippedFrom = data.skipped_from ?? null;
    return await withTransaction(async (db) => {
      const result = await db.insert(recurringRules).values({ ...data, skipped_from: skippedFrom }).run();
      const id = runResultOf(result).lastInsertRowId;
      if (tagIds.length > 0) {
        await db
          .insert(recurringRuleTags)
          .values(tagIds.map(tagId => ({ rule_id: id, tag_id: tagId })))
          .run();
      }
      return { ...data, skipped_from: skippedFrom, id, created_at: dbTimestamp(), updated_at: null };
    });
  },

  async updateWithTags(id: number, data: Partial<RecurringRuleInput>, tagIds: number[]): Promise<void> {
    await withTransaction(async (db) => {
      // Copy every provided writable column (all of `RecurringRuleInput` except
      // `user_id`), so adding a column needs no change here.
      const set: Partial<typeof recurringRules.$inferInsert> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'user_id' && value !== undefined) {
          (set as Record<string, unknown>)[key] = value;
        }
      }
      if (Object.keys(set).length > 0) {
        await db
          .update(recurringRules)
          .set({ ...set, updated_at: sql`datetime('now', 'localtime')` })
          .where(eq(recurringRules.id, id))
          .run();
      }
      await db.delete(recurringRuleTags).where(eq(recurringRuleTags.rule_id, id)).run();
      if (tagIds.length > 0) {
        await db
          .insert(recurringRuleTags)
          .values(tagIds.map(tagId => ({ rule_id: id, tag_id: tagId })))
          .run();
      }
    });
  },

  async setActive(id: number, active: boolean): Promise<void> {
    const db = await getDrizzle();
    await db
      .update(recurringRules)
      .set({ active: active ? 1 : 0, updated_at: sql`datetime('now', 'localtime')` })
      .where(eq(recurringRules.id, id))
      .run();
  },

  /** Reactivate a paused rule and jump its cursor forward (skips the pause window). */
  async reactivate(id: number, nextDue: string): Promise<void> {
    const db = await getDrizzle();
    await db
      .update(recurringRules)
      .set({ active: 1, next_due: nextDue, updated_at: sql`datetime('now', 'localtime')` })
      .where(eq(recurringRules.id, id))
      .run();
  },

  async updateNextDue(id: number, nextDue: string): Promise<void> {
    const db = await getDrizzle();
    await db
      .update(recurringRules)
      .set({ next_due: nextDue, updated_at: sql`datetime('now', 'localtime')` })
      .where(eq(recurringRules.id, id))
      .run();
  },

  async remove(id: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(recurringRules).where(eq(recurringRules.id, id)).run();
  },

  async hasOccurrence(ruleId: number, date: string): Promise<boolean> {
    const db = await getDrizzle();
    const row = await db
      .select({ id: transactions.id })
      .from(transactions)
      .where(and(eq(transactions.recurring_rule_id, ruleId), eq(transactions.recurrence_date, date)))
      .get();
    return row !== undefined;
  },

  /** Non-transactional: the caller (recurringService) wraps the whole run in one transaction. */
  async insertOccurrence(rule: RecurringRule, date: string, tagIds: number[]): Promise<void> {
    const db = await getDrizzle();
    const result = await db
      .insert(transactions)
      .values({
        account_id: rule.account_id,
        category_id: rule.category_id,
        type: rule.type,
        amount: rule.amount,
        description: rule.description,
        photo: null,
        date: `${date} 00:00:00`,
        recurring_rule_id: rule.id,
        recurrence_date: date,
      })
      .run();
    const id = runResultOf(result).lastInsertRowId;
    if (tagIds.length > 0) {
      await db
        .insert(transactionTags)
        .values(tagIds.map(tagId => ({ transaction_id: id, tag_id: tagId })))
        .run();
    }
  },

  async updateGeneratedTransactions(ruleId: number, patch: GeneratedTransactionPatch): Promise<number> {
    return await withTransaction(async (db) => {
      const set: Partial<typeof transactions.$inferInsert> = {};
      if (patch.account_id !== undefined) set.account_id = patch.account_id;
      if (patch.category_id !== undefined) set.category_id = patch.category_id;
      if (patch.amount !== undefined) set.amount = patch.amount;
      if (patch.description !== undefined) set.description = patch.description;
      if (patch.type !== undefined) set.type = patch.type;

      let changes = 0;
      if (Object.keys(set).length > 0) {
        const result = await db
          .update(transactions)
          .set({ ...set, updated_at: sql`datetime('now', 'localtime')` })
          .where(eq(transactions.recurring_rule_id, ruleId))
          .run();
        changes = runResultOf(result).changes;
      }

      if (patch.tagIds) {
        const rows = await db
          .select({ id: transactions.id })
          .from(transactions)
          .where(eq(transactions.recurring_rule_id, ruleId))
          .all();
        const ids = rows.map(r => r.id);
        if (ids.length > 0) {
          await db.delete(transactionTags).where(inArray(transactionTags.transaction_id, ids)).run();
          const tagIds = patch.tagIds;
          if (tagIds.length > 0) {
            await db
              .insert(transactionTags)
              .values(ids.flatMap(transactionId => tagIds.map(tagId => ({ transaction_id: transactionId, tag_id: tagId }))))
              .run();
          }
        }
      }

      return changes;
    });
  },
};
