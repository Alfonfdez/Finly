import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, sanitizeDefaultAccounts } from '../../src/database/configDefaults';

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

  it('sanitizes the recurring default account id too', () => {
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG, recurringDefaultAccountId: 1 }, ACCOUNTS)).toEqual({});
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG, recurringDefaultAccountId: 999 }, ACCOUNTS)).toEqual({ recurringDefaultAccountId: null });
    expect(sanitizeDefaultAccounts({ ...DEFAULT_CONFIG, recurringDefaultAccountId: 2 }, ACCOUNTS)).toEqual({ recurringDefaultAccountId: null });
  });
});
