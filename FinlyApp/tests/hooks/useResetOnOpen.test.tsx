import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useResetOnOpen } from '../../src/hooks/useResetOnOpen';

interface Props {
  visible: boolean;
  reset: () => void;
}

function useHook({ visible, reset }: Props) {
  useResetOnOpen(visible, reset);
}

describe('useResetOnOpen', () => {
  it('runs the reset once when the modal becomes visible', async () => {
    const reset = vi.fn();
    const { rerender } = await renderHook(useHook, { initialProps: { visible: false, reset } });
    expect(reset).not.toHaveBeenCalled();
    await act(async () => {
      rerender({ visible: true, reset });
    });
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('does not reset while hidden even when the callback changes', async () => {
    const firstReset = vi.fn();
    const { rerender } = await renderHook(useHook, { initialProps: { visible: false, reset: firstReset } });
    const secondReset = vi.fn();
    await act(async () => {
      rerender({ visible: false, reset: secondReset });
    });
    expect(firstReset).not.toHaveBeenCalled();
    expect(secondReset).not.toHaveBeenCalled();
  });

  it('re-runs the reset when the callback changes while visible', async () => {
    const firstReset = vi.fn();
    const { rerender } = await renderHook(useHook, { initialProps: { visible: true, reset: firstReset } });
    expect(firstReset).toHaveBeenCalledTimes(1);
    const secondReset = vi.fn();
    await act(async () => {
      rerender({ visible: true, reset: secondReset });
    });
    expect(firstReset).toHaveBeenCalledTimes(1);
    expect(secondReset).toHaveBeenCalledTimes(1);
  });

  it('does not re-run when nothing changed while visible', async () => {
    const reset = vi.fn();
    const { rerender } = await renderHook(useHook, { initialProps: { visible: true, reset } });
    expect(reset).toHaveBeenCalledTimes(1);
    await act(async () => {
      rerender({ visible: true, reset });
    });
    expect(reset).toHaveBeenCalledTimes(1);
  });
});