import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { AppProvider, useApp } from '../../src/context/AppContext';
import { setConfig, resetStub } from '../component/helpers/configStub';
import { TRANSACTION_TYPES } from '../../src/constants/types';
import type { Account, Category, Transaction } from '../../src/database/types';

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

const walletAccount: Account = { id: 1, user_id: 1, name: 'Wallet', initial_balance: 0, icon: 'wallet', color: '#22D3EE', is_total: 0, created_at: '2026-01-01' };
const totalAccount: Account = { id: 2, user_id: 1, name: 'Total', initial_balance: 0, icon: 'trending-up', color: '#34D399', is_total: 1, created_at: '2026-01-01' };
const catFood: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#ff0000', type: 'expense', created_at: '2026-01-01' };
const catTravel: Category = { id: 2, user_id: 1, name: 'Travel', icon: 'car', color: '#00ff00', type: 'expense', created_at: '2026-01-01' };
const catSalary: Category = { id: 3, user_id: 1, name: 'Salary', icon: 'wallet', color: '#0000ff', type: 'income', created_at: '2026-01-01' };

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
});