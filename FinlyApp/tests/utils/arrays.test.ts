import { describe, expect, it } from 'vitest';
import { areIdListsEqual } from '../../src/utils/arrays';

describe('areIdListsEqual', () => {
  it('compares ids regardless of order', () => {
    expect(areIdListsEqual([3, 1, 2], [1, 2, 3])).toBe(true);
  });

  it('accepts two empty lists', () => {
    expect(areIdListsEqual([], [])).toBe(true);
  });

  it('detects different lengths', () => {
    expect(areIdListsEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('detects different membership with the same length', () => {
    expect(areIdListsEqual([1, 2], [1, 3])).toBe(false);
    expect(areIdListsEqual([1, 1, 2], [1, 2, 2])).toBe(false);
  });

  it('does not mutate its inputs', () => {
    const a = [3, 1, 2];
    const b = [2, 3, 1];
    areIdListsEqual(a, b);
    expect(a).toEqual([3, 1, 2]);
    expect(b).toEqual([2, 3, 1]);
  });
});
