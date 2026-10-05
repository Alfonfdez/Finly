import { describe, it, expect } from 'vitest';
import { resolveDateBounds, isEndAfterStart, dayAfter } from '../../src/utils/calendarBounds';

describe('resolveDateBounds', () => {
  const today = new Date(2026, 9, 5);

  it('defaults max to today (no future) and min to null when omitted', () => {
    expect(resolveDateBounds(undefined, undefined, today)).toEqual({ min: null, max: today });
  });

  it('treats null as unbounded on that side', () => {
    expect(resolveDateBounds(null, null, today)).toEqual({ min: null, max: null });
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
