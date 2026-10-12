import { RECURRING_SORT_BY, SORT_DIRECTIONS, type RecurringSortBy, type SortDirection } from '../constants/types';
import type { RecurringRule } from '../database/types';

/** Natural default direction per field: dates/names ascending, amount/newest descending. */
export function defaultRecurringSortDirection(field: RecurringSortBy): SortDirection {
  return field === RECURRING_SORT_BY.amount || field === RECURRING_SORT_BY.created
    ? SORT_DIRECTIONS.desc
    : SORT_DIRECTIONS.asc;
}

function compareBy(field: RecurringSortBy, a: RecurringRule, b: RecurringRule): number {
  switch (field) {
    case RECURRING_SORT_BY.name: {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      return an < bn ? -1 : an > bn ? 1 : 0;
    }
    case RECURRING_SORT_BY.amount:
      return a.amount - b.amount;
    case RECURRING_SORT_BY.created:
      return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
    case RECURRING_SORT_BY.nextDue:
    default:
      return a.next_due < b.next_due ? -1 : a.next_due > b.next_due ? 1 : 0;
  }
}

/** Sort rules by `field`/`direction`; ties keep creation order (by id). */
export function sortRecurringRules(
  rules: RecurringRule[],
  field: RecurringSortBy,
  direction: SortDirection,
): RecurringRule[] {
  const sign = direction === SORT_DIRECTIONS.desc ? -1 : 1;
  return [...rules].sort((a, b) => {
    const diff = compareBy(field, a, b) * sign;
    return diff !== 0 ? diff : a.id - b.id;
  });
}
