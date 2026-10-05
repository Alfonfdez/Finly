/**
 * Shared calendar date-bound convention.
 *
 * - `undefined` keeps the historical default (no future: max = end of today).
 * - `null` means unbounded on that side.
 * - a `Date` is an inclusive clamp.
 *
 * Centralizes the rule used by the calendar navs (`MonthNav`/`YearNav`) and the
 * day grid (`DayPicker`), so it only lives in one place.
 */
import { startOfDay } from './formatters';

export interface ResolvedDateBounds {
  min: Date | null;
  max: Date | null;
}

export function resolveDateBounds(
  minDate?: Date | null,
  maxDate?: Date | null,
  today: Date = new Date(),
): ResolvedDateBounds {
  return {
    min: minDate ?? null,
    max: maxDate === undefined ? today : maxDate,
  };
}

/** The first day strictly after `startDay` (used as the recurring end-date minimum). */
export function dayAfter(startDay: Date): Date {
  const d = startOfDay(startDay);
  d.setDate(d.getDate() + 1);
  return d;
}

/** True when `endDate` is strictly after `startDay` (day granularity). */
export function isEndAfterStart(startDay: Date, endDate: Date): boolean {
  return startOfDay(endDate).getTime() > startOfDay(startDay).getTime();
}
