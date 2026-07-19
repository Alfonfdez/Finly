# Implementation plan — 002 Local database design

## Technical decision: SQLite with expo-sqlite (native) + localStorage (web)

AsyncStorage was replaced with **SQLite** using the `expo-sqlite` module for native platforms. Web uses a `localStorage` fallback (`webStorage.ts`) behind the same repository interface. Reasons:

- **Relational model**: finances have natural relationships (users → accounts → transactions → categories, plus tags via a junction table). SQLite is the standard for embedded databases.
- **Complex queries**: aggregations by period and category with `GROUP BY`, `SUM`, date filters, and tag breakdowns via `JOIN`.
- **Referential integrity**: foreign keys with `ON DELETE CASCADE`.
- **Performance**: SQLite handles thousands of transactions without issues; AsyncStorage degrades with volume.
- **Indexes**: created on frequently queried columns (account, category, type, date, user, tag).

## New dependencies

```bash
npx expo install expo-sqlite
```

## Files

```
FinlyApp/src/
├── database/
│   ├── database.ts           ← initialization (createSchema → seedData → seedConfig)
│   ├── index.ts              ← platform switching (SQLite vs localStorage)
│   ├── types.ts              ← TypeScript interfaces (User, Account, Category, Transaction, Tag, TransactionTag, Config)
│   ├── migrations/
│   │   ├── 001_initial.ts    ← createSchema(): CREATE TABLES + indexes
│   │   ├── 002_seed.ts       ← seedData(): default user, account, 18 categories
│   │   └── 003_config.ts     ← seedConfig(): config default values
│   ├── repositories/
│   │   ├── userRepo.ts       ← CRUD users
│   │   ├── accountRepo.ts    ← CRUD accounts + balance
│   │   ├── categoryRepo.ts   ← CRUD categories
│   │   ├── transactionRepo.ts← CRUD transactions + aggregations + tags
│   │   ├── configRepo.ts     ← config persistence
│   │   └── tagRepo.ts        ← CRUD tags
│   └── webStorage.ts         ← localStorage fallback (same interfaces)
└── context/
    ├── AppContext.tsx        ← uses repositories
    └── ConfigContext.tsx     ← uses configRepo
```

## Data architecture

```
AppContext / ConfigContext
  └── repositories (data access layer)
        └── database.ts (SQLite) OR webStorage.ts (localStorage)
              └── Finly.db (native) OR localStorage (web)
```

## Initialization flow

1. `App.tsx` calls `initDatabase()` (native) or `initWebStorage()` (web) on startup.
2. `initDatabase()` opens/creates `Finly.db` and runs, in order:
   - `createSchema()` — creates all tables and indexes (idempotent `CREATE TABLE IF NOT EXISTS`).
   - `seedData()` — inserts default user, "My Wallet" account, and 18 universal categories (idempotent `INSERT OR IGNORE`).
   - `seedConfig()` — inserts config defaults (`INSERT OR IGNORE`).
3. `AppContext` / `ConfigContext` connect to the repositories and load the initial state.
4. CRUD operations go through the repositories, never direct SQL.

## No versioned migrations (development mode)

During development the schema is defined entirely in `createSchema()`. There is no `DATABASE_VERSION` / `PRAGMA user_version` migration chain. When the schema changes, the developer resets the database manually:

- **Web**: clear the `@Finly/*` keys in LocalStorage (DevTools → Application).
- **Native**: Clear App Data / uninstall the Expo Go app.

This keeps the initialization simple. A proper versioned migration path can be reintroduced before production release.

## Main functions by repository

### userRepo
- `create(data)` → creates user
- `getById(id)` → gets user
- `update(id, data)` → modifies name, currency, etc.

### accountRepo
- `list(userId)` → all accounts
- `create(data)` → new account
- `update(id, data)` → modify name, balance, icon, color, description
- `delete(id)` → deletes account and associated transactions (cascade)
- `getCurrentBalance(id)` → initial balance + sum of income − sum of expenses
- `existsByName(name, excludeId?)` → duplicate check

### categoryRepo
- `list(userId, type?)` → all or filtered by type
- `create(data)` → new category
- `update(id, data)` → modify name, icon, color
- `delete(id)` → deletes category and associated transactions (cascade)
- `existsByName(name, excludeId?)` → duplicate check

### transactionRepo
- `list(filters)` → by account, category, type, date range, and optional `tagIds` (OR logic, with untagged support)
- `create(data)` / `createWithTags(data, tagIds)` → new transaction (+ tags)
- `update(id, data)` / `updateWithTags(id, data, tagIds)` → modify transaction (+ tags)
- `delete(id)` / `deleteByAccountId(accountId)` → delete transaction(s)
- `totalByPeriod(accountId, type, start, end)` → grouped SUM
- `breakdownByCategories(accountId, type, start, end)` → aggregation by category
- `breakdownByCategoryAndTag(...)` → aggregation by tag (includes "Untagged" row)
- `getTagsByTransactionId(id)` / `getTagsByTransactionIds(ids)` → tags for transaction(s)
- `reassignCategory(oldId, newId)` → move transactions when deleting a category

### tagRepo
- `list(userId)` → all tags by creation order
- `create(data)` → new tag
- `update(id, data)` → rename
- `delete(id)` → deletes tag and junction links (cascade)
- `existsByName(userId, name, excludeId?)` → duplicate check
- `getByTransactionIds(ids)` → tags for a batch of transactions

### configRepo
- `get()` → full `Config` (merged with defaults)
- `save(partial)` → upsert config keys

## Seed data (default)

When the database is created for the first time:

1. A default user is created (`id = 1`, name `User`, currency `€`).
2. One account is inserted: `My Wallet` (`id = 1`, `initial_balance: 0`, icon `wallet-outline`, color `#22D3EE`).
3. 18 universal categories are inserted (5 income + 13 expense) with fixed IDs 1–18, including `Others` (15) and `Other` (18).
4. `transactions` and `tags` start empty.

## Web fallback

`webStorage.ts` mirrors every repository method using `localStorage` keys prefixed with `@Finly/` (`users`, `accounts`, `categories`, `transactions`, `tags`, `transaction_tags`). Tag filtering, breakdowns, and cascading deletes are implemented in JavaScript.

## Verification

Run `npx expo start` (native) and `npx expo start --web`. Verify that:
- The database is created without errors.
- Default data is loaded correctly on first launch.
- Accounts, categories, transactions, and tags can be created.
- Aggregation and tag-breakdown queries return correct values.
- All acceptance criteria from `1-spec.md` are met.
