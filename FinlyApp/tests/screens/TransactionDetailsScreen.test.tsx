import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import TransactionDetailsScreen from '../../src/screens/TransactionDetailsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Account, Category, Transaction } from '../../src/database/types';

const getById = vi.fn(async (_id: number) => null as Transaction | null);
const getTagsByTransactionIds = vi.fn(async (_ids: number[]) => [] as { tag_id: number; name: string }[]);
const remove = vi.fn(async (_id: number) => undefined);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    getById: (id: number) => getById(id),
    getTagsByTransactionIds: (ids: number[]) => getTagsByTransactionIds(ids),
    delete: (id: number) => remove(id),
  },
}));

vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;
    exists = false;
    delete = vi.fn();
    constructor(uri: string) {
      this.uri = uri;
    }
  },
}));

const routeParams: Record<string, unknown> = { transactionId: 5 };
const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };

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

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const category: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 5,
    user_id: 1,
    date: '2026-01-15 10:00:00',
    type: 'expense',
    amount: 100,
    account_id: 1,
    category_id: 1,
    description: 'Lunch',
    created_at: '2026-01-15 10:00:00',
    updated_at: '2026-01-15 10:00:00',
    ...overrides,
  } as Transaction;
}

describe('TransactionDetailsScreen', () => {
  beforeEach(() => {
    getById.mockReset().mockResolvedValue(null);
    getTagsByTransactionIds.mockReset().mockResolvedValue([]);
    remove.mockReset().mockResolvedValue(undefined);
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    nav.goBack.mockClear();
    routeParams.transactionId = 5;
    setAppData({ accounts: [account], categories: [category] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('shows an empty state when the transaction is not found', async () => {
    const view = await render(<TransactionDetailsScreen />);
    expect(await view.findByText('No transactions')).toBeTruthy();
  });

  it('renders transaction account and category', async () => {
    getById.mockResolvedValue(tx());
    const view = await render(<TransactionDetailsScreen />);
    expect(await view.findByText('Wallet')).toBeTruthy();
    expect(view.getByText('Food')).toBeTruthy();
  });

  it('deletes the transaction and navigates back', async () => {
    getById.mockResolvedValue(tx());
    const ue = userEvent.setup();
    const view = await render(<TransactionDetailsScreen />);
    await view.findByText('Wallet');
    await ue.press(view.getByText('Delete'));
    const confirm = await view.findByRole('button', { name: 'Yes' });
    await ue.press(confirm);
    expect(remove).toHaveBeenCalledWith(5);
    expect(nav.goBack).toHaveBeenCalled();
  });
});
