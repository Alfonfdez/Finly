import { useRef } from 'react';

/**
 * Whether `current` differs from the baseline the form opened with.
 *
 * The baseline is captured **once** — the first non-null value, since `baseline`
 * is null until the entity has loaded. The comparison is shallow (every snapshot
 * here is a flat object of primitives), and it compares *values* rather than
 * tracking "was ever touched", so returning a field to its original value clears
 * the flag again (e.g. picking the original category back leaves nothing to save).
 */
export function useIsDirty<T extends object>(baseline: T | null, current: T): boolean {
  const initial = useRef<T | null>(null);
  if (initial.current === null && baseline !== null) {
    initial.current = baseline;
  }

  const start = initial.current;
  if (start === null) return false;

  const keys = Object.keys(current) as (keyof T)[];
  return keys.some(key => current[key] !== start[key]);
}
