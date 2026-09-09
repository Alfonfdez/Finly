import type { DatabaseHandle } from './types';
import { openEngine } from './engine';
import { createSchema } from './migrations/001_initial';
import { seedData, seedDataInner } from './migrations/002_seed';
import { seedConfig, seedConfigInner } from './migrations/003_config';
import { sanitizeDefaultAccountConfig } from './configDefaults';

const DATABASE_NAME = 'Finly.db';
export const SCHEMA_VERSION = 3;

let dbPromise: Promise<DatabaseHandle> | null = null;

export function getDatabase(): Promise<DatabaseHandle> {
  if (!dbPromise) {
    dbPromise = openEngine(DATABASE_NAME);
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
  });
}

let initPromise: Promise<DatabaseHandle> | null = null;

export function initDatabase(): Promise<DatabaseHandle> {
  if (!initPromise) {
    initPromise = (async () => {
      const database = await getDatabase();
      await database.execAsync('PRAGMA foreign_keys = ON;');
      await migrate(database);
      const user = await database.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM users');
      if ((user?.count ?? 0) === 0) {
        await seedData(database);
        await seedConfig(database);
      }
      return database;
    })();
  }
  return initPromise;
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM transactions');
    await database.runAsync('DELETE FROM transaction_tags');
    await database.runAsync('DELETE FROM accounts');
    await database.runAsync('DELETE FROM categories');
    await database.runAsync('DELETE FROM tags');
    await database.runAsync('DELETE FROM config');
    await seedDataInner(database);
    await seedConfigInner(database);
  });
}

export async function clearDataKeepSettings(): Promise<void> {
  const database = await getDatabase();
  await database.withTransactionAsync(async () => {
    await database.runAsync('DELETE FROM transactions');
    await database.runAsync('DELETE FROM transaction_tags');
    await database.runAsync('DELETE FROM accounts');
    await database.runAsync('DELETE FROM categories');
    await database.runAsync('DELETE FROM tags');
    await seedDataInner(database);
    await sanitizeDefaultAccountConfig(database);
  });
}
