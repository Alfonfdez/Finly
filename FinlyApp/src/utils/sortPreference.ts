import { SORT_DIRECTIONS, type SortDirection } from '../constants/types';

/** Flips ASC <-> DESC. */
export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc;
}

export interface SortPreference<By extends string> {
  by: By;
  direction: SortDirection;
}

/**
 * Tapping the active field flips its direction; tapping another field switches to
 * that field with its natural default direction (per-list, e.g. name ASC / usage DESC).
 */
export function nextSortPreference<By extends string>(
  current: SortPreference<By>,
  field: By,
  defaultDirection: (field: By) => SortDirection,
): SortPreference<By> {
  return field === current.by
    ? { by: current.by, direction: toggleSortDirection(current.direction) }
    : { by: field, direction: defaultDirection(field) };
}
