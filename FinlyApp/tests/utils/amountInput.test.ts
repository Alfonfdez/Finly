import { describe, it, expect } from 'vitest';
import { parseAmountInput, formatAmountDisplay, parseAmountValue } from '../../src/utils/amountInput';
import { DECIMAL_SEPARATORS } from '../../src/constants/types';

describe('parseAmountInput', () => {
  it('returns "0" for empty or non-numeric input', () => {
    expect(parseAmountInput('')).toBe('0');
    expect(parseAmountInput('abc')).toBe('0');
  });

  it('keeps a simple number', () => {
    expect(parseAmountInput('12.5')).toBe('12.5');
  });

  it('normalizes a comma to a dot', () => {
    expect(parseAmountInput('1,5')).toBe('1.5');
  });

  it('returns null when both separators are present', () => {
    expect(parseAmountInput('1,2.3')).toBeNull();
  });

  it('strips leading zeros from the integer part', () => {
    expect(parseAmountInput('000123')).toBe('123');
    expect(parseAmountInput('000')).toBe('0');
  });

  it('limits the integer part to 9 digits', () => {
    expect(parseAmountInput('99999999999')).toBe('999999999');
  });

  it('limits decimals to 2 digits', () => {
    expect(parseAmountInput('1.234')).toBe('1.23');
  });

  it('collapses repeated dots', () => {
    expect(parseAmountInput('1..2')).toBe('1.2');
  });

  it('keeps a trailing dot while typing', () => {
    expect(parseAmountInput('12.')).toBe('12.');
  });

  it('strips non-numeric characters', () => {
    expect(parseAmountInput('12a34')).toBe('1234');
  });
});

describe('formatAmountDisplay', () => {
  it('returns an empty string for empty input', () => {
    expect(formatAmountDisplay('', DECIMAL_SEPARATORS.comma)).toBe('');
  });

  it('adds space thousand separators', () => {
    expect(formatAmountDisplay('1234567', DECIMAL_SEPARATORS.comma)).toBe('1 234 567');
  });

  it('uses the configured decimal separator', () => {
    expect(formatAmountDisplay('1234567.89', DECIMAL_SEPARATORS.comma)).toBe('1 234 567,89');
    expect(formatAmountDisplay('100.5', DECIMAL_SEPARATORS.dot)).toBe('100.5');
  });

  it('keeps a trailing decimal separator while typing', () => {
    expect(formatAmountDisplay('12.', DECIMAL_SEPARATORS.comma)).toBe('12,');
  });
});

describe('parseAmountValue', () => {
  it('parses a valid raw amount', () => {
    expect(parseAmountValue('12.5')).toBe(12.5);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseAmountValue('')).toBeNull();
    expect(parseAmountValue('abc')).toBeNull();
  });
});
