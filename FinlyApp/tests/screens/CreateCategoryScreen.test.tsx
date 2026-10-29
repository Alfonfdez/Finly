import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CreateCategoryScreen from '../../src/screens/CreateCategoryScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
import { QUICK_COLORS } from '../../src/constants/colors';
import { setPendingCategory } from '../../src/utils/pendingCategory';
import type { Category } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = {};

const mockCategoryExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockCategoryCreate = vi.fn(async (_data: unknown) => ({ id: 3 }) as Category);

vi.mock('reanimated-color-picker', () => ({
  default: ({ children }: { children?: ReactNode }) => children ?? null,
  Panel1: () => null,
  HueSlider: () => null,
  OpacitySlider: () => null,
  Preview: () => null,
}));

vi.mock('../../src/database', () => ({
  categoryRepository: {
    existsByName: (userId: number, name: string, excludeId?: number) =>
      mockCategoryExists(userId, name, excludeId),
    create: (data: unknown) => mockCategoryCreate(data),
  },
}));

vi.mock('../../src/utils/pendingCategory', () => ({
  setPendingCategory: vi.fn(),
}));

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

describe('CreateCategoryScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockCategoryExists.mockClear().mockResolvedValue(false);
    mockCategoryCreate.mockClear();
    vi.mocked(setPendingCategory).mockClear();
    delete routeParams.type;
    delete routeParams.fromTransaction;
    setAppData({ categories: [] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the category name field with Expense/Income options and Add disabled', async () => {
    const view = await render(<CreateCategoryScreen />);
    expect(view.getByPlaceholderText('Category name')).toBeTruthy();
    expect(view.getByText('Expense')).toBeTruthy();
    expect(view.getByText('Income')).toBeTruthy();
    expect(view.getByText('Add')).toBeDisabled();
  });

  it('shows the hint inside the reserved band so Add never moves', async () => {
    const view = await render(<CreateCategoryScreen />);

    const slot = view.getByTestId(TEST_IDS.formHintSlot);
    expect(StyleSheet.flatten(slot.props.style).minHeight).toBeGreaterThan(0);
    expect(view.getByText('Enter a category name')).toBeTruthy();
  });

  it('shows the icon+color hint once a name is typed and keeps Add disabled', async () => {
    const view = await render(<CreateCategoryScreen />);
    await fireEvent.changeText(view.getByPlaceholderText('Category name'), 'Food');
    expect(view.getByText('Select an icon and a color')).toBeTruthy();
    expect(view.getByText('Add')).toBeDisabled();
  });

  it('locks the type when opened from the transaction flow', async () => {
    routeParams.type = 'expense';
    routeParams.fromTransaction = true;
    const view = await render(<CreateCategoryScreen />);

    expect(view.getByText('Expense')).toBeTruthy();
    expect(view.queryByText('Income')).toBeNull();
  });

  it('keeps both type options when opened from category management', async () => {
    routeParams.type = 'expense';
    const view = await render(<CreateCategoryScreen />);

    expect(view.getByText('Expense')).toBeTruthy();
    expect(view.getByText('Income')).toBeTruthy();
  });

  it('sets the pending category when returning to the transaction flow', async () => {
    routeParams.type = 'expense';
    routeParams.fromTransaction = true;
    const view = await render(<CreateCategoryScreen />);

    await fireEvent.changeText(view.getByPlaceholderText('Category name'), 'Coffee');
    await act(async () => {
      fireEvent(view.getByTestId(TEST_IDS.iconGrid), 'layout', {
        nativeEvent: { layout: { width: 320, height: 320 } },
      });
    });
    await fireEvent.press(view.getByLabelText('wallet-outline'));
    await fireEvent.press(view.getByLabelText(QUICK_COLORS[0]));

    await waitFor(() => expect(view.getByText('Add')).not.toBeDisabled());
    await act(async () => { fireEvent.press(view.getByText('Add')); });

    await waitFor(() => expect(setPendingCategory).toHaveBeenCalledWith(3, 'expense'));
  });

  it('does not set a pending category when returning to category management', async () => {
    routeParams.type = 'expense';
    const view = await render(<CreateCategoryScreen />);

    await fireEvent.changeText(view.getByPlaceholderText('Category name'), 'Coffee');
    await act(async () => {
      fireEvent(view.getByTestId(TEST_IDS.iconGrid), 'layout', {
        nativeEvent: { layout: { width: 320, height: 320 } },
      });
    });
    await fireEvent.press(view.getByLabelText('wallet-outline'));
    await fireEvent.press(view.getByLabelText(QUICK_COLORS[0]));

    await waitFor(() => expect(view.getByText('Add')).not.toBeDisabled());
    await act(async () => { fireEvent.press(view.getByText('Add')); });

    await waitFor(() => expect(mockCategoryCreate).toHaveBeenCalled());
    expect(setPendingCategory).not.toHaveBeenCalled();
  });
});
