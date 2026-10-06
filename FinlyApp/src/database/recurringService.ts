import { withTransaction } from './drizzle/engine';
import { recurringRepo, type RecurringRuleInput } from './repositories/recurringRepo';
import { listDueOccurrences, nextDueOnOrAfter, fromDateOnly, todayDateOnly, MAX_CATCH_UP_OCCURRENCES } from '../utils/recurrence';
import { RECURRENCE_FREQUENCIES, RECURRENCE_SCOPES, type RecurrenceScope } from '../constants/types';
import type { RecurringRule } from './types';

/**
 * Materialize every due occurrence for all active recurring rules.
 *
 * Runs on app start, on foreground and on the midnight timer. Safe to call
 * repeatedly: a partial unique index on (recurring_rule_id, recurrence_date)
 * plus the hasOccurrence guard make it idempotent. The list is bounded per rule
 * to avoid runaway generation.
 *
 * @returns the number of transactions created in this run.
 */
export async function materializeDueRecurring(now: Date = new Date()): Promise<number> {
  const today = todayDateOnly(now);
  const rules = await recurringRepo.listDue(today);
  if (rules.length === 0) return 0;

  let created = 0;

  for (const rule of rules) {
    const tagIds = await recurringRepo.getTagIds(rule.id);
    const { occurrences, nextDue } = listDueOccurrences(
      rule,
      rule.next_due,
      today,
      MAX_CATCH_UP_OCCURRENCES,
    );

    await withTransaction(async () => {
      for (const occurrence of occurrences) {
        if (await recurringRepo.hasOccurrence(rule.id, occurrence)) continue;
        await recurringRepo.insertOccurrence(rule, occurrence, tagIds);
        created += 1;
      }
      if (nextDue !== rule.next_due) {
        await recurringRepo.updateNextDue(rule.id, nextDue);
      }
    });
  }

  return created;
}

/**
 * Resume a paused rule. Occurrences missed while paused are intentionally NOT
 * created: the cursor jumps to the first occurrence on/after today, then the
 * current/next occurrence is materialized immediately.
 *
 * @returns the number of transactions created by the immediate reconciliation.
 */
export async function resumeRecurringRule(ruleId: number, now: Date = new Date()): Promise<number> {
  const rule = await recurringRepo.getById(ruleId);
  if (!rule) return 0;

  const today = todayDateOnly(now);
  const nextDue = rule.next_due < today ? nextDueOnOrAfter(rule, today) : rule.next_due;

  await recurringRepo.reactivate(ruleId, nextDue);
  return materializeDueRecurring(now);
}

export interface RecurringEditRecurrence {
  frequency: RecurringRule['frequency'];
  interval: number;
  endDate: string | null;
}

export interface RecurringEditPastPatch {
  account_id: number;
  category_id: number;
  amount: number;
  description: string | null;
}

export interface RecurringEditParams {
  ruleId: number;
  updated: Partial<RecurringRuleInput>;
  recurrence: RecurringEditRecurrence;
  scope: RecurrenceScope;
  pastPatch: RecurringEditPastPatch;
  tagIds: number[];
  now?: Date;
}

/**
 * Apply an edit to a recurring rule.
 *
 * Reconciles the old schedule first (so everything due exists with the old
 * values), then rewrites the rule and reconciles again so the change takes
 * effect immediately. Scope controls the cursor:
 * - `future`          → next occurrence on/after today (occurrences missed since
 *                       the rule's cursor are skipped; past generated unchanged).
 * - `futureAndPast`   → next occurrence on/after the rule's cursor (the missed
 *                       window is back-filled) and every already-generated
 *                       transaction is bulk-updated.
 *
 * @returns the number of transactions created by the second reconciliation.
 */
export async function saveRecurringRuleEdit(params: RecurringEditParams): Promise<number> {
  const { ruleId, updated, recurrence, scope, pastPatch, tagIds } = params;
  const now = params.now ?? new Date();
  const today = todayDateOnly(now);

  await materializeDueRecurring(now);

  const current = await recurringRepo.getById(ruleId);
  if (!current) return 0;

  const cursor = current.next_due;
  const startDate = (updated.start_date ?? current.start_date).slice(0, 10);
  const start = fromDateOnly(startDate);
  const schedule = {
    frequency: recurrence.frequency,
    interval: recurrence.interval,
    weekday: recurrence.frequency === RECURRENCE_FREQUENCIES.weekly ? start.getDay() : null,
    day_of_month:
      recurrence.frequency === RECURRENCE_FREQUENCIES.monthly || recurrence.frequency === RECURRENCE_FREQUENCIES.yearly
        ? start.getDate()
        : null,
    month: recurrence.frequency === RECURRENCE_FREQUENCIES.yearly ? start.getMonth() + 1 : null,
    start_date: startDate,
    end_date: recurrence.endDate,
  };
  const nextDue =
    scope === RECURRENCE_SCOPES.futureAndPast
      ? nextDueOnOrAfter(schedule, cursor)
      : nextDueOnOrAfter(schedule, cursor > today ? cursor : today);

  await recurringRepo.updateWithTags(ruleId, { ...updated, ...schedule, next_due: nextDue }, tagIds);

  const created = await materializeDueRecurring(now);

  if (scope === RECURRENCE_SCOPES.futureAndPast) {
    await recurringRepo.updateGeneratedTransactions(ruleId, { ...pastPatch, tagIds });
  }

  return created;
}
