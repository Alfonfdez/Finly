import { describe, expect, it } from 'vitest';
import {
  advanceOccurrence,
  buildRecurrenceSchedule,
  fromDateOnly,
  isRecurrenceEnded,
  isLastDayAnchor,
  isSkippedWindowRecoverable,
  listDueOccurrences,
  nextEffectiveOccurrence,
  planEdit,
  recurrencePreview,
  recurrenceSkipWindow,
  recurringStatus,
  resolveEditAnchor,
  ruleEditCursor,
  toDateOnly,
  todayDateOnly,
  type RecurrenceSchedule,
} from '../../src/utils/recurrence';

const base: RecurrenceSchedule = {
  frequency: 'monthly',
  interval: 1,
  day_of_month: 2,
  start_date: '2026-01-02',
  end_date: null,
};

describe('recurrence date helpers', () => {
  it('round-trips a local date through date-only strings', () => {
    const date = new Date(2026, 9, 5, 14, 30, 0);
    expect(toDateOnly(date)).toBe('2026-10-05');
    const parsed = fromDateOnly('2026-10-05');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(9);
    expect(parsed.getDate()).toBe(5);
  });

  it('todayDateOnly uses the local calendar day', () => {
    expect(todayDateOnly(new Date(2026, 0, 1, 23, 59, 0))).toBe('2026-01-01');
  });
});

describe('advanceOccurrence', () => {
  it('advances daily by the interval', () => {
    expect(advanceOccurrence({ ...base, frequency: 'daily', interval: 1 }, '2026-01-01')).toBe('2026-01-02');
    expect(advanceOccurrence({ ...base, frequency: 'daily', interval: 3 }, '2026-01-01')).toBe('2026-01-04');
  });

  it('advances weekly by the interval', () => {
    expect(advanceOccurrence({ ...base, frequency: 'weekly', interval: 1 }, '2026-01-01')).toBe('2026-01-08');
    expect(advanceOccurrence({ ...base, frequency: 'weekly', interval: 2 }, '2026-01-01')).toBe('2026-01-15');
  });

  it('keeps the monthly day-of-month anchor across short months', () => {
    const schedule: RecurrenceSchedule = {
      frequency: 'monthly',
      interval: 1,
      day_of_month: 31,
      start_date: '2026-01-31',
      end_date: null,
    };
    expect(advanceOccurrence(schedule, '2026-01-31')).toBe('2026-02-28');
    expect(advanceOccurrence(schedule, '2026-02-28')).toBe('2026-03-31');
  });

  it('advances monthly by a multi-month interval from the anchor day', () => {
    const schedule: RecurrenceSchedule = { ...base, interval: 3, day_of_month: 2 };
    expect(advanceOccurrence(schedule, '2026-01-02')).toBe('2026-04-02');
  });

  it('clamps a yearly Feb 29 occurrence in non-leap years', () => {
    const schedule: RecurrenceSchedule = {
      frequency: 'yearly',
      interval: 1,
      month: 2,
      day_of_month: 29,
      start_date: '2024-02-29',
      end_date: null,
    };
    expect(advanceOccurrence(schedule, '2024-02-29')).toBe('2025-02-28');
    expect(advanceOccurrence(schedule, '2027-02-28')).toBe('2028-02-29');
  });
});

describe('buildRecurrenceSchedule last day', () => {
  it('anchors a monthly last-day rule on the last day of the start month', () => {
    const schedule = buildRecurrenceSchedule(new Date(2026, 0, 15), 'monthly', 1, null, true);
    expect(schedule.day_of_month).toBe(31);
    expect(schedule.start_date).toBe('2026-01-31');
    expect(advanceOccurrence(schedule, '2026-01-31')).toBe('2026-02-28');
    expect(advanceOccurrence(schedule, '2026-02-28')).toBe('2026-03-31');
  });

  it('ignores lastDay for non monthly/yearly frequencies', () => {
    const schedule = buildRecurrenceSchedule(new Date(2026, 0, 15), 'weekly', 1, null, true);
    expect(schedule.day_of_month).toBeNull();
    expect(schedule.start_date).toBe('2026-01-15');
  });
});

