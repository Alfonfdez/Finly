import { describe, it, expect } from 'vitest';
import { sortCategoriesWithOthersLast } from '../../src/utils/categoryUtils';
import { OTHERS_CATEGORY_ID, OTHER_CATEGORY_ID } from '../../src/constants/types';
import type { Category } from '../../src/database/types';

function category(id: number, name: string): Category {
  return { id, user_id: 1, name, icon: 'tag', color: '#A78BFA', type: 'expense', created_at: '2026-08-03 00:00:00' };
}

describe('sortCategoriesWithOthersLast', () => {
  it('returns a new array without mutating the input', () => {
    const categories = [category(100, 'Zebra'), category(101, 'Aardvark')];
    const sorted = sortCategoriesWithOthersLast(categories);
    expect(sorted).not.toBe(categories);
    expect(categories[0].name).toBe('Zebra');
  });

  it('sorts alphabetically by display name', () => {
    const categories = [category(100, 'Zebra'), category(101, 'Aardvark'), category(102, 'Mango')];
    const names = sortCategoriesWithOthersLast(categories).map(c => c.name);
    expect(names).toEqual(['Aardvark', 'Mango', 'Zebra']);
  });

  it('moves the Others/Other categories to the end', () => {
    const categories = [
      category(100, 'Zebra'),
      category(OTHER_CATEGORY_ID, 'AAA'),
      category(101, 'Aardvark'),
      category(OTHERS_CATEGORY_ID, 'ZZZ'),
    ];
    const sorted = sortCategoriesWithOthersLast(categories);
    expect(sorted.map(c => c.id)).toEqual([101, 100, OTHER_CATEGORY_ID, OTHERS_CATEGORY_ID]);
  });

  it('sorts the trailing Others/Other categories among themselves', () => {
    const categories = [
      category(OTHERS_CATEGORY_ID, 'ZZZ'),
      category(OTHER_CATEGORY_ID, 'AAA'),
    ];
    expect(sortCategoriesWithOthersLast(categories).map(c => c.id)).toEqual([OTHER_CATEGORY_ID, OTHERS_CATEGORY_ID]);
  });
});
