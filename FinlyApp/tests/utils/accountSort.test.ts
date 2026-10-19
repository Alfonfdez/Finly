import { describe, expect, it } from 'vitest';
import { ACCOUNT_SORT_BY, SORT_DIRECTIONS, type SortDirection } from '../../src/constants/types';
import { defaultAccountSortDirection, sortAccounts, type AccountWithBalance } from '../../src/utils/accountSort';

function account(id: number, name: string, balance: number, isTotal = 0): AccountWithBalance {
  return { id, user_id: 1, name, icon: 'wallet', color: '#22D3EE', is_total: isTotal, balance } as AccountWithBalance;
}

const total = account(9, 'Total', 150, 1);
const wallet = account(1, 'Wallet', 100);
const cash = account(2, 'Cash', 50);
const savings = account(3, 'Savings', 50);

const names = (list: AccountWithBalance[]): string[] => list.map(item => item.name);
const sort = (field: typeof ACCOUNT_SORT_BY[keyof typeof ACCOUNT_SORT_BY], direction: SortDirection) =>
  names(sortAccounts([wallet, total, savings, cash], field, direction));

describe('defaultAccountSortDirection', () => {
  it('is ascending for the name and descending for the balance', () => {
    expect(defaultAccountSortDirection(ACCOUNT_SORT_BY.name)).toBe(SORT_DIRECTIONS.asc);
    expect(defaultAccountSortDirection(ACCOUNT_SORT_BY.balance)).toBe(SORT_DIRECTIONS.desc);
  });
});

describe('sortAccounts', () => {
  it('sorts by name while the Total account stays first', () => {
    expect(sort(ACCOUNT_SORT_BY.name, SORT_DIRECTIONS.asc)).toEqual(['Total', 'Cash', 'Savings', 'Wallet']);
    expect(sort(ACCOUNT_SORT_BY.name, SORT_DIRECTIONS.desc)).toEqual(['Total', 'Wallet', 'Savings', 'Cash']);
  });

  it('sorts by balance while the Total account stays first', () => {
    expect(sort(ACCOUNT_SORT_BY.balance, SORT_DIRECTIONS.desc)).toEqual(['Total', 'Wallet', 'Cash', 'Savings']);
    expect(sort(ACCOUNT_SORT_BY.balance, SORT_DIRECTIONS.asc)).toEqual(['Total', 'Cash', 'Savings', 'Wallet']);
  });

  it('breaks balance ties by name', () => {
    const second = account(4, 'Bonus', 50);
    const ordered = sortAccounts([wallet, second, cash, total], ACCOUNT_SORT_BY.balance, SORT_DIRECTIONS.desc);
    expect(names(ordered)).toEqual(['Total', 'Wallet', 'Bonus', 'Cash']);
  });

  it('does not mutate the input', () => {
    const input = [wallet, cash, total];
    sortAccounts(input, ACCOUNT_SORT_BY.balance, SORT_DIRECTIONS.desc);
    expect(names(input)).toEqual(['Wallet', 'Cash', 'Total']);
  });
});
