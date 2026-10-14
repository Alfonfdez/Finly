import { describe, it, expect } from 'vitest';
import { defaultCommentSortDirection, sortComments } from '../../src/utils/commentSort';
import { COMMENT_SORT_BY, SORT_DIRECTIONS } from '../../src/constants/types';
import type { CommentUsage } from '../../src/database/repositories/transactionRepo';

const comment = (description: string, count: number, lastUsed: string): CommentUsage => ({ description, count, lastUsed });

describe('commentSort', () => {
  it('defaults name ascending and lastUsed/usage descending', () => {
    expect(defaultCommentSortDirection(COMMENT_SORT_BY.name)).toBe(SORT_DIRECTIONS.asc);
    expect(defaultCommentSortDirection(COMMENT_SORT_BY.lastUsed)).toBe(SORT_DIRECTIONS.desc);
    expect(defaultCommentSortDirection(COMMENT_SORT_BY.usage)).toBe(SORT_DIRECTIONS.desc);
  });

  it('sorts by name case-insensitively', () => {
    const list = [comment('banana', 1, '2026-01-01'), comment('Apple', 1, '2026-01-01')];
    expect(sortComments(list, COMMENT_SORT_BY.name, SORT_DIRECTIONS.asc).map(c => c.description)).toEqual(['Apple', 'banana']);
  });

  it('sorts by last used date', () => {
    const list = [comment('a', 1, '2026-03-01'), comment('b', 1, '2026-01-01')];
    expect(sortComments(list, COMMENT_SORT_BY.lastUsed, SORT_DIRECTIONS.desc).map(c => c.description)).toEqual(['a', 'b']);
    expect(sortComments(list, COMMENT_SORT_BY.lastUsed, SORT_DIRECTIONS.asc).map(c => c.description)).toEqual(['b', 'a']);
  });

  it('sorts by usage count', () => {
    const list = [comment('a', 1, '2026-01-01'), comment('b', 5, '2026-01-01')];
    expect(sortComments(list, COMMENT_SORT_BY.usage, SORT_DIRECTIONS.desc).map(c => c.description)).toEqual(['b', 'a']);
    expect(sortComments(list, COMMENT_SORT_BY.usage, SORT_DIRECTIONS.asc).map(c => c.description)).toEqual(['a', 'b']);
  });

  it('does not mutate the input and breaks ties by name', () => {
    const list = [comment('b', 1, '2026-01-01'), comment('a', 1, '2026-01-01')];
    expect(sortComments(list, COMMENT_SORT_BY.usage, SORT_DIRECTIONS.desc).map(c => c.description)).toEqual(['a', 'b']);
    expect(list.map(c => c.description)).toEqual(['b', 'a']);
  });
});
