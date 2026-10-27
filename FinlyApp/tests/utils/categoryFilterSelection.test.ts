import { describe, it, expect } from 'vitest';
import { CATEGORY_SELECTION_KINDS, classifyCategorySelection, normalizeCategorySelection } from '../../src/utils/categoryFilterSelection';
import type { Category } from '../../src/database/types';

function category(id: number, type: 'expense' | 'income'): Category {
  return { id, user_id: 1, name: `C${id}`, icon: 'cart', color: '#000', type, created_at: '2026-01-01' } as Category;
}

const categories = [category(1, 'expense'), category(2, 'expense'), category(3, 'income')];

describe('classifyCategorySelection', () => {
  it('treats an empty selection as all categories', () => {
    expect(classifyCategorySelection([], categories)).toBe(CATEGORY_SELECTION_KINDS.all);
  });

  it('treats every category as all categories', () => {
    expect(classifyCategorySelection([3, 1, 2], categories)).toBe(CATEGORY_SELECTION_KINDS.all);
  });

  it('detects all expense categories only', () => {
    expect(classifyCategorySelection([1, 2], categories)).toBe(CATEGORY_SELECTION_KINDS.allExpenses);
  });

  it('detects all income categories only', () => {
    expect(classifyCategorySelection([3], categories)).toBe(CATEGORY_SELECTION_KINDS.allIncome);
  });

  it('keeps mixed or partial selections custom', () => {
    expect(classifyCategorySelection([1], categories)).toBe(CATEGORY_SELECTION_KINDS.custom);
    expect(classifyCategorySelection([1, 2, 3, 4], categories)).toBe(CATEGORY_SELECTION_KINDS.custom);
    expect(classifyCategorySelection([1, 3], categories)).toBe(CATEGORY_SELECTION_KINDS.custom);
  });
});

describe('normalizeCategorySelection', () => {
  it('stores a full category set as no filter', () => {
    expect(normalizeCategorySelection([1, 2, 3], categories)).toEqual([]);
    expect(normalizeCategorySelection([], categories)).toEqual([]);
  });

  it('keeps partial and full type sets', () => {
    expect(normalizeCategorySelection([1], categories)).toEqual([1]);
    expect(normalizeCategorySelection([1, 2], categories)).toEqual([1, 2]);
    expect(normalizeCategorySelection([3], categories)).toEqual([3]);
  });
});
