import { SORT_DIRECTIONS, TAG_SORT_BY, type SortDirection, type TagSortBy } from '../constants/types';
import type { Tag } from '../database/types';

/** Natural default direction per field: names ascending, dates/usage descending. */
export function defaultTagSortDirection(field: TagSortBy): SortDirection {
  return field === TAG_SORT_BY.name ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc;
}

function compareBy(field: TagSortBy, a: Tag, b: Tag, usage: Map<number, number>): number {
  switch (field) {
    case TAG_SORT_BY.usage:
      return (usage.get(a.id) ?? 0) - (usage.get(b.id) ?? 0);
    case TAG_SORT_BY.created:
      return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0;
    case TAG_SORT_BY.name:
    default: {
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();
      return an < bn ? -1 : an > bn ? 1 : 0;
    }
  }
}

/** Sort tags by `field`/`direction`; ties keep creation order (by id). */
export function sortTags(
  tags: Tag[],
  field: TagSortBy,
  direction: SortDirection,
  usage: Map<number, number>,
): Tag[] {
  const sign = direction === SORT_DIRECTIONS.desc ? -1 : 1;
  return [...tags].sort((a, b) => {
    const diff = compareBy(field, a, b, usage) * sign;
    return diff !== 0 ? diff : a.id - b.id;
  });
}
