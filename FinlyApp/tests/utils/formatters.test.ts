import { describe, it, expect } from 'vitest';
import {
  HIDDEN_BALANCE,
  formatCurrency,
  formatSignedCurrency,
  formatAmount,
  fitFontSize,
  formatDate,
  getMonthName,
  startOfDay,
  endOfDay,
  weekStart,
  dayOffset,
  resolvePeriodRange,
  getDaysInMonth,
  isSameDay,
  formatDateLong,
  formatDateForDB,
  parseDbDate,
  dbTimestamp,
  isFutureDate,
  scaleFontSize,
  formatWeekRange,
  formatPeriodText,
} from '../../src/utils/formatters';
import {
  PERIODS,
  TEXT_SIZES,
  DECIMAL_SEPARATORS,
  FIRST_DAYS,
} from '../../src/constants/types';
import { LANGUAGES } from '../../src/utils/language';
import { setLanguage } from '../../src/i18n';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

describe('formatCurrency', () => {
  it('formats with comma decimal separator and dot thousands (default)', () => {
    expect(formatCurrency(1000)).toBe('1.000,00 €');
    expect(formatCurrency(0)).toBe('0,00 €');
  });

  it('formats with dot decimal separator and comma thousands', () => {
    expect(formatCurrency(1234.5, '$', DECIMAL_SEPARATORS.dot)).toBe('1,234.50 $');
  });

  it('handles negatives with a minus sign', () => {
    expect(formatCurrency(-50)).toBe('-50,00 €');
  });

  it('rounds to 2 decimals avoiding floating point artifacts', () => {
    expect(formatCurrency(999.999)).toBe('1.000,00 €');
    expect(formatCurrency(1234567.891)).toBe('1.234.567,89 €');
  });
});

describe('formatSignedCurrency', () => {
  it('prepends + for non-negative amounts', () => {
    expect(formatSignedCurrency(100)).toBe('+100,00 €');
    expect(formatSignedCurrency(0)).toBe('+0,00 €');
  });

  it('keeps the minus sign for negative amounts', () => {
    expect(formatSignedCurrency(-5)).toBe('-5,00 €');
  });
});

describe('formatAmount', () => {
  it('formats using the currency and separator from the config', () => {
    const config = { currency: '$', decimalSeparator: DECIMAL_SEPARATORS.dot };
    expect(formatAmount(1234.5, config)).toBe('1,234.50 $');
  });

  it('uses the config decimal separator for grouping and decimals', () => {
    const config = { currency: '€', decimalSeparator: DECIMAL_SEPARATORS.comma };
    expect(formatAmount(1234567.891, config)).toBe('1.234.567,89 €');
  });

  it('keeps the minus sign for negative amounts', () => {
    const config = { currency: '€', decimalSeparator: DECIMAL_SEPARATORS.comma };
    expect(formatAmount(-50, config)).toBe('-50,00 €');
  });
});

describe('fitFontSize', () => {
  it('keeps the base size when the text fits', () => {
    expect(fitFontSize('1.234,56 €', 18, 119)).toBe(18);
    expect(fitFontSize('0,00 €', 18, 119)).toBe(18);
  });

  it('shrinks long texts proportionally to fit the width', () => {
    // "1.234.567,89 €" is 14 chars; at 18px it overflows a 119px box
    const size = fitFontSize('1.234.567,89 €', 18, 119);
    expect(size).toBeLessThan(18);
    expect(size * 14 * 0.6).toBeLessThanOrEqual(119 * 0.95);
  });

  it('shrinks more for longer texts', () => {
    const millions = fitFontSize('1.234.567,89 €', 18, 119);
    const billions = fitFontSize('1.234.567.890,12 €', 18, 119);
    expect(billions).toBeLessThan(millions);
  });

  it('never goes below the minimum size', () => {
    expect(fitFontSize('1.234.567.890.123,45 €', 18, 119)).toBe(10);
    expect(fitFontSize('1.234.567.890.123,45 €', 18, 119, { minSize: 8 })).toBe(8);
  });

  it('respects a custom factor and safety margin', () => {
    expect(fitFontSize('abcdefgh', 18, 108, { factor: 0.9, safety: 1 })).toBeLessThan(18);
  });
});

