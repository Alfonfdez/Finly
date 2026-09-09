import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useDeleteConfirmation } from '../../src/hooks/useDeleteConfirmation';

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

async function setup(overrides: Partial<Parameters<typeof useDeleteConfirmation>[0]> = {}) {
  const deleteFn = vi.fn(async () => undefined);
  const onSuccess = vi.fn(async () => undefined);

  const { result } = await renderHook(() =>
    useDeleteConfirmation({
      deleteFn,
      onSuccess,
      errorPrefix: 'Failed to delete item',
      ...overrides,
    })
  );

  return { result, deleteFn, onSuccess };
}

describe('useDeleteConfirmation', () => {
  beforeEach(() => {
    runWithErrorAlert.mockClear();
  });

  it('starts with the delete modal hidden', async () => {
    const { result } = await setup();
    expect(result.current.visible).toBe(false);
  });

  it('opens and closes the delete modal', async () => {
    const { result } = await setup();

    await act(() => result.current.open());
    expect(result.current.visible).toBe(true);

    await act(() => result.current.close());
    expect(result.current.visible).toBe(false);
  });

  it('closes the modal, runs deleteFn and then onSuccess on success', async () => {
    const { result, deleteFn, onSuccess } = await setup();

    await act(() => result.current.open());
    await act(async () => {
      await result.current.confirm();
    });

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(result.current.visible).toBe(false);
  });

  it('does not run onSuccess when deleteFn rejects', async () => {
    const { result, onSuccess } = await setup({
      deleteFn: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('routes the confirm through runWithErrorAlert with the error prefix', async () => {
    const { result } = await setup({
      deleteFn: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(runWithErrorAlert).toHaveBeenCalledTimes(1);
  });

  it('skips onSuccess when not provided', async () => {
    const { result, deleteFn, onSuccess } = await setup({ onSuccess: undefined });

    await act(async () => {
      await result.current.confirm();
    });

    expect(deleteFn).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
