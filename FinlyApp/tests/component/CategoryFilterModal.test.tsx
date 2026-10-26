import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryFilterModal from '../../src/components/CategoryFilterModal';
import { TYPE_FILTERS, TRANSACTION_TYPES } from '../../src/constants/types';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Category } from '../../src/database/types';

const mockOnApply = vi.fn();
const mockOnClose = vi.fn();

const expenseCat: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#22D3EE', type: 'expense', created_at: '2026-01-01' };
const expenseCat2: Category = { id: 3, user_id: 1, name: 'Travel', icon: 'airplane', color: '#60A5FA', type: 'expense', created_at: '2026-01-01' };
const incomeCat: Category = { id: 2, user_id: 1, name: 'Salary', icon: 'wallet', color: '#34D399', type: 'income', created_at: '2026-01-01' };
const allCategories: Category[] = [expenseCat, incomeCat];
const threeCategories: Category[] = [expenseCat, expenseCat2, incomeCat];

function renderFilter(
  overrides: Partial<{ visible: boolean; categories: Category[]; selectedIds: number[]; type: string }> = {},
) {
  return render(
    <CategoryFilterModal
      visible={overrides.visible ?? true}
      categories={overrides.categories ?? allCategories}
      selectedIds={overrides.selectedIds ?? []}
      type={(overrides.type ?? TYPE_FILTERS.all) as typeof TYPE_FILTERS.all}
      onApply={mockOnApply}
      onClose={mockOnClose}
    />,
  );
}

