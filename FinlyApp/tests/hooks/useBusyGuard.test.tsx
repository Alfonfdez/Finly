import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-native';
import { useBusyGuard } from '../../src/hooks/useBusyGuard';

describe('useBusyGuard', () => {
  it('runs only the first action while one is in flight', async () => {
    let release!: () => void;
    const action = vi.fn(() => new Promise<void>((resolve) => { release = resolve; }));
    const { result } = await renderHook(() => useBusyGuard());

    let first!: Promise<void | undefined>;
    let second!: Promise<void | undefined>;
    await act(async () => {
      first = result.current.run(action);
      second = result.current.run(action);
      release();
      await Promise.all([first, second]);
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(result.current.busy).toBe(false);
  });

  it('clears the guard after a rejection', async () => {
    const action = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = await renderHook(() => useBusyGuard());

    await act(async () => {
      await expect(result.current.run(action)).rejects.toThrow('boom');
    });

    expect(result.current.busy).toBe(false);
    await act(async () => {
      await result.current.run(async () => undefined);
    });
    expect(action).toHaveBeenCalledTimes(1);
  });
});
