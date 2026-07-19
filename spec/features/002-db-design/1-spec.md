# 002 — Local database design

- **Goal**
  Design and implement a local SQLite database (native) with a localStorage fallback for web that stores users, accounts, categories, transactions, tags, and configuration. The schema is created once on first launch from a single initial migration, seeded with default data, and a config table holds user preferences. Referential integrity is guaranteed with foreign keys and `ON DELETE CASCADE`.

- **Functional requirements**
  1. Local user (single default user, `id = 1`) with name, email, avatar, and currency.
  2. Full CRUD for accounts: each account belongs to a user, has a name, initial balance, icon, color, and optional description.
  3. Full CRUD for categories: each category belongs to a user, has a name, icon, color, and type (`expense` / `income`).
  4. Full CRUD for transactions: each transaction belongs to an account and a category, has a type (`expense` / `income`), amount, description, date, and an `updated_at` column.
  5. Full CRUD for tags (global, not tied to a type) and a `transaction_tags` junction table (many-to-many) for tagging transactions.
  6. Key-value `config` table that stores user preferences (theme, language, currency, first day of week, text size, decimal separator, icon shapes).
  7. Efficient queries by period (day, week, month, year, custom range) and by type (`expense` / `income`).
  8. Aggregations: total income and expenses by period, breakdown by categories with percentages, breakdown by category and tag.
  9. Initial loading of default data (one user, one account "My Wallet", 18 universal categories, empty transactions and tags) when the database is created for the first time.

- **Contents**
  SQL schema of the tables, initialization script, CRUD functions in TypeScript (repositories), and a web localStorage fallback.

- **Non-functional requirements**
  - The database is created when the app starts for the first time (`initDatabase()` in `database.ts`).
  - Schema is initialized in a single pass: `createSchema()` → `seedData()` → `seedConfig()`. No versioned migrations are used during development; the developer resets the database manually (clear LocalStorage on web / Clear Data on the device) when the schema changes.
  - Queries run off the UI thread using `expo-sqlite` async APIs (`await`).
  - Data is persisted locally without an internet connection. On web, `localStorage` is used instead of SQLite.
  - The structure supports cascading deletes (e.g., deleting a category removes its transactions; deleting a tag removes its junction links).
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
  date TEXT NOT NULL,
  updated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
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

-- Indexes
CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(user_id, type);
CREATE INDEX idx_transactions_account ON transactions(account_id, date);
CREATE INDEX idx_transactions_category ON transactions(category_id, date);
CREATE INDEX idx_transactions_type ON transactions(type, date);
CREATE INDEX idx_tags_user ON tags(user_id);
CREATE INDEX idx_transaction_tags_tag ON transaction_tags(tag_id);
```

- **config keys**

| key | value | meaning |
|-----|-------|---------|
| `theme` | `dark` \| `light` \| `system` | active theme |
| `first_day_of_week` | `0` \| `1` | Sunday (0) / Monday (1) |
| `currency` | `€` \| `$` \| `£` \| `¥` | currency symbol |
| `decimal_separator` | `,` \| `.` | decimal separator |
| `language` | `en` \| `es` \| `ca` | UI language |
| `text_size` | `small` \| `medium` \| `large` | font scaling |
| `category_icon_shape` | `square` \| `circle` | category icon shape |
| `account_icon_shape` | `square` \| `circle` | account icon shape |

- **Date format**
  All dates are stored in TEXT format with the pattern `YYYY-MM-DD HH:MM:SS`. Example: `'2026-07-01 14:30:00'`. `datetime('now', 'localtime')` is used to automatically generate `created_at`; `date` is stored when creating the transaction; `updated_at` is set on every update (nullable).

- **Acceptance criteria**
  - [x] The database is created automatically when the app starts if it does not exist.
  - [x] Default data (user, "My Wallet" account, 18 categories) is loaded as a seed on first creation.
  - [x] A user, accounts, categories, transactions, and tags can be inserted.
  - [x] Aggregation queries by period return the correct totals.
  - [x] When deleting a category, its associated transactions are also deleted.
  - [x] When deleting an account, its associated transactions are also deleted.
  - [x] When deleting a tag, its junction links are also deleted.
  - [x] Insertions and queries do not block the user interface.
  - [x] TypeScript type names match the code: `User`, `Account`, `Category`, `Transaction`, `Tag`, `TransactionTag`, `Config`.
