import { and, asc, eq, gte, inArray, isNotNull, isNull, lte, or, sql } from 'drizzle-orm';
import { getDrizzle, withTransaction, type DrizzleDb } from '../drizzle/engine';
import { recurringRules, recurringRuleTags, transactionTags, transactions } from '../drizzle/schema';
import { runResultOf } from '../drizzle/proxy';
import type { RecurringRule } from '../types';
import { recurringRuleSchema } from '../schemas';
import { parseRowOrNull, parseRows } from '../validate';
import { dbTimestamp } from '../../utils/formatters';
import { RULE_ACTIVE, RULE_INACTIVE } from '../../constants/types';
import { serializeWrites } from '../transactionQueue';

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

/** Only generated transactions inside this schedule window are rewritten. */
export interface GeneratedTransactionScope {
  startDate: string;
  endDate: string | null;
}

/**
 * Columns `updateWithTags` may write: the rule fields owned by the edit form.
 * `user_id` (and the generated `id`/timestamps) stay out on purpose.
 */
const WRITABLE_RULE_COLUMNS = [
  'name',
  'type',
  'account_id',
  'category_id',
  'amount',
  'description',
  'frequency',
  'interval',
  'weekday',
  'day_of_month',
  'month',
  'start_date',
  'end_date',
  'next_due',
  'active',
  'skipped_from',
] as const satisfies readonly (keyof RecurringRuleInput)[];

/** Write selected rule columns (never tags) and bump `updated_at`. */
async function writeRuleFields(
  id: number,
  patch: { active?: number; next_due?: string; skipped_from?: string | null },
): Promise<void> {
  const db = await getDrizzle();
  await db
    .update(recurringRules)
    .set({ ...patch, updated_at: sql`datetime('now', 'localtime')` })
    .where(eq(recurringRules.id, id))
    .run();
}

const recurringRepoBase = {
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
          eq(recurringRules.active, RULE_ACTIVE),
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

  /** Number of rules per category id (used by the category delete confirmation). */
  async countByCategoryIds(categoryIds: number[]): Promise<Record<number, number>> {
    if (categoryIds.length === 0) return {};
    const db = await getDrizzle();
    const rows = await db
      .select({ category_id: recurringRules.category_id, count: sql<number>`count(*)` })
      .from(recurringRules)
      .where(inArray(recurringRules.category_id, categoryIds))
      .groupBy(recurringRules.category_id)
      .all();
    const map: Record<number, number> = {};
    for (const row of rows) map[row.category_id] = Number(row.count);
    return map;
  },

  async createWithTags(data: RecurringRuleInput, tagIds: number[], tx?: DrizzleDb): Promise<RecurringRule> {
    const skippedFrom = data.skipped_from ?? null;
    const run = async (db: DrizzleDb) => {
      const result = await db.insert(recurringRules).values({ ...data, skipped_from: skippedFrom }).run();
      const id = runResultOf(result).lastInsertRowId;
      if (tagIds.length > 0) {
        await db
          .insert(recurringRuleTags)
          .values(tagIds.map(tagId => ({ rule_id: id, tag_id: tagId })))
          .run();
      }
      return { ...data, skipped_from: skippedFrom, id, created_at: dbTimestamp(), updated_at: null };
    };
    return tx ? run(tx) : withTransaction(run);
  },

  async updateWithTags(id: number, data: Partial<RecurringRuleInput>, tagIds: number[], tx?: DrizzleDb): Promise<void> {
    const run = async (db: DrizzleDb) => {
      // Only the columns the edit form owns: an allowlist keeps a stray field (e.g.
      // `user_id`) from being written through the spread of a partial input.
      const set: Partial<typeof recurringRules.$inferInsert> = {};
      for (const key of WRITABLE_RULE_COLUMNS) {
        const value = data[key];
        if (value !== undefined) {
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
    };
    await (tx ? run(tx) : withTransaction(run));
  },

  async setActive(id: number, active: boolean): Promise<void> {
    return writeRuleFields(id, { active: active ? RULE_ACTIVE : RULE_INACTIVE });
  },

  /**
   * Reactivate a paused rule and jump its cursor forward (skips the pause window).
   * When the cursor actually moves, the recorded recoverable skip is dropped: a
   * back-fill from it would also fill the pause window, which stays skipped forever.
   */
  async reactivate(id: number, nextDue: string, clearSkippedFrom = false): Promise<void> {
    return writeRuleFields(id, {
      active: RULE_ACTIVE,
      next_due: nextDue,
      ...(clearSkippedFrom ? { skipped_from: null } : {}),
    });
  },

  async updateNextDue(id: number, nextDue: string): Promise<void> {
    return writeRuleFields(id, { next_due: nextDue });
  },

  async remove(id: number): Promise<void> {
    const db = await getDrizzle();
    await db.delete(recurringRules).where(eq(recurringRules.id, id)).run();
  },

  /** Deletes rules by id; their generated transactions are kept (FK SET NULL). */
  async deleteMany(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const db = await getDrizzle();
    await db.delete(recurringRules).where(inArray(recurringRules.id, ids)).run();
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

  /** Scheduled dates this rule already generated a transaction for (indexed by rule). */
  async listOccurrenceDates(ruleId: number): Promise<string[]> {
    const db = await getDrizzle();
    const rows = await db
      .select({ date: transactions.recurrence_date })
      .from(transactions)
      .where(and(eq(transactions.recurring_rule_id, ruleId), isNotNull(transactions.recurrence_date)))
      .all();
    return rows.map(row => row.date as string);
  },

  /** Non-transactional: the service runs the whole catch-up inside one transaction. */
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

  async updateGeneratedTransactions(ruleId: number, patch: GeneratedTransactionPatch, tx?: DrizzleDb, scope?: GeneratedTransactionScope): Promise<number> {
    const run = async (db: DrizzleDb): Promise<number> => {
      const set: Partial<typeof transactions.$inferInsert> = {};
      if (patch.account_id !== undefined) set.account_id = patch.account_id;
      if (patch.category_id !== undefined) set.category_id = patch.category_id;
      if (patch.amount !== undefined) set.amount = patch.amount;
      if (patch.description !== undefined) set.description = patch.description;
      if (patch.type !== undefined) set.type = patch.type;

      const where = scope
        ? and(
          eq(transactions.recurring_rule_id, ruleId),
          gte(transactions.recurrence_date, scope.startDate),
          scope.endDate != null ? lte(transactions.recurrence_date, scope.endDate) : undefined,
        )
        : eq(transactions.recurring_rule_id, ruleId);

      let changes = 0;
      // A tag-only rewrite still bumps `updated_at`, so an open modify form notices it.
      if (Object.keys(set).length > 0 || patch.tagIds) {
        const result = await db
          .update(transactions)
          .set({ ...set, updated_at: sql`datetime('now', 'localtime')` })
          .where(where)
          .run();
        changes = runResultOf(result).changes;
      }

      if (patch.tagIds) {
        const rows = await db
          .select({ id: transactions.id })
          .from(transactions)
          .where(where)
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
    };
    return tx ? run(tx) : withTransaction(run);
  },
};

export const recurringRepo = serializeWrites(recurringRepoBase, ['setActive', 'reactivate', 'remove', 'deleteMany']);
