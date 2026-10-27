import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, parseBooleanConfigValue, sanitizeDefaultAccounts, toConfigRows } from '../../src/database/configDefaults';

const ACCOUNTS = [
  { id: 1, is_total: 0 },
  { id: 2, is_total: 1 },
  { id: 3, is_total: 0 },
];

describe('sanitizeDefaultAccounts', () => {
  it('returns empty updates when both keys are null', () => {
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG }, ACCOUNTS)).toEqual({});
  });

  it('keeps ids that reference existing non-total accounts', () => {
    const config = { ...DEFAULT_CONFIG, homeDefaultAccountId: 1, addDefaultAccountId: 3 };
    expect(sanitizeDefaultAccounts(config, ACCOUNTS)).toEqual({});
  });

  it('nulls ids that reference missing accounts', () => {
    const config = { ...DEFAULT_CONFIG, homeDefaultAccountId: 999, addDefaultAccountId: 999 };
    expect(sanitizeDefaultAccounts(config, ACCOUNTS)).toEqual({
      homeDefaultAccountId: null,
      addDefaultAccountId: null,
    });
  });

  it('nulls ids that reference the total account', () => {
    const config = { ...DEFAULT_CONFIG, homeDefaultAccountId: 2, addDefaultAccountId: 1 };
    expect(sanitizeDefaultAccounts(config, ACCOUNTS)).toEqual({ homeDefaultAccountId: null });
  });

  it('sanitizes the create-recurring default account id too', () => {
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG, createRecurringDefaultAccountId: 1 }, ACCOUNTS)).toEqual({});
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG, createRecurringDefaultAccountId: 999 }, ACCOUNTS)).toEqual({ createRecurringDefaultAccountId: null });
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG, createRecurringDefaultAccountId: 2 }, ACCOUNTS)).toEqual({ createRecurringDefaultAccountId: null });
  });

  it('serializes array config values as JSON', () => {
    expect(toConfigRows({
      allTransactionsCategoryIds: [1, 3],
      allTransactionsExpenseCategoryIds: [1],
      allTransactionsIncomeCategoryIds: [3],
      recurringStatusFilter: ['paused', 'ended'],
    })).toEqual([
      { key: 'all_transactions_category_ids', value: '[1,3]' },
      { key: 'all_transactions_expense_category_ids', value: '[1]' },
      { key: 'all_transactions_income_category_ids', value: '[3]' },
      { key: 'recurring_status_filter', value: '["paused","ended"]' },
    ]);
  });

  it('parses booleans without turning corruption into false', () => {
    expect(parseBooleanConfigValue('true')).toBe(true);
    expect(parseBooleanConfigValue('false')).toBe(false);
    expect(parseBooleanConfigValue('1')).toBeNull();
    expect(parseBooleanConfigValue('yes')).toBeNull();
  });
});
