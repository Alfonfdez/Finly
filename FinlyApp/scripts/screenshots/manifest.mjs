/**
 * Release screenshot manifest.
 *
 * The set name is the `v<N>` prefix of every file. Keep the keys stable and
 * append new screens at the end; bump SET only for a new release set.
 */
export const SET = 'v3';

/** Frozen browser clock so every capture shows the same dates. */
export const FIXED_TIME = '2026-10-21T12:00:00+02:00';

export const SCREENS = [
  {
    key: '01-a-home-empty',
    phase: 'empty',
    run: async h => {
      await h.reload();
      await h.waitHome();
    },
  },
  {
    key: '07-a-all-transactions-empty-state',
    phase: 'empty',
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.page.getByText('No transactions', { exact: true }).filter({ visible: true }).waitFor();
    },
  },
  {
    key: '01-b-home',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.waitTotal();
    },
  },
  {
    key: '02-hamburger',
    // Shipped previously as v3-02-hamburger.png; the new name makes GitHub render the refreshed image as a new file.
    name: 'v3.1-02-hamburger',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.openDrawer();
    },
  },
  {
    key: '03-add-transaction',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.addForm();
    },
  },
  {
    key: '04-date-picker',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.addForm();
      await h.openDatePicker();
    },
  },
  {
    key: '05-categories',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('Categories');
      await h.waitList('categories-grid');
    },
  },
  {
    key: '06-tags',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('Tags');
      await h.waitList('tags-list');
    },
  },
  {
    key: '07-b-all-transactions',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.page.getByText('All categories', { exact: true }).filter({ visible: true }).waitFor();
      await h.page.waitForTimeout(400);
    },
  },
  {
    key: '07-c-category-filter',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openCategoryFilter();
    },
  },
  {
    key: '08-accounts',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('Accounts');
      await h.waitList('accounts-list');
    },
  },
  {
    key: '09-a-details-income',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openDetails('October salary');
    },
  },
  {
    key: '09-b-details-expense',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('All transactions');
      await h.openDetails('October rent');
    },
  },
  {
    key: '10-settings',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('Settings');
    },
  },
  {
    key: '11-regional-en',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.settings('Regional');
    },
  },
  {
    key: '12-settings-appearance',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.settings('Appearance');
    },
  },
  {
    key: '13-settings-personalization',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.settings('Personalization');
    },
  },
  {
    key: '14-settings-data',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.settings('Data');
    },
  },
  {
    key: '15-comments',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('Comments');
      await h.waitList('comments-list');
    },
  },
  {
    key: '16-recurring',
    phase: 'fixture',
    run: async h => {
      await h.reload();
      await h.drawer('Recurring');
      await h.waitList('recurring-list');
    },
  },
];
