import { useDebouncedCallback } from './useDebouncedCallback';
import { DEBOUNCE_MS } from '../constants/types';

export function useUniqueNameCheck(check: (value: string) => void, debounceMs = DEBOUNCE_MS) {
  return useDebouncedCallback(check, debounceMs);
}
