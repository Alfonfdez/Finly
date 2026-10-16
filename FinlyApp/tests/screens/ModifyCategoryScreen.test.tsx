import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor, act, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyCategoryScreen from '../../src/screens/ModifyCategoryScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Category, Transaction } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = { categoryId: 7 };

const mockCategoryExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockCategoryUpdate = vi.fn(async (_id: number, data: unknown) => {});
const mockTxList = vi.fn(async (_filter: unknown) => [] as Transaction[]);

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
    update: (id: number, data: unknown) => mockCategoryUpdate(id, data),
  },
  transactionRepository: {
    list: (filter: unknown) => mockTxList(filter),
  },
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

const category: Category = {
  id: 7,
  user_id: 1,
  name: 'Food',
  icon: 'restaurant-outline',
  color: '#F59E0B',
  type: 'expense',
  created_at: '2026-01-01 00:00:00',
} as Category;

describe('ModifyCategoryScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockCategoryExists.mockClear().mockResolvedValue(false);
    mockCategoryUpdate.mockClear();
    mockTxList.mockClear().mockResolvedValue([]);
    setAppData({ categories: [category] });
  });

  afterEach(() => {
    resetAppStub();
    vi.useRealTimers();
  });

  it('preloads the category and keeps Save disabled until something changes', async () => {
    const view = await render(<ModifyCategoryScreen />);
    expect(view.getByDisplayValue('Food')).toBeTruthy();
    expect(view.getByText('Save')).toBeDisabled();
  });

  it('keeps what the user typed when the category data refreshes underneath', async () => {
    const view = await render(<ModifyCategoryScreen />);
    const input = await view.findByDisplayValue('Food');
    await fireEvent.changeText(input, 'Food edited');

    // A refresh from AppContext must not reset the form (the userEdited guard).
    setAppData({ categories: [{ ...category }] });
    expect(view.getByDisplayValue('Food edited')).toBeTruthy();
  });

  it('enables Save only while the form differs from the loaded category', async () => {
    vi.useFakeTimers();
    const view = await render(<ModifyCategoryScreen />);
    const nameInput = await view.findByDisplayValue('Food');

    await fireEvent.changeText(nameInput, 'Food2');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(view.getByText('Save')).toBeEnabled();

    await fireEvent.changeText(nameInput, 'Food');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(view.getByText('Save')).toBeDisabled();
  });

  it('saves the edited category and goes back', async () => {
    vi.useFakeTimers();
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');
    await fireEvent.changeText(view.getByPlaceholderText('Category name'), 'Food2');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(view.getByText('Save')).toBeEnabled();
    await fireEvent.press(view.getByText('Save'));
    await waitFor(() => expect(mockCategoryUpdate).toHaveBeenCalledTimes(1));
    expect(mockCategoryUpdate).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'Food2' }));
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('shows the name error in the slot above Save, not under the field', async () => {
    const view = await render(<ModifyCategoryScreen />);
    const input = await view.findByDisplayValue('Food');
    await fireEvent.changeText(input, '');

    const slot = view.getByTestId(TEST_IDS.formHintSlot);
    expect(within(slot).getByText('Enter a category name')).toBeTruthy();
  });

  it('only reddens the name field once the user touched it', async () => {
    const view = await render(<ModifyCategoryScreen />);
    const input = await view.findByDisplayValue('Food');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#334155');

    await fireEvent.changeText(input, '');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#F87171');
  });
});
