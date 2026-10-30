import { describe, it, expect } from 'vitest';
import { SORT_DIRECTIONS } from '../../src/constants/types';
import { nextSortPreference, toggleSortDirection } from '../../src/utils/sortPreference';

const defaultDirection = (field: string) => (field === 'usage' ? SORT_DIRECTIONS.desc : SORT_DIRECTIONS.asc);

describe('toggleSortDirection', () => {
  it('flips both directions', () => {
    expect(toggleSortDirection(SORT_DIRECTIONS.asc)).toBe(SORT_DIRECTIONS.desc);
    expect(toggleSortDirection(SORT_DIRECTIONS.desc)).toBe(SORT_DIRECTIONS.asc);
  });
});

describe('nextSortPreference', () => {
  it('flips the direction when the active field is tapped again', () => {
    expect(nextSortPreference({ by: 'name', direction: SORT_DIRECTIONS.asc }, 'name', defaultDirection))
      .toEqual({ by: 'name', direction: SORT_DIRECTIONS.desc });
  });

  it('switches field with its natural default direction', () => {
    expect(nextSortPreference({ by: 'name', direction: SORT_DIRECTIONS.asc }, 'usage', defaultDirection))
      .toEqual({ by: 'usage', direction: SORT_DIRECTIONS.desc });
    expect(nextSortPreference({ by: 'usage', direction: SORT_DIRECTIONS.desc }, 'name', defaultDirection))
      .toEqual({ by: 'name', direction: SORT_DIRECTIONS.asc });
  });
});
