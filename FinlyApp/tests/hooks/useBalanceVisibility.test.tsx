import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';

import { useBalanceVisibility } from '../../src/hooks/useBalanceVisibility';

// Capture the focus callback so a test can simulate leaving and coming back.
let focusCallback: (() => void | (() => void)) | null = null;

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useFocusEffect: (cb: () => void | (() => void)) => {
      focusCallback = cb;
      React.useEffect(cb, [cb]);
    },
  };
});

describe('useBalanceVisibility', () => {
  beforeEach(() => {
    focusCallback = null;
  });

  it('hides the balance when the setting is on', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(true));
    expect(result.current.isBalanceHidden).toBe(true);
  });

  it('shows the balance when the setting is off', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(false));
    expect(result.current.isBalanceHidden).toBe(false);
  });

  it('toggles both ways with the setting on', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(true));
    expect(result.current.isBalanceHidden).toBe(true);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(true);
  });

  it('toggles both ways with the setting off', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(false));
    expect(result.current.isBalanceHidden).toBe(false);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(true);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);
  });

  it('returns to the setting default when the screen regains focus', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(true));
    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);

    await act(async () => { focusCallback?.(); });
    expect(result.current.isBalanceHidden).toBe(true);
  });

  it('re-applies the new default when the setting changes', async () => {
    const { result, rerender } = await renderHook(({ hide }: { hide: boolean }) => useBalanceVisibility(hide), {
      initialProps: { hide: true },
    });
    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);

    await act(async () => { rerender({ hide: false }); });
    expect(result.current.isBalanceHidden).toBe(false);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(true);

    await act(async () => { rerender({ hide: true }); });
    expect(result.current.isBalanceHidden).toBe(true);
  });
});
