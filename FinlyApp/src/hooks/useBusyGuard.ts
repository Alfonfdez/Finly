import { useCallback, useRef, useState } from 'react';

/**
 * Ref-backed in-flight guard for async actions. The ref is set synchronously,
 * so two taps in the same render tick cannot both run the action.
 */
export function useBusyGuard() {
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    if (busyRef.current) return undefined;
    busyRef.current = true;
    setBusy(true);
    try {
      return await action();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, run };
}
