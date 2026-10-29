import {
  ACCOUNT_SORT_BY,
  CATEGORY_SORT_BY,
  CHART_TYPES,
  COMMENT_SORT_BY,
  CONFIG_ICON_SHAPES,
  DECIMAL_SEPARATORS,
  FIRST_DAYS,
  PERIODS,
  RECURRING_SORT_BY,
  RECURRING_VIEWS,
  SORT_BY,
  SORT_DIRECTIONS,
  TAG_SORT_BY,
  TEXT_SIZES,
  THEMES,
} from '../constants/types';
import { LANGUAGES } from '../utils/language';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { configSchema } from './schemas';
import { CONFIG_CODECS, CONFIG_METADATA } from './configMetadata';
import type { Config, DatabaseHandle } from './types';

export { ARRAY_CONFIG_KEYS, DB_KEY_MAP } from './configMetadata';

export const DEFAULT_CONFIG: Config = {
  theme: THEMES.dark,
  firstDayOfWeek: FIRST_DAYS.monday,
  currency: DEFAULT_CURRENCY,
  decimalSeparator: DECIMAL_SEPARATORS.comma,
  language: LANGUAGES.en,
  textSize: TEXT_SIZES.medium,
  categoryIconShape: CONFIG_ICON_SHAPES.square,
  accountIconShape: CONFIG_ICON_SHAPES.square,
  homeDefaultAccountId: null,
  homeDefaultPeriod: PERIODS.month,
  homeChartType: CHART_TYPES.donut,
  addDefaultAccountId: null,
  addShowLabels: true,
  addShowComments: true,
  addShowPhoto: true,
  modifyShowLabels: true,
  modifyShowComments: true,
  modifyShowPhoto: true,
  createRecurringDefaultAccountId: null,
  createRecurringShowLabels: true,
  createRecurringShowComments: true,
  editRecurringShowLabels: true,
  editRecurringShowComments: true,
  hideBalances: false,
  allTransactionsRecurringView: RECURRING_VIEWS.all,
  transactionsRecurringView: RECURRING_VIEWS.all,
  allTransactionsCategoryIds: [],
  allTransactionsExpenseCategoryIds: [],
  allTransactionsIncomeCategoryIds: [],
  recurringStatusFilter: [],
  tagsSortBy: TAG_SORT_BY.created,
  tagsSortDirection: SORT_DIRECTIONS.asc,
  commentsSortBy: COMMENT_SORT_BY.name,
  commentsSortDirection: SORT_DIRECTIONS.asc,
  recurringSortBy: RECURRING_SORT_BY.nextDue,
  recurringSortDirection: SORT_DIRECTIONS.asc,
  transactionsSortBy: SORT_BY.date,
  transactionsSortDirection: SORT_DIRECTIONS.desc,
  allTransactionsSortBy: SORT_BY.date,
  allTransactionsSortDirection: SORT_DIRECTIONS.desc,
  accountsSortBy: ACCOUNT_SORT_BY.name,
  accountsSortDirection: SORT_DIRECTIONS.asc,
  categoriesSortBy: CATEGORY_SORT_BY.name,
  categoriesSortDirection: SORT_DIRECTIONS.asc,
  addCategorySortBy: CATEGORY_SORT_BY.usage,
  addCategorySortDirection: SORT_DIRECTIONS.desc,
};

export const CONFIG_NULL_SENTINEL = 'null';

/** Parse a stored boolean without turning corruption into `false`. */
export function parseBooleanConfigValue(raw: string): boolean | null {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

const DB_KEY_RE = /^[a-z_]+$/;

function dbKeyFor(configKey: keyof Config): string {
  const key = CONFIG_METADATA[configKey].dbKey;
  if (!DB_KEY_RE.test(key)) {
    throw new Error(`Invalid config DB key for '${configKey}'`);
  }
  return key;
}

export function toConfigRows(partial: Partial<Config>): { key: string; value: string }[] {
  const rows: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(partial) as [keyof Config, unknown][]) {
    if (value === undefined) continue;
    const meta = CONFIG_METADATA[key];
    rows.push({
      key: meta.dbKey,
      value: meta.codec === CONFIG_CODECS.array ? JSON.stringify(value) : String(value),
    });
  }
  return rows;
}

/**
 * Drop invalid fields instead of the whole config: one corrupt value (a legacy
 * import, a manually edited DB) must never reset the theme, language or sort
 * preferences. Each key falls back to its default on its own.
 */
export function sanitizeConfig(config: Config): Config {
  const shape = configSchema.shape;
  const source = config as unknown as Record<string, unknown>;
  const result = { ...DEFAULT_CONFIG } as Record<keyof Config, unknown>;
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof Config)[]) {
    const parsed = shape[key].safeParse(source[key]);
    if (parsed.success) result[key] = parsed.data;
  }
  return result as Config;
}

export function sanitizeDefaultAccounts(
  config: Config,
  accounts: { id: number; is_total?: number }[],
): Partial<Config> {
  const ids = new Set(accounts.filter(a => (a.is_total ?? 0) === 0).map(a => a.id));
  const updates: Partial<Config> = {};
  if (config.homeDefaultAccountId !== null && !ids.has(config.homeDefaultAccountId)) {
    updates.homeDefaultAccountId = null;
  }
  if (config.addDefaultAccountId !== null && !ids.has(config.addDefaultAccountId)) {
    updates.addDefaultAccountId = null;
  }
  if (config.createRecurringDefaultAccountId !== null && !ids.has(config.createRecurringDefaultAccountId)) {
    updates.createRecurringDefaultAccountId = null;
  }
  return updates;
}

export async function sanitizeDefaultAccountConfig(database: DatabaseHandle): Promise<void> {
  const homeKey = dbKeyFor('homeDefaultAccountId');
  const addKey = dbKeyFor('addDefaultAccountId');
  const createRecurringKey = dbKeyFor('createRecurringDefaultAccountId');
  const v = CONFIG_NULL_SENTINEL;
  await database.runAsync(`
    UPDATE config SET value = '${v}'
    WHERE key IN ('${homeKey}', '${addKey}', '${createRecurringKey}')
      AND value != '${v}'
      AND value NOT IN (SELECT CAST(id AS TEXT) FROM accounts WHERE is_total = 0)
  `);
}
