import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useTransactionFilters } from '../../src/hooks/useTransactionFilters';
import type { Transaction, Account, Category } from '../../src/database/types';
import { TYPE_FILTERS, SORT_BY, SORT_DIRECTIONS } from '../../src/constants/types';
import { UNTAGGED_ID } from '../../src/database/helpers';

const getTagsByTransactionIds = vi.fn(async () => [] as { transaction_id: number; tag_id: number; name: string }[]);

vi.mock('../../src/database', () => ({
  transactionRepository: { getTagsByTransactionIds: () => getTagsByTransactionIds() },
}));

type Tx = Partial<Transaction> & Pick<Transaction, 'id' | 'date' | 'type' | 'amount' | 'account_id' | 'category_id'>;

function tx(id: number, overrides: Partial<Tx>): Transaction {
  return {
    id,
    user_id: 1,
    date: '2026-01-15 10:00:00',
    type: 'expense',
    amount: 100,
    account_id: 1,
    category_id: 1,
    description: '',
    created_at: '2026-01-15 10:00:00',
    updated_at: '2026-01-15 10:00:00',
    ...overrides,
  } as Transaction;
}

const account1: Account = { id: 1, user_id: 1, name: 'Wallet', icon: 'wallet', color: '#000', is_total: 0, initial_balance: 0, created_at: '' } as Account;
const account2: Account = { id: 2, user_id: 1, name: 'Cash', icon: 'cash', color: '#111', is_total: 0, initial_balance: 0, created_at: '' } as Account;
const totalAccount: Account = { id: 3, user_id: 1, name: 'Total', icon: 'logo', color: '#222', is_total: 1, initial_balance: 0, created_at: '' } as Account;

const category1: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#fff', type: 'expense', created_at: '' } as Category;
const category2: Category = { id: 2, user_id: 1, name: 'Salary', icon: 'cash', color: '#eee', type: 'income', created_at: '' } as Category;

type Options = Parameters<typeof useTransactionFilters>[0];

function baseOptions(transactions: Transaction[]): Options {
  return {
    transactions,
    accounts: [account1, account2, totalAccount],
    activeAccount: null,
    categoriesById: new Map([[1, category1], [2, category2]]),
  };
}

async function renderFilters(transactions: Transaction[], overrides: Partial<Options> = {}) {
  const options = baseOptions(transactions);
  const { result } = await renderHook(() => useTransactionFilters({ ...options, ...overrides }));
  await act(async () => {});
  return { result, options };
}

async function renderAll(transactions: Transaction[], overrides: Partial<Options> = {}) {
  return renderFilters(transactions, { activeAccount: totalAccount, ...overrides });
}

async function update(update: () => void) {
  await act(async () => {
    update();
  });
}

