import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import CategoriesScreen from '../../src/screens/CategoriesScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { MAX_CATEGORIES_PER_TYPE } from '../../src/constants/types';
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

vi.mock('../../src/database', () => ({
  categoryRepository: {
    deleteMany: async () => {},
    bulkDeleteWithTargets: async () => {},
  },
  transactionRepository: {
    countByCategoryIdsMap: (ids: number[]) => mockCountByCategoryIdsMap(ids),
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
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    mockCountByCategoryIdsMap.mockReset().mockResolvedValue({});
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

  it('opens the modify screen when a category is selected', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await render(<CategoriesScreen />);
    fireEvent.press(view.getByText('Food'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyCategory', { categoryId: 1 });
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

  it('adds the standard gap below the select-all line in select mode', async () => {
    setAppData({ categories: [expenseCategory(1, 'Food'), expenseCategory(2, 'Transport')] });
    const view = await renderWithHeader();

    // Normal mode: there is no select-all row, so the grid keeps its own spacing.
    expect(gridPaddingTop(view)).toBeUndefined();

    await fireEvent.press(view.getByLabelText('Enter select mode'));
    await fireEvent.press(await view.findByText('Select all'));

    // The tiles must not touch the separator line of the row above them.
    expect(gridPaddingTop(view)).toBe(16);
  });
});