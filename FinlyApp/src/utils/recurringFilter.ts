import { TYPE_FILTERS, type TransactionTypeFilter } from '../constants/types';
import type { RecurringRule } from '../database/types';

export interface RecurringFilterCriteria {
  /** Type tab (All / Expenses / Income). */
  type: TransactionTypeFilter;
  /** Selected account, or undefined while accounts are still loading. */
  accountId: number | undefined;
  /** True when the selected account is the "Total" pseudo-account (no account filter). */
  isTotal: boolean;
}

/** Filter rules by type tab and selected account (Total means every account). */
export function filterRecurringRules(
  rules: RecurringRule[],
  { type, accountId, isTotal }: RecurringFilterCriteria,
): RecurringRule[] {
  return rules.filter(rule =>
    (type === TYPE_FILTERS.all || rule.type === type) &&
    (isTotal || rule.account_id === accountId),
  );
}
