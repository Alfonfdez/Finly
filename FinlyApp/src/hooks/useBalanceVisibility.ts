import { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Balance visibility for a screen: the "Hide account balances" setting is the
 * default and the eye icon toggles it both ways for the current visit
 * (spec 003 §5.6):
 *
 * | hideBalances | isRevealed | isBalanceHidden |
 * |--------------|------------|-----------------|
 * | false        | false      | false (visible) |
 * | false        | true       | true  (tap hid it) |
 * | true         | false      | true  (hidden)  |
 * | true         | true       | false (tap revealed it) |
 *
 * The reveal is temporary: leaving the screen and coming back returns to the
 * setting's default, and changing the setting re-applies that setting's default.
 */
export function useBalanceVisibility(hideBalances: boolean) {
  const [isRevealed, setIsRevealed] = useState(false);

  // A flip of the setting starts from its own default instead of inheriting the
  // temporary state of the other mode.
  useEffect(() => {
    setIsRevealed(false);
  }, [hideBalances]);

  // The toggle is temporary: regaining focus returns to the setting's default.
  useFocusEffect(
    useCallback(() => {
      setIsRevealed(false);
    }, []),
  );

  const isBalanceHidden = hideBalances !== isRevealed;
  const toggleReveal = useCallback(() => setIsRevealed(prev => !prev), []);

  return { isBalanceHidden, toggleReveal };
}
