import { RECURRENCE_FREQUENCIES, RECURRENCE_SCOPES, RECURRING_STATUSES, LAST_DAY_OF_MONTH, RULE_ACTIVE, type RecurrenceFrequency, type RecurrenceScope, type RecurringStatus } from '../constants/types';
import { getDaysInMonth } from './formatters';

export interface RecurrenceSchedule {
  frequency: RecurrenceFrequency;
  interval: number;
  weekday?: number | null;
  day_of_month?: number | null;
  month?: number | null;
  start_date: string;
  end_date?: string | null;
}

export const MAX_CATCH_UP_OCCURRENCES = 500;

/** Safety bound for the schedule-probing loops (a schedule always advances monotonically). */
const MAX_SCHEDULE_PROBES = 10000;

/** Whether a `day_of_month` anchor means "the last day of the month". */
export function isLastDayAnchor(dayOfMonth: number | null | undefined): boolean {
  return dayOfMonth === LAST_DAY_OF_MONTH;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Build a recurrence schedule anchored on a start day (single source of truth for
 * the anchor columns). When `lastDay` is set for a monthly/yearly rule, the anchor
 * becomes the 31st (which clamps to each month's last day) and the start moves to
 * the last day of the start month.
 */
export function buildRecurrenceSchedule(
  startDay: Date,
  frequency: RecurrenceFrequency,
  interval: number,
  endDate: string | Date | null = null,
  lastDay = false,
): RecurrenceSchedule & { weekday: number | null; day_of_month: number | null; month: number | null; end_date: string | null } {
  const monthlyOrYearly =
    frequency === RECURRENCE_FREQUENCIES.monthly || frequency === RECURRENCE_FREQUENCIES.yearly;
  const useLastDay = lastDay && monthlyOrYearly;
  const effectiveStart = useLastDay
    ? new Date(startDay.getFullYear(), startDay.getMonth(), getDaysInMonth(startDay.getFullYear(), startDay.getMonth() + 1))
    : startDay;
  return {
    frequency,
    interval,
    weekday: frequency === RECURRENCE_FREQUENCIES.weekly ? startDay.getDay() : null,
    day_of_month: useLastDay ? LAST_DAY_OF_MONTH : monthlyOrYearly ? startDay.getDate() : null,
    month: frequency === RECURRENCE_FREQUENCIES.yearly ? startDay.getMonth() + 1 : null,
    start_date: toDateOnly(effectiveStart),
    end_date: endDate == null ? null : typeof endDate === 'string' ? endDate : toDateOnly(endDate),
  };
}

export function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function todayDateOnly(now: Date = new Date()): string {
  return toDateOnly(now);
}

function clampDay(year: number, monthIndex: number, day: number): number {
  const max = getDaysInMonth(year, monthIndex + 1);
  return Math.min(Math.max(day, 1), max);
}

export function advanceOccurrence(schedule: RecurrenceSchedule, from: string): string {
  const date = fromDateOnly(from);
  const interval = Math.max(1, Math.floor(schedule.interval) || 1);

  switch (schedule.frequency) {
    case RECURRENCE_FREQUENCIES.daily: {
      date.setDate(date.getDate() + interval);
      return toDateOnly(date);
    }
    case RECURRENCE_FREQUENCIES.weekly: {
      date.setDate(date.getDate() + interval * 7);
      return toDateOnly(date);
    }
    case RECURRENCE_FREQUENCIES.monthly: {
      const anchorDay = schedule.day_of_month ?? date.getDate();
      const monthCursor = new Date(date.getFullYear(), date.getMonth() + interval, 1);
      const day = clampDay(monthCursor.getFullYear(), monthCursor.getMonth(), anchorDay);
      return toDateOnly(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day));
    }
    case RECURRENCE_FREQUENCIES.yearly: {
      const anchorMonth = (schedule.month ?? date.getMonth() + 1) - 1;
      const anchorDay = schedule.day_of_month ?? date.getDate();
      const year = date.getFullYear() + interval;
      const day = clampDay(year, anchorMonth, anchorDay);
      return toDateOnly(new Date(year, anchorMonth, day));
    }
    default:
      return from;
  }
}

export interface CatchUpResult {
  occurrences: string[];
  nextDue: string;
  truncated: boolean;
}

/** First occurrence on or after `today` (used when a rule's schedule changes). */
export function nextDueOnOrAfter(schedule: RecurrenceSchedule, today: string): string {
  let cursor = schedule.start_date;
  let guard = 0;
  while (cursor < today && guard < MAX_SCHEDULE_PROBES) {
    if (schedule.end_date && cursor > schedule.end_date) break;
    cursor = advanceOccurrence(schedule, cursor);
    guard += 1;
  }
  return cursor;
}

/**
 * The next occurrence a rule would generate from `nextDue`, ignoring a pause
 * freeze: if the cursor is already in the future it is used as-is, otherwise the
 * cursor advances to the first occurrence on/after `today`.
 */
export function nextEffectiveOccurrence(schedule: RecurrenceSchedule, nextDue: string, today: string): string {
  return nextDue >= today ? nextDue : nextDueOnOrAfter(schedule, today);
}

/**
 * A rule is ended when it has an end date and no occurrence remains on/after
 * `today` within it — i.e. resuming it could never generate anything. Covers both
 * active rules (cursor already jumped past the end date) and paused ones (frozen
 * cursor, checked from today).
 */
export function isRecurrenceEnded(schedule: RecurrenceSchedule, nextDue: string, today: string): boolean {
  if (schedule.end_date == null) return false;
  return nextEffectiveOccurrence(schedule, nextDue, today) > schedule.end_date;
}

/**
 * The rule's display/filter status: `ended` (no occurrence left within the end date —
 * it wins over the active flag, matching the row's label) or, otherwise, `active`/`paused`.
 */
export function recurringStatus(
  rule: RecurrenceSchedule & { active: number; next_due: string },
  today: string,
): RecurringStatus {
  if (isRecurrenceEnded(rule, rule.next_due, today)) return RECURRING_STATUSES.ended;
  return rule.active === RULE_ACTIVE ? RECURRING_STATUSES.active : RECURRING_STATUSES.paused;
}

/**
 * Whether a recorded skip window can still be back-filled by "Future + past":
 * it exists, starts on/before today, and is not past the (current) end date.
 */
export function isSkippedWindowRecoverable(
  skippedFrom: string | null | undefined,
  endDate: string | null | undefined,
  today: string,
): boolean {
  if (skippedFrom == null || skippedFrom > today) return false;
  return endDate == null || skippedFrom <= endDate;
}

export interface SkipWindow {
  /** First skipped occurrence. */
  from: string;
  /** First occurrence after the skipped window (the new cursor). */
  to: string;
  /** Number of occurrences in `[from, to)`. */
  count: number;
}

/**
 * Occurrences a "Future only" edit would skip: those the schedule has in
 * `[first on/after cursor, first on/after max(cursor, today))`. Returns `null`
 * when nothing is skipped (the cursor is already at/after the next occurrence).
 */
export function recurrenceSkipWindow(
  schedule: RecurrenceSchedule,
  cursor: string,
  today: string,
): SkipWindow | null {
  const from = nextDueOnOrAfter(schedule, cursor);
  const to = nextDueOnOrAfter(schedule, cursor > today ? cursor : today);
  if (from >= to) return null;
  let count = 0;
  let c = from;
  while (c < to) {
    count += 1;
    c = advanceOccurrence(schedule, c);
  }
  return { from, to, count };
}

/** True when a rule has never generated or skipped an occurrence (its cursor still equals its start). */
export function isRuleUnmaterialized(rule: { next_due: string; start_date: string }): boolean {
  return rule.next_due === rule.start_date;
}

/**
 * The cursor an edit anchors from: a not-yet-started rule ("fresh") uses the NEW
 * schedule's start so moving the start re-anchors it; otherwise keep the rule's own
 * cursor (it may encode a deliberate skip from a pause/resume or a previous edit).
 */
export function ruleEditCursor(
  rule: { next_due: string; start_date: string },
  schedule: RecurrenceSchedule,
): string {
  return isRuleUnmaterialized(rule) ? schedule.start_date : rule.next_due;
}

export interface EditAnchorOptions {
  cursor: string;
  scope: RecurrenceScope;
  today: string;
  /** Earliest skipped occurrence to recover with "Future + past". */
  skippedFrom?: string | null;
  /**
   * The rule's schedule BEFORE the edit. The app has generated every occurrence of
   * it up to today, so it tells whether today's occurrence already exists — a
   * "Future only" edit then starts at the next occurrence instead of re-counting it.
   */
  previousSchedule?: RecurrenceSchedule | null;
}

/**
 * First occurrence a save will generate (the cursor anchor).
 * - "Future only": the new schedule's first occurrence on/after today (occurrences
 *   before today are skipped). Today's occurrence is also skipped when it already
 *   exists (it was generated under the previous schedule); but a schedule change that
 *   introduces today/future occurrences takes effect from **today**, never from the
 *   rule's stale cursor.
 * - "Future + past": back-fills from the rule's cursor — or the earliest recorded
 *   skipped occurrence.
 */
export function resolveEditAnchor(
  schedule: RecurrenceSchedule,
  { cursor, scope, today, skippedFrom = null, previousSchedule = null }: EditAnchorOptions,
): string {
  if (scope === RECURRENCE_SCOPES.futureAndPast) {
    const base = skippedFrom != null && skippedFrom < cursor ? skippedFrom : cursor;
    return nextDueOnOrAfter(schedule, base);
  }
  const anchor = nextDueOnOrAfter(schedule, today);
  const todayAlreadyGenerated =
    anchor === today && previousSchedule != null && nextDueOnOrAfter(previousSchedule, today) === today;
  return todayAlreadyGenerated ? advanceOccurrence(schedule, today) : anchor;
}

export interface RecurrencePreviewOptions {
  today: string;
  /** Edit mode: the rule's cursor (omit/null for create). */
  cursor?: string | null;
  scope?: RecurrenceScope;
  skippedFrom?: string | null;
  /** The rule's schedule before the edit (see {@link resolveEditAnchor}). */
  previousSchedule?: RecurrenceSchedule | null;
  /**
   * Scheduled dates that already have a generated transaction. Excluded from `count`,
   * so a back-fill summary reports only the occurrences the save will actually create.
   */
  existingOccurrences?: ReadonlySet<string>;
}

export interface RecurrencePreview {
  /** First (create) or next (edit) occurrence the save will generate. */
  firstDate: string;
  /** Number of transactions the save creates now (up to `today`, bounded). */
  count: number;
}

/**
 * What a recurring-form save will generate: the first/next occurrence date and
 * how many transactions it creates immediately (up to `today`, respecting the end
 * date). Mirrors the service's materialization.
 */
export function recurrencePreview(
  schedule: RecurrenceSchedule,
  { today, cursor = null, scope = RECURRENCE_SCOPES.future, skippedFrom = null, previousSchedule = null, existingOccurrences }: RecurrencePreviewOptions,
): RecurrencePreview {
  const firstDate =
    cursor == null
      ? schedule.start_date
      : resolveEditAnchor(schedule, { cursor, scope, today, skippedFrom, previousSchedule });
  const { occurrences } = listDueOccurrences(schedule, firstDate, today);
  const missing = existingOccurrences
    ? occurrences.filter(occurrence => !existingOccurrences.has(occurrence))
    : occurrences;
  return { firstDate, count: missing.length };
}

export interface RecurrenceEditPlanOptions {
  /** The schedule AFTER the edit. */
  schedule: RecurrenceSchedule;
  /** The rule's schedule BEFORE the edit (used to skip an already-generated today). */
  previousSchedule?: RecurrenceSchedule | null;
  /** The rule's cursor before the edit (see {@link ruleEditCursor}). */
  cursor: string;
  scope: RecurrenceScope;
  today: string;
  /** Earliest occurrence a previous "Future only" edit skipped. */
  skippedFrom?: string | null;
  /** Scheduled dates that already have a generated transaction (see {@link RecurrencePreviewOptions}). */
  existingOccurrences?: ReadonlySet<string>;
}

export interface RecurrenceEditPlan {
  /** New cursor (`next_due`) to persist. */
  nextDue: string;
  /** `skipped_from` to persist (null when nothing is recoverable). */
  skippedFrom: string | null;
  /** Occurrences a "Future only" save would skip. */
  skipWindow: SkipWindow | null;
  /** What the form's Summary block shows. */
  preview: RecurrencePreview;
}

/**
 * The single source of truth for a recurring-rule edit: the new cursor, the skipped
 * window, the recoverable-skip record and the Summary preview. Used by both the write
 * (`saveRecurringRuleEdit`) and the form, so the UI and the persisted result can't drift.
 */
export function planEdit({
  schedule,
  previousSchedule = null,
  cursor,
  scope,
  today,
  skippedFrom = null,
  existingOccurrences,
}: RecurrenceEditPlanOptions): RecurrenceEditPlan {
  const skipWindow = scope === RECURRENCE_SCOPES.future ? recurrenceSkipWindow(schedule, cursor, today) : null;
  const nextDue = resolveEditAnchor(schedule, { cursor, scope, today, skippedFrom, previousSchedule });
  let nextSkippedFrom = scope === RECURRENCE_SCOPES.futureAndPast ? null : skippedFrom ?? skipWindow?.from ?? null;
  if (!isSkippedWindowRecoverable(nextSkippedFrom, schedule.end_date, today)) {
    nextSkippedFrom = null;
  }
  const preview = recurrencePreview(schedule, { today, cursor, scope, skippedFrom, previousSchedule, existingOccurrences });
  return { nextDue, skippedFrom: nextSkippedFrom, skipWindow, preview };
}

export function listDueOccurrences(
  schedule: RecurrenceSchedule,
  from: string,
  today: string,
  cap: number = MAX_CATCH_UP_OCCURRENCES,
): CatchUpResult {
  const occurrences: string[] = [];
  let cursor = from;
  let truncated = false;

  while (cursor <= today) {
    if (schedule.end_date && cursor > schedule.end_date) break;
    if (occurrences.length >= cap) {
      truncated = true;
      break;
    }
    occurrences.push(cursor);
    cursor = advanceOccurrence(schedule, cursor);
  }

  return { occurrences, nextDue: cursor, truncated };
}
