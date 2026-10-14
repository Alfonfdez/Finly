import { SORT_DIRECTIONS, COMMENT_SORT_BY, type SortDirection, type CommentSortBy } from '../constants/types';
import type { CommentUsage } from '../database/repositories/transactionRepo';

/** Natural default direction per field: names ascending, dates/usage descending. */
export function defaultCommentSortDirection(field: CommentSortBy): SortDirection {
  return field === COMMENT_SORT_BY.name ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc;
}

function compareBy(field: CommentSortBy, a: CommentUsage, b: CommentUsage): number {
  switch (field) {
    case COMMENT_SORT_BY.usage:
      return a.count - b.count;
    case COMMENT_SORT_BY.lastUsed:
      return a.lastUsed < b.lastUsed ? -1 : a.lastUsed > b.lastUsed ? 1 : 0;
    case COMMENT_SORT_BY.name:
    default: {
      const an = a.description.toLowerCase();
      const bn = b.description.toLowerCase();
      return an < bn ? -1 : an > bn ? 1 : 0;
    }
  }
}

/** Sort comments by `field`/`direction`; ties fall back to the comment text. */
export function sortComments(
  comments: CommentUsage[],
  field: CommentSortBy,
  direction: SortDirection,
): CommentUsage[] {
  const sign = direction === SORT_DIRECTIONS.desc ? -1 : 1;
  return [...comments].sort((a, b) => {
    const diff = compareBy(field, a, b) * sign;
    return diff !== 0 ? diff : a.description.localeCompare(b.description);
  });
}
