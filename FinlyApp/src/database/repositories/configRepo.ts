import { sql } from 'drizzle-orm';
import { getDrizzle } from '../drizzle/engine';
import { config } from '../drizzle/schema';
import type { Config } from '../types';
import { FIRST_DAYS } from '../../constants/types';
import { DEFAULT_CONFIG, DB_KEY_MAP, sanitizeConfig, toConfigRows } from '../configDefaults';

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
    const db = await getDrizzle();
    const rows = await db.select({ key: config.key, value: config.value }).from(config).all();
    return sanitizeConfig(rows.length > 0 ? parseConfig(rows) : DEFAULT_CONFIG);
  },

  async save(partial: Partial<Config>): Promise<void> {
    const db = await getDrizzle();
    for (const row of toConfigRows(partial)) {
      await db
        .insert(config)
        .values(row)
        .onConflictDoUpdate({ target: config.key, set: { value: sql`excluded.value` } })
        .run();
    }
  },
};
