import type { Config } from './types';

export const CONFIG_CODECS = {
  string: 'string',
  firstDay: 'firstDay',
  boolean: 'boolean',
  intOrNull: 'intOrNull',
  array: 'array',
} as const;

export type ConfigCodec = keyof typeof CONFIG_CODECS;

export interface ConfigFieldMeta {
  dbKey: string;
  codec: ConfigCodec;
}

/**
 * Single source for the config key vocabulary: the DB key and how the value is
 * stored. `DEFAULT_CONFIG` remains the source for default values.
 */
export const CONFIG_METADATA = {
  theme: { dbKey: 'theme', codec: CONFIG_CODECS.string },
  firstDayOfWeek: { dbKey: 'first_day_of_week', codec: CONFIG_CODECS.firstDay },
  currency: { dbKey: 'currency', codec: CONFIG_CODECS.string },
  decimalSeparator: { dbKey: 'decimal_separator', codec: CONFIG_CODECS.string },
  language: { dbKey: 'language', codec: CONFIG_CODECS.string },
  textSize: { dbKey: 'text_size', codec: CONFIG_CODECS.string },
  categoryIconShape: { dbKey: 'category_icon_shape', codec: CONFIG_CODECS.string },
  accountIconShape: { dbKey: 'account_icon_shape', codec: CONFIG_CODECS.string },
  homeDefaultAccountId: { dbKey: 'home_default_account_id', codec: CONFIG_CODECS.intOrNull },
  homeDefaultPeriod: { dbKey: 'home_default_period', codec: CONFIG_CODECS.string },
  homeChartType: { dbKey: 'home_chart_type', codec: CONFIG_CODECS.string },
  addDefaultAccountId: { dbKey: 'add_default_account_id', codec: CONFIG_CODECS.intOrNull },
  addShowLabels: { dbKey: 'add_show_labels', codec: CONFIG_CODECS.boolean },
  addShowComments: { dbKey: 'add_show_comments', codec: CONFIG_CODECS.boolean },
  addShowPhoto: { dbKey: 'add_show_photo', codec: CONFIG_CODECS.boolean },
  modifyShowLabels: { dbKey: 'modify_show_labels', codec: CONFIG_CODECS.boolean },
  modifyShowComments: { dbKey: 'modify_show_comments', codec: CONFIG_CODECS.boolean },
  modifyShowPhoto: { dbKey: 'modify_show_photo', codec: CONFIG_CODECS.boolean },
  createRecurringDefaultAccountId: { dbKey: 'create_recurring_default_account_id', codec: CONFIG_CODECS.intOrNull },
  createRecurringShowLabels: { dbKey: 'create_recurring_show_labels', codec: CONFIG_CODECS.boolean },
  createRecurringShowComments: { dbKey: 'create_recurring_show_comments', codec: CONFIG_CODECS.boolean },
  editRecurringShowLabels: { dbKey: 'edit_recurring_show_labels', codec: CONFIG_CODECS.boolean },
  editRecurringShowComments: { dbKey: 'edit_recurring_show_comments', codec: CONFIG_CODECS.boolean },
  hideBalances: { dbKey: 'hide_balances', codec: CONFIG_CODECS.boolean },
  allTransactionsRecurringView: { dbKey: 'all_transactions_recurring_view', codec: CONFIG_CODECS.string },
  transactionsRecurringView: { dbKey: 'transactions_recurring_view', codec: CONFIG_CODECS.string },
  allTransactionsCategoryIds: { dbKey: 'all_transactions_category_ids', codec: CONFIG_CODECS.array },
  allTransactionsExpenseCategoryIds: { dbKey: 'all_transactions_expense_category_ids', codec: CONFIG_CODECS.array },
  allTransactionsIncomeCategoryIds: { dbKey: 'all_transactions_income_category_ids', codec: CONFIG_CODECS.array },
  recurringStatusFilter: { dbKey: 'recurring_status_filter', codec: CONFIG_CODECS.array },
  tagsSortBy: { dbKey: 'tags_sort_by', codec: CONFIG_CODECS.string },
  tagsSortDirection: { dbKey: 'tags_sort_direction', codec: CONFIG_CODECS.string },
  commentsSortBy: { dbKey: 'comments_sort_by', codec: CONFIG_CODECS.string },
  commentsSortDirection: { dbKey: 'comments_sort_direction', codec: CONFIG_CODECS.string },
  recurringSortBy: { dbKey: 'recurring_sort_by', codec: CONFIG_CODECS.string },
  recurringSortDirection: { dbKey: 'recurring_sort_direction', codec: CONFIG_CODECS.string },
  transactionsSortBy: { dbKey: 'transactions_sort_by', codec: CONFIG_CODECS.string },
  transactionsSortDirection: { dbKey: 'transactions_sort_direction', codec: CONFIG_CODECS.string },
  allTransactionsSortBy: { dbKey: 'all_transactions_sort_by', codec: CONFIG_CODECS.string },
  allTransactionsSortDirection: { dbKey: 'all_transactions_sort_direction', codec: CONFIG_CODECS.string },
  accountsSortBy: { dbKey: 'accounts_sort_by', codec: CONFIG_CODECS.string },
  accountsSortDirection: { dbKey: 'accounts_sort_direction', codec: CONFIG_CODECS.string },
  categoriesSortBy: { dbKey: 'categories_sort_by', codec: CONFIG_CODECS.string },
  categoriesSortDirection: { dbKey: 'categories_sort_direction', codec: CONFIG_CODECS.string },
} as const satisfies Record<keyof Config, ConfigFieldMeta>;

export const DB_KEY_MAP: Record<string, keyof Config> = Object.fromEntries(
  Object.entries(CONFIG_METADATA).map(([key, meta]) => [meta.dbKey, key as keyof Config]),
);

export const ARRAY_CONFIG_KEYS: (keyof Config)[] = (
  Object.entries(CONFIG_METADATA) as [keyof Config, ConfigFieldMeta][]
)
  .filter(([, meta]) => meta.codec === CONFIG_CODECS.array)
  .map(([key]) => key);
