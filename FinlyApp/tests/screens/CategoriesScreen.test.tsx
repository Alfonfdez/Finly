import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CategoriesScreen from '../../src/screens/CategoriesScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Category } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn() };

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
});