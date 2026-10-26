import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * The software keyboard's height in px (0 when hidden). Used to lift modal content above the
 * keyboard, since a native `Modal` window does not always resize with the keyboard.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      setInset(event.endCoordinates?.height ?? 0);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return inset;
}

/**
 * A keyboard lift that only grows while `visible` and resets when it turns false.
 *
 * Used by `ModalShell`: tapping a button blurs the input and hides the keyboard, and letting
 * the modal drop at that moment would move the button out from under the finger and swallow
 * the tap. The lift is therefore held for a short release delay after the keyboard hides,
 * then dropped so a searchable modal returns to its centred size.
 */
export const KEYBOARD_LIFT_RELEASE_MS = 250;

export function useKeyboardLift(visible: boolean): number {
  const keyboardInset = useKeyboardInset();
  const [lift, setLift] = useState(0);

  useEffect(() => {
    if (!visible) {
      setLift(0);
      return;
    }
    if (keyboardInset > 0) {
      setLift(prev => Math.max(prev, keyboardInset));
      return;
    }
    const timer = setTimeout(() => setLift(0), KEYBOARD_LIFT_RELEASE_MS);
    return () => clearTimeout(timer);
  }, [visible, keyboardInset]);

  return lift;
}
