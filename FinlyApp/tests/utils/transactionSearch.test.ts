import { describe, it, expect } from 'vitest';
import { matchesTransactionSearch } from '../../src/utils/transactionSearch';
import type { Transaction, Category } from '../../src/database/types';

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    account_id: 1,
    category_id: 1,
    type: 'expense',
    amount: 10,
    description: null,
    photo: null,
    date: '2026-08-11 10:00:00',
    created_at: '2026-08-11 10:00:00',
    updated_at: null,
    ...overrides,
  };
}

function category(id: number, name: string): Category {
  return { id, user_id: 1, name, icon: 'tag', color: '#A78BFA', type: 'expense', created_at: '2026-08-03 00:00:00' };
}

describe('matchesTransactionSearch', () => {
  it('returns true for an empty or whitespace-only query', () => {
    expect(matchesTransactionSearch(tx(), {}, '')).toBe(true);
    expect(matchesTransactionSearch(tx(), {}, '   ')).toBe(true);
  });

  it('matches the description case-insensitively', () => {
    const t = tx({ description: 'Coffee at Café Central' });
    expect(matchesTransactionSearch(t, {}, 'coffee')).toBe(true);
    expect(matchesTransactionSearch(t, {}, 'CAFÉ')).toBe(true);
  });

  it('matches a null description as empty text', () => {
    expect(matchesTransactionSearch(tx({ description: null }), {}, 'coffee')).toBe(false);
  });

  it('matches the category display name', () => {
    const t = tx({ category_id: 5 });
    const ctx = { category: category(5, 'Groceries') };
    expect(matchesTransactionSearch(t, ctx, 'grocer')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'other')).toBe(false);
  });

  it('matches the account name', () => {
    const t = tx({ account_id: 3 });
    const ctx = { accountName: 'My Wallet' };
    expect(matchesTransactionSearch(t, ctx, 'wallet')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'bank')).toBe(false);
  });

  it('matches a tag name', () => {
    const t = tx();
    const ctx = { tags: [{ name: 'Lunch' }, { name: 'Work' }] };
    expect(matchesTransactionSearch(t, ctx, 'lunch')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'work')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'travel')).toBe(false);
  });

  it('requires every term to match (AND across all fields)', () => {
    const t = tx({ description: 'Lunch at the office' });
    const ctx = { tags: [{ name: 'Meal' }], accountName: 'Cash' };
    expect(matchesTransactionSearch(t, ctx, 'lunch meal')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'lunch cash')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'lunch meal cash')).toBe(true);
    expect(matchesTransactionSearch(t, ctx, 'lunch travel')).toBe(false);
  });

  it('matches substrings at any position', () => {
    const t = tx({ description: 'Salary January' });
    expect(matchesTransactionSearch(t, {}, 'jan')).toBe(true);
    expect(matchesTransactionSearch(t, {}, 'alary')).toBe(true);
  });
});
