import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate004(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (transaction_id, tag_id)
    );
  `);

  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag ON transaction_tags(tag_id);`);
}
