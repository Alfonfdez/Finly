import { CONFIG_ICON_SHAPES, PERIODS, TEXT_SIZES, THEMES, DECIMAL_SEPARATORS, FIRST_DAYS } from '../constants/types';
import { LANGUAGES } from '../utils/language';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { configSchema } from './schemas';
import type { Config, DatabaseHandle } from './types';

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
  addDefaultAccountId: null,
  addShowLabels: true,
  addShowComments: true,
  addShowPhoto: true,
  hideBalances: false,
};

export const DB_KEY_MAP: Record<string, keyof Config> = {
  theme: 'theme',
  first_day_of_week: 'firstDayOfWeek',
  currency: 'currency',
  decimal_separator: 'decimalSeparator',
  language: 'language',
  text_size: 'textSize',
  category_icon_shape: 'categoryIconShape',
  account_icon_shape: 'accountIconShape',
  home_default_account_id: 'homeDefaultAccountId',
  home_default_period: 'homeDefaultPeriod',
  add_default_account_id: 'addDefaultAccountId',
  add_show_labels: 'addShowLabels',
  add_show_comments: 'addShowComments',
  add_show_photo: 'addShowPhoto',
  hide_balances: 'hideBalances',
};

export function toConfigRows(partial: Partial<Config>): { key: string; value: string }[] {
  const reverseMap: Record<string, string> = {};
  for (const [dbKey, configKey] of Object.entries(DB_KEY_MAP)) {
    reverseMap[configKey] = dbKey;
  }
  const rows: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined) continue;
    rows.push({ key: reverseMap[key] ?? key, value: String(value) });
  }
  return rows;
}

export function sanitizeConfig(config: Config): Config {
  const result = configSchema.safeParse(config);
  return result.success ? result.data : DEFAULT_CONFIG;
}

export function sanitizeDefaultAccounts(
  config: Config,
  accounts: { id: number; is_total?: number }[]
): Partial<Config> {
  const ids = new Set(accounts.filter(a => (a.is_total ?? 0) === 0).map(a => a.id));
  const updates: Partial<Config> = {};
  if (config.homeDefaultAccountId !== null && !ids.has(config.homeDefaultAccountId)) {
    updates.homeDefaultAccountId = null;
  }
  if (config.addDefaultAccountId !== null && !ids.has(config.addDefaultAccountId)) {
    updates.addDefaultAccountId = null;
  }
  return updates;
}

export async function sanitizeDefaultAccountConfig(database: DatabaseHandle): Promise<void> {
  await database.runAsync(`
    UPDATE config SET value = 'null'
    WHERE key IN ('home_default_account_id', 'add_default_account_id')
      AND value != 'null'
      AND value NOT IN (SELECT CAST(id AS TEXT) FROM accounts WHERE is_total = 0)
  `);
}
