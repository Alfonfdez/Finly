import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, type ScrollView } from 'react-native';

type ScrollViewRef = { current: ScrollView | null };

/** What to do to bring a field into view (defaults to scrolling to the end). */
export type RevealAction = (scrollRef: ScrollViewRef) => void;

const scrollToEnd: RevealAction = (scrollRef) => {
  scrollRef.current?.scrollToEnd({ animated: true });
};

/**
 * Keeps a field reachable while the keyboard is open: when the wired field is focused, run
 * `reveal` (scroll-to-end by default). Used for a bottom field so the submit button clears the
 * keyboard, and for the recurring name so its section sits at the top.
 *
 * The scroll is scheduled (not immediate) because the keyboard resize animates; it is re-run
 * on `keyboardDidShow` and on the ScrollView's `onLayout` so a first attempt that lands short
 * (or gets overridden by the OS reveal-the-focused-input scroll) is corrected. Only the wired
 * field triggers it — focusing another field must not move the form.
 *
 * @param externalRef the form's ScrollView ref to drive; omit to let the hook own one
 *                    (for `FormScrollView`, pass the ref you give to its `scrollRef` prop).
 * @param reveal      the action to run; pass a stable (e.g. `useCallback`) function.
 */
export function useKeyboardReveal(externalRef?: ScrollViewRef, reveal: RevealAction = scrollToEnd) {
  const ownRef = useRef<ScrollView>(null);
  const scrollRef = externalRef ?? ownRef;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomFieldFocused = useRef(false);

  const cancelScheduledReveal = useCallback(() => {
    if (timer.current == null) return;
    clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => () => cancelScheduledReveal(), [cancelScheduledReveal]);

  const scheduleReveal = useCallback(() => {
    cancelScheduledReveal();
    timer.current = setTimeout(() => {
      timer.current = null;
      if (bottomFieldFocused.current) reveal(scrollRef);
    }, 300);
  }, [cancelScheduledReveal, reveal, scrollRef]);

  const onBottomFieldFocus = useCallback(() => {
    bottomFieldFocused.current = true;
    scheduleReveal();
  }, [scheduleReveal]);

  const onBottomFieldBlur = useCallback(() => {
    bottomFieldFocused.current = false;
    // A focus/blur that happens before the 300ms reveal must not scroll later.
    cancelScheduledReveal();
  }, [cancelScheduledReveal]);

  const onScrollLayout = useCallback(() => {
    if (bottomFieldFocused.current) scheduleReveal();
  }, [scheduleReveal]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (bottomFieldFocused.current) scheduleReveal();
    });
    return () => sub.remove();
  }, [scheduleReveal]);

  return { scrollRef, onBottomFieldFocus, onBottomFieldBlur, onScrollLayout };
}
