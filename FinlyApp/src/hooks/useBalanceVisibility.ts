import { useState, useCallback, useEffect } from 'react';

export function useBalanceVisibility(hideBalances: boolean) {
  const [isRevealed, setIsRevealed] = useState(false);

  // A flip of the setting starts from its own default instead of inheriting the
  // previous reveal state (otherwise turning "hide balances" off could hide them).
  useEffect(() => {
    setIsRevealed(false);
  }, [hideBalances]);

  const isBalanceHidden = hideBalances && !isRevealed;
  const toggleReveal = useCallback(() => setIsRevealed(prev => !prev), []);

  return { isBalanceHidden, toggleReveal };
}
