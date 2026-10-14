import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, type ScrollView } from 'react-native';

type ScrollViewRef = { current: ScrollView | null };

/**
 * Keeps a form's bottom action button reachable while the keyboard is open: when the
 * bottom-most field (the one just above the button) is focused, scroll the form to the end.
 *
 * The scroll is scheduled (not immediate) because the keyboard resize animates; it is re-run
 * on `keyboardDidShow` and on the ScrollView's `onLayout` so a first attempt that lands short
 * (before the viewport has shrunk) is corrected. Only the wired field triggers it — focusing
 * a field higher up must not jump the form to the end.
 *
 * @param externalRef the form's ScrollView ref to drive; omit to let the hook own one
 *                    (for `FormScrollView`, pass the ref you give to its `scrollRef` prop).
 */
export function useKeyboardReveal(externalRef?: ScrollViewRef) {
  const ownRef = useRef<ScrollView>(null);
  const scrollRef = externalRef ?? ownRef;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomFieldFocused = useRef(false);

  useEffect(() => () => {
    if (timer.current != null) clearTimeout(timer.current);
  }, []);

  const reveal = useCallback(() => {
    if (timer.current != null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, [scrollRef]);

  const onBottomFieldFocus = useCallback(() => {
    bottomFieldFocused.current = true;
    reveal();
  }, [reveal]);

  const onBottomFieldBlur = useCallback(() => {
    bottomFieldFocused.current = false;
  }, []);

  const onScrollLayout = useCallback(() => {
    if (bottomFieldFocused.current) reveal();
  }, [reveal]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (bottomFieldFocused.current) reveal();
    });
    return () => sub.remove();
  }, [reveal]);

  return { scrollRef, onBottomFieldFocus, onBottomFieldBlur, onScrollLayout };
}
