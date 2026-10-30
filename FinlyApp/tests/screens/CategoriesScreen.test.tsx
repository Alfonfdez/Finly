import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import CategoriesScreen from '../../src/screens/CategoriesScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub, setConfig } from '../component/helpers/configStub';
import { setLanguage } from '../../src/i18n';
import { MAX_CATEGORIES_PER_TYPE, OTHERS_CATEGORY_ID } from '../../src/constants/types';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Category } from '../../src/database/types';

// The screen's Select/Search controls live in the navigation header, so the header
// node is captured and rendered next to the screen (mirrors the Accounts test).
let setHeaderNode: ((node: ReactNode) => void) | null = null;
const nav = {
  navigate: vi.fn(),
  setOptions: vi.fn((opts: { headerRight?: (() => ReactNode) | null }) => {
    setHeaderNode?.(opts.headerRight ? opts.headerRight() : null);
  }),
};

function HeaderHost() {
  const [node, setNode] = useState<ReactNode>(null);
  setHeaderNode = setNode;
  return <>{node}</>;
}

const renderWithHeader = () => render(<><HeaderHost /><CategoriesScreen /></>);

/** `paddingTop` of the grid's scroll container. */
function gridPaddingTop(view: unknown): number | undefined {
  const queries = view as {
    getByTestId: (id: string) => { props: { contentContainerStyle?: unknown } };
  };
  const style = StyleSheet.flatten(
    queries.getByTestId(TEST_IDS.categoriesGrid).props.contentContainerStyle,
  ) as { paddingTop?: number } | undefined;
  return style?.paddingTop;
}

const mockCountByCategoryIdsMap = vi.fn();
const mockCountByCategoryIds = vi.fn();
const mockDeleteMany = vi.fn();
const mockBulkDeleteWithTargets = vi.fn();

vi.mock('../../src/database', () => ({
  categoryRepository: {
    deleteMany: (ids: number[]) => mockDeleteMany(ids),
    bulkDeleteWithTargets: (items: unknown[]) => mockBulkDeleteWithTargets(items),
  },
  transactionRepository: {
    countByCategoryIdsMap: (ids: number[]) => mockCountByCategoryIdsMap(ids),
  },
  recurringRepository: {
    countByCategoryIds: (ids: number[]) => mockCountByCategoryIds(ids),
  },
}));

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useRoute: () => ({ params: {} }),
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

const baseCategory: Omit<Category, 'name' | 'icon'> = {
  id: 1,
  user_id: 1,
  color: '#22D3EE',
  type: 'expense',
  created_at: '2026-01-01',
};

function expenseCategory(id: number, name: string): Category {
  return { ...baseCategory, id, name, icon: 'cart' };
}

function incomeCategory(id: number, name: string): Category {
  return { ...baseCategory, id, name, icon: 'wallet', type: 'income' };
}

