import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useBalanceVisibility(hideBalances: boolean) {
  const [isRevealed, setIsRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsRevealed(false);
    }, [])
  );

  const isBalanceHidden = hideBalances !== isRevealed;
  const toggleReveal = useCallback(() => setIsRevealed(prev => !prev), []);

  return { isBalanceHidden, toggleReveal };
}