describe('CategoryFilterModal', () => {
  beforeEach(() => {
    mockOnApply.mockClear();
    mockOnClose.mockClear();
  });

  it('does not render when invisible', async () => {
    const view = await renderFilter({ visible: false });
    expect(view.queryByText('Food')).toBeNull();
  });

  it('renders categories in sections when type is all', async () => {
    const view = await renderFilter();
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.getByText('Salary')).toBeTruthy();
    expect(view.getByText('Expenses')).toBeTruthy();
    expect(view.getByText('Income')).toBeTruthy();
  });

  it('shows only expense categories with the Expenses title when type filter is expense', async () => {
    const view = await renderFilter({ type: TRANSACTION_TYPES.expense });
    expect(view.getByText('Expenses')).toBeTruthy();
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.queryByText('Salary')).toBeNull();
  });

  it('shows only income categories with the Income title when type filter is income', async () => {
    const view = await renderFilter({ type: TRANSACTION_TYPES.income });
    expect(view.getByText('Income')).toBeTruthy();
    expect(view.getByText('Salary')).toBeTruthy();
    expect(view.queryByText('Food')).toBeNull();
  });

  it('shows every tile and the matching preset as selected when no filter is applied', async () => {
    const view = await renderFilter({ categories: threeCategories });
    expect(view.getByLabelText('Food').props.accessibilityState).toEqual({ selected: true });
    expect(view.getByLabelText('Travel').props.accessibilityState).toEqual({ selected: true });
    expect(view.getByLabelText('Salary').props.accessibilityState).toEqual({ selected: true });
    expect(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-all`).props.accessibilityState).toEqual({ selected: true });
    expect(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-expenses`).props.accessibilityState).toEqual({ selected: false });
    expect(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-income`).props.accessibilityState).toEqual({ selected: false });
    expect(view.queryByText('Select at least one category.')).toBeNull();
  });

  it('shows the type tiles and preset as selected when no filter is applied on a type tab', async () => {
    const expenseView = await renderFilter({ type: TRANSACTION_TYPES.expense });
    expect(expenseView.getByLabelText('Food').props.accessibilityState).toEqual({ selected: true });
    expect(expenseView.queryByLabelText('Salary')).toBeNull();
    expect(expenseView.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-expenses`).props.accessibilityState).toEqual({ selected: true });

    const incomeView = await renderFilter({ type: TRANSACTION_TYPES.income });
    expect(incomeView.getByLabelText('Salary').props.accessibilityState).toEqual({ selected: true });
    expect(incomeView.queryByLabelText('Food')).toBeNull();
    expect(incomeView.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-income`).props.accessibilityState).toEqual({ selected: true });
  });

  it('marks only the provided ids when the filter is not empty', async () => {
    const view = await renderFilter({ selectedIds: [1] });
    expect(view.getByLabelText('Food').props.accessibilityState).toEqual({ selected: true });
    expect(view.getByLabelText('Salary').props.accessibilityState).toEqual({ selected: false });
  });

  it('offers the three presets on the All tab and only the matching one on a type tab', async () => {
    const allView = await renderFilter();
    expect(allView.getByText('All categories')).toBeTruthy();
    expect(allView.getByText('All expenses')).toBeTruthy();
    expect(allView.getByText('All income')).toBeTruthy();

    const expenseView = await renderFilter({ type: TRANSACTION_TYPES.expense });
    expect(expenseView.getByText('All expenses')).toBeTruthy();
    expect(expenseView.queryByText('All categories')).toBeNull();
    expect(expenseView.queryByText('All income')).toBeNull();

    const incomeView = await renderFilter({ type: TRANSACTION_TYPES.income });
    expect(incomeView.getByText('All income')).toBeTruthy();
    expect(incomeView.queryByText('All expenses')).toBeNull();
  });

  it('deselects and reselects a category from the all-selected state', async () => {
    const view = await renderFilter({ categories: threeCategories });
    await fireEvent.press(view.getByText('Food'));
    expect(view.getByLabelText('Food').props.accessibilityState).toEqual({ selected: false });
    expect(view.getByLabelText('Travel').props.accessibilityState).toEqual({ selected: true });
    expect(view.getByLabelText('Salary').props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(view.getByText('Apply (2)'));
    expect(mockOnApply).toHaveBeenCalledWith([3, 2]);

    mockOnApply.mockClear();
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Apply (All categories)'));
    expect(mockOnApply).toHaveBeenCalledWith([3, 2, 1]);
  });

  it('selects every category with the All categories preset', async () => {
    const view = await renderFilter({ selectedIds: [1] });
    await fireEvent.press(view.getByText('All categories'));
    await fireEvent.press(view.getByText('Apply (All categories)'));
    expect(mockOnApply).toHaveBeenCalledWith([1, 2]);
  });

  it('selects the expense set with the All expenses preset', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('All expenses'));
    await fireEvent.press(view.getByText('Apply (All expenses)'));
    expect(mockOnApply).toHaveBeenCalledWith([1]);
  });

  it('selects the income set with the All income preset', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('All income'));
    await fireEvent.press(view.getByText('Apply (All income)'));
    expect(mockOnApply).toHaveBeenCalledWith([2]);
  });

  it('recognizes a manually selected full expense or income set', async () => {
    const expenseView = await renderFilter();
    await fireEvent.press(expenseView.getByText('Salary'));
    await fireEvent.press(expenseView.getByText('Apply (All expenses)'));
    expect(mockOnApply).toHaveBeenCalledWith([1]);

    mockOnApply.mockClear();
    const incomeView = await renderFilter();
    await fireEvent.press(incomeView.getByText('Food'));
    await fireEvent.press(incomeView.getByText('Apply (All income)'));
    expect(mockOnApply).toHaveBeenCalledWith([2]);
  });

  it('keeps a count for a partial or mixed selection', async () => {
    const view = await renderFilter({ categories: threeCategories, selectedIds: [1] });
    await fireEvent.press(view.getByText('Salary'));
    await fireEvent.press(view.getByText('Apply (2)'));
    expect(mockOnApply).toHaveBeenCalledWith([1, 2]);
  });

  it('clears every category when the active preset is tapped again', async () => {
    const view = await renderFilter({ categories: threeCategories });
    await fireEvent.press(view.getByText('All categories'));
    expect(view.getByLabelText('Food').props.accessibilityState).toEqual({ selected: false });
    expect(view.getByLabelText('Travel').props.accessibilityState).toEqual({ selected: false });
    expect(view.getByLabelText('Salary').props.accessibilityState).toEqual({ selected: false });
    expect(view.getByTestId(`${TEST_IDS.categoryFilterPresetPrefix}-all`).props.accessibilityState).toEqual({ selected: false });
    expect(view.getByText('Select at least one category.')).toBeTruthy();
    expect(view.getByText('Apply (0)')).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.categoryFilterApply).props.accessibilityState).toEqual({ disabled: true });
    await fireEvent.press(view.getByText('Apply (0)'));
    expect(mockOnApply).not.toHaveBeenCalled();
  });

  it('disables Apply when the last selected category is removed and re-enables it after selecting one', async () => {
    const view = await renderFilter({ selectedIds: [1] });
    await fireEvent.press(view.getByText('Food'));
    expect(view.getByText('Apply (0)')).toBeTruthy();
    expect(view.getByText('Select at least one category.')).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.categoryFilterApply).props.accessibilityState).toEqual({ disabled: true });

    await fireEvent.press(view.getByText('Salary'));
    expect(view.getByText('Apply (All income)')).toBeTruthy();
    expect(view.queryByText('Select at least one category.')).toBeNull();
    expect(view.getByTestId(TEST_IDS.categoryFilterApply).props.accessibilityState).toEqual({ disabled: false });
  });

  it('applies the whole type set when opened with no filter on a type tab', async () => {
    const expenseView = await renderFilter({ type: TRANSACTION_TYPES.expense });
    await fireEvent.press(expenseView.getByText('Apply (All expenses)'));
    expect(mockOnApply).toHaveBeenCalledWith([1]);
  });

  it('applies every category when opened with no filter', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('Apply (All categories)'));
    expect(mockOnApply).toHaveBeenCalledWith([1, 2]);
  });

  it('filters categories by search text', async () => {
    const view = await renderFilter();
    const searchInput = view.getByPlaceholderText('Search category');
    await fireEvent.changeText(searchInput, 'Food');
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.queryByText('Salary')).toBeNull();
  });

  it('keeps matching tiles selected when searching the all-selected state', async () => {
    const view = await renderFilter();
    await fireEvent.changeText(view.getByPlaceholderText('Search category'), 'Food');
    expect(view.getByLabelText('Food').props.accessibilityState).toEqual({ selected: true });
  });

  it('shows a no-results state when the search matches nothing', async () => {
    const view = await renderFilter();
    const searchInput = view.getByPlaceholderText('Search category');
    await fireEvent.changeText(searchInput, 'zzz');
    expect(view.getByText('No results found')).toBeTruthy();
  });

  it('closes the modal when the close button is pressed', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
