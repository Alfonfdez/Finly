import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate005(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE transactions ADD COLUMN updated_at TEXT;
  `);
}
