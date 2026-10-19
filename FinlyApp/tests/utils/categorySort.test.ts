import { describe, expect, it } from 'vitest';
import {
  CATEGORY_SORT_BY,
  OTHER_CATEGORY_ID,
  OTHERS_CATEGORY_ID,
  SORT_DIRECTIONS,
  type SortDirection,
} from '../../src/constants/types';
import type { Category } from '../../src/database/types';
import { defaultCategorySortDirection, sortCategories } from '../../src/utils/categorySort';

function category(id: number, name: string): Category {
  return { id, user_id: 1, name, icon: 'cart', color: '#22D3EE', type: 'expense', created_at: '2026-01-01' } as Category;
}

const alpha = category(101, 'Alpha');
const beta = category(102, 'Beta');
const gamma = category(103, 'Gamma');
const others = category(OTHERS_CATEGORY_ID, 'Others');
const other = category(OTHER_CATEGORY_ID, 'Other');

const names = (list: Category[]): string[] => list.map(item => item.name);

function sort(
  field: typeof CATEGORY_SORT_BY[keyof typeof CATEGORY_SORT_BY],
  direction: SortDirection,
  usage: Map<number, number> = new Map(),
  categories: Category[] = [others, beta, alpha, gamma],
): string[] {
  return names(sortCategories(categories, field, direction, usage));
}

describe('defaultCategorySortDirection', () => {
  it('is ascending for the name and descending for the usage', () => {
    expect(defaultCategorySortDirection(CATEGORY_SORT_BY.name)).toBe(SORT_DIRECTIONS.asc);
    expect(defaultCategorySortDirection(CATEGORY_SORT_BY.usage)).toBe(SORT_DIRECTIONS.desc);
  });
});

describe('sortCategories', () => {
  it('sorts by name and keeps the fallback categories last', () => {
    expect(sort(CATEGORY_SORT_BY.name, SORT_DIRECTIONS.asc)).toEqual(['Alpha', 'Beta', 'Gamma', 'Others']);
    expect(sort(CATEGORY_SORT_BY.name, SORT_DIRECTIONS.desc)).toEqual(['Gamma', 'Beta', 'Alpha', 'Others']);
    expect(names(sortCategories([other, others, beta, alpha], CATEGORY_SORT_BY.name, SORT_DIRECTIONS.asc)))
      .toEqual(['Alpha', 'Beta', 'Other', 'Others']);
  });

  it('sorts by usage and keeps Others/Other last even with the highest count', () => {
    const usage = new Map([[alpha.id, 1], [beta.id, 5], [gamma.id, 3], [others.id, 99], [other.id, 80]]);
    expect(sort(CATEGORY_SORT_BY.usage, SORT_DIRECTIONS.desc, usage, [others, other, beta, alpha, gamma]))
      .toEqual(['Beta', 'Gamma', 'Alpha', 'Others', 'Other']);
  });

  it('sorts by usage ascending', () => {
    const usage = new Map([[alpha.id, 1], [beta.id, 5]]);
    expect(sort(CATEGORY_SORT_BY.usage, SORT_DIRECTIONS.asc, usage, [beta, alpha])).toEqual(['Alpha', 'Beta']);
  });

  it('breaks usage ties by name', () => {
    const usage = new Map([[alpha.id, 2], [beta.id, 2], [gamma.id, 7]]);
    expect(sort(CATEGORY_SORT_BY.usage, SORT_DIRECTIONS.desc, usage, [beta, gamma, alpha]))
      .toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('does not mutate the input', () => {
    const input = [others, beta, alpha];
    sortCategories(input, CATEGORY_SORT_BY.name, SORT_DIRECTIONS.asc);
    expect(names(input)).toEqual(['Others', 'Beta', 'Alpha']);
  });
});
