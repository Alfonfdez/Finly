import { describe, it, expect } from 'vitest';
import { resolveDateBounds, isEndAfterStart, dayAfter } from '../../src/utils/calendarBounds';
import { CALENDAR_MIN_DATE } from '../../src/constants/calendar';

describe('resolveDateBounds', () => {
  const today = new Date(2026, 9, 5);

  it('defaults max to today (no future) and min to 1900 when omitted', () => {
    expect(resolveDateBounds(undefined, undefined, today)).toEqual({ min: CALENDAR_MIN_DATE, max: today });
  });

  it('treats null min as 1900 and null max as unbounded', () => {
    expect(resolveDateBounds(null, null, today)).toEqual({ min: CALENDAR_MIN_DATE, max: null });
  });

  it('passes explicit Date bounds through unchanged', () => {
    const min = new Date(2026, 9, 6);
    const max = new Date(2026, 11, 31);
    expect(resolveDateBounds(min, max, today)).toEqual({ min, max });
  });

  it('keeps a min bound while defaulting the max', () => {
    const min = new Date(2026, 9, 6);
    expect(resolveDateBounds(min, undefined, today)).toEqual({ min, max: today });
  });
});

describe('dayAfter', () => {
  it('returns the next calendar day at start of day', () => {
    const d = dayAfter(new Date(2026, 8, 30, 15, 30));
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 1, 0]);
  });
});

describe('isEndAfterStart', () => {
  it('is true only when the end day is strictly after the start day', () => {
    expect(isEndAfterStart(new Date(2026, 8, 1), new Date(2026, 8, 30))).toBe(true);
    expect(isEndAfterStart(new Date(2026, 8, 1, 23, 59), new Date(2026, 8, 2, 0, 0))).toBe(true);
    expect(isEndAfterStart(new Date(2026, 8, 1), new Date(2026, 8, 1, 23, 59))).toBe(false);
    expect(isEndAfterStart(new Date(2026, 8, 30), new Date(2026, 8, 1))).toBe(false);
  });
});
