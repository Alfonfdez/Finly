import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate003(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const defaults: [string, string][] = [
    ['theme', 'dark'],
    ['first_day_of_week', '1'],
    ['currency', '€'],
    ['decimal_separator', ','],
    ['language', 'en'],
    ['text_size', 'medium'],
  ];

  for (const [key, value] of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)',
      key,
      value
    );
  }
}
