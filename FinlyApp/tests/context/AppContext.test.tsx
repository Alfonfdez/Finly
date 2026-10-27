import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from '../../src/context/AppContext';
import { materializeDueRecurring } from '../../src/database/recurringService';
import { setConfig, resetStub } from '../component/helpers/configStub';
import { TRANSACTION_TYPES, UNTAGGED_ID } from '../../src/constants/types';
import type { Account, Category, Transaction, Tag } from '../../src/database/types';

const mockAccountList = vi.fn();
const mockCategoryList = vi.fn();
const mockTagList = vi.fn();
const mockTxList = vi.fn();
const mockGetTagsByTransactionIds = vi.fn();
const mockTotalByPeriod = vi.fn();
const mockGetBalances = vi.fn();

vi.mock('../../src/database', () => ({
  accountRepository: {
    list: (userId: number) => mockAccountList(userId),
    getBalances: () => mockGetBalances(),
  },
  categoryRepository: {
    list: (userId: number) => mockCategoryList(userId),
  },
  tagRepository: {
    list: (userId: number) => mockTagList(userId),
  },
  transactionRepository: {
    list: (opts: unknown) => mockTxList(opts),
    getTagsByTransactionIds: (ids: number[]) => mockGetTagsByTransactionIds(ids),
    totalByPeriod: (accountId: number | null, type: unknown, start: unknown, end: unknown) =>
      mockTotalByPeriod(accountId, type, start, end),
  },
}));

vi.mock('../../src/database/recurringService', () => ({
  materializeDueRecurring: vi.fn(async () => 0),
}));

const walletAccount: Account = { id: 1, user_id: 1, name: 'Wallet', initial_balance: 0, icon: 'wallet', color: '#22D3EE', is_total: 0, created_at: '2026-01-01' };
const catFood: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#ff0000', type: 'expense', created_at: '2026-01-01' };
const catTravel: Category = { id: 2, user_id: 1, name: 'Travel', icon: 'car', color: '#00ff00', type: 'expense', created_at: '2026-01-01' };

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1,
    account_id: 1,
    category_id: 1,
    type: 'expense',
    amount: 50,
    description: null,
    photo: null,
    date: '2026-09-01',
    created_at: '2026-09-01',
    updated_at: null,
    ...overrides,
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

