import { CATEGORY_SORT_BY, OTHER_CATEGORY_ID, OTHERS_CATEGORY_ID, SORT_DIRECTIONS, type CategorySortBy, type SortDirection } from '../constants/types';
import type { Category } from '../database/types';
import { getDisplayCategoryName } from '../i18n';

/** Natural default direction per field: name ascending, usage descending. */
export function defaultCategorySortDirection(field: CategorySortBy): SortDirection {
  return field === CATEGORY_SORT_BY.usage ? SORT_DIRECTIONS.desc : SORT_DIRECTIONS.asc;
}

const isFallbackCategory = (category: Category): boolean =>
  category.id === OTHERS_CATEGORY_ID || category.id === OTHER_CATEGORY_ID;

/**
 * Sort categories by name or lifetime usage (number of transactions). The fallback
 * categories (Others/Other) always stay last: they are the catch-all option, not a
 * category the user usually looks for. Ties break by display name, then id.
 */
export function sortCategories(
  categories: Category[],
  field: CategorySortBy,
  direction: SortDirection,
  usage: ReadonlyMap<number, number> = new Map(),
): Category[] {
  const sign = direction === SORT_DIRECTIONS.desc ? -1 : 1;

  return [...categories].sort((a, b) => {
    const aFallback = isFallbackCategory(a);
    const bFallback = isFallbackCategory(b);
    if (aFallback !== bFallback) return aFallback ? 1 : -1;

    const primary = field === CATEGORY_SORT_BY.usage
      ? (usage.get(a.id) ?? 0) - (usage.get(b.id) ?? 0)
      : getDisplayCategoryName(a).localeCompare(getDisplayCategoryName(b));
    const diff = primary * sign;
    if (diff !== 0) return diff;

    return getDisplayCategoryName(a).localeCompare(getDisplayCategoryName(b)) || a.id - b.id;
  });
}
