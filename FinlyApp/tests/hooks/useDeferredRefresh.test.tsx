import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useDeferredRefresh } from '../../src/hooks/useDeferredRefresh';

describe('useDeferredRefresh', () => {
  const originalRAF = globalThis.requestAnimationFrame;

  beforeEach(() => {
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(Date.now());
      return 0;
    }) as typeof globalThis.requestAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    vi.restoreAllMocks();
  });

  it('calls the function and resolves the returned promise', async () => {
    const fn = vi.fn(async (x: number) => x * 2);
    const { result } = await renderHook(() => useDeferredRefresh(fn as (...args: unknown[]) => unknown));

    await act(async () => {
      await result.current(21);
    });

    expect(fn).toHaveBeenCalledWith(21);
  });

  it('resolves even when the underlying function throws', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fn = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = await renderHook(() => useDeferredRefresh(fn as (...args: unknown[]) => unknown));

    await act(async () => {
      await result.current();
    });

    expect(errorSpy).toHaveBeenCalled();
  });

  it('always calls the latest function reference', async () => {
    const first = vi.fn(async () => 'first');
    const second = vi.fn(async () => 'second');
    let current = first as (...args: unknown[]) => unknown;
    const { result, rerender } = await renderHook(() => useDeferredRefresh(current));

    current = second;
    await rerender({});

    await act(async () => {
      await result.current();
    });

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });
});
