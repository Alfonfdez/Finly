import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useDebouncedCallback } from '../../src/hooks/useDebouncedCallback';

describe('useDebouncedCallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call the callback before the delay elapses', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result } = await renderHook(() => useDebouncedCallback(cb, 300));
    await act(() => result.current('a'));
    expect(cb).not.toHaveBeenCalled();
  });

  it('calls the callback once after the delay with the latest args', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result, unmount } = await renderHook(() => useDebouncedCallback(cb, 300));

    await act(() => result.current('a'));
    await act(() => result.current('b'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('b');
  });

  it('debounces rapid consecutive calls into one final call', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result } = await renderHook(() => useDebouncedCallback(cb, 100));

    await act(() => result.current(1));
    await act(() => result.current(2));
    await act(() => result.current(3));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(90);
    });
    await act(() => result.current(4));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(4);
  });

  it('clears the pending timer on unmount', async () => {
    vi.useFakeTimers();
    const cb = vi.fn();
    const { result, unmount } = await renderHook(() => useDebouncedCallback(cb, 300));
    await act(() => result.current('x'));
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(cb).not.toHaveBeenCalled();
  });
});
