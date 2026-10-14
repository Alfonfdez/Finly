import { describe, it, expect } from 'vitest';
import { defaultTagSortDirection, sortTags } from '../../src/utils/tagSort';
import { SORT_DIRECTIONS, TAG_SORT_BY } from '../../src/constants/types';
import type { Tag } from '../../src/database/types';

function tag(id: number, overrides: Partial<Tag> = {}): Tag {
  return { id, user_id: 1, name: `T${id}`, created_at: '2026-01-01 00:00:00', ...overrides } as Tag;
}

const usage = new Map<number, number>([[1, 5], [2, 1], [3, 9]]);

describe('tagSort', () => {
  it('defaults name ascending and created/usage descending', () => {
    expect(defaultTagSortDirection(TAG_SORT_BY.name)).toBe(SORT_DIRECTIONS.asc);
    expect(defaultTagSortDirection(TAG_SORT_BY.created)).toBe(SORT_DIRECTIONS.desc);
    expect(defaultTagSortDirection(TAG_SORT_BY.usage)).toBe(SORT_DIRECTIONS.desc);
  });

  it('sorts by name case-insensitively', () => {
    const a = tag(1, { name: 'banana' });
    const b = tag(2, { name: 'Apple' });
    expect(sortTags([a, b], TAG_SORT_BY.name, SORT_DIRECTIONS.asc, usage).map(t => t.name)).toEqual(['Apple', 'banana']);
  });

  it('sorts by created date', () => {
    const a = tag(1, { created_at: '2026-03-01 10:00:00' });
    const b = tag(2, { created_at: '2026-01-01 10:00:00' });
    expect(sortTags([a, b], TAG_SORT_BY.created, SORT_DIRECTIONS.desc, usage).map(t => t.id)).toEqual([1, 2]);
    expect(sortTags([a, b], TAG_SORT_BY.created, SORT_DIRECTIONS.asc, usage).map(t => t.id)).toEqual([2, 1]);
  });

  it('sorts by usage, treating a missing count as zero', () => {
    const a = tag(1);
    const b = tag(2);
    const missing = tag(9);
    expect(sortTags([a, b, missing], TAG_SORT_BY.usage, SORT_DIRECTIONS.desc, usage).map(t => t.id)).toEqual([1, 2, 9]);
    expect(sortTags([a, b, missing], TAG_SORT_BY.usage, SORT_DIRECTIONS.asc, usage).map(t => t.id)).toEqual([9, 2, 1]);
  });

  it('does not mutate the input and breaks ties by id', () => {
    const a = tag(2, { name: 'same' });
    const b = tag(1, { name: 'same' });
    const input = [a, b];
    expect(sortTags(input, TAG_SORT_BY.name, SORT_DIRECTIONS.asc, usage).map(t => t.id)).toEqual([1, 2]);
    expect(input.map(t => t.id)).toEqual([2, 1]);
  });
});
