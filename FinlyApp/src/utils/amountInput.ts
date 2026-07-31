export const MAX_AMOUNT_INTEGER_DIGITS = 9; // up to 999,999,999.99

/**
 * Parse user input into a clean raw amount string (digits + optional '.' separator).
 * Returns null if input is invalid (both separators present).
 */
export function parseAmountInput(text: string): string | null {
  let raw = text.replace(/\s/g, '');

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

  // Only allow one dot
  const dotIndex = raw.indexOf('.');
  if (dotIndex !== -1) {
    let before = raw.slice(0, dotIndex);
    let after = raw.slice(dotIndex + 1).replace(/\./g, '');
    // Remove leading zeros from integer part (keep single "0")
    before = before.replace(/^0+(?=\d)/, '') || '0';
    // Limit integer digits
    before = before.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
    // Max 2 decimal digits
    after = after.slice(0, 2);
    raw = before + '.' + after;
  } else {
    // No dot - remove leading zeros
    raw = raw.replace(/^0+(?=\d)/, '') || '0';
    // Limit integer digits
    raw = raw.slice(0, MAX_AMOUNT_INTEGER_DIGITS);
  }

  return raw;
}

/**
 * Format a raw amount string for display: add thousand separators (spaces)
 * and use the configured decimal separator.
 */
export function formatAmountDisplay(raw: string, decimalSeparator: ',' | '.'): string {
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