describe('CategoriesScreen', () => {
  beforeEach(() => {
    resetStub();
    setLanguage('en');
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    mockCountByCategoryIdsMap.mockReset().mockResolvedValue({});
    mockCountByCategoryIds.mockReset().mockResolvedValue({});
    mockDeleteMany.mockReset().mockResolvedValue(undefined);
    mockBulkDeleteWithTargets.mockReset().mockResolvedValue(undefined);
    setAppData({ categories: [] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the expense categories grid and the counter', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await render(<CategoriesScreen />);
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.getByText('Transport')).toBeTruthy();
    expect(view.getByText('2 of 30 categories')).toBeTruthy();
  });

  it('sorts by usage with the count on each tile and keeps Others last', async () => {
    setAppData({
      categories: [
        expenseCategory(1, 'Food'),
        expenseCategory(2, 'Transport'),
        expenseCategory(OTHERS_CATEGORY_ID, 'Others'),
      ],
    });
    mockCountByCategoryIdsMap.mockResolvedValue({ 1: 7, [OTHERS_CATEGORY_ID]: 99 });
    const view = await render(<CategoriesScreen />);
    await view.findByText('Food');

    // Lifetime usage is shown on the tiles; zero counts are hidden.
    await waitFor(() => expect(view.getByText('7')).toBeTruthy());
    expect(view.queryByText('0')).toBeNull();

    await fireEvent.press(view.getByText('Usage'));
    await waitFor(() => {
      const names = view.getAllByText(/^(Food|Transport|Others)$/).map(node => String(node.props.children));
      expect(names).toEqual(['Food', 'Transport', 'Others']);
    });
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({
      categoriesSortBy: 'usage',
      categoriesSortDirection: 'desc',
    });
  });
  it('flags the counter once the per-type limit is reached', async () => {
    setAppData({
      categories: Array.from({ length: MAX_CATEGORIES_PER_TYPE }, (_, i) => expenseCategory(i + 1, `Cat ${i + 1}`)),
    });
    const view = await render(<CategoriesScreen />);

    const counter = view.getByText(`${MAX_CATEGORIES_PER_TYPE} of ${MAX_CATEGORIES_PER_TYPE} categories`);
    const style = StyleSheet.flatten(counter.props.style) as { color?: string; fontWeight?: string };
    expect(style.color).toBe('#F87171');
    expect(style.fontWeight).toBe('700');
  });

  it('shows an empty state when there are no categories of the active type', async () => {
    setAppData({ categories: [incomeCategory(3, 'Salary')] });
    const view = await render(<CategoriesScreen />);
    expect(view.getByText('No results found')).toBeTruthy();
  });

  it('reorders name-sorted categories when the language changes', async () => {
    setAppData({
      categories: [expenseCategory(13, 'Clothing'), expenseCategory(10, 'Education')],
    });
    const view = await renderWithHeader();
    await view.findByText('Clothing');

    const order = () => view.getAllByText(/^(Clothing|Education|Ropa|Educación)$/).map(n => String(n.props.children));
    expect(order()).toEqual(['Clothing', 'Education']);

    await act(async () => {
      setLanguage('es');
      setConfig({ language: 'es' });
    });
    expect(order()).toEqual(['Educación', 'Ropa']);
  });
  it('opens the modify screen when a category is selected', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await render(<CategoriesScreen />);
    fireEvent.press(view.getByText('Food'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyCategory', { categoryId: 1 });
  });

  it('uses the shared one-line title when deleting one selected category', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await renderWithHeader();
    await view.findByText('Food');

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Delete (1)'));

    await waitFor(() => expect(view.getByText('Delete 1 category?', { exact: false })).toBeTruthy());
  });

  it('permanently deletes the selected categories', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await renderWithHeader();
    await view.findByText('Food');

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Delete (1)'));
    await waitFor(() => expect(view.getByText('Delete 1 category?', { exact: false })).toBeTruthy());

    await fireEvent.press(view.getByText('Permanent delete'));

    await waitFor(() => expect(mockDeleteMany).toHaveBeenCalledWith([1]));
  });

  it('leaves select mode after a failed permanent delete', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    mockDeleteMany.mockRejectedValue(new Error('boom'));
    const view = await renderWithHeader();
    await view.findByText('Food');

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Delete (1)'));
    await waitFor(() => expect(view.getByText('Delete 1 category?', { exact: false })).toBeTruthy());

    await fireEvent.press(view.getByText('Permanent delete'));

    await waitFor(() => expect(view.queryByText('Delete (1)')).toBeNull());
  });

  it('opens the transfer flow instead of deleting in-use categories', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    mockCountByCategoryIdsMap.mockResolvedValue({ 1: 2 });
    const view = await renderWithHeader();
    await view.findByText('Food');

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Delete (1)'));
    await waitFor(() => expect(view.getByText('Move them to another category')).toBeTruthy());

    await fireEvent.press(view.getByText('Move them to another category'));

    await waitFor(() => expect(
      view.getByText('Categories without transactions will be deleted.'),
    ).toBeTruthy());
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it('deletes only selected categories still visible after searching', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await renderWithHeader();
    await view.findByText('Food');

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Transport'));
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());

    await fireEvent.press(view.getByLabelText('Search'));
    await fireEvent.changeText(await view.findByPlaceholderText('Search category'), 'Transport');
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
    await fireEvent.press(view.getByText('Delete (1)'));
    await waitFor(() => expect(view.getByText('Delete 1 category?', { exact: false })).toBeTruthy());
    await fireEvent.press(view.getByText('Permanent delete'));

    await waitFor(() => expect(mockDeleteMany).toHaveBeenCalledWith([2]));
  });

  it('switches the grid when the Income tab is selected', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), incomeCategory(3, 'Salary')] });
    const view = await render(<CategoriesScreen />);
    expect(view.getByText('Food')).toBeTruthy();

    await fireEvent.press(view.getByText('Income'));
    expect(view.getByText('Salary')).toBeTruthy();
    expect(view.queryByText('Food')).toBeNull();
  });

  it('exposes the add-more tile linked to the create screen', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food')] });
    const view = await render(<CategoriesScreen />);
    fireEvent.press(view.getByText('Create'));
    expect(nav.navigate).toHaveBeenCalledWith('CreateCategory', { type: 'expense' });
  });

  it('keeps the standard gap below the controls separator in normal and select mode', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await renderWithHeader();

    // Normal mode: the tiles must not touch the sort row separator line.
    expect(gridPaddingTop(view)).toBe(16);

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(await view.findByText('Select all'));

    // Selection mode: the gap is kept below the select-all row separator.
    expect(gridPaddingTop(view)).toBe(16);
  });
});
