import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate006(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT '';
  `);
}
