import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryFilterModal from '../../src/components/CategoryFilterModal';
import { TYPE_FILTERS, TRANSACTION_TYPES } from '../../src/constants/types';
import type { Category } from '../../src/database/types';

const mockOnApply = vi.fn();
const mockOnClose = vi.fn();

const expenseCat: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#22D3EE', type: 'expense', created_at: '2026-01-01' };
const incomeCat: Category = { id: 2, user_id: 1, name: 'Salary', icon: 'wallet', color: '#34D399', type: 'income', created_at: '2026-01-01' };
const allCategories: Category[] = [expenseCat, incomeCat];

function renderFilter(
  overrides: Partial<{ visible: boolean; categories: Category[]; selectedIds: number[]; type: string }> = {}
) {
  return render(
    <CategoryFilterModal
      visible={overrides.visible ?? true}
      categories={overrides.categories ?? allCategories}
      selectedIds={overrides.selectedIds ?? []}
      type={(overrides.type ?? TYPE_FILTERS.all) as typeof TYPE_FILTERS.all}
      onApply={mockOnApply}
      onClose={mockOnClose}
    />
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

  it('toggles a category on and off', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('Food'));
    await fireEvent.press(view.getByText('Apply (1)'));
    expect(mockOnApply).toHaveBeenCalledWith([1]);

    mockOnApply.mockClear();
    await fireEvent.press(view.getByText('Food'));
    expect(view.getByText('Apply (0)')).toBeDisabled();
    expect(mockOnApply).not.toHaveBeenCalled();
  });

  it('selects all categories when All is pressed', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByText('All'));
    await fireEvent.press(view.getByText('Apply (All)'));
    expect(mockOnApply).toHaveBeenCalledWith([1, 2]);
  });

  it('deselects all when All is pressed while all selected', async () => {
    const view = await renderFilter({ selectedIds: [1, 2] });
    await fireEvent.press(view.getByText('All'));
    expect(view.getByText('Apply (0)')).toBeDisabled();
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

  it('disables the apply button when no categories are selected', async () => {
    const view = await renderFilter();
    expect(view.getByText('Apply (0)')).toBeDisabled();
  });

  it('closes the modal when the close button is pressed', async () => {
    const view = await renderFilter();
    await fireEvent.press(view.getByLabelText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});