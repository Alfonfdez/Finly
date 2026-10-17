import { describe, it, expect } from 'vitest';
import { PERIODS } from '../../src/constants/types';
import {
  canGoForward,
  canJumpToCurrent,
  isSamePeriod,
  shiftPeriod,
} from '../../src/utils/periodNavigation';

function iso(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

describe('shiftPeriod', () => {
  it('steps days', () => {
    expect(iso(shiftPeriod(PERIODS.day, new Date(2026, 9, 17), -1))).toBe('2026-10-16');
    expect(iso(shiftPeriod(PERIODS.day, new Date(2026, 9, 17), 1))).toBe('2026-10-18');
  });

  it('steps weeks by seven days', () => {
    expect(iso(shiftPeriod(PERIODS.week, new Date(2026, 9, 17), -1))).toBe('2026-10-10');
    expect(iso(shiftPeriod(PERIODS.week, new Date(2026, 9, 17), 2))).toBe('2026-10-31');
  });

  it('steps months and clamps the day to the target month', () => {
    expect(iso(shiftPeriod(PERIODS.month, new Date(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(iso(shiftPeriod(PERIODS.month, new Date(2026, 2, 15), -1))).toBe('2026-02-15');
    expect(iso(shiftPeriod(PERIODS.month, new Date(2026, 0, 15), -1))).toBe('2025-12-15');
  });

  it('steps years and clamps 29 February', () => {
    expect(iso(shiftPeriod(PERIODS.year, new Date(2028, 1, 29), 1))).toBe('2029-02-28');
    expect(iso(shiftPeriod(PERIODS.year, new Date(2026, 5, 10), -2))).toBe('2024-06-10');
  });

  it('leaves the custom range anchor untouched', () => {
    expect(iso(shiftPeriod(PERIODS.custom, new Date(2026, 9, 17), 1))).toBe('2026-10-17');
  });
});

describe('isSamePeriod', () => {
  // 17 Oct 2026 is a Saturday; its Monday-based week starts on 12 Oct.
  const today = new Date(2026, 9, 17);

  it('compares whole days', () => {
    expect(isSamePeriod(PERIODS.day, new Date(2026, 9, 17, 21, 30), today)).toBe(true);
    expect(isSamePeriod(PERIODS.day, new Date(2026, 9, 16), today)).toBe(false);
  });

  it('compares the Monday-based week', () => {
    expect(isSamePeriod(PERIODS.week, new Date(2026, 9, 12), today)).toBe(true);
    expect(isSamePeriod(PERIODS.week, new Date(2026, 9, 11), today)).toBe(false);
  });

  it('compares months and years', () => {
    expect(isSamePeriod(PERIODS.month, new Date(2026, 9, 1), today)).toBe(true);
    expect(isSamePeriod(PERIODS.month, new Date(2026, 8, 30), today)).toBe(false);
    expect(isSamePeriod(PERIODS.year, new Date(2026, 0, 1), today)).toBe(true);
    expect(isSamePeriod(PERIODS.year, new Date(2025, 11, 31), today)).toBe(false);
  });
});

describe('canGoForward / canJumpToCurrent', () => {
  const today = new Date(2026, 9, 17);

  it('offers the next step only while not on the current period', () => {
    expect(canGoForward(PERIODS.day, today, today)).toBe(false);
    expect(canGoForward(PERIODS.day, new Date(2026, 9, 16), today)).toBe(true);
    expect(canGoForward(PERIODS.week, new Date(2026, 9, 12), today)).toBe(false);
    expect(canGoForward(PERIODS.week, new Date(2026, 9, 5), today)).toBe(true);
  });

  it('offers jump-to-current only two or more steps back', () => {
    expect(canJumpToCurrent(PERIODS.day, today, today)).toBe(false);
    expect(canJumpToCurrent(PERIODS.day, new Date(2026, 9, 16), today)).toBe(false);
    expect(canJumpToCurrent(PERIODS.day, new Date(2026, 9, 15), today)).toBe(true);
  });

  it('applies the same rule to weeks, months and years', () => {
    expect(canJumpToCurrent(PERIODS.week, new Date(2026, 9, 5), today)).toBe(false); // previous week
    expect(canJumpToCurrent(PERIODS.week, new Date(2026, 8, 28), today)).toBe(true);
    expect(canJumpToCurrent(PERIODS.month, new Date(2026, 8, 20), today)).toBe(false); // previous month
    expect(canJumpToCurrent(PERIODS.month, new Date(2026, 7, 20), today)).toBe(true);
    expect(canJumpToCurrent(PERIODS.year, new Date(2025, 3, 1), today)).toBe(false); // previous year
    expect(canJumpToCurrent(PERIODS.year, new Date(2024, 3, 1), today)).toBe(true);
  });
});
