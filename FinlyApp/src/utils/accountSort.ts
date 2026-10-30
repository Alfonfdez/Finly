import { ACCOUNT_SORT_BY, SORT_DIRECTIONS, isTotalAccount, type AccountSortBy, type SortDirection } from '../constants/types';
import type { Account } from '../database/types';
import { getDisplayAccountName } from '../i18n';

/** Natural default direction per field: name ascending, balance descending. */
export function defaultAccountSortDirection(field: AccountSortBy): SortDirection {
  return field === ACCOUNT_SORT_BY.balance ? SORT_DIRECTIONS.desc : SORT_DIRECTIONS.asc;
}

export type AccountWithBalance = Account & { balance: number };

/**
 * Sort accounts by `field`/`direction`. The Total account is an aggregate rather than
 * a real account (its balance is the sum of the others), so it always stays first.
 * Ties break by display name, then id.
 */
export function sortAccounts(
  accounts: AccountWithBalance[],
  field: AccountSortBy,
  direction: SortDirection,
): AccountWithBalance[] {
  const sign = direction === SORT_DIRECTIONS.desc ? -1 : 1;

  return [...accounts].sort((a, b) => {
    const aTotal = isTotalAccount(a);
    const bTotal = isTotalAccount(b);
    if (aTotal !== bTotal) return aTotal ? -1 : 1;

    const primary = field === ACCOUNT_SORT_BY.balance
      ? a.balance - b.balance
      : getDisplayAccountName(a).localeCompare(getDisplayAccountName(b));
    const diff = primary * sign;
    if (diff !== 0) return diff;

    return getDisplayAccountName(a).localeCompare(getDisplayAccountName(b)) || a.id - b.id;
  });
}
