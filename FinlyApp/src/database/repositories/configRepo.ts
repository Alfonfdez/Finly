import { getDatabase } from '../database';
import { Config } from '../../context/ConfigContext';
import { FIRST_DAYS, type DecimalSeparator } from '../../constants/types';
import { DEFAULT_CONFIG, toConfigRows } from '../configDefaults';

function parseConfig(rows: { key: string; value: string }[]): Config {
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    theme: (map.theme as Config['theme']) ?? DEFAULT_CONFIG.theme,
    firstDayOfWeek: map.first_day_of_week === String(FIRST_DAYS.sunday) ? FIRST_DAYS.sunday : FIRST_DAYS.monday,
    currency: map.currency ?? DEFAULT_CONFIG.currency,
    decimalSeparator: (map.decimal_separator as DecimalSeparator) ?? DEFAULT_CONFIG.decimalSeparator,
    language: (map.language as Config['language']) ?? DEFAULT_CONFIG.language,
    textSize: (map.text_size as Config['textSize']) ?? DEFAULT_CONFIG.textSize,
    categoryIconShape: (map.category_icon_shape as Config['categoryIconShape']) ?? DEFAULT_CONFIG.categoryIconShape,
    accountIconShape: (map.account_icon_shape as Config['accountIconShape']) ?? DEFAULT_CONFIG.accountIconShape,
    homeDefaultAccountId: map.home_default_account_id === 'null' ? null : map.home_default_account_id ? Number(map.home_default_account_id) : DEFAULT_CONFIG.homeDefaultAccountId,
    homeDefaultPeriod: (map.home_default_period as Config['homeDefaultPeriod']) ?? DEFAULT_CONFIG.homeDefaultPeriod,
    addDefaultAccountId: map.add_default_account_id === 'null' ? null : map.add_default_account_id ? Number(map.add_default_account_id) : DEFAULT_CONFIG.addDefaultAccountId,
    addShowLabels: map.add_show_labels === 'true',
    addShowComments: map.add_show_comments === 'true',
    addShowPhoto: map.add_show_photo === 'true',
    hideBalances: map.hide_balances === 'true',
  };
}

export const configRepo = {
  async get(): Promise<Config> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM config');
    return rows.length > 0 ? parseConfig(rows) : DEFAULT_CONFIG;
  },

  async save(partial: Partial<Config>): Promise<void> {
    const db = getDatabase();
    for (const row of toConfigRows(partial)) {
      await db.runAsync(
        'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        row.key,
        row.value
      );
    }
  },
};