describe('useTransactionFilters', () => {
  beforeEach(() => {
    getTagsByTransactionIds.mockReset();
    getTagsByTransactionIds.mockResolvedValue([]);
  });

  it('defaults selectedAccountId to the first non-total account', async () => {
    const { result } = await renderFilters([tx(1, {})]);
    expect(result.current.selectedAccountId).toBe(1);
    expect(result.current.isTotal).toBe(false);
  });

  it('selects the provided activeAccount and marks it total', async () => {
    const transactions = [tx(1, {})];
    const { result } = await renderFilters(transactions, { activeAccount: totalAccount });
    expect(result.current.selectedAccountId).toBe(3);
    expect(result.current.isTotal).toBe(true);
  });

  it('selectAccount updates the selected account and closes the modal', async () => {
    const { result } = await renderFilters([tx(1, {})]);
    await update(() => result.current.openAccountModal());
    expect(result.current.accountModalVisible).toBe(true);
    await update(() => result.current.selectAccount(2));
    expect(result.current.selectedAccountId).toBe(2);
    expect(result.current.accountModalVisible).toBe(false);
  });

  it('filters by account unless the total account is selected', async () => {
    const transactions = [
      tx(1, { id: 1, account_id: 1 }),
      tx(2, { id: 2, account_id: 2 }),
    ];
    const { result } = await renderFilters(transactions);
    expect(result.current.filtered.map(t => t.id)).toEqual([1]);

    await update(() => result.current.selectAccount(3));
    expect(result.current.filtered.map(t => t.id).sort()).toEqual([1, 2]);
  });

  it('filters by transaction type', async () => {
    const transactions = [
      tx(1, { id: 1, type: 'expense', account_id: 3 }),
      tx(2, { id: 2, type: 'income', account_id: 3 }),
    ];
    const { result } = await renderAll(transactions, { typeTab: TYPE_FILTERS.income });
    expect(result.current.filtered.map(t => t.id)).toEqual([2]);
  });

  it('includes all types when the type filter is "all"', async () => {
    const transactions = [
      tx(1, { id: 1, type: 'expense', account_id: 3 }),
      tx(2, { id: 2, type: 'income', account_id: 3 }),
    ];
    const { result } = await renderAll(transactions, { typeTab: TYPE_FILTERS.all });
    expect(result.current.filtered.map(t => t.id).sort()).toEqual([1, 2]);
  });

  it('filters by selected category ids', async () => {
    const transactions = [
      tx(1, { id: 1, category_id: 1, account_id: 3 }),
      tx(2, { id: 2, category_id: 2, account_id: 3 }),
    ];
    const { result } = await renderAll(transactions, { selectedCategoryIds: [1] });
    expect(result.current.filtered.map(t => t.id)).toEqual([1]);
  });

  it('filters by period date range', async () => {
    const transactions = [
      tx(1, { id: 1, date: '2026-01-10 00:00:00', account_id: 3 }),
      tx(2, { id: 2, date: '2026-02-10 00:00:00', account_id: 3 }),
    ];
    const { result } = await renderAll(transactions, {
      periodDates: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
    });
    expect(result.current.filtered.map(t => t.id)).toEqual([1]);
  });

  it('filters by a tag, including the untagged pseudo-tag', async () => {
    const transactions = [
      tx(1, { id: 1, account_id: 3 }),
      tx(2, { id: 2, account_id: 3 }),
    ];
    getTagsByTransactionIds.mockResolvedValue([
      { transaction_id: 1, tag_id: 10, name: 'Work' },
    ]);

    const { result } = await renderAll(transactions, { initialTagIds: [10] });
    expect(result.current.filtered.map(t => t.id)).toEqual([1]);
  });

  it('keeps only transactions with no tags when filtering by the untagged pseudo-tag', async () => {
    const transactions = [
      tx(1, { id: 1, account_id: 3 }),
      tx(2, { id: 2, account_id: 3 }),
    ];
    getTagsByTransactionIds.mockResolvedValue([
      { transaction_id: 1, tag_id: 10, name: 'Work' },
    ]);

    const { result } = await renderAll(transactions, { initialTagIds: [UNTAGGED_ID] });
    expect(result.current.filtered.map(t => t.id)).toEqual([2]);
  });

  it('filters by search term using category and tag context', async () => {
    const transactions = [
      tx(1, { id: 1, category_id: 1, account_id: 3 }),
      tx(2, { id: 2, category_id: 2, account_id: 3 }),
    ];
    const { result } = await renderAll(transactions, { searchTerm: 'Food' });
    expect(result.current.filtered.map(t => t.id)).toEqual([1]);
  });

  it('sorts by date descending by default', async () => {
    const transactions = [
      tx(1, { id: 1, date: '2026-01-10 00:00:00', account_id: 3 }),
      tx(2, { id: 2, date: '2026-02-10 00:00:00', account_id: 3 }),
    ];
    const { result } = await renderAll(transactions);
    expect(result.current.filtered.map(t => t.id)).toEqual([2, 1]);
  });

  it('handleToggleSort switches field and toggles direction', async () => {
    const transactions = [
      tx(1, { id: 1, amount: 50, account_id: 3 }),
      tx(2, { id: 2, amount: 150, account_id: 3 }),
    ];
    const { result } = await renderAll(transactions);

    await update(() => result.current.handleToggleSort(SORT_BY.amount));
    expect(result.current.sortBy).toBe(SORT_BY.amount);
    expect(result.current.sortDirection).toBe(SORT_DIRECTIONS.desc);
    expect(result.current.filtered.map(t => t.id)).toEqual([2, 1]);

    await update(() => result.current.handleToggleSort(SORT_BY.amount));
    expect(result.current.sortDirection).toBe(SORT_DIRECTIONS.asc);
    expect(result.current.filtered.map(t => t.id)).toEqual([1, 2]);
  });

  it('handleClearTagFilter resets the local tag selection', async () => {
    const { result } = await renderFilters([tx(1, {})], { initialTagIds: [10] });
    expect(result.current.localTagIds).toEqual([10]);

    await update(() => result.current.handleClearTagFilter());
    expect(result.current.localTagIds).toEqual([]);
  });

  it('groups filtered transactions into sections by date', async () => {
    const transactions = [
      tx(1, { id: 1, date: '2026-01-10 10:00:00', account_id: 3 }),
      tx(2, { id: 2, date: '2026-01-10 12:00:00', account_id: 3 }),
      tx(3, { id: 3, date: '2026-01-11 09:00:00', account_id: 3 }),
    ];
    const { result } = await renderAll(transactions);
    const sectionDates = result.current.sections.map(s => s.date);
    expect(sectionDates).toEqual(['2026-01-11', '2026-01-10']);
    expect(result.current.sections[0].data.map(t => t.id)).toEqual([3]);
    expect(result.current.sections[1].data.map(t => t.id)).toEqual([2, 1]);
  });
});
