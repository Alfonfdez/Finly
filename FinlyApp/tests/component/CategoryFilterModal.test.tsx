import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryFilterModal from '../../src/components/CategoryFilterModal';
import { TYPE_FILTERS, TRANSACTION_TYPES } from '../../src/constants/types';
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

  it('shows only expense categories when type filter is expense', async () => {
    const view = await renderFilter({ type: TRANSACTION_TYPES.expense });
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.queryByText('Salary')).toBeNull();
  });

  it('shows only income categories when type filter is income', async () => {
    const view = await renderFilter({ type: TRANSACTION_TYPES.income });
    expect(view.getByText('Salary')).toBeTruthy();
    expect(view.queryByText('Food')).toBeNull();
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

  it('toggles a category on and off', async () => {
    const view = await renderFilter({ categories: threeCategories });
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Apply (1)'));
    expect(mockOnApply).toHaveBeenCalledWith([1]);

    // Deselecting everything is the same as "no filter": the label falls back to
    // All categories and applying it clears the selection.
    mockOnApply.mockClear();
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Apply (All categories)'));
    expect(mockOnApply).toHaveBeenCalledWith([]);
  });

  it('selects every category with the All categories preset', async () => {
    const view = await renderFilter();
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
    await fireEvent.press(expenseView.getByText('Food'));
    await fireEvent.press(expenseView.getByText('Apply (All expenses)'));
    expect(mockOnApply).toHaveBeenCalledWith([1]);

    mockOnApply.mockClear();
    const incomeView = await renderFilter();
    await fireEvent.press(incomeView.getByText('Salary'));
    await fireEvent.press(incomeView.getByText('Apply (All income)'));
    expect(mockOnApply).toHaveBeenCalledWith([2]);
  });

  it('keeps a count for a partial or mixed selection', async () => {
    const view = await renderFilter({ categories: threeCategories });
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Salary'));
    await fireEvent.press(view.getByText('Apply (2)'));
    expect(mockOnApply).toHaveBeenCalledWith([1, 2]);
  });

  it('toggles an active preset off', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('All expenses'));
    await fireEvent.press(view.getByText('All expenses'));
    await fireEvent.press(view.getByText('Apply (All categories)'));
    expect(mockOnApply).toHaveBeenCalledWith([]);
  });

  it('uses the type-aware empty label inside a type tab', async () => {
    const expenseView = await renderFilter({ type: TRANSACTION_TYPES.expense });
    await fireEvent.press(expenseView.getByText('Apply (All expenses)'));
    expect(mockOnApply).toHaveBeenCalledWith([]);
  });

  it('treats an empty selection as "all categories" so the filter can be cleared', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('Apply (All categories)'));
    expect(mockOnApply).toHaveBeenCalledWith([]);
  });

  it('filters categories by search text', async () => {
    const view = await renderFilter();
    const searchInput = view.getByPlaceholderText('Search category');
    await fireEvent.changeText(searchInput, 'Food');
    expect(view.getByText('Food')).toBeTruthy();
    expect(view.queryByText('Salary')).toBeNull();
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
