import { type SQLiteDatabase, openDatabaseSync, deleteDatabaseAsync } from 'expo-sqlite';
import { migrate001 } from './migrations/001_initial';
import { seed002 } from './migrations/002_seed';
import { migrate003 } from './migrations/003_config';
import { migrate004 } from './migrations/004_tags';
import { migrate005 } from './migrations/005_updated_at';

const DATABASE_NAME = 'Finly.db';
const DATABASE_VERSION = 5;

let db: SQLiteDatabase | null = null;

export function getDatabase(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync(DATABASE_NAME);
  }
  return db;
}

async function isDatabaseConsistent(database: SQLiteDatabase): Promise<boolean> {
  const tagsTable = await database.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='tags'"
  );
  return !!tagsTable;
}

async function deleteDatabaseFile(): Promise<void> {
  if (db) {
    await db.closeAsync();
  }
  db = null;
  await deleteDatabaseAsync(DATABASE_NAME);
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  const database = getDatabase();

  let { user_version: currentVersion } = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  ) ?? { user_version: 0 };

  if (currentVersion < 1) {
    await migrate001(database);
    currentVersion = 1;
  }

  if (currentVersion < 2) {
    await seed002(database);
    currentVersion = 2;
  }

  if (currentVersion < 3) {
    await migrate003(database);
    currentVersion = 3;
  }

  if (currentVersion < 4) {
    await migrate004(database);
    currentVersion = 4;
  }

  if (currentVersion < 5) {
    await migrate005(database);
    currentVersion = 5;
  }

  if (!(await isDatabaseConsistent(database))) {
    await deleteDatabaseFile();
    return initDatabase();
  }

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

  return database;
}
