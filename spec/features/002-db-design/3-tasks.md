# Tasks — 002 Local database design
Execution order. All tasks completed.

[x] T1 — Install `expo-sqlite`. Create `src/database/` folder with `database.ts`, `types.ts`, `index.ts`, and `migrations/`.

[x] T2 — Implement `database.ts`: open connection and run `createSchema()` → `seedData()` → `seedConfig()` (no versioned migrations in dev).

[x] T3 — Write `migrations/001_initial.ts` (`createSchema`): CREATE TABLE for users, accounts, categories, transactions, tags, transaction_tags, config + indexes.

[x] T4 — Write `migrations/002_seed.ts` (`seedData`): insert default user, "My Wallet" account, and 18 universal categories (INSERT OR IGNORE).

[x] T5 — Write `migrations/003_config.ts` (`seedConfig`): insert config defaults including theme, first_day_of_week, currency, decimal_separator, language, text_size, category_icon_shape, account_icon_shape.

[x] T6 — Implement `types.ts` with TypeScript interfaces: `User`, `Account`, `Category`, `Transaction`, `Tag`, `TransactionTag`, `Config`.

[x] T7 — Implement `userRepo.ts`: create, getById, update.

[x] T8 — Implement `accountRepo.ts`: list, create, update, delete, getCurrentBalance, existsByName.

[x] T9 — Implement `categoryRepo.ts`: list (with optional filter by type), create, update, delete, existsByName.

[x] T10 — Implement `transactionRepo.ts`: list with filters (account, category, type, date range, tagIds), create, createWithTags, update, updateWithTags, delete, deleteByAccountId, totalByPeriod, breakdownByCategories, breakdownByCategoryAndTag, getTagsByTransactionId(s), reassignCategory.

[x] T11 — Implement `tagRepo.ts`: list, create, update, delete, existsByName, getByTransactionIds.

[x] T12 — Implement `configRepo.ts` + `webConfigRepo`: get, save.

[x] T13 — Implement `webStorage.ts`: localStorage fallback mirroring all repositories with tag filtering, breakdowns, and cascade deletes.

[x] T14 — Implement `index.ts`: Platform.OS switching (SQLite on native, localStorage on web).

[x] T15 — Update `AppContext.tsx` and `ConfigContext.tsx` to use the repositories instead of mock data.

[x] T16 — Verification: test that the database is created, default data is loaded, CRUD works, and aggregations return correct data (native + web).
