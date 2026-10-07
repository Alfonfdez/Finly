import { RECURRENCE_FREQUENCIES, type RecurrenceFrequency } from '../constants/types';
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

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Build a recurrence schedule anchored on a start day (single source of truth for the anchor columns). */
export function buildRecurrenceSchedule(
  startDay: Date,
  frequency: RecurrenceFrequency,
  interval: number,
  endDate: string | null = null,
): RecurrenceSchedule & { weekday: number | null; day_of_month: number | null; month: number | null; end_date: string | null } {
  const monthlyOrYearly =
    frequency === RECURRENCE_FREQUENCIES.monthly || frequency === RECURRENCE_FREQUENCIES.yearly;
  return {
    frequency,
    interval,
    weekday: frequency === RECURRENCE_FREQUENCIES.weekly ? startDay.getDay() : null,
    day_of_month: monthlyOrYearly ? startDay.getDate() : null,
    month: frequency === RECURRENCE_FREQUENCIES.yearly ? startDay.getMonth() + 1 : null,
    start_date: toDateOnly(startDay),
    end_date: endDate,
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
    case 'daily': {
      date.setDate(date.getDate() + interval);
      return toDateOnly(date);
    }
    case 'weekly': {
      date.setDate(date.getDate() + interval * 7);
      return toDateOnly(date);
    }
    case 'monthly': {
      const anchorDay = schedule.day_of_month ?? date.getDate();
      const monthCursor = new Date(date.getFullYear(), date.getMonth() + interval, 1);
      const day = clampDay(monthCursor.getFullYear(), monthCursor.getMonth(), anchorDay);
      return toDateOnly(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day));
    }
    case 'yearly': {
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
  while (cursor < today && guard < 10000) {
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
