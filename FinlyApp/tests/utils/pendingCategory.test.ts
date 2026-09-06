import { describe, it, expect } from 'vitest';
import { setPendingCategory, consumePendingCategory } from '../../src/utils/pendingCategory';
import { TRANSACTION_TYPES } from '../../src/constants/types';

describe('pendingCategory', () => {
  it('returns null when nothing has been set', () => {
    expect(consumePendingCategory()).toBeNull();
  });

  it('returns the pending category and clears it after a single consume', () => {
    setPendingCategory(5, TRANSACTION_TYPES.expense);
    expect(consumePendingCategory()).toEqual({ categoryId: 5, type: TRANSACTION_TYPES.expense });
    expect(consumePendingCategory()).toBeNull();
  });

  it('keeps the most recently set category', () => {
    setPendingCategory(1, TRANSACTION_TYPES.expense);
    setPendingCategory(2, TRANSACTION_TYPES.income);
    expect(consumePendingCategory()).toEqual({ categoryId: 2, type: TRANSACTION_TYPES.income });
    expect(consumePendingCategory()).toBeNull();
  });
});