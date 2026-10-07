import type { DatabaseHandle } from '../types';

export async function createRecurringSchema(db: DatabaseHandle) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recurring_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      account_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      description TEXT,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      interval INTEGER NOT NULL DEFAULT 1 CHECK(interval >= 1),
      weekday INTEGER,
      day_of_month INTEGER,
      month INTEGER,
      start_date TEXT NOT NULL,
      end_date TEXT,
      next_due TEXT NOT NULL,
      skipped_from TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recurring_rule_tags (
      rule_id INTEGER NOT NULL REFERENCES recurring_rules(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (rule_id, tag_id)
    );

    CREATE INDEX IF NOT EXISTS idx_recurring_rules_user ON recurring_rules(user_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_rule_tags_tag ON recurring_rule_tags(tag_id);
  `);

  await db.execAsync(
    'ALTER TABLE transactions ADD COLUMN recurring_rule_id INTEGER REFERENCES recurring_rules(id) ON DELETE SET NULL'
  );
  await db.execAsync('ALTER TABLE transactions ADD COLUMN recurrence_date TEXT');
  await db.execAsync(
    'CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_recurrence ON transactions(recurring_rule_id, recurrence_date) WHERE recurring_rule_id IS NOT NULL'
  );
}
