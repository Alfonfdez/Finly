import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';
import { migrate001 } from './migrations/001_initial';
import { seed002 } from './migrations/002_seed';
import { migrate003 } from './migrations/003_configuracion';

const DATABASE_NAME = 'Finly.db';
const DATABASE_VERSION = 3;

let db: SQLiteDatabase | null = null;

export function getDatabase(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync(DATABASE_NAME);
  }
  return db;
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

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

  return database;
}
