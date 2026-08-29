import type { Category } from '../database/types';
import type { TransactionType } from '../constants/types';
import { getDisplayCategoryName } from '../i18n';
import { OTHERS_CATEGORY_ID, OTHER_CATEGORY_ID } from '../constants/types';

export function categoriesOfType(categories: Category[], type: TransactionType): Category[] {
  return categories.filter(category => category.type === type);
}

export function countCategoriesOfType(categories: Category[], type: TransactionType): number {
  return categoriesOfType(categories, type).length;
}

export function sortCategoriesWithOthersLast(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const aEnd = a.id === OTHERS_CATEGORY_ID || a.id === OTHER_CATEGORY_ID ? 1 : 0;
    const bEnd = b.id === OTHERS_CATEGORY_ID || b.id === OTHER_CATEGORY_ID ? 1 : 0;
    if (aEnd !== bEnd) return aEnd - bEnd;
    return getDisplayCategoryName(a).localeCompare(getDisplayCategoryName(b));
  });
}
