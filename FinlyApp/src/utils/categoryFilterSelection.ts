import { TRANSACTION_TYPES } from '../constants/types';
import type { Category } from '../database/types';

/** What an applied category selection represents, for the pill/Apply labels. */
export const CATEGORY_SELECTION_KINDS = {
  /** No filter, or every category selected. */
  all: 'all',
  /** Exactly every expense category (and nothing else). */
  allExpenses: 'allExpenses',
  /** Exactly every income category (and nothing else). */
  allIncome: 'allIncome',
  /** Any other combination. */
  custom: 'custom',
} as const;

export type CategorySelectionKind = keyof typeof CATEGORY_SELECTION_KINDS;

function sameIdSet(selected: ReadonlySet<number>, ids: number[]): boolean {
  return selected.size === ids.length && ids.every(id => selected.has(id));
}

/**
 * Classify a category selection against the user's categories. Empty and
 * "everything" both mean the same filter, so they share the `all` kind.
 */
export function classifyCategorySelection(
  selectedIds: readonly number[],
  categories: Category[],
): CategorySelectionKind {
  const selected = new Set(selectedIds);
  const allIds = categories.map(category => category.id);
  if (selected.size === 0 || sameIdSet(selected, allIds)) return CATEGORY_SELECTION_KINDS.all;

  const expenseIds = categories
    .filter(category => category.type === TRANSACTION_TYPES.expense)
    .map(category => category.id);
  if (expenseIds.length > 0 && sameIdSet(selected, expenseIds)) return CATEGORY_SELECTION_KINDS.allExpenses;

  const incomeIds = categories
    .filter(category => category.type === TRANSACTION_TYPES.income)
    .map(category => category.id);
  if (incomeIds.length > 0 && sameIdSet(selected, incomeIds)) return CATEGORY_SELECTION_KINDS.allIncome;

  return CATEGORY_SELECTION_KINDS.custom;
}
