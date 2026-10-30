import type { DatabaseHandle } from './types';
import { openEngine } from './engine';
import { createSchema } from './migrations/001_initial';
import { seedDataInner } from './migrations/002_seed';
import { seedConfigInner } from './migrations/003_config';
import { createRecurringSchema } from './migrations/004_recurring';
import { sanitizeDefaultAccountConfig } from './configDefaults';
import { wipeUserData } from './wipe';
import { DATABASE_NAME } from '../constants/storage';

export const SCHEMA_VERSION = 4;

let dbPromise: Promise<DatabaseHandle> | null = null;

export function getDatabase(): Promise<DatabaseHandle> {
  if (!dbPromise) {
    dbPromise = openEngine(DATABASE_NAME).catch(error => {
      // A failed open must not poison every later retry.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

async function migrate(database: DatabaseHandle): Promise<void> {
  const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) return;

  await database.withTransactionAsync(async () => {
    if (currentVersion < 1) {
      await createSchema(database);
      await database.execAsync('PRAGMA user_version = 1');
    }
    if (currentVersion < 2) {
      const user = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM users');
      if ((user?.count ?? 0) === 0) {
        await seedDataInner(database);
      }
      await database.execAsync('PRAGMA user_version = 2');
    }
    if (currentVersion < 3) {
      const config = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM config');
      if ((config?.count ?? 0) === 0) {
        await seedConfigInner(database);
      }
      await database.execAsync('PRAGMA user_version = 3');
    }
    if (currentVersion < 4) {
      await createRecurringSchema(database);
      await database.execAsync('PRAGMA user_version = 4');
    }
  });
}

let initPromise: Promise<DatabaseHandle> | null = null;

type SeededTable = 'users' | 'accounts' | 'categories' | 'config';

async function countRows(database: DatabaseHandle, table: SeededTable): Promise<number> {
  const row = await database.getFirstAsync<{ count: number }>(`SELECT COUNT(*) AS count FROM ${table}`);
  return row?.count ?? 0;
}

/**
 * Idempotent seed repair. A wipe that was interrupted by the old transaction
 * interleaving could leave empty tables behind, and init only looked at `users`
 * (which a factory reset keeps), so it never healed them. The seed inserts use
 * `INSERT OR IGNORE`, so existing rows are never modified.
 */
export async function ensureSeedData(database: DatabaseHandle): Promise<void> {
  const [users, accounts, categories, configRows] = await Promise.all([
    countRows(database, 'users'),
    countRows(database, 'accounts'),
    countRows(database, 'categories'),
    countRows(database, 'config'),
  ]);
  const needsSeedData = users === 0 || accounts === 0 || categories === 0;
  const needsConfig = configRows === 0;
  if (!needsSeedData && !needsConfig) return;

  await database.withTransactionAsync(async () => {
    if (needsSeedData) await seedDataInner(database);
    if (needsConfig) await seedConfigInner(database);
  });
}

export function initDatabase(): Promise<DatabaseHandle> {
  if (!initPromise) {
    initPromise = (async () => {
      const database = await getDatabase();
      await database.execAsync('PRAGMA foreign_keys = ON;');
      await migrate(database);
      await ensureSeedData(database);
      return database;
    })().catch(error => {
      // The App retry path must be able to try the whole initialization again.
      initPromise = null;
      throw error;
    });
  }
  return initPromise;
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await wipeUserData(database, { keepConfig: false, keepUsers: true });
    await seedDataInner(database);
    await seedConfigInner(database);
  });
}

export async function clearDataKeepSettings(): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await wipeUserData(database, { keepConfig: true, keepUsers: true });
    await seedDataInner(database);
    await sanitizeDefaultAccountConfig(database);
  });
}
