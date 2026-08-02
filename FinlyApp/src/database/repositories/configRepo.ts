import { getDatabase } from '../database';
import { Config } from '../../context/ConfigContext';
import { FIRST_DAYS } from '../../constants/types';
import { DEFAULT_CONFIG, DB_KEY_MAP, toConfigRows } from '../configDefaults';

const BOOLEAN_KEYS: (keyof Config)[] = ['addShowLabels', 'addShowComments', 'addShowPhoto', 'hideBalances'];
const INT_OR_NULL_KEYS: (keyof Config)[] = ['homeDefaultAccountId', 'addDefaultAccountId'];

function parseConfig(rows: { key: string; value: string }[]): Config {
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  const parsed: Record<string, unknown> = {};
  for (const [dbKey, configKey] of Object.entries(DB_KEY_MAP)) {
    const raw = map[dbKey];
    if (raw === undefined) continue;
    if (configKey === 'firstDayOfWeek') {
      parsed[configKey] = raw === String(FIRST_DAYS.sunday) ? FIRST_DAYS.sunday : FIRST_DAYS.monday;
    } else if (BOOLEAN_KEYS.includes(configKey)) {
      parsed[configKey] = raw === 'true';
    } else if (INT_OR_NULL_KEYS.includes(configKey)) {
      parsed[configKey] = raw === 'null' ? null : Number(raw);
    } else {
      parsed[configKey] = raw;
    }
  }
  return { ...DEFAULT_CONFIG, ...(parsed as Partial<Config>) };
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
