import { describe, it, expect } from 'vitest';
import { filterRecurringRules } from '../../src/utils/recurringFilter';
import { TYPE_FILTERS } from '../../src/constants/types';
import type { RecurringRule } from '../../src/database/types';

function rule(id: number, overrides: Partial<RecurringRule>): RecurringRule {
  return {
    id,
    user_id: 1,
    name: `R${id}`,
    type: 'expense',
    account_id: 1,
    category_id: 1,
    amount: 10,
    description: null,
    frequency: 'monthly',
    interval: 1,
    weekday: null,
    day_of_month: 1,
    month: null,
    start_date: '2026-01-01',
    end_date: null,
    next_due: '2026-02-01',
    skipped_from: null,
    active: 1,
    created_at: '2026-01-01 00:00:00',
    updated_at: null,
    ...overrides,
  } as RecurringRule;
}

describe('recurringFilter', () => {
  it('keeps every rule when the type is All', () => {
    const rules = [rule(1, { type: 'expense' }), rule(2, { type: 'income' })];
    expect(filterRecurringRules(rules, { type: TYPE_FILTERS.all, accountId: 1, isTotal: true }).map(r => r.id)).toEqual([1, 2]);
  });

  it('filters by type', () => {
    const rules = [rule(1, { type: 'expense' }), rule(2, { type: 'income' })];
    expect(filterRecurringRules(rules, { type: TYPE_FILTERS.expense, accountId: 1, isTotal: true }).map(r => r.id)).toEqual([1]);
    expect(filterRecurringRules(rules, { type: TYPE_FILTERS.income, accountId: 1, isTotal: true }).map(r => r.id)).toEqual([2]);
  });

  it('keeps every account when the selection is the Total account', () => {
    const rules = [rule(1, { account_id: 1 }), rule(2, { account_id: 3 })];
    expect(filterRecurringRules(rules, { type: TYPE_FILTERS.all, accountId: 2, isTotal: true }).map(r => r.id)).toEqual([1, 2]);
  });

  it('filters by account when a concrete account is selected', () => {
    const rules = [rule(1, { account_id: 1 }), rule(2, { account_id: 3 })];
    expect(filterRecurringRules(rules, { type: TYPE_FILTERS.all, accountId: 1, isTotal: false }).map(r => r.id)).toEqual([1]);
  });

  it('combines the type and account filters', () => {
    const rules = [
      rule(1, { account_id: 1, type: 'expense' }),
      rule(2, { account_id: 1, type: 'income' }),
      rule(3, { account_id: 3, type: 'expense' }),
    ];
    expect(filterRecurringRules(rules, { type: TYPE_FILTERS.expense, accountId: 1, isTotal: false }).map(r => r.id)).toEqual([1]);
  });

  it('does not mutate the input', () => {
    const rules = [rule(1, { account_id: 1 }), rule(2, { account_id: 3 })];
    filterRecurringRules(rules, { type: TYPE_FILTERS.all, accountId: 1, isTotal: false });
    expect(rules.map(r => r.id)).toEqual([1, 2]);
  });
});
