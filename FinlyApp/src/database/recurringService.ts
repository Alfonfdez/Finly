import { withTransaction } from './drizzle/engine';
import { recurringRepo, type RecurringRuleInput } from './repositories/recurringRepo';
import { advanceOccurrence, buildRecurrenceSchedule, isRecurrenceEnded, isSkippedWindowRecoverable, listDueOccurrences, nextDueOnOrAfter, fromDateOnly, recurrenceSkipWindow, todayDateOnly, MAX_CATCH_UP_OCCURRENCES } from '../utils/recurrence';
import { RECURRENCE_FREQUENCIES, RECURRENCE_SCOPES, USER_ID, type RecurrenceScope } from '../constants/types';
import type { RecurringRule } from './types';

/**
 * Materialize a single rule's due occurrences (bounded) and advance its cursor.
 * Idempotent: the hasOccurrence guard plus the unique occurrence index.
 *
 * @returns the number of transactions created for this rule.
 */
async function materializeRule(rule: RecurringRule, today: string): Promise<number> {
  const tagIds = await recurringRepo.getTagIds(rule.id);
  const { occurrences, nextDue } = listDueOccurrences(
    rule,
    rule.next_due,
    today,
    MAX_CATCH_UP_OCCURRENCES,
  );

  let created = 0;
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
  return created;
}

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

  let created = 0;
  for (const rule of rules) {
    created += await materializeRule(rule, today);
  }
  return created;
}

export interface CreateRecurringRuleParams {
  name: string;
  type: RecurringRule['type'];
  account_id: number;
  category_id: number;
  amount: number;
  description: string | null;
  /** The selected transaction date, used as the schedule anchor. */
  date: string;
  frequency: RecurringRule['frequency'];
  interval: number;
  endDate: string | null;
  skipFirst: boolean;
  tagIds: number[];
  now?: Date;
}

/**
 * Create a recurring rule from a transaction-form draft and immediately
 * materialize any occurrence that is already due.
 *
 * @returns the number of transactions created by the initial reconciliation.
 */
export async function createRecurringRule(params: CreateRecurringRuleParams): Promise<number> {
  const schedule = buildRecurrenceSchedule(
    fromDateOnly(params.date.slice(0, 10)),
    params.frequency,
    params.interval,
    params.endDate,
  );
  const nextDue = params.skipFirst ? advanceOccurrence(schedule, schedule.start_date) : schedule.start_date;

  await recurringRepo.createWithTags(
    {
      user_id: USER_ID,
      name: params.name,
      type: params.type,
      account_id: params.account_id,
      category_id: params.category_id,
      amount: params.amount,
      description: params.description,
      ...schedule,
      next_due: nextDue,
      active: 1,
    },
    params.tagIds,
  );

  return materializeDueRecurring(params.now);
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
  // A finished rule has no occurrence left within its end date — refuse to
  // reactivate it (the toggle for such a rule is disabled in the UI).
  if (isRecurrenceEnded(rule, rule.next_due, today)) return 0;

  const nextDue = rule.next_due < today ? nextDueOnOrAfter(rule, today) : rule.next_due;

  await recurringRepo.reactivate(ruleId, nextDue);

  // Materialize only this rule (its cursor is now on/after today); any other
  // overdue rules are caught up by the app-start/foreground/midnight runs.
  const resumed = await recurringRepo.getById(ruleId);
  return resumed ? materializeRule(resumed, today) : 0;
}

/**
 * Pause or resume a rule from the Recurring screen toggle. Pausing only clears
 * the active flag; resuming skips the paused window (see {@link resumeRecurringRule}).
 *
 * @returns the number of transactions created (resume only).
 */
export async function setRecurringRuleActive(ruleId: number, active: boolean, now: Date = new Date()): Promise<number> {
  if (!active) {
    await recurringRepo.setActive(ruleId, false);
    return 0;
  }
  return resumeRecurringRule(ruleId, now);
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
  type: RecurringRule['type'];
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
  const skip = scope === RECURRENCE_SCOPES.future ? recurrenceSkipWindow(schedule, cursor, today) : null;

  // "Future + past" re-anchors at the earliest skipped occurrence so the window a
  // previous "Future only" edit passed over is back-filled.
  const anchor =
    scope === RECURRENCE_SCOPES.futureAndPast && current.skipped_from != null && current.skipped_from < cursor
      ? current.skipped_from
      : cursor;
  const nextDue =
    scope === RECURRENCE_SCOPES.futureAndPast
      ? nextDueOnOrAfter(schedule, anchor)
      : nextDueOnOrAfter(schedule, cursor > today ? cursor : today);

  // "Future + past" fills the skipped window; "Future only" records the earliest
  // skipped occurrence so it can be recovered later. Clear it once it falls past
  // the (possibly shortened) end date.
  let skippedFrom = scope === RECURRENCE_SCOPES.futureAndPast ? null : current.skipped_from ?? skip?.from ?? null;
  if (!isSkippedWindowRecoverable(skippedFrom, schedule.end_date, today)) {
    skippedFrom = null;
  }

  await recurringRepo.updateWithTags(
    ruleId,
    { ...updated, ...schedule, next_due: nextDue, skipped_from: skippedFrom },
    tagIds,
  );

  const created = await materializeDueRecurring(now);

  if (scope === RECURRENCE_SCOPES.futureAndPast) {
    await recurringRepo.updateGeneratedTransactions(ruleId, { ...pastPatch, tagIds });
  }

  return created;
}
