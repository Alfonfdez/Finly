import { useCallback } from 'react';
import type { SortDirection } from '../constants/types';
import {
  nextSortPreference,
  toggleSortDirection,
  type SortPreference,
} from '../utils/sortPreference';

interface Options<By extends string> {
  sortBy: By;
  sortDirection: SortDirection;
  defaultDirection: (field: By) => SortDirection;
  onChange: (next: SortPreference<By>) => void;
}

/**
 * Shared sort-field/direction behaviour for the list screens. Tapping the active
 * field flips its direction; tapping another field switches to that field's
 * natural default direction. Persistence stays with the caller.
 */
export function useSortPreference<By extends string>({
  sortBy,
  sortDirection,
  defaultDirection,
  onChange,
}: Options<By>) {
  const handleToggleSort = useCallback((field: By) => {
    onChange(nextSortPreference(
      { by: sortBy, direction: sortDirection },
      field,
      defaultDirection,
    ));
  }, [defaultDirection, onChange, sortBy, sortDirection]);

  const handleToggleDirection = useCallback(() => {
    onChange({ by: sortBy, direction: toggleSortDirection(sortDirection) });
  }, [onChange, sortBy, sortDirection]);

  return { handleToggleSort, handleToggleDirection };
}