describe('date helpers', () => {
  it('exposes the hidden balance marker', () => {
    expect(HIDDEN_BALANCE).toBe('•••••');
  });

  it('formats a date as dd/mm/yyyy', () => {
    expect(formatDate(new Date(2026, 7, 3))).toBe('03/08/2026');
  });

  it('returns the localized month name for a month index', () => {
    expect(getMonthName(8)).toBe('August');
  });

  it('normalizes to the start and end of a day', () => {
    const date = new Date(2026, 7, 3, 14, 30, 45);
    expect(startOfDay(date).getHours()).toBe(0);
    expect(startOfDay(date).getMinutes()).toBe(0);
    expect(endOfDay(date).getHours()).toBe(23);
    expect(endOfDay(date).getMinutes()).toBe(59);
    expect(endOfDay(date).getSeconds()).toBe(59);
    expect(endOfDay(date).getMilliseconds()).toBe(999);
  });

  it('computes week start with Monday as first day', () => {
    // 2026-01-07 is a Wednesday; its week starts Monday 2026-01-05
    const start = weekStart(new Date(2026, 0, 7));
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(5);
  });

  it('computes the day offset for Monday-first calendars', () => {
    // Monday -> 0, Sunday -> 6
    expect(dayOffset(new Date(2026, 0, 5), FIRST_DAYS.monday)).toBe(0);
    expect(dayOffset(new Date(2026, 0, 4), FIRST_DAYS.monday)).toBe(6);
  });

  it('computes the day offset for Sunday-first calendars', () => {
    // Sunday -> 0, Monday -> 1
    expect(dayOffset(new Date(2026, 0, 4), FIRST_DAYS.sunday)).toBe(0);
    expect(dayOffset(new Date(2026, 0, 5), FIRST_DAYS.sunday)).toBe(1);
  });

  it('resolves the custom period to the provided range', () => {
    const custom = { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) };
    expect(resolvePeriodRange(PERIODS.custom, new Date(), custom)).toBe(custom);
  });

  it('resolves a day period to a single day range', () => {
    const { start, end } = resolvePeriodRange(PERIODS.day, new Date(2026, 7, 3), { start: new Date(), end: new Date() });
    expect(start.getDate()).toBe(3);
    expect(start.getHours()).toBe(0);
    expect(end.getDate()).toBe(3);
    expect(end.getHours()).toBe(23);
  });

  it('counts days in a month (handles leap years)', () => {
    expect(getDaysInMonth(2026, 2)).toBe(28);
    expect(getDaysInMonth(2024, 2)).toBe(29);
    expect(getDaysInMonth(2026, 8)).toBe(31);
  });

  it('detects whether two dates fall on the same day', () => {
    expect(isSameDay(new Date(2026, 7, 3, 8), new Date(2026, 7, 3, 22))).toBe(true);
    expect(isSameDay(new Date(2026, 7, 3), new Date(2026, 7, 4))).toBe(false);
  });

  it('formats a long date in English', () => {
    expect(formatDateLong(new Date(2026, 7, 3), LANGUAGES.en)).toBe('August 3, 2026');
  });

  it('formats a long date per non-English language', () => {
    const date = new Date(2026, 7, 3);
    try {
      setLanguage('es');
      expect(formatDateLong(date, LANGUAGES.es)).toBe('3 de agosto de 2026');
      setLanguage('ca');
      expect(formatDateLong(date, LANGUAGES.ca)).toBe('3 d\'agost de 2026');
      setLanguage('ca');
      expect(formatDateLong(new Date(2026, 2, 3), LANGUAGES.ca)).toBe('3 de març de 2026');
      setLanguage('pt');
      expect(formatDateLong(date, LANGUAGES.pt)).toBe('3 de agosto de 2026');
      setLanguage('fr');
      expect(formatDateLong(date, LANGUAGES.fr)).toBe('3 août 2026');
      setLanguage('it');
      expect(formatDateLong(date, LANGUAGES.it)).toBe('3 agosto 2026');
      setLanguage('de');
      expect(formatDateLong(date, LANGUAGES.de)).toBe('3. August 2026');
    } finally {
      setLanguage('en');
    }
  });
});

describe('DB date conversion', () => {
  it('formats a Date as a DB timestamp', () => {
    expect(formatDateForDB(new Date(2026, 7, 3, 9, 5, 7))).toBe('2026-08-03 09:05:07');
  });

  it('parses a DB timestamp with time', () => {
    const parsed = parseDbDate('2026-08-03 09:05:07');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(3);
    expect(parsed.getHours()).toBe(9);
    expect(parsed.getMinutes()).toBe(5);
  });

  it('parses a DB date without time as local midnight', () => {
    const parsed = parseDbDate('2026-08-03');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(3);
    expect(parsed.getHours()).toBe(0);
  });

  it('produces the current timestamp in DB format', () => {
    expect(dbTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('future dates', () => {
  it('flags dates beyond today', () => {
    expect(isFutureDate(new Date(Date.now() + 24 * 60 * 60 * 1000))).toBe(true);
    expect(isFutureDate(new Date(Date.now() - 24 * 60 * 60 * 1000))).toBe(false);
  });
});

describe('font scaling', () => {
  it('applies the configured text size factor', () => {
    expect(scaleFontSize(16, TEXT_SIZES.small)).toBe(14);
    expect(scaleFontSize(16, TEXT_SIZES.medium)).toBe(16);
    expect(scaleFontSize(16, TEXT_SIZES.large)).toBe(18);
  });
});

describe('period text', () => {
  it('formats a week range across a shared short-month name', () => {
    // 2026-01-05 is a Monday; the week runs 5 Jan - 11 Jan
    expect(formatWeekRange(new Date(2026, 0, 5), shortMonths)).toBe('5 Jan – 11 Jan');
  });

  it('formats day, month and year period labels', () => {
    const date = new Date(2026, 7, 3);
    expect(formatPeriodText(PERIODS.day, date, months, shortMonths)).toBe('3 August 2026');
    expect(formatPeriodText(PERIODS.month, date, months, shortMonths)).toBe('August 2026');
    expect(formatPeriodText(PERIODS.year, date, months, shortMonths)).toBe('2026');
  });
});
