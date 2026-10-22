import { FIRST_DAYS, PERIODS, type FirstDay, type Period } from '../constants/types';
import { getDaysInMonth, isSameDay, weekStart } from './formatters';

/**
 * The anchor date shifted by `delta` periods (negative = back). Month/year moves
 * keep the day when the target month has it, so 31 Jan -1 month is 28/29 Feb and
 * a later switch to the Day period still lands on a sensible date.
 */
export function shiftPeriod(period: Period, date: Date, delta: number): Date {
  switch (period) {
    case PERIODS.day:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
    case PERIODS.week:
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta * 7);
    case PERIODS.month: {
      const monthIndex = date.getMonth() + delta;
      const year = date.getFullYear() + Math.floor(monthIndex / 12);
      const month = ((monthIndex % 12) + 12) % 12;
      const day = Math.min(date.getDate(), getDaysInMonth(year, month + 1));
      return new Date(year, month, day);
    }
    case PERIODS.year: {
      const year = date.getFullYear() + delta;
      const day = Math.min(date.getDate(), getDaysInMonth(year, date.getMonth() + 1));
      return new Date(year, date.getMonth(), day);
    }
    case PERIODS.custom:
      return new Date(date);
  }
}

/** Whether two dates belong to the same period (day, week, month or year). */
export function isSamePeriod(period: Period, a: Date, b: Date, firstDay: FirstDay = FIRST_DAYS.monday): boolean {
  switch (period) {
    case PERIODS.day:
    case PERIODS.custom:
      return isSameDay(a, b);
    case PERIODS.week:
      return weekStart(a, firstDay).getTime() === weekStart(b, firstDay).getTime();
    case PERIODS.month:
      return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    case PERIODS.year:
      return a.getFullYear() === b.getFullYear();
  }
}

/** The next period is only offered while it is not in the future. */
export function canGoForward(period: Period, date: Date, today: Date, firstDay: FirstDay = FIRST_DAYS.monday): boolean {
  return !isSamePeriod(period, date, today, firstDay);
}

/**
 * "Jump to the current period" only saves taps when the current period is two or
 * more steps away: on the current period you are already there, and on the
 * penultimate one a single forward step reaches it.
 */
export function canJumpToCurrent(period: Period, date: Date, today: Date, firstDay: FirstDay = FIRST_DAYS.monday): boolean {
  return (
    !isSamePeriod(period, date, today, firstDay) &&
    !isSamePeriod(period, date, shiftPeriod(period, today, -1), firstDay)
  );
}
