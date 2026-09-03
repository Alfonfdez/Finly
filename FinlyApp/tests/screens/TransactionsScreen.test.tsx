import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import TransactionsScreen from '../../src/screens/TransactionsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Account, Category, Transaction } from '../../src/database/types';

const list = vi.fn(async (_q: unknown) => [] as Transaction[]);
const deleteMany = vi.fn(async (_ids: number[]) => undefined);
const getTagsByTransactionIds = vi.fn(
  async () => [] as { transaction_id: number; tag_id: number; name: string }[]
);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    list: (q: unknown) => list(q),
    deleteMany: (ids: number[]) => deleteMany(ids),
    getTagsByTransactionIds: () => getTagsByTransactionIds(),
  },
}));

const routeParams: Record<string, unknown> = {};
const nav = { setOptions: vi.fn(), navigate: vi.fn() };

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useRoute: () => ({ params: routeParams }),
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

function tx(id: number, overrides: Partial<Transaction> = {}): Transaction {
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

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const category: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;

describe('TransactionsScreen', () => {
  beforeEach(() => {
    list.mockReset().mockResolvedValue([]);
    deleteMany.mockReset().mockResolvedValue(undefined);
    getTagsByTransactionIds.mockReset().mockResolvedValue([]);
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    routeParams.categoryId = undefined;
    routeParams.startDate = undefined;
    routeParams.endDate = undefined;
    routeParams.tagIds = undefined;
    routeParams.period = undefined;
    routeParams.type = undefined;
    setAppData({
      accounts: [account],
      categories: [category],
      categoriesById: new Map([[1, category]]),
    });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('shows the account trigger and empty state with no transactions', async () => {
    const view = await render(<TransactionsScreen />);
    expect(view.getByText('Wallet')).toBeTruthy();
    expect(view.getByText('No transactions')).toBeTruthy();
  });

  it('loads transactions through the repository on focus', async () => {
    list.mockResolvedValue([tx(1, { description: 'Coffee' })]);
    setAppData({ transactions: [], activeAccount: account });
    await render(<TransactionsScreen />);
    expect(list).toHaveBeenCalled();
  });

  it('renders a transaction row when transactions are loaded', async () => {
    list.mockResolvedValue([tx(1, { description: 'Coffee', amount: 250 })]);
    setAppData({
      transactions: [],
      categoriesById: new Map([[1, category]]),
    });
    const view = await render(<TransactionsScreen />);
    expect(view.getByText('Coffee')).toBeTruthy();
  });
});
