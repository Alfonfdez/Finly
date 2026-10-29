import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import TransactionDetailsScreen from '../../src/screens/TransactionDetailsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Account, Category, Transaction } from '../../src/database/types';

const getById = vi.fn(async (_id: number) => null as Transaction | null);
const getTagsByTransactionIds = vi.fn(async (_ids: number[]) => [] as { tag_id: number; name: string }[]);
const remove = vi.fn(async (_id: number) => undefined);
const recurringGetById = vi.fn(async (_id: number) => null as { id: number; name: string } | null);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    getById: (id: number) => getById(id),
    getTagsByTransactionIds: (ids: number[]) => getTagsByTransactionIds(ids),
    delete: (id: number) => remove(id),
  },
  recurringRepository: {
    getById: (id: number) => recurringGetById(id),
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
    date: '2026-07-15 00:00:00',
    type: 'expense',
    amount: 100,
    account_id: 1,
    category_id: 1,
    description: 'Lunch',
    created_at: '2026-10-19 18:20:00',
    updated_at: '2026-10-20 09:05:00',
    ...overrides,
  } as Transaction;
}

describe('TransactionDetailsScreen', () => {
  beforeEach(() => {
    getById.mockReset().mockResolvedValue(null);
    getTagsByTransactionIds.mockReset().mockResolvedValue([]);
    remove.mockReset().mockResolvedValue(undefined);
    recurringGetById.mockReset().mockResolvedValue(null);
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

  it('shows the record creation and update timestamps, not the transaction date', async () => {
    getById.mockResolvedValue(tx());
    const view = await render(<TransactionDetailsScreen />);
    await view.findByText('Wallet');

    // A backdated transaction: the footer reports when the record was created/edited...
    expect(view.getByText('Created: 18:20 - 19 oct 2026')).toBeTruthy();
    expect(view.getByText('Updated: 09:05 - 20 oct 2026')).toBeTruthy();
    expect(view.getByText('time-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByText('refresh-outline', { includeHiddenElements: true })).toBeTruthy();
    // ...while the Date row keeps the transaction's own date.
    expect(view.getByText('July 15, 2026')).toBeTruthy();
    expect(view.queryByText('Created: 00:00 - 15 jul 2026')).toBeNull();
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
    expect(await view.findByText('This transaction will be permanently deleted. This cannot be undone.')).toBeTruthy();
    const confirms = view.getAllByRole('button', { name: 'Delete' });
    await ue.press(confirms[confirms.length - 1]);
    expect(remove).toHaveBeenCalledWith(5);
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('shows the recurring rule name (no toggle) for a recurring transaction', async () => {
    getById.mockResolvedValue(tx({ recurring_rule_id: 7 }));
    recurringGetById.mockResolvedValue({ id: 7, name: 'Rent' });
    const view = await render(<TransactionDetailsScreen />);
    await view.findByText('Recurring');
    expect(view.getByText('Rent')).toBeTruthy();
    // The rule name wraps instead of being clipped to one line.
    expect(view.getByText('Rent').props.numberOfLines).toBeUndefined();
    expect(view.queryByRole('switch')).toBeNull();

    // The row is a button that opens the rule's edit screen.
    fireEvent.press(view.getByLabelText('Edit recurring rule'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyRecurring', { ruleId: 7 });
  });

  it('always shows the Tags, Recurring and Photo rows and uses the placeholder for empty fields', async () => {
    getById.mockResolvedValue(tx({ description: null }));
    const view = await render(<TransactionDetailsScreen />);
    await view.findByText('Recurring');
    expect(view.getByText('Photos')).toBeTruthy();
    // Without a rule the Recurring row is not a button.
    expect(view.queryByLabelText('Edit recurring rule')).toBeNull();
    // Comment, Tags, Recurring and Photo are all empty -> "—" each.
    expect(view.getAllByText('—')).toHaveLength(4);
  });

  it('keeps the Tags and Comment labels visible with long, wrapping values', async () => {
    const tags = Array.from({ length: 12 }, (_, index) => ({
      tag_id: index + 1,
      name: `very-long-tag-${String(index + 1).padStart(2, '0')}`,
    }));
    getById.mockResolvedValue(tx({ description: 'a long comment '.repeat(300) }));
    getTagsByTransactionIds.mockResolvedValue(tags);
    const view = await render(<TransactionDetailsScreen />);

    await view.findByText('very-long-tag-01');
    // The labels stay rendered next to the wrapping values...
    expect(view.getByText('Comment')).toBeTruthy();
    expect(view.getByText('Tags')).toBeTruthy();
    // ...and every tag chip is shown.
    expect(view.getAllByText(/^very-long-tag-/)).toHaveLength(12);
    // The chips wrap inside the value column (1:2 split), so the label cannot collapse.
    const container = view.getByTestId(TEST_IDS.detailsTags);
    expect((StyleSheet.flatten(container.props.style) as { flex?: number }).flex).toBe(2);
  });
  it('renders a primary-colored symbol for each row', async () => {
    getById.mockResolvedValue(tx());
    const view = await render(<TransactionDetailsScreen />);
    await view.findByText('Wallet');
    for (const name of [
      'cash-outline', 'wallet-outline', 'grid-outline', 'calendar-outline',
      'chatbubble-ellipses-outline', 'pricetag-outline', 'repeat-outline', 'image-outline',
    ]) {
      expect(view.getByText(name, { includeHiddenElements: true })).toBeTruthy();
    }
    const cash = view.root!.queryAll((i) => i.type === 'RCTText' && i.children[0] === 'cash-outline')[0];
    expect(cash.props.color).toBe('#22D3EE');
  });
});
