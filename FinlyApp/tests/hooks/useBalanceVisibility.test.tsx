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
});
