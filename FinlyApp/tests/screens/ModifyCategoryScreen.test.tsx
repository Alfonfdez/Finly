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
const mockRuleCounts = vi.fn(async (_ids: number[]) => ({} as Record<number, number>));

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
  recurringRepository: {
    countByCategoryIds: (ids: number[]) => mockRuleCounts(ids),
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
    mockRuleCounts.mockClear().mockResolvedValue({});
    setAppData({ categories: [category] });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    });
    resetAppStub();
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

  it('disables Delete when the category is the only one of its type', async () => {
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    expect(view.getByText('Delete')).toBeDisabled();
    expect(view.getByText('You need at least one category of each type, so this one cannot be deleted.')).toBeTruthy();
  });

  it('warns that the category rules are deleted too and offers moving them', async () => {
    setAppData({ categories: [category, { ...category, id: 8, name: 'Travel' } as Category] });
    mockRuleCounts.mockResolvedValue({ 7: 2 });
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    await fireEvent.press(view.getByText('Delete'));

    await waitFor(() => expect(mockRuleCounts).toHaveBeenCalledWith([7]));
    expect(view.getByText(
      'Deleting this category will also delete its recurring rules, unless you choose to move them to another category',
    )).toBeTruthy();
    expect(view.getByText('Move them to another category')).toBeTruthy();
    expect(view.queryByText('This category will be permanently deleted.')).toBeNull();
  });

  it('warns that the transactions are deleted too', async () => {
    setAppData({ categories: [category, { ...category, id: 8, name: 'Travel' } as Category] });
    mockTxList.mockResolvedValue([{ id: 1 } as Transaction]);
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    await fireEvent.press(view.getByText('Delete'));

    await waitFor(() => expect(mockTxList).toHaveBeenCalled());
    expect(view.getByText(
      'Deleting this category will also delete its transactions, unless you choose to move them to another category',
    )).toBeTruthy();
    expect(view.getByText('Move them to another category')).toBeTruthy();
  });

  it('warns about transactions and rules together', async () => {
    setAppData({ categories: [category, { ...category, id: 8, name: 'Travel' } as Category] });
    mockTxList.mockResolvedValue([{ id: 1 } as Transaction]);
    mockRuleCounts.mockResolvedValue({ 7: 1 });
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    await fireEvent.press(view.getByText('Delete'));

    await waitFor(() => expect(mockRuleCounts).toHaveBeenCalledWith([7]));
    expect(view.getByText(
      'Deleting this category will also delete its transactions and its recurring rules, unless you choose to move them to another category',
    )).toBeTruthy();
  });

  it('does not offer to move a category without data', async () => {
    setAppData({ categories: [category, { ...category, id: 8, name: 'Travel' } as Category] });
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    await fireEvent.press(view.getByText('Delete'));

    await waitFor(() => expect(view.getByText('This category will be permanently deleted.')).toBeTruthy());
    expect(view.queryByText('Move them to another category')).toBeNull();
  });

  it('assumes data when the linked-data check fails', async () => {
    setAppData({ categories: [category, { ...category, id: 8, name: 'Travel' } as Category] });
    mockTxList.mockRejectedValue(new Error('offline'));
    mockRuleCounts.mockRejectedValue(new Error('offline'));
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    await fireEvent.press(view.getByText('Delete'));

    await waitFor(() => expect(view.getByText(
      'Deleting this category will also delete its transactions and its recurring rules, unless you choose to move them to another category',
    )).toBeTruthy());
  });
  it('keeps a custom name when only the icon changes', async () => {
    const view = await render(<ModifyCategoryScreen />);
    await view.findByDisplayValue('Food');

    // The icon grid only renders its cells once it knows its width.
    await act(async () => {
      fireEvent(view.getByTestId(TEST_IDS.iconGrid), 'layout', {
        nativeEvent: { layout: { width: 320, height: 320 } },
      });
    });
    await fireEvent.press(view.getByLabelText('airplane-outline'));
    await fireEvent.press(view.getByText('Save'));

    await waitFor(() => expect(mockCategoryUpdate).toHaveBeenCalledTimes(1));
    // "Food" is not the seeded default for this id, so it must be stored as typed.
    expect(mockCategoryUpdate).toHaveBeenCalledWith(7, expect.objectContaining({ name: 'Food' }));
  });
});
