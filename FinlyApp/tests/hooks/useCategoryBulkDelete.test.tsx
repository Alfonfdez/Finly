import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCategoryBulkDelete } from '../../src/hooks/useCategoryBulkDelete';
import type { Category } from '../../src/database/types';

const mockCountByCategoryIdsMap = vi.fn();
const mockCountByCategoryIds = vi.fn();
const mockDeleteMany = vi.fn();
const mockBulkDeleteWithTargets = vi.fn();

vi.mock('../../src/database', () => ({
  categoryRepository: {
    deleteMany: (ids: number[]) => mockDeleteMany(ids),
    bulkDeleteWithTargets: (items: unknown[]) => mockBulkDeleteWithTargets(items),
  },
  transactionRepository: {
    countByCategoryIdsMap: (ids: number[]) => mockCountByCategoryIdsMap(ids),
  },
  recurringRepository: {
    countByCategoryIds: (ids: number[]) => mockCountByCategoryIds(ids),
  },
}));

type Options = Parameters<typeof useCategoryBulkDelete>[0];

const baseCategory: Omit<Category, 'name' | 'icon'> = {
  id: 1,
  user_id: 1,
  color: '#22D3EE',
  type: 'expense',
  created_at: '2026-01-01',
};

function category(id: number, name: string): Category {
  return { ...baseCategory, id, name, icon: 'cart' };
}

async function setup(overrides: Partial<Options> = {}) {
  const selectedIds = new Set([1]);
  const exitSelectMode = vi.fn();
  const onChanged = vi.fn(async () => {});
  const categoriesByType = [category(1, 'Food'), category(2, 'Transport')];
  const visibleIds = [1, 2];
  const initialProps: Options = {
    categoriesByType,
    visibleIds,
    selectedIds,
    typeCount: 2,
    exitSelectMode,
    onChanged,
    ...overrides,
  };
  const { result, rerender } = await renderHook(
    (props: Options) => useCategoryBulkDelete(props),
    { initialProps },
  );
  return { result, rerender, initialProps, exitSelectMode, onChanged };
}

describe('useCategoryBulkDelete', () => {
  beforeEach(() => {
    mockCountByCategoryIdsMap.mockReset().mockResolvedValue({});
    mockCountByCategoryIds.mockReset().mockResolvedValue({});
    mockDeleteMany.mockReset().mockResolvedValue(undefined);
    mockBulkDeleteWithTargets.mockReset().mockResolvedValue(undefined);
  });

  it('prepares in-use categories and opens the delete modal', async () => {
    mockCountByCategoryIdsMap.mockResolvedValue({ 1: 2 });
    mockCountByCategoryIds.mockResolvedValue({ 1: 1 });
    const { result } = await setup();

    await act(async () => {
      await result.current.handleDeletePress();
    });

    expect(result.current.inUseCategories).toEqual([{
      category: category(1, 'Food'),
      txCount: 2,
      ruleCount: 1,
    }]);
    expect(result.current.deleteHasData).toBe(true);
    expect(result.current.deleteModalVisible).toBe(true);
  });

  it('falls back to marking every selected category as in use when counts fail', async () => {
    mockCountByCategoryIdsMap.mockRejectedValue(new Error('boom'));
    const { result } = await setup();

    await act(async () => {
      await result.current.handleDeletePress();
    });

    expect(result.current.inUseCategories).toEqual([{
      category: category(1, 'Food'),
      txCount: 0,
      ruleCount: 0,
    }]);
    expect(result.current.deleteHasData).toBe(true);
    expect(result.current.deleteModalVisible).toBe(true);
  });

  it('opens the guard instead of the delete modal when every category is selected', async () => {
    const { result } = await setup({ typeCount: 1, visibleIds: [1] });

    await act(async () => {
      await result.current.handleDeletePress();
    });

    expect(result.current.guardVisible).toBe(true);
    expect(result.current.deleteModalVisible).toBe(false);
    expect(mockCountByCategoryIdsMap).not.toHaveBeenCalled();
    expect(mockCountByCategoryIds).not.toHaveBeenCalled();
  });

  it('deletes only visible selected ids and calls onChanged', async () => {
    const { result, exitSelectMode, onChanged } = await setup({ visibleIds: [1] });

    await act(async () => {
      result.current.handlePermanentDelete();
    });

    await waitFor(() => expect(mockDeleteMany).toHaveBeenCalledWith([1]));
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(exitSelectMode).toHaveBeenCalledTimes(1);
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it('closes the delete modal and opens the transfer flow', async () => {
    mockCountByCategoryIdsMap.mockResolvedValue({ 1: 2 });
    const { result } = await setup();

    await act(async () => {
      await result.current.handleDeletePress();
    });
    await act(() => result.current.handleMoveTransactions());

    expect(result.current.deleteModalVisible).toBe(false);
    expect(result.current.resolutionVisible).toBe(true);
    expect(result.current.decisions).toEqual({});
    expect(result.current.transferTargets).toEqual([category(2, 'Transport')]);
  });

  it('confirms the transfer with the selected decisions', async () => {
    mockCountByCategoryIdsMap.mockResolvedValue({ 1: 2 });
    const { result, exitSelectMode, onChanged } = await setup();

    await act(async () => {
      await result.current.handleDeletePress();
    });
    await act(() => result.current.handleMoveTransactions());
    await act(() => result.current.handleDecide(1, 2));
    await act(async () => {
      await result.current.handleConfirmResolution();
    });

    expect(mockBulkDeleteWithTargets).toHaveBeenCalledWith([{ id: 1, targetId: 2 }]);
    expect(onChanged).toHaveBeenCalledTimes(1);
    expect(exitSelectMode).toHaveBeenCalledTimes(1);
    expect(result.current.resolutionVisible).toBe(false);
  });

  it('maps the delete option to a null target', async () => {
    mockCountByCategoryIdsMap.mockResolvedValue({ 1: 2 });
    const { result } = await setup();

    await act(async () => {
      await result.current.handleDeletePress();
    });
    await act(() => result.current.handleMoveTransactions());
    await act(() => result.current.handleDecide(1, 'delete'));
    await act(async () => {
      await result.current.handleConfirmResolution();
    });

    expect(mockBulkDeleteWithTargets).toHaveBeenCalledWith([{ id: 1, targetId: null }]);
  });

  it('closes the modal and exits without deleting when no selected id is visible', async () => {
    const { result, exitSelectMode } = await setup({ visibleIds: [2] });

    await act(() => result.current.handlePermanentDelete());

    expect(result.current.deleteModalVisible).toBe(false);
    expect(exitSelectMode).toHaveBeenCalledTimes(1);
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });
});
