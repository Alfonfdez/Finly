import { useCallback, useRef } from 'react';

/**
 * Whether `current` differs from the baseline the form opened with.
 *
 * The baseline is captured **once** — the first non-null value, since `baseline`
 * is null until the entity has loaded. The comparison is shallow (every snapshot
 * here is a flat object of primitives), and it compares *values* rather than
 * tracking "was ever touched", so returning a field to its original value clears
 * the flag again (e.g. picking the original category back leaves nothing to save).
 */
export function useIsDirty<T extends object>(
  baseline: T | null,
  current: T,
): { isDirty: boolean; resetBaseline: (next: T | null) => void } {
  const initial = useRef<T | null>(null);
  if (initial.current === null && baseline !== null) {
    initial.current = baseline;
  }

  const resetBaseline = useCallback((next: T | null) => {
    initial.current = next;
  }, []);

  const start = initial.current;
  const isDirty = start === null
    ? false
    : (Object.keys(current) as (keyof T)[]).some(key => current[key] !== start[key]);

  return { isDirty, resetBaseline };
}
