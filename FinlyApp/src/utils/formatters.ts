import { Config } from '../context/ConfigContext';
import { t } from '../i18n';

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

export function formatWeek(date: Date, firstDay: 0 | 1 = 1): string {
  const start = weekStart(date, firstDay);
  const end = weekEnd(date, firstDay);
  const startDay = start.getDate();
  const startMonth = getShortMonthName(start.getMonth() + 1);
  const endDay = end.getDate();
  const endMonth = getShortMonthName(end.getMonth() + 1);
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
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
