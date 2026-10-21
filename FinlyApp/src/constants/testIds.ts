/**
 * Stable `testID`s shared by components and their tests, so the selector never drifts
 * between the two. (Accessibility labels used by tests come from i18n, not from here.)
 */
export const TEST_IDS = {
  repeatOptions: 'repeat-options',
  repeatEndDate: 'repeat-end-date',
  repeatName: 'repeat-name',
  tagsList: 'tags-list',
  commentsList: 'comments-list',
  recurringList: 'recurring-list',
  accountsList: 'accounts-list',
  categoriesGrid: 'categories-grid',
  iconGrid: 'icon-grid',
  formDelete: 'form-delete',
  formHintSlot: 'form-hint-slot',
  formMutedSlot: 'form-muted-slot',
  detailsTags: 'details-tags',
  allTransactionsCategoryFilter: 'all-transactions-category-filter',
  categoryFilterPresetPrefix: 'category-filter-preset',
  categoryFilterApply: 'category-filter-apply',
} as const;
