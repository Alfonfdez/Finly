import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import AddCategoryScreen from '../../src/screens/AddCategoryScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { consumePendingCategory } from '../../src/utils/pendingCategory';
import type { Category } from '../../src/database/types';

let setHeaderNode: ((node: ReactNode) => void) | null = null;
const nav = {
  setOptions: vi.fn((opts: { headerRight?: (() => ReactNode) | null }) => {
    setHeaderNode?.(opts.headerRight ? opts.headerRight() : null);
  }),
  navigate: vi.fn(),
  goBack: vi.fn(),
};

function HeaderHost() {
  const [node, setNode] = useState<ReactNode>(null);
  setHeaderNode = setNode;
  return <>{node}</>;
}

const renderWithHeader = () => render(<><HeaderHost /><AddCategoryScreen /></>);

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
    setHeaderNode = null;
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

  it('shows the header search action only when there is more than one category', async () => {
    const single = await renderWithHeader();
    expect(single.queryByLabelText('Search')).toBeNull();

    setAppData({
      categories: [
        expenseCategory,
        { ...expenseCategory, id: 2, name: 'Salary' },
      ],
    });
    const multiple = await renderWithHeader();
    expect(multiple.getByLabelText('Search')).toBeTruthy();
  });

  it('opens the search from the header, filters the grid and closes it', async () => {
    setAppData({
      categories: [
        expenseCategory,
        { ...expenseCategory, id: 2, name: 'Salary' },
      ],
    });
    const view = await renderWithHeader();
    expect(view.queryByPlaceholderText('Search category')).toBeNull();

    await fireEvent.press(view.getByLabelText('Search'));
    const search = view.getByPlaceholderText('Search category');
    await fireEvent.changeText(search, 'Food');
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.queryByText('Salary')).toBeNull();

    await fireEvent.press(view.getByLabelText('Close search'));
    expect(view.queryByPlaceholderText('Search category')).toBeNull();
    expect(view.getByText('Salary')).toBeTruthy();
  });

  it('closes the search when the header action is pressed again', async () => {
    setAppData({
      categories: [
        expenseCategory,
        { ...expenseCategory, id: 2, name: 'Salary' },
      ],
    });
    const view = await renderWithHeader();

    await fireEvent.press(view.getByLabelText('Search'));
    expect(view.getByPlaceholderText('Search category')).toBeTruthy();

    await fireEvent.press(view.getByLabelText('Search'));
    expect(view.queryByPlaceholderText('Search category')).toBeNull();
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
    expect(nav.navigate).toHaveBeenCalledWith('CreateCategory', { type: 'expense', fromTransaction: true });
  });
});
