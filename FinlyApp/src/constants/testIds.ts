/**
 * Stable `testID`s shared by components and their tests, so the selector never drifts
 * between the two. (Accessibility labels used by tests come from i18n, not from here.)
 */
export const TEST_IDS = {
  repeatOptions: 'repeat-options',
  repeatEndDate: 'repeat-end-date',
  tagsList: 'tags-list',
  commentsList: 'comments-list',
  recurringList: 'recurring-list',
  accountsList: 'accounts-list',
} as const;
