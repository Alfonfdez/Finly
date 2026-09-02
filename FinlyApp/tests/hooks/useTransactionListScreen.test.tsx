import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useTransactionListScreen } from '../../src/hooks/useTransactionListScreen';
import type { Transaction, Account, Category } from '../../src/database/types';
import type { NavigationProp } from '../../src/constants/types';

const getTagsByTransactionIds = vi.fn(async () => [] as { transaction_id: number; tag_id: number; name: string }[]);

vi.mock('../../src/database', () => ({
  transactionRepository: { getTagsByTransactionIds: () => getTagsByTransactionIds() },
}));

type Tx = Partial<Transaction> & Pick<Transaction, 'id' | 'date' | 'type' | 'amount' | 'account_id' | 'category_id'>;

function tx(id: number, overrides: Partial<Tx> = {}): Transaction {
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

const account1: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const category1: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;

function navigationMock() {
  return { navigate: vi.fn() } as unknown as NavigationProp<'Transactions'>;
}

async function setup(overrides: Partial<Parameters<typeof useTransactionListScreen>[0]> = {}) {
  const transactions = [tx(1, {}), tx(2, { id: 2 })];
  const navigation = navigationMock();
  const loadTransactions = vi.fn(async () => transactions);
  const setTransactions = vi.fn();
  const deleteFn = vi.fn(async () => undefined);
  const onAfterDelete = vi.fn(async () => undefined);
  const options: Parameters<typeof useTransactionListScreen>[0] = {
    navigation,
    selectMode: false,
    toggleItem: vi.fn(),
    selectedIds: new Set<number>(),
    exitSelectMode: vi.fn(),
    searchText: '',
    loadTransactions,
    setTransactions,
    filters: {
      transactions,
      accounts: [account1],
      activeAccount: null,
      categoriesById: new Map([[1, category1]]),
    },
    deleteFn,
    onAfterDelete,
    ...overrides,
  };
  const { result } = await renderHook(() => useTransactionListScreen(options));
  await act(async () => {});
  return { result, navigation, loadTransactions, setTransactions, deleteFn, onAfterDelete, options };
}

describe('useTransactionListScreen', () => {
  beforeEach(() => {
    getTagsByTransactionIds.mockReset();
    getTagsByTransactionIds.mockResolvedValue([]);
  });

  it('returns filters and the bulk-delete modal state', async () => {
    const { result } = await setup();
    expect(result.current.filters.filtered).toBeInstanceOf(Array);
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it('opens and closes the delete modal', async () => {
    const { result } = await setup();
    await act(() => result.current.openDeleteModal());
    expect(result.current.deleteModalVisible).toBe(true);
    await act(() => result.current.closeDeleteModal());
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it('confirmBulkDelete runs deleteFn, reloads, updates data and calls onAfterDelete', async () => {
    const { result, deleteFn, loadTransactions, setTransactions, onAfterDelete, options } = await setup({
      selectedIds: new Set([1, 2]),
    });

    await act(async () => { await result.current.confirmBulkDelete(); });

    expect(deleteFn).toHaveBeenCalledWith([1, 2]);
    expect(options.exitSelectMode).toHaveBeenCalledTimes(1);
    expect(loadTransactions).toHaveBeenCalledTimes(1);
    expect(setTransactions).toHaveBeenCalled();
    expect(onAfterDelete).toHaveBeenCalledTimes(1);
  });

  it('handleTransactionPress navigates to details when not in select mode', async () => {
    const { result, navigation } = await setup();
    await act(() => result.current.handleTransactionPress(5));
    expect(navigation.navigate).toHaveBeenCalledWith('TransactionDetails', { transactionId: 5 });
  });

  it('handleTransactionPress toggles selection instead of navigating in select mode', async () => {
    const toggleItem = vi.fn();
    const { result, navigation } = await setup({ selectMode: true, toggleItem });
    await act(() => result.current.handleTransactionPress(7));
    expect(toggleItem).toHaveBeenCalledWith(7);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('keyExtractor returns the stringified transaction id', async () => {
    const { result } = await setup();
    const transaction = tx(42, {});
    expect(result.current.keyExtractor(transaction)).toBe('42');
  });
});
