import { describe, it, expect } from 'vitest';
import { matchesAccountSearch } from '../../src/utils/accountSearch';
import type { Account } from '../../src/database/types';

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    user_id: 1,
    name: 'My Wallet',
    initial_balance: 0,
    icon: 'wallet',
    color: '#A78BFA',
    description: '',
    is_total: 0,
    created_at: '2026-08-03 00:00:00',
    ...overrides,
  };
}

describe('matchesAccountSearch', () => {
  it('returns true for an empty or whitespace-only query', () => {
    expect(matchesAccountSearch(account(), '')).toBe(true);
    expect(matchesAccountSearch(account(), '   ')).toBe(true);
  });

  it('matches the display name case-insensitively', () => {
    expect(matchesAccountSearch(account(), 'wallet')).toBe(true);
    expect(matchesAccountSearch(account(), 'MY WALLET')).toBe(true);
  });

  it('matches a custom (non-translated) account name', () => {
    expect(matchesAccountSearch(account({ id: 5, name: 'Platinum Card' }), 'platinum')).toBe(true);
  });

  it('matches the description', () => {
    const acc = account({ description: 'everyday expenses' });
    expect(matchesAccountSearch(acc, 'everyday')).toBe(true);
    expect(matchesAccountSearch(acc, 'expenses')).toBe(true);
  });

  it('matches across name and description combined', () => {
    const acc = account({ name: 'Cash', description: 'for travel' });
    expect(matchesAccountSearch(acc, 'cash travel')).toBe(true);
  });

  it('requires every term to match (AND)', () => {
    const acc = account({ name: 'My Wallet', description: 'daily' });
    expect(matchesAccountSearch(acc, 'wallet daily')).toBe(true);
    expect(matchesAccountSearch(acc, 'wallet savings')).toBe(false);
  });

  it('returns false when no field matches', () => {
    expect(matchesAccountSearch(account(), 'groceries')).toBe(false);
  });

  it('matches substrings at any position', () => {
    expect(matchesAccountSearch(account({ name: 'Cash' }), 'as')).toBe(true);
  });
});
