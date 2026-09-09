import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import AddCategoryScreen from '../../src/screens/AddCategoryScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { consumePendingCategory } from '../../src/utils/pendingCategory';
import type { Category } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useRoute: () => ({ params: { type: 'expense' } }),
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

const expenseCategory: Category = {
  id: 1,
  user_id: 1,
  name: 'Food',
  icon: 'cart',
  color: '#22D3EE',
  type: 'expense',
  created_at: '2026-01-01',
};

describe('AddCategoryScreen', () => {
  beforeEach(() => {
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    nav.goBack.mockClear();
    setAppData({ categories: [expenseCategory] });
  });

  afterEach(() => {
    resetAppStub();
    consumePendingCategory();
  });

  it('renders the categories of the route type', async () => {
    const view = await render(<AddCategoryScreen />);
    expect(view.getByText('Food')).toBeTruthy();
  });

  it('does not show income categories when the type is expense', async () => {
    setAppData({
      categories: [
        expenseCategory,
        { ...expenseCategory, id: 2, name: 'Salary', icon: 'wallet', type: 'income' },
      ],
    });
    const view = await render(<AddCategoryScreen />);
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.queryByText('Salary')).toBeNull();
  });

  it('shows an empty state when there are no categories of the route type', async () => {
    setAppData({ categories: [] });
    const view = await render(<AddCategoryScreen />);
    expect(view.getByText('No results found')).toBeTruthy();
  });

  it('stores the pending category and goes back when a category is selected', async () => {
    const view = await render(<AddCategoryScreen />);
    fireEvent.press(view.getByText('Food'));
    expect(nav.goBack).toHaveBeenCalled();
    expect(consumePendingCategory()).toEqual({ categoryId: 1, type: 'expense' });
  });

  it('offers an add-more tile to create a category of the same type', async () => {
    const view = await render(<AddCategoryScreen />);
    fireEvent.press(view.getByText('Create'));
    expect(nav.navigate).toHaveBeenCalledWith('CreateCategory', { type: 'expense' });
  });
});