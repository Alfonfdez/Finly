import { useRef, useEffect, useCallback } from 'react';
import { DEBOUNCE_MS } from '../constants/types';

export function useUniqueNameCheck(check: (value: string) => void, debounceMs = DEBOUNCE_MS) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => check(value), debounceMs);
    },
    [check, debounceMs]
  );
}
