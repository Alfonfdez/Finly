import { type SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_CONFIG, toConfigRows } from '../configDefaults';

export async function seedConfig(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    await seedConfigInner(db);
  });
}

export async function seedConfigInner(db: SQLiteDatabase): Promise<void> {
  for (const row of toConfigRows(DEFAULT_CONFIG)) {
    await db.runAsync(
      'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)',
      row.key,
      row.value
    );
  }
}
