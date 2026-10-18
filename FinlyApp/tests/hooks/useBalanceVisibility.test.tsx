import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useBalanceVisibility } from '../../src/hooks/useBalanceVisibility';

describe('useBalanceVisibility', () => {
  it('hides the balance when hideBalances is on and not revealed', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(true));
    expect(result.current.isBalanceHidden).toBe(true);
  });

  it('shows the balance when hideBalances is off', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(false));
    expect(result.current.isBalanceHidden).toBe(false);
  });

  it('toggleReveal reveals then re-hides the balance', async () => {
    const { result } = await renderHook(() => useBalanceVisibility(true));
    expect(result.current.isBalanceHidden).toBe(true);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);

    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(true);
  });

  it('keeps balances visible when the hide setting is turned off after a reveal', async () => {
    const { result, rerender } = await renderHook(({ hide }: { hide: boolean }) => useBalanceVisibility(hide), {
      initialProps: { hide: true },
    });
    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);

    await act(async () => { rerender({ hide: false }); });
    expect(result.current.isBalanceHidden).toBe(false);
  });

  it('starts hidden again when the hide setting is turned back on', async () => {
    const { result, rerender } = await renderHook(({ hide }: { hide: boolean }) => useBalanceVisibility(hide), {
      initialProps: { hide: false },
    });
    await act(() => result.current.toggleReveal());
    expect(result.current.isBalanceHidden).toBe(false);

    await act(async () => { rerender({ hide: true }); });
    expect(result.current.isBalanceHidden).toBe(true);
  });
});