describe('listDueOccurrences', () => {
  it('back-fills every missed monthly occurrence up to today', () => {
    const result = listDueOccurrences(base, '2026-01-02', '2026-04-15');
    expect(result.occurrences).toEqual(['2026-01-02', '2026-02-02', '2026-03-02', '2026-04-02']);
    expect(result.nextDue).toBe('2026-05-02');
    expect(result.truncated).toBe(false);
  });

  it('returns nothing when the next due date is in the future', () => {
    const result = listDueOccurrences(base, '2026-06-02', '2026-04-15');
    expect(result.occurrences).toEqual([]);
    expect(result.nextDue).toBe('2026-06-02');
  });

  it('stops at the end date', () => {
    const result = listDueOccurrences({ ...base, end_date: '2026-03-02' }, '2026-01-02', '2026-06-15');
    expect(result.occurrences).toEqual(['2026-01-02', '2026-02-02', '2026-03-02']);
  });

  it('truncates at the safety cap', () => {
    const result = listDueOccurrences(
      { ...base, frequency: 'daily', interval: 1, start_date: '2026-01-01', day_of_month: null },
      '2026-01-01',
      '2027-01-01',
      10,
    );
    expect(result.occurrences).toHaveLength(10);
    expect(result.truncated).toBe(true);
  });
});

describe('isRecurrenceEnded', () => {
  const ended = { ...base, end_date: '2026-03-02' };

  it('is false without an end date', () => {
    expect(isRecurrenceEnded(base, '2099-01-02', '2026-04-15')).toBe(false);
  });

  it('is true when the cursor has jumped past the end date', () => {
    expect(isRecurrenceEnded(ended, '2026-04-02', '2026-04-15')).toBe(true);
  });

  it('is false while an occurrence remains on/after today within the end date', () => {
    expect(isRecurrenceEnded(ended, '2026-03-02', '2026-02-15')).toBe(false);
  });

  it('is true for a paused rule whose end date already passed (frozen cursor)', () => {
    // The frozen cursor (2026-02-02) is within the end date, but nothing remains from today.
    expect(isRecurrenceEnded(ended, '2026-02-02', '2026-04-15')).toBe(true);
  });

  it('nextEffectiveOccurrence keeps a frozen cursor that is still in the future', () => {
    expect(nextEffectiveOccurrence(ended, '2026-03-02', '2026-02-15')).toBe('2026-03-02');
    expect(nextEffectiveOccurrence(ended, '2026-02-02', '2026-04-15')).toBe('2026-04-02');
  });
});

describe('recurrencePreview', () => {
  const monthly = { ...base, frequency: 'monthly' as const, interval: 1, day_of_month: 2, start_date: '2026-01-02' };

  it('create: counts the occurrences up to today', () => {
    expect(recurrencePreview(monthly, { today: '2026-04-15' })).toEqual({ firstDate: '2026-01-02', count: 4 });
  });

  it('create: a future first occurrence creates nothing', () => {
    expect(recurrencePreview({ ...monthly, start_date: '2026-05-02' }, { today: '2026-04-15' })).toEqual({
      firstDate: '2026-05-02',
      count: 0,
    });
  });

  it('create: respects the end date', () => {
    expect(recurrencePreview({ ...monthly, end_date: '2026-03-02' }, { today: '2026-04-15' })).toEqual({
      firstDate: '2026-01-02',
      count: 3,
    });
  });

  it('edit (future only): anchors on/after today', () => {
    expect(recurrencePreview(monthly, { today: '2026-04-15', cursor: '2026-01-02' })).toEqual({
      firstDate: '2026-05-02',
      count: 0,
    });
  });

  it('edit (future + past): back-fills from the cursor', () => {
    expect(recurrencePreview(monthly, { today: '2026-04-15', cursor: '2026-01-02', scope: 'futureAndPast' })).toEqual({
      firstDate: '2026-01-02',
      count: 4,
    });
  });

  it('edit (future only): applies a denser schedule from today, not the stale cursor', () => {
    const daily: RecurrenceSchedule = { frequency: 'daily', interval: 1, day_of_month: null, start_date: '2026-09-01', end_date: null };
    const previous: RecurrenceSchedule = { frequency: 'monthly', interval: 1, day_of_month: 1, start_date: '2026-09-01', end_date: null };
    expect(recurrencePreview(daily, { today: '2026-10-06', cursor: '2026-11-01', previousSchedule: previous })).toEqual({
      firstDate: '2026-10-06',
      count: 1,
    });
  });

  it('edit (future only): does not re-count an already-generated today', () => {
    const daily: RecurrenceSchedule = { frequency: 'daily', interval: 1, day_of_month: null, start_date: '2026-10-06', end_date: null };
    expect(recurrencePreview(daily, { today: '2026-10-06', cursor: '2026-10-07', previousSchedule: daily })).toEqual({
      firstDate: '2026-10-07',
      count: 0,
    });
  });
});

