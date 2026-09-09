import { useState, useCallback } from 'react';

export function useBalanceVisibility(hideBalances: boolean) {
  const [isRevealed, setIsRevealed] = useState(false);

  const isBalanceHidden = hideBalances !== isRevealed;
  const toggleReveal = useCallback(() => setIsRevealed(prev => !prev), []);

  return { isBalanceHidden, toggleReveal };
}
