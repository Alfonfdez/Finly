import { describe, it, expect } from 'vitest';
import { resolveDefaultAccountId } from '../../src/utils/defaultAccount';
import type { Account } from '../../src/database/types';

function account(id: number, overrides: Partial<Account> = {}): Account {
  return {
    id,
    user_id: 1,
    name: `A${id}`,
    initial_balance: 0,
    icon: 'wallet-outline',
    color: '#22D3EE',
    is_total: 0,
    created_at: '2026-01-01',
    ...overrides,
  } as Account;
}

const withBalance = (a: Account) => ({ ...a, balance: 0 });

const total = account(2, { name: 'Total', is_total: 1 });
const wallet = account(1, { name: 'Wallet' });
const bank = account(3, { name: 'Bank' });

describe('resolveDefaultAccountId', () => {
  it('uses the configured default when it references an existing non-total account', () => {
    expect(resolveDefaultAccountId(3, [withBalance(total), withBalance(wallet), withBalance(bank)], null, [total, wallet, bank])).toBe(3);
  });

  it('ignores a default that is missing or points at the total account', () => {
    expect(resolveDefaultAccountId(999, [withBalance(total), withBalance(wallet)], wallet, [total, wallet])).toBe(1);
    expect(resolveDefaultAccountId(2, [withBalance(total), withBalance(wallet)], wallet, [total, wallet])).toBe(1);
  });

  it('falls back to the active account when the default is null', () => {
    expect(resolveDefaultAccountId(null, [withBalance(total), withBalance(wallet), withBalance(bank)], bank, [total, wallet, bank])).toBe(3);
  });

  it('ignores a total active account and falls back to the first non-total account', () => {
    expect(resolveDefaultAccountId(null, [withBalance(total), withBalance(wallet), withBalance(bank)], total, [total, wallet, bank])).toBe(1);
  });

  it('returns undefined when there is no non-total account', () => {
    expect(resolveDefaultAccountId(null, [withBalance(total)], total, [total])).toBeUndefined();
  });
});
