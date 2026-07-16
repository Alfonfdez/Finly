import { getDatabase } from '../database';
import { Config } from '../../context/ConfigContext';

const CONFIG_DEFAULTS: Config = {
  theme: 'dark',
  firstDayOfWeek: 1,
  currency: '€',
  decimalSeparator: ',',
  language: 'en',
  textSize: 'medium',
  categoryIconShape: 'square',
  accountIconShape: 'square',
};

const DB_KEY_MAP: Record<string, keyof Config> = {
  theme: 'theme',
  first_day_of_week: 'firstDayOfWeek',
  currency: 'currency',
  decimal_separator: 'decimalSeparator',
  language: 'language',
  text_size: 'textSize',
  category_icon_shape: 'categoryIconShape',
  account_icon_shape: 'accountIconShape',
};

function parseConfig(rows: { key: string; value: string }[]): Config {
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    theme: (map.theme as Config['theme']) ?? CONFIG_DEFAULTS.theme,
    firstDayOfWeek: map.first_day_of_week === '0' ? 0 : 1,
    currency: map.currency ?? CONFIG_DEFAULTS.currency,
    decimalSeparator: (map.decimal_separator as Config['decimalSeparator']) ?? CONFIG_DEFAULTS.decimalSeparator,
    language: (map.language as Config['language']) ?? CONFIG_DEFAULTS.language,
    textSize: (map.text_size as Config['textSize']) ?? CONFIG_DEFAULTS.textSize,
    categoryIconShape: (map.category_icon_shape as Config['categoryIconShape']) ?? CONFIG_DEFAULTS.categoryIconShape,
    accountIconShape: (map.account_icon_shape as Config['accountIconShape']) ?? CONFIG_DEFAULTS.accountIconShape,
  };
}

export const configRepo = {
  async get(): Promise<Config> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM config');
    return rows.length > 0 ? parseConfig(rows) : CONFIG_DEFAULTS;
  },

  async save(partial: Partial<Config>): Promise<void> {
    const db = getDatabase();
    const reverseMap: Record<string, string> = {};
    for (const [dbKey, configKey] of Object.entries(DB_KEY_MAP)) {
      reverseMap[configKey] = dbKey;
    }
    for (const [key, value] of Object.entries(partial)) {
      if (value === undefined) continue;
      const dbKey = reverseMap[key] ?? key;
      const val = String(value);
      await db.runAsync(
        'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        dbKey,
        val
      );
    }
  },
};
