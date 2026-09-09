import type { TransactionType } from '../constants/types';

let pendingCategoryId: number | null = null;
let pendingCategoryType: TransactionType | null = null;

export function setPendingCategory(categoryId: number, type: TransactionType) {
  pendingCategoryId = categoryId;
  pendingCategoryType = type;
}

export function consumePendingCategory(): { categoryId: number; type: TransactionType } | null {
  if (pendingCategoryId !== null && pendingCategoryType !== null) {
    const result = { categoryId: pendingCategoryId, type: pendingCategoryType };
    pendingCategoryId = null;
    pendingCategoryType = null;
    return result;
  }
  return null;
}
