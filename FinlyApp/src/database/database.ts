import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';
import { migrate001 } from './migrations/001_initial';
import { seed002 } from './migrations/002_seed';
import { migrate003 } from './migrations/003_configuracion';
import { seed004 } from './migrations/004_nuevas_categorias';

const DATABASE_NAME = 'Finly.db';
const DATABASE_VERSION = 4;

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

  if (currentVersion < 4) {
    await seed004(database);
    currentVersion = 4;
  }

  await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);

  await database.runAsync(`UPDATE categorias SET icono = 'musical-notes-outline' WHERE id = 5`);
  await database.runAsync(`UPDATE categorias SET icono = 'game-controller-outline' WHERE id = 10`);
  await database.runAsync(`UPDATE categorias SET icono = 'wallet-outline' WHERE id = 23`);

  return database;
}
