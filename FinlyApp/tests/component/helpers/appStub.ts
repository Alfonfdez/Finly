import { vi } from 'vitest';
import type { ReactNode } from 'react';
import type { Account, Category, Tag, Transaction } from '../../../src/database/types';
import { PERIODS, TRANSACTION_TYPES, type Period, type TransactionType, type CategoryWithTotal } from '../../../src/constants/types';

interface AppStubState {
  activeAccount: Account | null;
  activeType: TransactionType;
  activePeriod: Period;
  selectedDate: Date;
  customDate: { start: Date; end: Date };
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  tags: Tag[];
  loading: boolean;
  categoriesById: Map<number, Category>;
  refresh: ReturnType<typeof vi.fn>;
  refreshAccounts: ReturnType<typeof vi.fn>;
  refreshCategories: ReturnType<typeof vi.fn>;
  refreshTags: ReturnType<typeof vi.fn>;
  resetAll: ReturnType<typeof vi.fn>;
  selectAccount: ReturnType<typeof vi.fn>;
  changeType: ReturnType<typeof vi.fn>;
  changePeriod: ReturnType<typeof vi.fn>;
  setSelectedDate: ReturnType<typeof vi.fn>;
  setCustomDate: ReturnType<typeof vi.fn>;
  toggleTagId: ReturnType<typeof vi.fn>;
  clearTagFilter: ReturnType<typeof vi.fn>;
  reset: () => void;
}

interface GlobalWithAppStub {
  __finlyAppStub__?: AppStubState;
}

const now = new Date();

function createStub(): AppStubState {
  const state: AppStubState = {
    activeAccount: null,
    activeType: TRANSACTION_TYPES.expense,
    activePeriod: PERIODS.month,
    selectedDate: now,
    customDate: { start: new Date(now.getFullYear(), 0, 1), end: now },
    accounts: [],
    categories: [],
    transactions: [],
    tags: [],
    loading: false,
    categoriesById: new Map(),
    refresh: vi.fn(),
    refreshAccounts: vi.fn(async () => {}),
    refreshCategories: vi.fn(async () => {}),
    refreshTags: vi.fn(async () => {}),
    resetAll: vi.fn(async () => {}),
    selectAccount: vi.fn(),
    changeType: vi.fn(),
    changePeriod: vi.fn(),
    setSelectedDate: vi.fn(),
    setCustomDate: vi.fn(),
    toggleTagId: vi.fn(),
    clearTagFilter: vi.fn(),
    reset() {
      const fresh = createStub();
      state.activeAccount = fresh.activeAccount;
      state.activeType = fresh.activeType;
      state.activePeriod = fresh.activePeriod;
      state.selectedDate = fresh.selectedDate;
      state.customDate = fresh.customDate;
      state.accounts = fresh.accounts;
      state.categories = fresh.categories;
      state.transactions = fresh.transactions;
      state.tags = fresh.tags;
      state.loading = fresh.loading;
      state.categoriesById = fresh.categoriesById;
      state.refresh.mockClear();
      state.refreshAccounts.mockClear();
      state.refreshCategories.mockClear();
      state.refreshTags.mockClear();
      state.resetAll.mockClear();
      state.selectAccount.mockClear();
      state.changeType.mockClear();
      state.changePeriod.mockClear();
      state.setSelectedDate.mockClear();
      state.setCustomDate.mockClear();
      state.toggleTagId.mockClear();
      state.clearTagFilter.mockClear();
    },
  };
  return state;
}

const g = globalThis as GlobalWithAppStub;
g.__finlyAppStub__ = createStub();

// Stable empty array so that buildAppMock() keeps reference identity across
// renders. A fresh `[]` on every call would retrigger effects that depend on
// `activeCategories` (e.g. HomeScreen's tag-breakdown loader), causing an
// infinite render loop in tests.
const EMPTY_ACTIVE_CATEGORIES: CategoryWithTotal[] = [];
const EMPTY_TAG_IDS: number[] = [];
const EMPTY_FILTERED: Transaction[] = [];
const EMPTY_TAGS_BY_TX = new Map<number, number[]>();

// Returns the value of useApp(). Referenced lazily inside a vi.mock factory
// (e.g. `useApp: () => buildAppMock()`) so the factory has no top-level
// references that could be touched before this module initializes.
export function buildAppMock() {
  const s = currentStub();
  const accountsWithBalance = s.accounts.map((a) => ({ ...a, balance: 0 }));
  return {
    activeAccount: s.activeAccount,
    activeType: s.activeType,
    activePeriod: s.activePeriod,
    selectedDate: s.selectedDate,
    customDate: s.customDate,
    accounts: s.accounts,
    categories: s.categories,
    transactions: s.transactions,
    tags: s.tags,
    loading: s.loading,
    categoriesById: s.categoriesById,
    refresh: s.refresh,
    refreshAccounts: s.refreshAccounts,
    refreshCategories: s.refreshCategories,
    refreshTags: s.refreshTags,
    resetAll: s.resetAll,
    selectAccount: s.selectAccount,
    changeType: s.changeType,
    changePeriod: s.changePeriod,
    setSelectedDate: s.setSelectedDate,
    setCustomDate: s.setCustomDate,
    toggleTagId: s.toggleTagId,
    clearTagFilter: s.clearTagFilter,
    accountsWithBalance: accountsWithBalance as (Account & { balance: number })[],
    tagsByTransaction: EMPTY_TAGS_BY_TX,
    activeCategories: EMPTY_ACTIVE_CATEGORIES,
    activeTagIds: EMPTY_TAG_IDS,
    filteredTransactions: EMPTY_FILTERED,
    totalIncome: 0,
    totalExpenses: 0,
    totalIncomeAll: 0,
    totalExpensesAll: 0,
  };
}

function currentStub(): AppStubState {
  const stub = (globalThis as GlobalWithAppStub).__finlyAppStub__;
  if (!stub) throw new Error('appStub setup not loaded: import tests/component/helpers/appStub.ts');
  return stub;
}

export function getAppStub(): AppStubState {
  return currentStub();
}

export function setAppData(data: Partial<AppStubState>): void {
  const stub = currentStub();
  Object.assign(stub, data);
  if (data.categories) stub.categoriesById = new Map(data.categories.map((c) => [c.id, c]));
}

export function setAppState(data: Partial<{
  activeAccount: Account | null;
  activeType: TransactionType;
  activePeriod: Period;
  selectedDate: Date;
  customDate: { start: Date; end: Date };
  loading: boolean;
}>): void {
  const stub = currentStub();
  Object.assign(stub, data);
}

export function resetAppStub(): void {
  currentStub().reset();
}

// Re-exported for convenience in tests that build typed stubs.
export type { Account, Category, Tag, Transaction };
