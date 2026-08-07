import { CONFIG_ICON_SHAPES, PERIODS, TEXT_SIZES, THEMES, DECIMAL_SEPARATORS, FIRST_DAYS } from '../constants/types';
import { LANGUAGES } from '../utils/language';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { configSchema } from './schemas';
import type { Config } from './types';

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
