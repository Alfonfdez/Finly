import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { initSqliteHarness, bootSqliteDb as boot } from './helpers/sqliteHarness';

vi.mock('../../src/database/photoCleanup', () => ({
  collectTransactionPhotos: vi.fn(async () => []),
  collectAllTransactionPhotos: vi.fn(async () => []),
  deletePhotoUris: vi.fn(async () => {}),
}));

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

await import('expo-sqlite');

beforeAll(initSqliteHarness);

interface SeededCounts {
  users: number;
  accounts: number;
  categories: number;
  config: number;
}

async function count(db: DatabaseHandle, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) AS count FROM ${table}`);
  return row?.count ?? 0;
}

async function counts(db: DatabaseHandle): Promise<SeededCounts> {
  const [users, accounts, categories, config] = await Promise.all([
    count(db, 'users'),
    count(db, 'accounts'),
    count(db, 'categories'),
    count(db, 'config'),
  ]);
  return { users, accounts, categories, config };
}

async function wipe(db: DatabaseHandle, tables: string[]): Promise<void> {
  for (const table of tables) {
    await db.runAsync(`DELETE FROM ${table}`);
  }
}

async function loadEnsureSeedData() {
  const { ensureSeedData, getDatabase } = await import('../../src/database/database');
  return { ensureSeedData, db: await getDatabase() };
}

const CHILD_TABLES = ['transactions', 'transaction_tags', 'recurring_rule_tags', 'recurring_rules'];

describe('ensureSeedData (self-heal)', () => {
  it('leaves a healthy database untouched', async () => {
    await boot();
    const { ensureSeedData, db } = await loadEnsureSeedData();

    const before = await counts(db);
    expect(before).toEqual({ users: 1, accounts: 2, categories: 31, config: before.config });
    expect(before.config).toBeGreaterThan(0);

    await ensureSeedData(db);

    expect(await counts(db)).toEqual(before);
  });

  it('is idempotent when called twice', async () => {
    await boot();
    const { ensureSeedData, db } = await loadEnsureSeedData();
    await wipe(db, ['accounts']);

    await ensureSeedData(db);
    const once = await counts(db);
    await ensureSeedData(db);

    expect(await counts(db)).toEqual(once);
    expect(once.accounts).toBe(2);
  });

  it('re-seeds accounts that were lost (users kept)', async () => {
    await boot();
    const { ensureSeedData, db } = await loadEnsureSeedData();
    const healthy = await counts(db);
    await wipe(db, ['accounts']);

    await ensureSeedData(db);

    expect(await counts(db)).toEqual(healthy);
  });

  it('re-seeds categories that were lost', async () => {
    await boot();
    const { ensureSeedData, db } = await loadEnsureSeedData();
    const healthy = await counts(db);
    await wipe(db, ['categories']);

    await ensureSeedData(db);

    expect(await counts(db)).toEqual(healthy);
  });

  it('restores the default config when it was lost', async () => {
    await boot();
    const { ensureSeedData, db } = await loadEnsureSeedData();
    const healthy = await counts(db);
    await wipe(db, ['config']);

    await ensureSeedData(db);

    expect(await counts(db)).toEqual(healthy);
    const language = await db.getFirstAsync<{ value: string }>("SELECT value FROM config WHERE key = 'language'");
    expect(language?.value).toBe('en');
  });

  it('repairs a half-applied wipe (every seeded table empty)', async () => {
    await boot();
    const { ensureSeedData, db } = await loadEnsureSeedData();
    const healthy = await counts(db);
    await wipe(db, [...CHILD_TABLES, 'accounts', 'categories', 'users']);

    await ensureSeedData(db);

    expect(await counts(db)).toEqual(healthy);
  });
});
