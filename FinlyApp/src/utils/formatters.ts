import { t } from '../i18n';
import { PERIODS, TEXT_SIZES, DECIMAL_SEPARATORS, FIRST_DAYS, type DecimalSeparator, type FirstDay, type Period, type TextSize } from '../constants/types';
import { DAYS_PER_WEEK } from '../constants/calendar';
import { LANGUAGES, type Language } from './language';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export const HIDDEN_BALANCE = '•••••';

export function formatCurrency(amount: number, currency = DEFAULT_CURRENCY, separator: DecimalSeparator = DECIMAL_SEPARATORS.comma): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.round(Math.abs(amount) * 100) / 100;
  const integer = Math.floor(abs);
  const dec = Math.round((abs - integer) * 100);

  const thousandsSep = separator === ',' ? '.' : ',';
  const decSep = separator;

  const integerStr = integer.toString();
  const integerFmt = integerStr.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  const decStr = String(dec).padStart(2, '0');

  return `${sign}${integerFmt}${decSep}${decStr} ${currency}`;
}

export function formatSignedCurrency(amount: number, currency = DEFAULT_CURRENCY, separator: DecimalSeparator = DECIMAL_SEPARATORS.comma): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount, currency, separator)}`;
}

export interface FitFontSizeOptions {
  factor?: number;
  safety?: number;
  minSize?: number;
}

export function fitFontSize(
  text: string,
  baseSize: number,
  maxWidth: number,
  { factor = 0.6, safety = 0.95, minSize = 10 }: FitFontSizeOptions = {},
): number {
  const available = maxWidth * safety;
  const estimated = text.length * baseSize * factor;
  if (estimated <= available) return baseSize;
  return Math.max(minSize, Math.floor(available / (text.length * factor)));
}

export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getMonthName(month: number): string {
  return t().months[month - 1] ?? '';
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function weekStart(date: Date, firstDay: FirstDay = FIRST_DAYS.monday): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < firstDay ? DAYS_PER_WEEK : 0) + day - firstDay;
  d.setDate(d.getDate() - diff);
  return startOfDay(d);
}

function weekEnd(date: Date, firstDay: FirstDay = FIRST_DAYS.monday): Date {
  const start = weekStart(date, firstDay);
  const end = new Date(start);
  end.setDate(end.getDate() + DAYS_PER_WEEK - 1);
  return endOfDay(end);
}

export function dayOffset(dayDate: Date, firstDay: FirstDay): number {
  const weekDay = dayDate.getDay();
  if (firstDay === FIRST_DAYS.monday) {
    return weekDay === 0 ? DAYS_PER_WEEK - 1 : weekDay - 1;
  }
  return weekDay;
}

function getPeriodRange(period: Period, date: Date): { start: Date; end: Date } {
  switch (period) {
    case PERIODS.day: {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = endOfDay(start);
      return { start, end };
    }
    case PERIODS.week: {
      const start = weekStart(date);
      const end = weekEnd(date);
      return { start, end };
    }
    case PERIODS.month: {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      return { start, end };
    }
    case PERIODS.year: {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = endOfDay(new Date(date.getFullYear(), 11, 31));
      return { start, end };
    }
    default: {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = endOfDay(new Date(date));
      return { start, end };
    }
  }
}

export function resolvePeriodRange(
  period: Period,
  date: Date,
  custom: { start: Date; end: Date }
): { start: Date; end: Date } {
  return period === PERIODS.custom ? custom : getPeriodRange(period, date);
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function formatDateLong(date: Date, language: Language): string {
  const day = date.getDate();
  const month = (date.getMonth() + 1);
  const year = date.getFullYear();
  const monthName = getMonthName(month);

  if (language === LANGUAGES.en) {
    return `${monthName} ${day}, ${year}`;
  }
  return `${day} de ${monthName.toLowerCase()} de ${year}`;
}

export function formatDateForDB(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

export function parseDbDate(value: string): Date {
  const [datePart, timePart] = value.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  if (timePart) {
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  return new Date(year, month - 1, day);
}

export function dbTimestamp(): string {
  return formatDateForDB(new Date());
}

export function isFutureDate(date: Date): boolean {
  const today = endOfDay(new Date());
  return date.getTime() > today.getTime();
}

const FACTORS: Record<TextSize, number> = {
  [TEXT_SIZES.small]: 0.85,
  [TEXT_SIZES.medium]: 1.0,
  [TEXT_SIZES.large]: 1.15,
};

export function scaleFontSize(size: number, textSize: TextSize): number {
  return Math.round(size * FACTORS[textSize]);
}

export function formatWeekRange(date: Date, shortMonths: string[], includeYear = false, firstDay: FirstDay = FIRST_DAYS.monday): string {
  const start = weekStart(date, firstDay);
  const end = weekEnd(date, firstDay);
  const startDay = start.getDate();
  const startMonth = shortMonths[start.getMonth()];
  const endDay = end.getDate();
  const endMonth = shortMonths[end.getMonth()];
  const year = includeYear ? ` ${date.getFullYear()}` : '';
  return `${startDay} ${startMonth} – ${endDay} ${endMonth}${year}`;
}

export function formatPeriodText(period: string, date: Date, months: string[], shortMonths: string[]): string {
  const m = months[date.getMonth()];
  switch (period) {
    case PERIODS.day: return `${date.getDate()} ${m} ${date.getFullYear()}`;
    case PERIODS.week: return formatWeekRange(date, shortMonths, true);
    case PERIODS.month: return `${m} ${date.getFullYear()}`;
    case PERIODS.year: return date.getFullYear().toString();
    default: return '';
  }
}