describe('AppProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAccountList.mockResolvedValue([walletAccount]);
    mockCategoryList.mockResolvedValue([catFood]);
    mockTagList.mockResolvedValue([]);
    mockTxList.mockResolvedValue([]);
    mockGetTagsByTransactionIds.mockResolvedValue([]);
    mockTotalByPeriod.mockResolvedValue([0, 0]);
    mockGetBalances.mockResolvedValue([{ account_id: 1, balance: 100 }]);
    resetStub();
  });

  afterEach(() => {
    resetStub();
  });

  it('loads accounts, categories and tags on mount and sets loading to false', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.accounts).toEqual([walletAccount]);
    expect(result.current.categories).toEqual([catFood]);
    expect(result.current.tags).toEqual([]);
    expect(mockAccountList).toHaveBeenCalled();
  });

  it('does not reload reference data or re-materialize when a Home default changes', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const listCalls = mockAccountList.mock.calls.length;
    const materializeCalls = vi.mocked(materializeDueRecurring).mock.calls.length;
    expect(materializeCalls).toBe(1);

    await act(async () => {
      setConfig({ homeDefaultPeriod: 'year' });
    });

    expect(result.current.activePeriod).toBe('year');
    expect(mockAccountList).toHaveBeenCalledTimes(listCalls);
    expect(vi.mocked(materializeDueRecurring).mock.calls.length).toBe(materializeCalls);
  });

  it('applies the home default account from the config', async () => {
    setConfig({ homeDefaultAccountId: 1 });
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.activeAccount).toEqual(walletAccount);
  });

  it('fetches transactions and computes accountsWithBalance', async () => {
    const t = tx();
    mockTxList.mockResolvedValue([t]);
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.transactions).toEqual([t]));
    expect(result.current.accountsWithBalance[0].balance).toBe(100);
    expect(result.current.transactions[0].amount).toBe(50);
  });

  it('filteredTransactions respects the active type filter', async () => {
    const expenseTx = tx({ id: 1, type: 'expense', amount: 10 });
    const incomeTx = tx({ id: 2, type: 'income', category_id: 3, amount: 20 });
    mockTxList.mockResolvedValue([expenseTx, incomeTx]);

    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.transactions.length).toBe(2));

    expect(result.current.filteredTransactions).toEqual([expenseTx]);
    await act(async () => { result.current.changeType(TRANSACTION_TYPES.income); });
    expect(result.current.filteredTransactions).toEqual([incomeTx]);
    expect(result.current.totalIncome).toBe(20);
    expect(result.current.totalExpenses).toBe(0);
  });

  it('refresh bumps the transactions version and triggers a re-fetch', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBefore = mockTxList.mock.calls.length;
    await act(async () => { await result.current.refresh(); });
    expect(mockTxList.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('activeCategories computes totals and percentages from filtered transactions', async () => {
    mockCategoryList.mockResolvedValue([catFood, catTravel]);
    const t1 = tx({ id: 1, category_id: 1, amount: 80 });
    const t2 = tx({ id: 2, category_id: 2, amount: 20 });
    mockTxList.mockResolvedValue([t1, t2]);

    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.activeCategories.length).toBe(2));

    const food = result.current.activeCategories.find(c => c.id === 1)!;
    expect(food.total).toBe(80);
    expect(food.percentage).toBeCloseTo(80);

    const travel = result.current.activeCategories.find(c => c.id === 2)!;
    expect(travel.total).toBe(20);
    expect(travel.percentage).toBeCloseTo(20);
  });

  it('refreshes the active account object when its row changes', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const renamed = { ...walletAccount, name: 'Renamed wallet', icon: 'cash-outline' };
    mockAccountList.mockResolvedValue([renamed]);
    await act(async () => { await result.current.refreshAccounts(); });

    expect(result.current.activeAccount?.name).toBe('Renamed wallet');
    expect(result.current.activeAccount?.icon).toBe('cash-outline');
  });

  it('keeps the selected Home period when the active account is deleted', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { result.current.changePeriod('year'); });
    const replacement: Account = { ...walletAccount, id: 2, name: 'Savings' };
    mockAccountList.mockResolvedValue([replacement]);

    await act(async () => { await result.current.refreshAccounts(); });
    await waitFor(() => expect(result.current.activeAccount?.id).toBe(2));

    expect(result.current.activePeriod).toBe('year');
  });

  it('prunes a deleted tag from the Home filter', async () => {
    const tagA = { id: 10, user_id: 1, name: 'Work' } as Tag;
    const tagB = { id: 20, user_id: 1, name: 'Home' } as Tag;
    mockTagList.mockResolvedValue([tagA, tagB]);
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { result.current.toggleTagId(tagA.id); });
    expect(result.current.activeTagIds).toEqual([tagA.id]);

    mockTagList.mockResolvedValue([tagB]);
    await act(async () => { await result.current.refreshTags(); });

    expect(result.current.activeTagIds).toEqual([]);
  });

  it('keeps the untagged pseudo-filter when real tags disappear', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { result.current.toggleTagId(UNTAGGED_ID); });
    mockTagList.mockResolvedValue([]);
    await act(async () => { await result.current.refreshTags(); });

    expect(result.current.activeTagIds).toEqual([UNTAGGED_ID]);
  });

  it('exposes a retry path when the initial load fails', async () => {
    mockAccountList.mockRejectedValueOnce(new Error('load failed'));
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.loadError).toBe(true);
    expect(result.current.activeAccount).toBeNull();

    mockAccountList.mockResolvedValue([walletAccount]);
    await act(async () => { await result.current.retryInitialLoad(); });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loadError).toBe(false);
    expect(result.current.activeAccount).toEqual(walletAccount);
  });

  it('starts the custom period at Jan 1 and the end of today', async () => {
    const { result } = await renderHook(() => useApp(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const { start, end } = result.current.customDate;
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(start.getHours()).toBe(0);
    // The whole of today belongs to the range, not just the moment of loading.
    expect(end.getDate()).toBe(new Date().getDate());
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });
});
