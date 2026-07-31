import { Config } from '../context/ConfigContext';
import { t } from '../i18n';
import { Period } from '../constants/types';
import type { Language } from './language';

export const HIDDEN_BALANCE = '•••••';

export function formatCurrency(amount: number, currency = '€', separator: ',' | '.' = ','): string {
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

export function formatSignedCurrency(amount: number, currency = '€', separator: ',' | '.' = ','): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount, currency, separator)}`;
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

export function getShortMonthName(month: number): string {
  return t().months_short[month - 1] ?? '';
}

export function weekStart(date: Date, firstDay: 0 | 1 = 1): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < firstDay ? 7 : 0) + day - firstDay;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function weekEnd(date: Date, firstDay: 0 | 1 = 1): Date {
  const start = weekStart(date, firstDay);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getPeriodRange(period: Period, date: Date): { start: Date; end: Date } {
  switch (period) {
    case 'day': {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'week': {
      const start = weekStart(date);
      const end = weekEnd(date);
      return { start, end };
    }
    case 'month': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case 'year': {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    default: {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }
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

  if (language === 'en') {
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

export function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date.getTime() > today.getTime();
}

const FACTORS: Record<Config['textSize'], number> = {
  'small': 0.85,
  'medium': 1.0,
  'large': 1.15,
};

export function scaleFontSize(size: number, textSize: Config['textSize']): number {
  return Math.round(size * FACTORS[textSize]);
}

export function formatWeekRange(date: Date, shortMonths: string[], includeYear = false): string {
  const start = weekStart(date);
  const end = weekEnd(date);
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
    case 'day': return `${date.getDate()} ${m} ${date.getFullYear()}`;
    case 'week': return formatWeekRange(date, shortMonths, true);
    case 'month': return `${m} ${date.getFullYear()}`;
    case 'year': return date.getFullYear().toString();
    default: return '';
  }
}
