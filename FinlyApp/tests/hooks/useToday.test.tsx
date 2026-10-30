import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useToday } from '../../src/hooks/useToday';

describe('useToday', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('advances the shared today value after midnight', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 23, 59, 59));
    const { result } = await renderHook(() => useToday());
    expect(result.current.getDate()).toBe(1);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.getFullYear()).toBe(2026);
    expect(result.current.getMonth()).toBe(0);
    expect(result.current.getDate()).toBe(2);
  });
});
