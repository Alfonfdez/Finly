import { describe, it, expect } from 'vitest';
import { defaultRecurringSortDirection, sortRecurringRules } from '../../src/utils/recurringSort';
import { RECURRING_SORT_BY, SORT_DIRECTIONS } from '../../src/constants/types';
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

describe('recurringSort', () => {
  it('defaults next due and name ascending, amount and created descending', () => {
    expect(defaultRecurringSortDirection(RECURRING_SORT_BY.nextDue)).toBe(SORT_DIRECTIONS.asc);
    expect(defaultRecurringSortDirection(RECURRING_SORT_BY.name)).toBe(SORT_DIRECTIONS.asc);
    expect(defaultRecurringSortDirection(RECURRING_SORT_BY.amount)).toBe(SORT_DIRECTIONS.desc);
    expect(defaultRecurringSortDirection(RECURRING_SORT_BY.created)).toBe(SORT_DIRECTIONS.desc);
  });

  it('sorts by next due, ascending and descending', () => {
    const a = rule(1, { next_due: '2026-03-01' });
    const b = rule(2, { next_due: '2026-01-01' });
    expect(sortRecurringRules([a, b], RECURRING_SORT_BY.nextDue, SORT_DIRECTIONS.asc).map(r => r.id)).toEqual([2, 1]);
    expect(sortRecurringRules([a, b], RECURRING_SORT_BY.nextDue, SORT_DIRECTIONS.desc).map(r => r.id)).toEqual([1, 2]);
  });

  it('sorts by name case-insensitively', () => {
    const a = rule(1, { name: 'banana' });
    const b = rule(2, { name: 'Apple' });
    expect(sortRecurringRules([a, b], RECURRING_SORT_BY.name, SORT_DIRECTIONS.asc).map(r => r.name)).toEqual(['Apple', 'banana']);
  });

  it('sorts by amount', () => {
    const a = rule(1, { amount: 50 });
    const b = rule(2, { amount: 100 });
    expect(sortRecurringRules([a, b], RECURRING_SORT_BY.amount, SORT_DIRECTIONS.desc).map(r => r.id)).toEqual([2, 1]);
  });

  it('sorts by created', () => {
    const a = rule(1, { created_at: '2026-01-01 00:00:00' });
    const b = rule(2, { created_at: '2026-05-01 00:00:00' });
    expect(sortRecurringRules([a, b], RECURRING_SORT_BY.created, SORT_DIRECTIONS.desc).map(r => r.id)).toEqual([2, 1]);
  });

  it('does not mutate the input and breaks ties by id', () => {
    const a = rule(2, { next_due: '2026-01-01' });
    const b = rule(1, { next_due: '2026-01-01' });
    const input = [a, b];
    expect(sortRecurringRules(input, RECURRING_SORT_BY.nextDue, SORT_DIRECTIONS.asc).map(r => r.id)).toEqual([1, 2]);
    expect(input.map(r => r.id)).toEqual([2, 1]);
  });
});
