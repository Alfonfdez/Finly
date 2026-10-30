/**
 * Release screenshot manifest.
 *
 * The filenames are `<set>-<index>-<slug>.png`. The README screenshots section
 * must follow this order exactly; tests/tooling/screenshots.test.ts enforces it.
 */
export const SET = 'v3.4';

/** Frozen browser clock so every capture shows the same dates. */
export const FIXED_TIME = '2026-10-21T12:00:00+02:00';

const fixture = 'fixture';
const empty = 'empty';

export const SCREENS = [
  {
    key: '01-a-home-empty',
    phase: empty,
    run: async h => {
      await h.reload();
      await h.waitHome();
    },
  },
  {
    key: '01-b-home',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.waitTotal();
    },
  },
  {
    key: '02-hamburger',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.openDrawer();
    },
  },
  {
    key: '03-add-transaction',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.addForm();
    },
  },
  {
    key: '04-date-picker',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.addForm();
      await h.openDatePicker();
    },
  },
  {
    key: '05-a-all-transactions-empty-state',
    phase: empty,
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.page.getByText('No transactions', { exact: true }).filter({ visible: true }).waitFor();
    },
  },
  {
    key: '05-b-all-transactions',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.page.getByText('All categories', { exact: true }).filter({ visible: true }).waitFor();
      await h.page.waitForTimeout(400);
    },
  },
  {
    key: '05-c-category-filter',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openCategoryFilter();
    },
  },
  {
    key: '05-d-details-income',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openDetails('October salary');
    },
  },
  {
    key: '05-e-details-expense',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openDetails('October rent');
    },
  },
  {
    key: '05-f-modify-transaction',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openDetails('October rent');
      await h.openEditTransaction();
    },
  },
  {
    key: '06-recurring',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Recurring');
      await h.waitList('recurring-list');
    },
  },
  {
    key: '06-a-create-recurring',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Recurring');
      await h.openCreateRecurring();
    },
  },
  {
    key: '06-b-modify-recurring',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Recurring');
      await h.openModifyRecurring();
    },
  },
  {
    key: '07-accounts',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Accounts');
      await h.waitList('accounts-list');
    },
  },
  {
    key: '07-a-create-account',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Accounts');
      await h.openCreateAccount();
    },
  },
  {
    key: '07-b-modify-account',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Accounts');
      await h.openModifyAccount('Credit Card');
    },
  },
  {
    key: '08-categories',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Categories');
      await h.waitList('categories-grid');
    },
  },
  {
    key: '08-a-create-category',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Categories');
      await h.openCreateCategory();
    },
  },
  {
    key: '08-b-modify-category',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Categories');
      await h.openModifyCategory('Restaurants');
    },
  },
  {
    key: '09-tags',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Tags');
      await h.waitList('tags-list');
    },
  },
  {
    key: '09-a-create-tag',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Tags');
      await h.openCreateTag();
    },
  },
  {
    key: '09-b-modify-tag',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Tags');
      await h.openModifyTag('food');
    },
  },
  {
    key: '10-comments',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Comments');
      await h.waitList('comments-list');
    },
  },
  {
    key: '10-a-modify-comment',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Comments');
      await h.openModifyComment('Weekly groceries');
    },
  },
  {
    key: '11-settings',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.drawer('Settings');
    },
  },
  {
    key: '11-a-appearance',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.settings('Appearance');
    },
  },
  {
    key: '11-b-regional-en',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.settings('Regional');
    },
  },
  {
    key: '11-c-personalization',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.settings('Personalization');
    },
  },
  {
    key: '11-d-data',
    phase: fixture,
    run: async h => {
      await h.reload();
      await h.settings('Data');
    },
  },
];
