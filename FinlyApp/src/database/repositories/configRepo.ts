import { sql } from 'drizzle-orm';
import { getDrizzle, withTransaction } from '../drizzle/engine';
import { config } from '../drizzle/schema';
import type { Config } from '../types';
import { FIRST_DAYS } from '../../constants/types';
import { CONFIG_CODECS, CONFIG_METADATA } from '../configMetadata';
import { DEFAULT_CONFIG, CONFIG_NULL_SENTINEL, parseBooleanConfigValue, sanitizeConfig, toConfigRows } from '../configDefaults';

function parseConfig(rows: { key: string; value: string }[]): Config {
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  const parsed: Record<string, unknown> = {};
  for (const [configKey, meta] of Object.entries(CONFIG_METADATA) as [keyof Config, typeof CONFIG_METADATA[keyof Config]][]) {
    const raw = map[meta.dbKey];
    if (raw === undefined) continue;
    switch (meta.codec) {
      case CONFIG_CODECS.firstDay:
        parsed[configKey] = raw === String(FIRST_DAYS.sunday) ? FIRST_DAYS.sunday : FIRST_DAYS.monday;
        break;
      case CONFIG_CODECS.boolean: {
        const value = parseBooleanConfigValue(raw);
        if (value !== null) parsed[configKey] = value;
        break;
      }
      case CONFIG_CODECS.intOrNull:
        parsed[configKey] = raw === CONFIG_NULL_SENTINEL ? null : Number(raw);
        break;
      case CONFIG_CODECS.array:
        try {
          parsed[configKey] = JSON.parse(raw);
        } catch {
          // Leave it unset so sanitizeConfig falls back to the default array.
        }
        break;
      default:
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
    const rows = toConfigRows(partial);
    if (rows.length === 0) return;
    await withTransaction(async (db) => {
      for (const row of rows) {
        await db
          .insert(config)
          .values(row)
          .onConflictDoUpdate({ target: config.key, set: { value: sql`excluded.value` } })
          .run();
      }
    });
  },
};
