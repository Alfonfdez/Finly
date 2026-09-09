import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

import { useFocusLoad } from '../../src/hooks/useFocusLoad';

describe('useFocusLoad', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the data and turns loading off', async () => {
    const loader = vi.fn(async () => 'loaded');
    const { result } = await renderHook(() => useFocusLoad(loader, 'initial'));
    await act(async () => {});
    expect(loader).toHaveBeenCalled();
    expect(result.current.data).toBe('loaded');
    expect(result.current.loading).toBe(false);
  });

  it('does not overwrite data when the values are equal by default', async () => {
    const loader = vi.fn(async () => 'same');
    const { result } = await renderHook(() => useFocusLoad(loader, 'same'));
    await act(async () => {});
    expect(result.current.data).toBe('same');
    expect(result.current.loading).toBe(false);
  });

  it('uses areEqual to decide whether to replace the data', async () => {
    const loader = vi.fn(async () => ({ id: 1, v: 2 }));
    const initial = { id: 1, v: 1 };
    const areEqual = (a: { v: number }, b: { v: number }) => a.v === b.v;
    const { result } = await renderHook(() => useFocusLoad(loader, initial, areEqual));
    await act(async () => {});
    expect(result.current.data).toEqual({ id: 1, v: 2 });
    expect(result.current.loading).toBe(false);
  });

  it('keeps the previous data when areEqual reports equality', async () => {
    const loader = vi.fn(async () => ({ id: 1, v: 1 }));
    const initial = { id: 1, v: 1 };
    const areEqual = (a: { v: number }, b: { v: number }) => a.v === b.v;
    const { result } = await renderHook(() => useFocusLoad(loader, initial, areEqual));
    await act(async () => {});
    expect(result.current.data).toBe(initial);
    expect(result.current.loading).toBe(false);
  });

  it('returns changeable data through setData', async () => {
    const loader = vi.fn(async () => 'a');
    const { result } = await renderHook(() => useFocusLoad(loader, 'a'));
    await act(() => result.current.setData('b'));
    expect(result.current.data).toBe('b');
  });

  it('logs the error and turns loading off when the loader rejects', async () => {
    const loader = vi.fn(async () => {
      throw new Error('boom');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = await renderHook(() => useFocusLoad(loader, 'initial'));
    await act(async () => {});
    expect(errorSpy).toHaveBeenCalled();
    expect(result.current.data).toBe('initial');
    expect(result.current.loading).toBe(false);
    errorSpy.mockRestore();
  });
});
