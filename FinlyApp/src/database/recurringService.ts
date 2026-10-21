import { withTransaction } from './drizzle/engine';
import { recurringRepo, type RecurringRuleInput } from './repositories/recurringRepo';
import { buildRecurrenceSchedule, isRecurrenceEnded, listDueOccurrences, nextDueOnOrAfter, planEdit, recurrencePreview, ruleEditCursor, fromDateOnly, todayDateOnly, MAX_CATCH_UP_OCCURRENCES } from '../utils/recurrence';
import { InvalidRecurringRuleError, validateRecurringRuleDraft, type RecurringRuleDraft } from '../utils/recurringRuleValidation';
import { datePart } from '../utils/formatters';
import { RECURRENCE_SCOPES, RECURRING_RULE_ERRORS, RULE_ACTIVE, USER_ID, type RecurrenceScope, type RecurrenceSpec } from '../constants/types';
import type { RecurringRule } from './types';

/**
 * Serializes every reconciliation and rule-state write: the app start, foreground
 * and midnight timers can fire together with a rule edit, and the web engine cannot
 * nest transactions. Each entry point queues behind the previous one.
 */
let materializationQueue: Promise<unknown> = Promise.resolve();

function runExclusive<T>(task: () => Promise<T>): Promise<T> {
  const run = materializationQueue.then(task, task);
  materializationQueue = run.then(() => undefined, () => undefined);
  return run;
}

/**
 * Catch up one rule inside an already open transaction (no transaction of its own).
 * The existing occurrence dates are fetched once, so a long catch-up costs one
 * query instead of one per occurrence; the unique occurrence index stays as the
 * last line of defence.
 */
async function materializeRuleInRun(rule: RecurringRule, today: string): Promise<number> {
  const [tagIds, existingDates] = await Promise.all([
    recurringRepo.getTagIds(rule.id),
    recurringRepo.listOccurrenceDates(rule.id),
  ]);
  const existing = new Set(existingDates);
  const { occurrences, nextDue } = listDueOccurrences(
    rule,
    rule.next_due,
    today,
    MAX_CATCH_UP_OCCURRENCES,
  );

  let created = 0;
  for (const occurrence of occurrences) {
    if (existing.has(occurrence)) continue;
    await recurringRepo.insertOccurrence(rule, occurrence, tagIds);
    created += 1;
  }
  if (nextDue !== rule.next_due) {
    await recurringRepo.updateNextDue(rule.id, nextDue);
  }
  return created;
}

/** Catch up a single rule in its own transaction (resume path). */
async function materializeRule(rule: RecurringRule, today: string): Promise<number> {
  let created = 0;
  await withTransaction(async () => {
    created = await materializeRuleInRun(rule, today);
  });
  return created;
}

/** Reconcile every due rule inside an already open transaction (no transaction of its own). */
async function materializeDueInTransaction(now: Date): Promise<number> {
  const today = todayDateOnly(now);
  let created = 0;
  const rules = await recurringRepo.listDue(today);
  for (const rule of rules) {
    created += await materializeRuleInRun(rule, today);
  }
  return created;
}

/** Reconcile every due rule in one transaction (the "single DB transaction" run). */
async function materializeDueCore(now: Date): Promise<number> {
  let created = 0;
  await withTransaction(async () => {
    created = await materializeDueInTransaction(now);
  });
  return created;
}

/**
 * Materialize every due occurrence for all active recurring rules.
 *
 * Runs on app start, on foreground and on the midnight timer. Runs are serialized,
 * so overlapping triggers can never interleave their cursors, and the whole run
 * happens inside one transaction. Safe to call repeatedly: the unique occurrence
 * index plus the already-generated date set make it idempotent. The list is bounded
 * per rule to avoid runaway generation.
 *
 * @returns the number of transactions created in this run.
 */
export function materializeDueRecurring(now: Date = new Date()): Promise<number> {
  return runExclusive(() => materializeDueCore(now));
}

/**
 * Reject the intrinsic invariants the UI already enforces (defensive: imported or
 * future callers). Uniqueness of the name stays in the form - there is no race in a
 * local, single-user database.
 */
function assertValidRule(draft: RecurringRuleDraft): void {
  const error = validateRecurringRuleDraft(draft);
  if (error) throw new InvalidRecurringRuleError(error);
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
  /** Monthly/yearly: anchor on the last day of the month instead of the start day. */
  lastDay?: boolean;
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
  return runExclusive(async () => {
    const schedule = buildRecurrenceSchedule(
      fromDateOnly(datePart(params.date)),
      params.frequency,
      params.interval,
      params.endDate,
      params.lastDay,
    );
    // Validate the schedule the rule actually gets: with the last-day anchor the
    // start can move to the month end, so the raw picked date is not enough.
    assertValidRule({
      name: params.name,
      startDate: schedule.start_date,
      endDate: params.endDate,
      interval: params.interval,
    });
    const now = params.now ?? new Date();
    // Refuse a backlog that would not finish in this run: every accepted rule must
    // catch up completely, so the cursor never stays in the past.
    if (recurrencePreview(schedule, { today: todayDateOnly(now) }).truncated) {
      throw new InvalidRecurringRuleError(RECURRING_RULE_ERRORS.tooManyOccurrences);
    }
    const nextDue = schedule.start_date;

    // One transaction: a failure while catching up must not leave a rule without
    // its due occurrences.
    return withTransaction(async (db) => {
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
          active: RULE_ACTIVE,
        },
        params.tagIds,
        db,
      );

      return materializeDueInTransaction(now);
    });
  });
}

