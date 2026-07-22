import { type SQLiteDatabase } from 'expo-sqlite';

export async function seedConfig(db: SQLiteDatabase): Promise<void> {
  const defaults: [string, string][] = [
    ['theme', 'dark'],
    ['first_day_of_week', '1'],
    ['currency', '€'],
    ['decimal_separator', ','],
    ['language', 'en'],
    ['text_size', 'medium'],
    ['category_icon_shape', 'square'],
    ['account_icon_shape', 'square'],
    ['home_default_account_id', 'null'],
    ['home_default_period', 'month'],
    ['add_default_account_id', 'null'],
    ['add_show_labels', 'true'],
    ['add_show_comments', 'true'],
    ['add_show_photo', 'true'],
    ['hide_balances', 'false'],
  ];

  for (const [key, value] of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)',
      key,
      value
    );
  }
}
