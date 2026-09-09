import { describe, it, expect, beforeAll, vi } from 'vitest';
import { openDatabaseSync } from 'expo-sqlite';
import type { DatabaseHandle } from '../../src/database/types';
import { createSqlJsDatabase, type SqlJsDatabase } from '../../src/database/sqliteWeb';
import { createSchema } from '../../src/database/migrations/001_initial';
import { seedDataInner } from '../../src/database/migrations/002_seed';
import { seedConfigInner } from '../../src/database/migrations/003_config';
import { clearDataKeepSettings, resetDatabase } from '../../src/database/database';

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses.
await import('expo-sqlite');

const dbHolder = vi.hoisted(() => ({ db: null as SqlJsDatabase | null }));

beforeAll(async () => {
  await createSqlJsDatabase(null, null);
});

// database.ts caches the result of getDatabase() (openEngine -> openDatabaseSync).
// Boot schema + seeds on the singleton the app will use, so resetDatabase and
// clearDataKeepSettings operate on it through the mocked expo-sqlite engine.
beforeAll(async () => {
  const db = openDatabaseSync('Finly.db') as unknown as SqlJsDatabase;
  dbHolder.db = db;
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await createSchema(db);
  await seedDataInner(db);
  await seedConfigInner(db);
});

async function getConfig(db: DatabaseHandle, key: string): Promise<string> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM config WHERE key = ?',
    key
  );
  return row?.value ?? '';
}

async function setConfig(db: DatabaseHandle, key: string, value: string): Promise<void> {
  await db.runAsync("UPDATE config SET value = ? WHERE key = ?", value, key);
}

async function insertTestAccount(db: DatabaseHandle): Promise<void> {
  await db.runAsync(
    `INSERT INTO accounts (id, user_id, name, initial_balance, icon, color, description, is_total, created_at)
     VALUES (3, 1, 'Test', 0, 'wallet-outline', '#000000', '', 0, '2026-01-01')`
  );
}

describe('resetDatabase (factory reset)', () => {
  it('resets config to defaults and re-seeds seed data', async () => {
    const db = dbHolder.db!;
    await setConfig(db, 'language', 'es');
    await setConfig(db, 'home_default_account_id', '99');
    await setConfig(db, 'add_default_account_id', '1');
    await insertTestAccount(db);

    await resetDatabase();

    await expect(getConfig(db, 'language')).resolves.toBe('en');
    await expect(getConfig(db, 'home_default_account_id')).resolves.toBe('null');
    await expect(getConfig(db, 'add_default_account_id')).resolves.toBe('null');

    const accounts = await db.getAllAsync<{ id: number }>(
      'SELECT id FROM accounts ORDER BY id'
    );
    expect(accounts.map(a => a.id)).toEqual([1, 2]);

    const custom = await db.getFirstAsync('SELECT id FROM accounts WHERE id = 3');
    expect(custom).toBeNull();
  });
});

describe('clearDataKeepSettings (delete data, keep settings)', () => {
  it('preserves config and sanitizes dangling default-account keys', async () => {
    const db = dbHolder.db!;
    await setConfig(db, 'language', 'es');
    await setConfig(db, 'home_default_account_id', '99');
    await setConfig(db, 'add_default_account_id', '1');
    await insertTestAccount(db);

    await clearDataKeepSettings();

    await expect(getConfig(db, 'language')).resolves.toBe('es');
    await expect(getConfig(db, 'home_default_account_id')).resolves.toBe('null');
    await expect(getConfig(db, 'add_default_account_id')).resolves.toBe('1');

    const accounts = await db.getAllAsync<{ id: number }>(
      'SELECT id FROM accounts ORDER BY id'
    );
    expect(accounts.map(a => a.id)).toEqual([1, 2]);
  });

  it('keeps defaults that reference accounts surviving the wipe', async () => {
    const db = dbHolder.db!;
    await setConfig(db, 'home_default_account_id', '1');
    await setConfig(db, 'add_default_account_id', '1');

    await clearDataKeepSettings();

    await expect(getConfig(db, 'home_default_account_id')).resolves.toBe('1');
    await expect(getConfig(db, 'add_default_account_id')).resolves.toBe('1');
  });
});
