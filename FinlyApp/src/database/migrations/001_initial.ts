import { type SQLiteDatabase } from 'expo-sqlite';

export async function createSchema(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      currency TEXT NOT NULL DEFAULT '€',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      initial_balance REAL NOT NULL DEFAULT 0,
      icon TEXT NOT NULL DEFAULT 'wallet',
      color TEXT NOT NULL DEFAULT '#22D3EE',
      description TEXT DEFAULT '',
      is_total INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'tag',
      color TEXT NOT NULL DEFAULT '#A78BFA',
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      amount REAL NOT NULL CHECK(amount > 0),
      description TEXT,
      photo TEXT,
      date TEXT NOT NULL,
      updated_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS transaction_tags (
      transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (transaction_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(user_id, type);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id, date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id, date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type, date);
    CREATE INDEX IF NOT EXISTS idx_tags_user ON tags(user_id);
    CREATE INDEX IF NOT EXISTS idx_transaction_tags_tag ON transaction_tags(tag_id);
  `);
}
