import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useBulkDelete } from '../../src/hooks/useBulkDelete';

const runWithErrorAlert = vi.fn(async (fn: () => Promise<unknown>) => {
  try {
    return await fn();
  } catch {
    return undefined;
  }
});

vi.mock('../../src/utils/errors', () => ({
  runWithErrorAlert: (fn: () => Promise<unknown>) => runWithErrorAlert(fn),
}));

async function setup(overrides: Partial<Parameters<typeof useBulkDelete>[0]> = {}) {
  const selectedIds = new Set([1, 2]);
  const exitSelectMode = vi.fn();
  const deleteFn = vi.fn(async () => undefined);
  const afterDelete = vi.fn(async () => undefined);

  const { result } = await renderHook(() =>
    useBulkDelete({
      selectedIds,
      exitSelectMode,
      deleteFn,
      afterDelete,
      errorPrefix: 'Failed to delete items',
      ...overrides,
    })
  );

  return { result, selectedIds, exitSelectMode, deleteFn, afterDelete };
}

describe('useBulkDelete', () => {
  beforeEach(() => {
    runWithErrorAlert.mockClear();
  });

  it('starts with the delete modal hidden', async () => {
    const { result } = await setup();
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it('opens and closes the delete modal', async () => {
    const { result } = await setup();

    await act(() => result.current.openDeleteModal());
    expect(result.current.deleteModalVisible).toBe(true);

    await act(() => result.current.closeDeleteModal());
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it('calls deleteFn with the selected ids, then exits select mode and afterDelete', async () => {
    const { result, selectedIds, exitSelectMode, deleteFn, afterDelete } = await setup();

    await act(() => result.current.openDeleteModal());
    await act(async () => {
      await result.current.confirmBulkDelete();
    });

    expect(deleteFn).toHaveBeenCalledWith([...selectedIds]);
    expect(exitSelectMode).toHaveBeenCalledTimes(1);
    expect(afterDelete).toHaveBeenCalledTimes(1);
    expect(result.current.deleteModalVisible).toBe(false);
  });

  it('does not exit select mode or run afterDelete when deleteFn rejects', async () => {
    const { result, exitSelectMode, afterDelete } = await setup({
      deleteFn: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    await act(async () => {
      await result.current.confirmBulkDelete();
    });

    expect(exitSelectMode).not.toHaveBeenCalled();
    expect(afterDelete).not.toHaveBeenCalled();
  });

  it('skips afterDelete when not provided', async () => {
    const { result, afterDelete } = await setup({ afterDelete: undefined });

    await act(async () => {
      await result.current.confirmBulkDelete();
    });

    expect(afterDelete).not.toHaveBeenCalled();
  });

  it('routes the confirm through runWithErrorAlert with the error prefix', async () => {
    const { result } = await setup({
      deleteFn: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    await act(async () => {
      await result.current.confirmBulkDelete();
    });

    expect(runWithErrorAlert).toHaveBeenCalledTimes(1);
  });
});