describe('resolveEditAnchor (future only)', () => {
  const daily: RecurrenceSchedule = { frequency: 'daily', interval: 1, day_of_month: null, start_date: '2026-10-06', end_date: null };
  const monthly: RecurrenceSchedule = { frequency: 'monthly', interval: 1, day_of_month: 1, start_date: '2026-09-01', end_date: null };

  it('anchors at today when today is a new occurrence', () => {
    expect(resolveEditAnchor(daily, { cursor: '2026-11-01', scope: 'future', today: '2026-10-06' })).toBe('2026-10-06');
  });

  it('skips today when it was already generated under the previous schedule', () => {
    expect(resolveEditAnchor(daily, { cursor: '2026-10-07', scope: 'future', today: '2026-10-06', previousSchedule: daily })).toBe('2026-10-07');
  });

  it('does not skip today when the schedule change made it a new occurrence', () => {
    expect(resolveEditAnchor(daily, { cursor: '2026-11-01', scope: 'future', today: '2026-10-06', previousSchedule: monthly })).toBe('2026-10-06');
  });

  it('anchors strictly after today when today is not an occurrence', () => {
    expect(resolveEditAnchor(monthly, { cursor: '2026-11-01', scope: 'future', today: '2026-10-06' })).toBe('2026-11-01');
  });

  it('future + past back-fills from the cursor regardless of today', () => {
    expect(resolveEditAnchor(monthly, { cursor: '2026-09-01', scope: 'futureAndPast', today: '2026-10-06' })).toBe('2026-09-01');
  });
});

describe('isSkippedWindowRecoverable', () => {
  it('is false without a recorded skip', () => {
    expect(isSkippedWindowRecoverable(null, null, '2026-10-07')).toBe(false);
    expect(isSkippedWindowRecoverable(undefined, null, '2026-10-07')).toBe(false);
  });

  it('is false for a skip in the future', () => {
    expect(isSkippedWindowRecoverable('2026-12-01', null, '2026-10-07')).toBe(false);
  });

  it('is true for a past skip with no end date', () => {
    expect(isSkippedWindowRecoverable('2026-10-01', null, '2026-10-07')).toBe(true);
  });

  it('is false once the end date falls before the skip', () => {
    expect(isSkippedWindowRecoverable('2026-10-01', '2026-09-30', '2026-10-07')).toBe(false);
    expect(isSkippedWindowRecoverable('2026-10-01', '2026-10-31', '2026-10-07')).toBe(true);
  });
});

describe('recurrenceSkipWindow', () => {
  const daily = { ...base, frequency: 'daily' as const, interval: 1, day_of_month: null, start_date: '2026-09-01' };

  it('returns null when the cursor is already at the next occurrence', () => {
    expect(recurrenceSkipWindow(daily, '2026-10-08', '2026-10-07')).toBeNull();
  });

  it('reports the occurrences a Future-only edit would skip', () => {
    expect(recurrenceSkipWindow(daily, '2026-10-01', '2026-10-07')).toEqual({
      from: '2026-10-01',
      to: '2026-10-07',
      count: 6,
    });
  });

  it('respects the end date', () => {
    expect(recurrenceSkipWindow({ ...daily, end_date: '2026-10-03' }, '2026-10-01', '2026-10-07')).toEqual({
      from: '2026-10-01',
      to: '2026-10-04',
      count: 3,
    });
  });

  it('respects a multi-unit interval when counting', () => {
    // Occurrences every 2 days: Oct 1, 3, 5, 7 → the window [Oct 1, Oct 7) holds 3.
    expect(recurrenceSkipWindow({ ...daily, interval: 2 }, '2026-10-01', '2026-10-07')).toEqual({
      from: '2026-10-01',
      to: '2026-10-07',
      count: 3,
    });
  });
});

describe('buildRecurrenceSchedule', () => {
  const start = new Date(2026, 9, 6); // Tue 6 Oct 2026

  it('derives the anchor columns from the start day', () => {
    expect(buildRecurrenceSchedule(start, 'monthly', 1)).toMatchObject({
      frequency: 'monthly',
      interval: 1,
      weekday: null,
      day_of_month: 6,
      month: null,
      start_date: '2026-10-06',
      end_date: null,
    });
    expect(buildRecurrenceSchedule(start, 'yearly', 2, '2027-10-06')).toMatchObject({
      day_of_month: 6,
      month: 10,
      end_date: '2027-10-06',
    });
    expect(buildRecurrenceSchedule(start, 'weekly', 1)).toMatchObject({
      weekday: 2,
      day_of_month: null,
      month: null,
    });
  });

  it('advances one interval from the start date', () => {
    const schedule = buildRecurrenceSchedule(start, 'monthly', 1);
    expect(advanceOccurrence(schedule, schedule.start_date)).toBe('2026-11-06');
  });

  it('accepts a Date end date (normalized to date-only)', () => {
    expect(buildRecurrenceSchedule(start, 'daily', 1, new Date(2026, 9, 31))).toMatchObject({
      end_date: '2026-10-31',
    });
  });
});

