import { type SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';
import { createSchema } from './migrations/001_initial';
import { seedData } from './migrations/002_seed';
import { seedConfig } from './migrations/003_config';

const DATABASE_NAME = 'Finly.db';

let db: SQLiteDatabase | null = null;

export function getDatabase(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync(DATABASE_NAME);
  }
  return db;
}

export async function initDatabase(): Promise<SQLiteDatabase> {
  const database = getDatabase();

  await database.execAsync('PRAGMA foreign_keys = ON;');
  await createSchema(database);
  await seedData(database);
  await seedConfig(database);

  return database;
}
