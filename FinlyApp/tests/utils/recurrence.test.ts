import { describe, expect, it } from 'vitest';
import {
  advanceOccurrence,
  buildRecurrenceSchedule,
  fromDateOnly,
  isRecurrenceEnded,
  isSkippedWindowRecoverable,
  listDueOccurrences,
  nextEffectiveOccurrence,
  recurrenceSkipWindow,
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

  it('supports skipping the first occurrence by advancing one interval', () => {
    const schedule = buildRecurrenceSchedule(start, 'monthly', 1);
    expect(advanceOccurrence(schedule, schedule.start_date)).toBe('2026-11-06');
  });
});
