import { useRef, useEffect, useCallback } from 'react';

export function useUniqueNameCheck(check: (value: string) => void, debounceMs = 300) {
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
