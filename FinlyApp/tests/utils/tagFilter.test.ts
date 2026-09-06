import { describe, it, expect } from 'vitest';
import { toggleTagInArray } from '../../src/utils/tagFilter';
import { UNTAGGED_ID } from '../../src/constants/types';

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