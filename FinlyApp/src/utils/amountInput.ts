import { DECIMAL_PLACES, MAX_AMOUNT_INTEGER_DIGITS, type DecimalSeparator } from '../constants/types';

function normalizeAmountDigits(raw: string): string {
  const dotIndex = raw.indexOf('.');
  if (dotIndex !== -1) {
    let before = raw.slice(0, dotIndex);
    let after = raw.slice(dotIndex + 1).replace(/\./g, '');
    // Remove leading zeros from integer part (keep single "0")
    before = before.replace(/^0+(?=\d)/, '') || '0';
    // Limit integer digits
    before = before.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
    // Max 2 decimal digits
    after = after.slice(0, DECIMAL_PLACES);
    return before + '.' + after;
  }
  // No dot - remove leading zeros
  return (raw.replace(/^0+(?=\d)/, '') || '0').slice(0, MAX_AMOUNT_INTEGER_DIGITS);
}

/**
 * Parse user input into a clean raw amount string (digits + optional '.' separator).
 * Returns null if input is invalid (both separators present). A leading minus is
 * kept only when `allowNegative` is set (account initial balances).
 */
export function parseAmountInput(text: string, allowNegative = false): string | null {
  let raw = text.replace(/\s/g, '');
  const negative = allowNegative && raw.startsWith('-');

  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');

  // Both separators at same time is invalid
  if (hasComma && hasDot) return null;

  // Normalize comma to dot
  if (hasComma) {
    raw = raw.replace(',', '.');
  }

  // Remove all non-digit, non-dot characters
  raw = raw.replace(/[^0-9.]/g, '');

  // A lone sign is a valid intermediate state while typing a negative amount.
  if (negative && raw === '') return '-';

  const normalized = normalizeAmountDigits(raw);
  return negative ? `-${normalized}` : normalized;
}

/**
 * Format a raw amount string for display: add thousand separators (spaces)
 * and use the configured decimal separator.
 */
export function formatAmountDisplay(raw: string, decimalSeparator: DecimalSeparator): string {
  if (!raw) return '';
  const parts = raw.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1] || '';
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  // Show decimal separator even if no decimal digits yet (user is still typing)
  if (decimalPart || raw.endsWith('.')) {
    return `${formattedInteger}${decimalSeparator}${decimalPart}`;
  }
  return formattedInteger;
}

/** Parse a raw amount string into a numeric value (null if invalid or empty). */
export function parseAmountValue(raw: string): number | null {
  if (!raw) return null;
  const num = parseFloat(raw);
  return isNaN(num) ? null : num;
}
