import { describe, it, expect } from 'vitest';
import {
  ARRAY_CONFIG_KEYS,
  CONFIG_CODECS,
  CONFIG_METADATA,
  DB_KEY_MAP,
} from '../../src/database/configMetadata';
import { DEFAULT_CONFIG } from '../../src/database/configDefaults';

describe('config metadata', () => {
  it('covers every config key', () => {
    expect(Object.keys(CONFIG_METADATA).sort()).toEqual(Object.keys(DEFAULT_CONFIG).sort());
  });

  it('uses unique, valid database keys', () => {
    const dbKeys = Object.values(CONFIG_METADATA).map(meta => meta.dbKey);
    expect(new Set(dbKeys).size).toBe(dbKeys.length);
    for (const dbKey of dbKeys) {
      expect(dbKey).toMatch(/^[a-z_]+$/);
      expect(DB_KEY_MAP[dbKey]).toBeTruthy();
    }
  });

  it('derives array keys from the array codec', () => {
    const expected = Object.entries(CONFIG_METADATA)
      .filter(([, meta]) => meta.codec === CONFIG_CODECS.array)
      .map(([key]) => key);
    expect(ARRAY_CONFIG_KEYS).toEqual(expected);
  });
});
