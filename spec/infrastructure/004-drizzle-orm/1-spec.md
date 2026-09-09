# 004 — Drizzle ORM data layer over the shared DatabaseHandle

- **Objective**
Adopt Drizzle ORM as the query layer of the data access layer. The five repositories stop composing raw SQL strings and instead use the Drizzle query builder against tables declared in a single schema module. Drizzle runs on **both** native and web through the existing `DatabaseHandle` abstraction via a `sqlite-proxy` adapter, so there is still exactly one repository implementation and one engine per platform — no behavior change and no new migration system.

---

## Background

Repositories currently hand-build SQL strings (`SELECT … WHERE 1=1` + conditional clauses, hand-rolled `IN` placeholders, `COALESCE`/`CASE`/`TRIM` fragments, subqueries for tag filtering). Every aggregate and join (balances, tag breakdowns, category usage counts, comment suggestions) is raw text that must stay in sync with the schema by hand, and drift is only caught by the Phase B contract suite.

Drizzle was deferred since `003-web-sqlite-engine` because its `expo-sqlite` driver could only drive native, while web uses the custom `DatabaseHandle` (`SqlJsDatabase` over sql.js). This feature removes that blocker: `drizzle-orm/sqlite-proxy` drives **any** callback that maps `(sql, params, method) → rows`, and the existing `DatabaseHandle` is exactly that. The contract suite, migrations, `PRAGMA user_version` runner, Zod validation and backup/import tooling all stay in place.

---

## Functional requirements

### 1. Adapter over DatabaseHandle

- A new `src/database/drizzle/proxy.ts` exposes `createSqliteProxyCallback(getHandle)` returning the Drizzle remote callback:
  - `run` → `db.runAsync` → returns `{ rows: [{ lastInsertRowId, changes }] }`.
  - `get` → `db.getFirstAsync` → returns `{ rows: [row] }` or `{ rows: null }` when absent.
  - `all`/`values` → `db.getAllAsync` → rows as **positional arrays** (Drizzle maps results by column index, not by name).
  - It also exports `runResultOf(result)` to read `{ lastInsertRowId, changes }` from a `run` result.
- `src/database/drizzle/engine.ts` caches a singleton `drizzle(...)` instance created with `createSqliteProxyCallback(getDatabase)` and the schema module, and exports `withTransaction(task)` which wraps `DatabaseHandle.withTransactionAsync` (Drizzle's own `db.transaction()` is **not** used: it would emit raw `BEGIN`/`COMMIT` through the proxy and break web's persist-on-commit batching).

### 2. Schema module

- `src/database/drizzle/schema.ts` declares the seven tables (`users`, `accounts`, `categories`, `transactions`, `tags`, `transaction_tags` with composite primary key, `config`) exactly mirroring `migrations/001_initial.ts`, including defaults (`currency`, `icon`, `color`, `is_total`, `created_at` = `datetime('now','localtime')`).

### 3. Repositories use the query builder

- `accountRepo`, `categoryRepo`, `tagRepo`, `transactionRepo`, `configRepo` are rewritten to Drizzle `select`/`insert`/`update`/`delete` with the same behavior:
  - Writes go through `.run()` (persist-on-commit path on web). `.returning()` is **not** used — on web it runs via `getAllAsync` and would never persist.
  - Multi-statement operations (`deleteAllTransactions`, `category.delete`, `reassignAndDelete`, `createWithTags`, `updateWithTags`) keep transaction semantics via `withTransaction`.
  - Collations and function usage that have no builder equivalent stay as parameterized `sql\`…\`` fragments (e.g. `COLLATE NOCASE` ordering, `LOWER()` name checks, `TRIM()` comment grouping, `CASE WHEN` comment-suggestion ranking, `COALESCE(SUM(…))` balances).
  - Public exports of `src/database/index.ts` are unchanged.

### 4. Dead helpers removed

- `buildUpdateQuery` and `buildNameExistsQuery` in `src/database/helpers.ts` are deleted (their callers moved to the builder). `UNTAGGED_ID` and `isTotalAccount` remain (still used by screens, context and hooks).

---

## Non-functional requirements

- **No behavior change.** Same queries, same ordering, same transaction boundaries; the Phase B contract suite passes unchanged (it still runs over `SqlJsDatabase` via the mock).
- **No new migration system.** `PRAGMA user_version` runner, migration files and seed/config steps are untouched; `drizzle-kit` is not introduced.
- **Web persistence intact.** Every write that must persist goes through `.run()`, which the proxy routes to `runAsync` → commit → IndexedDB write.
- **Zod stays.** Runtime validation and the drift contract stay as-is; Drizzle adds typed columns on top, not a replacement validator.
- **Single dependency.** Only `drizzle-orm` is added; no codegen, no CLI, no config file.

---

## Acceptance criteria

- [x] `src/database/drizzle/proxy.ts` maps the four proxy methods onto `DatabaseHandle` with positional rows, `{ rows: null }` on empty `get`, and `lastInsertRowId`/`changes` surfaced through `runResultOf`.
- [x] `src/database/drizzle/engine.ts` provides the singleton `getDrizzle()` and `withTransaction(task)` (wrapping `withTransactionAsync`); `db.transaction()` is not used anywhere.
- [x] `src/database/drizzle/schema.ts` declares the seven tables matching `001_initial` (names, types, NOT NULL, defaults, composite PK); `tests/database/drizzleDrift.test.ts` proves the drizzle columns equal `PRAGMA table_info` after migration.
- [x] All five repositories are rewritten to Drizzle builders; `npm run test:all` passes (typecheck + lint + the full suite, including the unchanged contract suite).
- [x] `buildUpdateQuery` / `buildNameExistsQuery` and their test cases are removed; `UNTAGGED_ID` / `isTotalAccount` are preserved.
- [x] `src/database/index.ts` exports are unchanged (no screen/context/hook edits).
- [x] `package.json` lists `drizzle-orm@^0.45.2` as a dependency; no `drizzle-kit`, no config file.
- [x] Browser verification (verification-loop skill, 375px): transactions CRUD, backup export/import, and tag/category limit indicators work identically over the Drizzle-backed repos on web.
- [x] `docs/changelog.md`, `docs/programming-concepts.md` and `spec/constitution/3-roadmap.md` are updated.