/** Resume a paused rule (cursor jump + immediate catch-up), serialized with the runs. */
async function resumeCore(ruleId: number, now: Date): Promise<number> {
  const rule = await recurringRepo.getById(ruleId);
  if (!rule) return 0;

  const today = todayDateOnly(now);
  // A finished rule has no occurrence left within its end date — refuse to
  // reactivate it (the toggle for such a rule is disabled in the UI).
  if (isRecurrenceEnded(rule, rule.next_due, today)) return 0;

  const nextDue = rule.next_due < today ? nextDueOnOrAfter(rule, today) : rule.next_due;

  // The pause window stays skipped forever, so a recovered-skip record from before
  // the pause can no longer be back-filled faithfully — drop it when the cursor moves.
  await recurringRepo.reactivate(ruleId, nextDue, nextDue !== rule.next_due);

  // Materialize only this rule (its cursor is now on/after today); any other
  // overdue rules are caught up by the app-start/foreground/midnight runs.
  const resumed = await recurringRepo.getById(ruleId);
  return resumed ? materializeRule(resumed, today) : 0;
}

/**
 * Resume a paused rule. Occurrences missed while paused are intentionally NOT
 * created: the cursor jumps to the first occurrence on/after today, then the
 * current/next occurrence is materialized immediately.
 *
 * @returns the number of transactions created by the immediate reconciliation.
 */
export function resumeRecurringRule(ruleId: number, now: Date = new Date()): Promise<number> {
  return runExclusive(() => resumeCore(ruleId, now));
}

/**
 * Pause or resume a rule from the Recurring screen toggle. Pausing only clears
 * the active flag; resuming skips the paused window (see {@link resumeRecurringRule}).
 *
 * @returns the number of transactions created (resume only).
 */
export function setRecurringRuleActive(ruleId: number, active: boolean, now: Date = new Date()): Promise<number> {
  if (!active) {
    return runExclusive(async () => {
      await recurringRepo.setActive(ruleId, false);
      return 0;
    });
  }
  return resumeRecurringRule(ruleId, now);
}

export type RecurringEditRecurrence = RecurrenceSpec;

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
 * The whole edit is serialized with the reconciliation runs, so a foreground
 * catch-up can never interleave its cursor reads with these writes.
 *
 * @returns the number of transactions created by the second reconciliation.
 */
export function saveRecurringRuleEdit(params: RecurringEditParams): Promise<number> {
  const { ruleId, updated, recurrence, scope, pastPatch, tagIds } = params;

  return runExclusive(async () => {
    const now = params.now ?? new Date();
    const today = todayDateOnly(now);

    // One transaction for the whole edit: the pre-catch-up, the rule update, the
    // post-update catch-up and the past patch either all apply or none do.
    return withTransaction(async (db) => {
      await materializeDueInTransaction(now);

      const current = await recurringRepo.getById(ruleId);
      if (!current) return 0;

      const startDate = datePart(updated.start_date ?? current.start_date);
      const schedule = buildRecurrenceSchedule(fromDateOnly(startDate), recurrence.frequency, recurrence.interval, recurrence.endDate, recurrence.lastDay);

      assertValidRule({
        name: updated.name ?? current.name,
        startDate: schedule.start_date,
        endDate: recurrence.endDate,
        interval: recurrence.interval,
      });

      // Mirror the form: occurrences that already exist do not count against the cap.
      const existingOccurrences = new Set(await recurringRepo.listOccurrenceDates(ruleId));
      const plan = planEdit({
        schedule,
        previousSchedule: current,
        cursor: ruleEditCursor(current, schedule),
        scope,
        today,
        skippedFrom: current.skipped_from,
        existingOccurrences,
        ruleActive: current.active === RULE_ACTIVE,
      });

      // Same guard as creation: an edit that would have to generate more than one run
      // can hold is refused before anything is written (the reconciliation above only
      // materializes what was already due).
      if (plan.preview.truncated) {
        throw new InvalidRecurringRuleError(RECURRING_RULE_ERRORS.tooManyOccurrences);
      }

      await recurringRepo.updateWithTags(
        ruleId,
        { ...updated, ...schedule, next_due: plan.nextDue, skipped_from: plan.skippedFrom },
        tagIds,
        db,
      );

      const created = await materializeDueInTransaction(now);

      if (scope === RECURRENCE_SCOPES.futureAndPast) {
        await recurringRepo.updateGeneratedTransactions(ruleId, { ...pastPatch, tagIds }, db);
      }

      return created;
    });
  });
}
