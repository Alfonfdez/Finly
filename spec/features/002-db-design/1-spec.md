# 002 — Local database design

- **Goal**
  Design and implement the local SQLite database used on every platform — `expo-sqlite` on native and sql.js (WASM) persisted to IndexedDB on web — that stores users, accounts, categories, transactions, tags, recurring rules, and configuration. The schema is versioned (`PRAGMA user_version`, `SCHEMA_VERSION 4`) and seeded with default data, and a config table holds user preferences. Referential integrity is guaranteed with foreign keys and `ON DELETE CASCADE`.

- **Functional requirements**
  1. Local user (single default user, `id = 1`) with name, email, avatar, and currency.
  2. Full CRUD for accounts: each account belongs to a user, has a name, initial balance, icon, color, optional description, and an `is_total` flag (0=regular, 1=special "Total" account that aggregates all accounts).
  3. Full CRUD for categories: each category belongs to a user, has a name, icon, color, and type (`expense` / `income`).
   4. Full CRUD for transactions: each transaction belongs to an account and a category, has a type (`expense` / `income`), amount, description, date, `updated_at` column, and an optional `photo` column (stores the file URI on native or the data URI on web for an attached receipt/invoice image, null when no photo).
  5. Full CRUD for tags (global, not tied to a type) and a `transaction_tags` junction table (many-to-many) for tagging transactions.
  6. Key-value `config` table that stores user preferences (theme, language, currency, first day of week, text size, decimal separator, icon shapes, default accounts, section visibility, hide balances, and each list's sort field/direction). Every field is validated independently (`sanitizeConfig`), so one corrupt value falls back to its default without resetting the rest.
  7. Efficient queries by period (day, week, month, year, custom range) and by type (`expense` / `income`).
  8. Aggregations: total income and expenses by period, breakdown by categories with percentages, breakdown by category and tag.
   9. Initial loading of default data (one user, two accounts "My Wallet" and "Total", 31 universal categories, empty transactions and tags) when the database is created for the first time. The default account name "My Wallet" is stored in English and translated at display time via `getDisplayAccountName` (key `account_my_wallet`, translated into all 9 languages). The Total account (`is_total=1`) is a special aggregate account whose name "Total" is also translated at display time (key `account_total`).
  10. Bulk deletion methods for DataScreen: `deleteAllTransactions()` clears `transactions` + `transaction_tags`; `deleteAll()` clears all rows from `accounts`, `categories`, or `tags`. After bulk deletes, `resetAll()` in AppContext re-fetches all data and re-applies home defaults.
  11. Recurring rules (`recurring_rules`), their tag links (`recurring_rule_tags`), and the generated-transaction link (`transactions.recurring_rule_id` + `transactions.recurrence_date`), added by `004_recurring`.
  12. Versioned migrations: `initDatabase()` reads `PRAGMA user_version` and applies each pending step once inside a transaction — `001_initial` (schema), `002_seed` (seed data), `003_config` (config defaults), `004_recurring` (recurring rules). `SCHEMA_VERSION = 4`.
  13. Seed self-heal: on every launch `ensureSeedData()` re-seeds `users`/`accounts`/`categories`/`config` when any of those tables is empty, using `INSERT OR IGNORE`, so an interrupted wipe repairs itself without modifying existing rows.
  14. One transaction queue: every explicit SQLite transaction (migrations, reconciliation, rule edits, config saves, wipes, imports) goes through `runExclusiveDb`, because the app uses one connection. A task never starts a nested transaction.

- **Contents**
  SQL schema of the tables, the versioned migration runner, the idempotent seed repair, CRUD functions in TypeScript (repositories), and the shared transaction queue. Web runs the same SQLite bytes through sql.js and persists them to IndexedDB; there is no separate web repository layer.

- **Non-functional requirements**
  - The database is created when the app starts for the first time (`initDatabase()` in `database.ts`).
  - Schema changes are versioned: `initDatabase()` applies the pending migrations from `PRAGMA user_version` up to `SCHEMA_VERSION = 4`, each step once inside a transaction. There is no manual reset requirement for schema upgrades.
  - Queries run through the shared `DatabaseHandle` async API — `expo-sqlite` on native, sql.js (WASM) on web — and screens never call synchronous storage APIs.
  - Data is persisted locally without an internet connection. On web, the exported SQLite bytes are stored in IndexedDB (sql.js), so the same schema, migrations, and repositories run on every platform.
  - The structure supports cascading deletes (e.g., deleting a category removes its transactions; deleting a tag removes its junction links). The Total account (`is_total = 1`) is never deleted: `accountRepo.delete()`/`deleteMany()` skip it, so its transactions are never removed by an account delete.
  - The whole app shares one transaction queue (`runExclusiveDb`); explicit transactions are serialized and never nested.
  - `configRepository.get()` applies `sanitizeConfig()`, which validates every key separately and falls back per field to `DEFAULT_CONFIG`.
  - `backup.ts` reads and writes all 9 tables (including recurring rules) in one transaction; imported snapshots are validated before any write (see 025).
  - Dates are stored in TEXT format with the pattern `YYYY-MM-DD HH:MM:SS`.
  - TypeScript type names match those in the code: `User`, `Account`, `Category`, `Transaction`, `Tag`, `TransactionTag`, `Config`.
  - Indexes are created on frequently queried columns to optimize performance.

- **Out of scope**
  Cloud sync, remote authentication, external server, real-time database, multi-user switching.

- **Table schema (current)**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  currency TEXT NOT NULL DEFAULT '€',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE accounts (
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

CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#A78BFA',
  type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
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
  recurring_rule_id INTEGER REFERENCES recurring_rules(id) ON DELETE SET NULL,
  recurrence_date TEXT,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);

CREATE TABLE transaction_tags (
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (transaction_id, tag_id)
);

CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Added by 004_recurring (SCHEMA_VERSION 4).
CREATE TABLE recurring_rules (
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

CREATE TABLE recurring_rule_tags (
  rule_id INTEGER NOT NULL REFERENCES recurring_rules(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (rule_id, tag_id)
);

-- Indexes
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(user_id, type);
CREATE INDEX idx_transactions_account ON transactions(account_id, date);
CREATE INDEX idx_transactions_category ON transactions(category_id, date);
CREATE INDEX idx_transactions_type ON transactions(type, date);
CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);
CREATE INDEX idx_recurring_rules_user ON recurring_rules(user_id);
CREATE INDEX idx_recurring_rule_tags_tag ON recurring_rule_tags(tag_id);
CREATE UNIQUE INDEX ux_transactions_recurrence ON transactions(recurring_rule_id, recurrence_date) WHERE recurring_rule_id IS NOT NULL;
```

- **config keys**

| key | value | meaning |
|-----|-------|---------|
| `theme` | `dark` \| `light` \| `system` | active theme |
| `first_day_of_week` | `0` \| `1` | Sunday (0) / Monday (1) |
| `currency` | `currency_euro` \| `currency_usd` \| … | selected currency label key (resolved to its symbol for display) |
| `decimal_separator` | `,` \| `.` | decimal separator |
| `language` | `en` \| `es` \| `ca` \| `gl` \| `eu` \| `fr` \| `de` \| `pt` \| `it` | UI language |
| `text_size` | `small` \| `medium` \| `large` | font scaling |
| `category_icon_shape` | `square` \| `circle` | category icon shape |
| `account_icon_shape` | `square` \| `circle` | account icon shape |
| `home_default_account_id` | `null` \| `<id>` | default account on HomeScreen (null = Total) |
| `home_default_period` | `day` \| `week` \| `month` \| `year` | default period on HomeScreen |
| `add_default_account_id` | `null` \| `<id>` | default account in AddTransactionScreen (null = not selected) |
| `add_show_labels` | `true` \| `false` | show labels section in AddTransactionScreen |
| `add_show_comments` | `true` \| `false` | show comments section in AddTransactionScreen |
| `add_show_photo` | `true` \| `false` | show photo section in AddTransactionScreen |
| `modify_show_labels` | `true` \| `false` | show labels section in ModifyTransactionScreen |
| `modify_show_comments` | `true` \| `false` | show comments section in ModifyTransactionScreen |
| `modify_show_photo` | `true` \| `false` | show photo section in ModifyTransactionScreen |
| `create_recurring_default_account_id` | `null` \| `<id>` | default account in CreateRecurringScreen |
| `create_recurring_show_labels` | `true` \| `false` | show labels section in CreateRecurringScreen |
| `create_recurring_show_comments` | `true` \| `false` | show comments section in CreateRecurringScreen |
| `edit_recurring_show_labels` | `true` \| `false` | show labels section when editing a rule |
| `edit_recurring_show_comments` | `true` \| `false` | show comments section when editing a rule |
| `hide_balances` | `true` \| `false` | hide account balances across the app |
| `tags_sort_by` | `name` \| `created` \| `usage` | Tags screen sort field |
| `tags_sort_direction` | `asc` \| `desc` | Tags screen sort direction |
| `comments_sort_by` | `name` \| `lastUsed` \| `usage` | Comments screen sort field |
| `comments_sort_direction` | `asc` \| `desc` | Comments screen sort direction |
| `recurring_sort_by` | `nextDue` \| `name` \| `amount` \| `created` | Recurring screen sort field |
| `recurring_sort_direction` | `asc` \| `desc` | Recurring screen sort direction |
| `transactions_sort_by` | `date` \| `amount` | Transactions screen sort field |
| `transactions_sort_direction` | `asc` \| `desc` | Transactions screen sort direction |
| `all_transactions_sort_by` | `date` \| `amount` | All Transactions screen sort field |
| `all_transactions_sort_direction` | `asc` \| `desc` | All Transactions screen sort direction |
| `accounts_sort_by` | `name` \| `balance` | Accounts screen sort field |
| `accounts_sort_direction` | `asc` \| `desc` | Accounts screen sort direction |
| `categories_sort_by` | `name` \| `usage` | Categories screen sort field |
| `categories_sort_direction` | `asc` \| `desc` | Categories screen sort direction |

- **Date format**
  All dates are stored in TEXT format with the pattern `YYYY-MM-DD HH:MM:SS`. Example: `'2026-07-01 14:30:00'`. `datetime('now', 'localtime')` is used to automatically generate `created_at`; `date` is stored when creating the transaction; `updated_at` is set on every update (nullable).

- **Acceptance criteria**
  - [x] The database is created automatically when the app starts if it does not exist.
  - [x] Default data (user, "My Wallet" account, 31 categories) is loaded as a seed on first creation.
  - [x] A user, accounts, categories, transactions, and tags can be inserted.
  - [x] Aggregation queries by period return the correct totals.
  - [x] When deleting a category, its associated transactions are also deleted.
  - [x] When deleting an account, its associated transactions are also deleted.
  - [x] When deleting a tag, its junction links are also deleted.
  - [x] `deleteAllTransactions()` clears all transactions and transaction_tags.
  - [x] `deleteAll()` clears all rows from accounts, categories, or tags.
  - [x] After bulk deletion, `resetAll()` re-fetches all data and re-applies home defaults.
  - [x] Insertions and queries do not block the user interface.
  - [x] TypeScript type names match the code: `User`, `Account`, `Category`, `Transaction`, `Tag`, `TransactionTag`, `Config`.
  - [x] The `photo` column in transactions stores an optional file URI or data URI (TEXT, nullable) for attached receipt images.
  - [x] `initDatabase()` applies pending migrations from `PRAGMA user_version` up to `SCHEMA_VERSION = 4`, each step once inside a transaction.
  - [x] An interrupted wipe is repaired on launch: `ensureSeedData()` re-seeds empty `users`/`accounts`/`categories`/`config` tables with `INSERT OR IGNORE`.
  - [x] Every explicit transaction is serialized through `runExclusiveDb`, and a task never nests a transaction.
  - [x] `sanitizeConfig()` keeps valid fields and resets only the corrupt ones; one bad value never resets the whole configuration.
  - [x] The Total account is never deleted, and an account delete never removes its transactions.
  - [x] `recurring_rules`, `recurring_rule_tags`, `transactions.recurring_rule_id` and `transactions.recurrence_date` exist after migration 4.
