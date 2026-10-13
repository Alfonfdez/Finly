import { describe, it, expect } from 'vitest';
import { isUntaggedTag, matchesTagFilter, toggleTagInArray } from '../../src/utils/tagFilter';
import { UNTAGGED_ID } from '../../src/constants/types';

describe('isUntaggedTag', () => {
  it('is true for the UNTAGGED sentinel', () => {
    expect(isUntaggedTag(UNTAGGED_ID)).toBe(true);
  });

  it('is false for a real tag id', () => {
    expect(isUntaggedTag(7)).toBe(false);
  });
});

describe('toggleTagInArray', () => {
  it('adds a tag to an empty selection', () => {
    expect(toggleTagInArray([], 3)).toEqual([3]);
  });

  it('adds a tag to an existing selection', () => {
    expect(toggleTagInArray([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('removes a tag already in the selection', () => {
    expect(toggleTagInArray([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it('selects only UNTAGGED when toggling UNTAGGED on an empty selection', () => {
    expect(toggleTagInArray([], UNTAGGED_ID)).toEqual([UNTAGGED_ID]);
  });

  it('clears the selection when toggling UNTAGGED off', () => {
    expect(toggleTagInArray([UNTAGGED_ID], UNTAGGED_ID)).toEqual([]);
  });

  it('replaces UNTAGGED with a concrete tag', () => {
    expect(toggleTagInArray([UNTAGGED_ID], 7)).toEqual([7]);
  });

  it('replaces UNTAGGED even when concrete tags are present', () => {
    expect(toggleTagInArray([UNTAGGED_ID, 4], 7)).toEqual([7]);
  });
});

describe('matchesTagFilter', () => {
  it('matches everything when no tag is selected', () => {
    expect(matchesTagFilter([], [])).toBe(true);
    expect(matchesTagFilter([], [1])).toBe(true);
  });

  it('matches a transaction carrying a selected tag', () => {
    expect(matchesTagFilter([3], [3])).toBe(true);
    expect(matchesTagFilter([3], [1, 3])).toBe(true);
  });

  it('rejects a transaction without any selected tag', () => {
    expect(matchesTagFilter([3], [1, 2])).toBe(false);
    expect(matchesTagFilter([3], [])).toBe(false);
  });

  it('matches only untagged transactions when UNTAGGED is selected', () => {
    expect(matchesTagFilter([UNTAGGED_ID], [])).toBe(true);
    expect(matchesTagFilter([UNTAGGED_ID], [1])).toBe(false);
  });

  it('matches tagged OR untagged when both are selected (OR)', () => {
    expect(matchesTagFilter([UNTAGGED_ID, 3], [])).toBe(true);
    expect(matchesTagFilter([UNTAGGED_ID, 3], [3])).toBe(true);
    expect(matchesTagFilter([UNTAGGED_ID, 3], [1, 2])).toBe(false);
  });
});