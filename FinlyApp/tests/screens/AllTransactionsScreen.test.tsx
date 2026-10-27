import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, waitFor, userEvent, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import AllTransactionsScreen from '../../src/screens/AllTransactionsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { setConfig, getConfigStub, resetStub } from '../component/helpers/configStub';
import { formatSignedCurrency, HIDDEN_BALANCE } from '../../src/utils/formatters';
import type { Account, Category, Transaction } from '../../src/database/types';
import { PERIODS } from '../../src/constants/types';
import { TEST_IDS } from '../../src/constants/testIds';

function flattenStyle(style: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.assign(out, value);
  };
  walk(style);
  return out;
}

const list = vi.fn(async (_q: unknown) => [] as Transaction[]);
const deleteMany = vi.fn(async (_ids: number[]) => undefined);
const getTagsByTransactionIds = vi.fn(
  async () => [] as { transaction_id: number; tag_id: number; name: string }[],
);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    list: (q: unknown) => list(q),
    deleteMany: (ids: number[]) => deleteMany(ids),
    getTagsByTransactionIds: () => getTagsByTransactionIds(),
  },
  recurringRepository: {
    list: async () => [],
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

describe('AllTransactionsScreen', () => {
  beforeEach(() => {
    resetStub();
    list.mockReset().mockResolvedValue([]);
    deleteMany.mockReset().mockResolvedValue(undefined);
    getTagsByTransactionIds.mockReset().mockResolvedValue([]);
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    setAppData({
      accounts: [account],
      categories: [category],
      categoriesById: new Map([[1, category]]),
      activeAccount: null,
      transactions: [],
    });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('masks the header total when hide balances is on, and the eye reveals it', async () => {
    setConfig({ hideBalances: true });
    list.mockResolvedValue([tx(1, { description: 'Rent', amount: 1200 })]);
    setAppData({
      activePeriod: PERIODS.custom,
      customDate: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
    });
    const view = await render(<AllTransactionsScreen />);

    await waitFor(() => expect(view.getByText(HIDDEN_BALANCE)).toBeTruthy());
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    expect(flattenStyle(view.getByText(HIDDEN_BALANCE).props.style).color).toBe('#94A3B8');

    await fireEvent.press(view.getByLabelText('Show amounts'));
    expect(view.queryByText(HIDDEN_BALANCE)).toBeNull();

    const cfg = getConfigStub().config;
    const shown = formatSignedCurrency(-1200, cfg.currency, cfg.decimalSeparator);
    expect(view.getAllByText(shown).some((node) => flattenStyle(node.props.style).color === '#F87171')).toBe(true);
  });

  it('shows the account trigger, category filter button and empty state when empty', async () => {
    const view = await render(<AllTransactionsScreen />);
    expect(view.getByText('Wallet')).toBeTruthy();
    expect(view.getByText(/all categories/i)).toBeTruthy();
    expect(view.getByText('No transactions')).toBeTruthy();
  });

  it('labels the pill with the applied category selection', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    const view = await render(<AllTransactionsScreen />);

    // All tab -> All expenses preset -> the pill names the applied set.
    await fireEvent.press(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter));
    await fireEvent.press(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-expenses`));
    await fireEvent.press(view.getByTestId(TEST_IDS.categoryFilterApply));

    await waitFor(() => expect(
      within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('All expenses'),
    ).toBeTruthy());
    expect(getConfigStub().config.allTransactionsCategoryIds).toEqual([1, 2]);
  });

  it('restores a separate category selection per type tab', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    setConfig({
      allTransactionsCategoryIds: [1],
      allTransactionsExpenseCategoryIds: [1, 2],
      allTransactionsIncomeCategoryIds: [3],
    });

    const view = await render(<AllTransactionsScreen />);
    await waitFor(() => expect(
      within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('1 category'),
    ).toBeTruthy());

    await fireEvent.press(view.getByRole('tab', { name: 'Show expenses' }));
    await waitFor(() => expect(
      within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('All expenses'),
    ).toBeTruthy());

    await fireEvent.press(view.getByRole('tab', { name: 'Show income' }));
    await waitFor(() => expect(
      within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('All income'),
    ).toBeTruthy());

    await fireEvent.press(view.getByRole('tab', { name: 'All' }));
    await waitFor(() => expect(
      within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('1 category'),
    ).toBeTruthy());

    expect(getConfigStub().config.allTransactionsCategoryIds).toEqual([1]);
    expect(getConfigStub().config.allTransactionsExpenseCategoryIds).toEqual([]);
    expect(getConfigStub().config.allTransactionsIncomeCategoryIds).toEqual([]);
  });

  it('updates only the active tab category selection', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    setConfig({
      allTransactionsCategoryIds: [1],
      allTransactionsExpenseCategoryIds: [1, 2],
      allTransactionsIncomeCategoryIds: [3],
    });

    const view = await render(<AllTransactionsScreen />);
    await fireEvent.press(view.getByRole('tab', { name: 'Show expenses' }));
    await fireEvent.press(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter));
    await fireEvent.press(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-expenses`));
    await fireEvent.press(view.getByLabelText('Food'));
    await fireEvent.press(view.getByTestId(TEST_IDS.categoryFilterApply));

    await waitFor(() => expect(getConfigStub().config.allTransactionsExpenseCategoryIds).toEqual([1]));
    expect(getConfigStub().config.allTransactionsCategoryIds).toEqual([1]);
    expect(getConfigStub().config.allTransactionsIncomeCategoryIds).toEqual([]);
  });

  it('prunes deleted categories from every tab selection', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    setConfig({
      allTransactionsCategoryIds: [1, 99],
      allTransactionsExpenseCategoryIds: [2, 99],
      allTransactionsIncomeCategoryIds: [3, 99],
    });

    const view = await render(<AllTransactionsScreen />);
    await waitFor(() => expect(getConfigStub().config.allTransactionsCategoryIds).toEqual([1]));
    expect(getConfigStub().config.allTransactionsExpenseCategoryIds).toEqual([2]);
    expect(getConfigStub().config.allTransactionsIncomeCategoryIds).toEqual([]);
    expect(within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('1 category')).toBeTruthy();
  });

  it('stores a full category selection as no filter for that tab only', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    setConfig({
      allTransactionsExpenseCategoryIds: [1],
      allTransactionsIncomeCategoryIds: [3],
    });
    const view = await render(<AllTransactionsScreen />);

    await fireEvent.press(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter));
    await fireEvent.press(view.getByText('Apply (All categories)'));
    await waitFor(() => expect(getConfigStub().config.allTransactionsCategoryIds).toEqual([]));
    expect(getConfigStub().config.allTransactionsExpenseCategoryIds).toEqual([1]);
    expect(getConfigStub().config.allTransactionsIncomeCategoryIds).toEqual([]);
    expect(within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('All categories')).toBeTruthy();
  });

  it('stores the full expense set as no filter on the Expenses tab', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    const view = await render(<AllTransactionsScreen />);

    await fireEvent.press(view.getByRole('tab', { name: 'Show expenses' }));
    await fireEvent.press(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter));
    await fireEvent.press(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-expenses`));
    await fireEvent.press(view.getByTestId(TEST_IDS.categoryFilterApply));

    await waitFor(() => expect(getConfigStub().config.allTransactionsExpenseCategoryIds).toEqual([]));
    expect(within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('All expenses')).toBeTruthy();
  });

  it('prunes categories of the wrong type from a type tab', async () => {
    const food: Category = { ...category };
    const travel: Category = { ...category, id: 2, name: 'Travel' };
    const salary: Category = { ...category, id: 3, name: 'Salary', type: 'income' };
    setAppData({
      categories: [food, travel, salary],
      categoriesById: new Map([[1, food], [2, travel], [3, salary]]),
    });
    setConfig({ allTransactionsExpenseCategoryIds: [1, 3] });

    const view = await render(<AllTransactionsScreen />);
    await waitFor(() => expect(getConfigStub().config.allTransactionsExpenseCategoryIds).toEqual([1]));
    expect(within(view.getByTestId(TEST_IDS.allTransactionsCategoryFilter)).getByText('All categories')).toBeTruthy();
  });

  it('loads transactions through the repository on focus', async () => {
    list.mockResolvedValue([tx(1, { description: 'Rent' })]);
    await render(<AllTransactionsScreen />);
    expect(list).toHaveBeenCalled();
  });

  it('renders a transaction row when transactions are loaded', async () => {
    list.mockResolvedValue([tx(1, { description: 'Rent', amount: 1200 })]);
    setAppData({
      categoriesById: new Map([[1, category]]),
      activePeriod: PERIODS.custom,
      customDate: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
    });
    const view = await render(<AllTransactionsScreen />);
    expect(view.getByText('Rent')).toBeTruthy();
  });

  it('hides the header search/select actions when no transaction matches the filters', async () => {
    list.mockResolvedValue([tx(1, { date: '2026-01-15 10:00:00' })]);
    setAppData({ categoriesById: new Map([[1, category]]) });
    const view = await render(<AllTransactionsScreen />);
    expect(view.getByText('No transactions')).toBeTruthy();
    expect(nav.setOptions).toHaveBeenCalledWith({ headerRight: null });
  });

  it('shows the header search/select actions when transactions are visible', async () => {
    list.mockResolvedValue([tx(1, { description: 'Rent' })]);
    setAppData({
      categoriesById: new Map([[1, category]]),
      activePeriod: PERIODS.custom,
      customDate: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
    });
    await render(<AllTransactionsScreen />);
    const lastOptions = nav.setOptions.mock.calls[nav.setOptions.mock.calls.length - 1][0] as { headerRight: unknown };
    expect(lastOptions.headerRight).toEqual(expect.any(Function));
  });

  it('filters the list through the recurring view chip', async () => {
    list.mockResolvedValue([
      tx(1, { description: 'Rent', recurring_rule_id: 5 }),
      tx(2, { description: 'Coffee' }),
    ]);
    setAppData({
      categoriesById: new Map([[1, category]]),
      activePeriod: PERIODS.custom,
      customDate: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
    });
    const view = await render(<AllTransactionsScreen />);
    expect(view.getByText('Rent')).toBeTruthy();
    expect(view.getByText('Coffee')).toBeTruthy();

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('All'));
    await ue.press(view.getByText('One-time'));
    await ue.press(view.getByText('Select'));

    await waitFor(() => expect(view.queryByText('Rent')).toBeNull());
    expect(view.getByText('Coffee')).toBeTruthy();
    expect(view.getByLabelText('One-time')).toBeTruthy();
  });

  it('always shows the recurring view chip, defaulting to All', async () => {
    list.mockResolvedValue([tx(1, { description: 'Coffee' })]);
    setAppData({
      categoriesById: new Map([[1, category]]),
      activePeriod: PERIODS.custom,
      customDate: { start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) },
    });
    const view = await render(<AllTransactionsScreen />);
    expect(view.getByLabelText('All')).toBeTruthy();
  });
});