describe('recurringStatus', () => {
  const rule = {
    frequency: 'monthly' as const,
    interval: 1,
    day_of_month: 5,
    start_date: '2026-10-05',
    end_date: null,
    active: 1,
    next_due: '2026-11-05',
  };

  it('is active when the flag is on and an occurrence remains', () => {
    expect(recurringStatus(rule, '2026-10-10')).toBe('active');
  });

  it('is paused when the flag is off', () => {
    expect(recurringStatus({ ...rule, active: 0 }, '2026-10-10')).toBe('paused');
  });

  it('is ended (over the flag) when no occurrence remains within the end date', () => {
    const ended = { ...rule, end_date: '2026-09-30', next_due: '2026-10-01' };
    expect(recurringStatus(ended, '2026-10-10')).toBe('ended');
    expect(recurringStatus({ ...ended, active: 0 }, '2026-10-10')).toBe('ended');
  });
});

describe('ruleEditCursor', () => {
  const schedule: RecurrenceSchedule = { frequency: 'daily', interval: 1, day_of_month: null, start_date: '2026-10-01', end_date: null };

  it('anchors a fresh rule on the new schedule start', () => {
    expect(ruleEditCursor({ next_due: '2026-10-30', start_date: '2026-10-30' }, schedule)).toBe('2026-10-01');
  });

  it('keeps the cursor of a rule that already ran', () => {
    expect(ruleEditCursor({ next_due: '2026-10-14', start_date: '2026-10-01' }, schedule)).toBe('2026-10-14');
  });
});

describe('planEdit', () => {
  const daily: RecurrenceSchedule = { frequency: 'daily', interval: 1, day_of_month: null, start_date: '2026-09-01', end_date: null };

  it('Future only skips the missed window and records it as recoverable', () => {
    const plan = planEdit({ schedule: daily, cursor: '2026-09-01', scope: 'future', today: '2026-10-07' });
    expect(plan.nextDue).toBe('2026-10-07');
    expect(plan.skipWindow).toEqual({ from: '2026-09-01', to: '2026-10-07', count: 36 });
    expect(plan.skippedFrom).toBe('2026-09-01');
    expect(plan.preview).toEqual({ firstDate: '2026-10-07', count: 1 });
  });

  it('Future + past back-fills from the cursor and clears the record', () => {
    const plan = planEdit({ schedule: daily, cursor: '2026-09-01', scope: 'futureAndPast', today: '2026-10-07' });
    expect(plan.nextDue).toBe('2026-09-01');
    expect(plan.skipWindow).toBeNull();
    expect(plan.skippedFrom).toBeNull();
    expect(plan.preview).toEqual({ firstDate: '2026-09-01', count: 37 });
  });

  it('Future only applies a denser schedule from today (previousSchedule)', () => {
    const previous: RecurrenceSchedule = { frequency: 'monthly', interval: 1, day_of_month: 1, start_date: '2026-09-01', end_date: null };
    const plan = planEdit({ schedule: daily, previousSchedule: previous, cursor: '2026-11-01', scope: 'future', today: '2026-10-06' });
    expect(plan.nextDue).toBe('2026-10-06');
    expect(plan.skippedFrom).toBeNull();
    expect(plan.preview).toEqual({ firstDate: '2026-10-06', count: 1 });
  });

  it('drops a recorded skip once the end date falls before it', () => {
    const ended: RecurrenceSchedule = { ...daily, end_date: '2026-08-15' };
    const plan = planEdit({ schedule: ended, cursor: '2026-09-01', scope: 'future', today: '2026-10-07', skippedFrom: '2026-09-01' });
    expect(plan.skippedFrom).toBeNull();
  });
});

describe('isLastDayAnchor', () => {
  it('is true only for the last-day sentinel (31)', () => {
    expect(isLastDayAnchor(31)).toBe(true);
    expect(isLastDayAnchor(30)).toBe(false);
    expect(isLastDayAnchor(1)).toBe(false);
    expect(isLastDayAnchor(null)).toBe(false);
    expect(isLastDayAnchor(undefined)).toBe(false);
  });
});
