# 004 — Implementation plan

## Architecture

### New files

| File | Purpose |
|---|---|
| `src/database/drizzle/schema.ts` | Drizzle table definitions (7 tables) mirroring `migrations/001_initial.ts`. |
| `src/database/drizzle/proxy.ts` | `createSqliteProxyCallback(getHandle)` (remote callback for `sqlite-proxy`), `runResultOf`, `ProxyMethod`/`SqliteProxyCallback` types. |
| `src/database/drizzle/engine.ts` | `getDrizzle()` singleton (lazy `drizzle(callback, { schema })`) + `withTransaction(task)` wrapping `withTransactionAsync`. |
| `tests/database/drizzleProxy.test.ts` | Adapter unit tests over the sql.js mock: run/get/all/values, positional rows, `{ rows: null }`, error propagation, `runResultOf`. |
| `tests/database/drizzleDrift.test.ts` | Drizzle schema vs `PRAGMA table_info` drift test (names, types, NOT NULL for non-PK columns). |

### Modified files

| File | Change |
|---|---|
| `src/database/repositories/accountRepo.ts` | Rewritten with Drizzle: `list` (order by `is_total DESC, name COLLATE NOCASE`), `create`/`update` via `.run()`, `delete` (photo cleanup + `withTransaction`), `getBalances` (left join + `COALESCE(SUM(CASE …))`), `existsByName` (`LOWER()`). |
| `src/database/repositories/categoryRepo.ts` | Rewritten: `list`/`create`/`update`, `delete`/`reassignAndDelete` via `withTransaction`, `existsByName`. |
| `src/database/repositories/tagRepo.ts` | Rewritten: `list`/`create`/`update`/`delete`/`deleteMany` (`inArray`)/`existsByName` (`LOWER()`). |
| `src/database/repositories/transactionRepo.ts` | Rewritten: filterable `list` (incl. untagged/`NOT EXISTS` tag logic), `createWithTags`/`updateWithTags`/`deleteAllTransactions` via `withTransaction`, `searchComments`/`getDistinctComments`/`updateComment`/`deleteComment`/`deleteComments`/`countByDescription` (TRIM/LIKE fragments), `breakdownByCategoriesAndTags`, `getTagsByTransactionId(s)`, `getCategoryUsageCounts`. |
| `src/database/repositories/configRepo.ts` | Rewritten: `get` (typed `select` + existing parsing/sanitize), `save` (`onConflictDoUpdate` upsert). |
| `src/database/helpers.ts` | Delete `buildUpdateQuery` + `buildNameExistsQuery`; keep `UNTAGGED_ID` + `isTotalAccount`. |
| `tests/database/helpers.test.ts` | Remove the two deleted helpers' test cases. |
| `package.json` | Add `drizzle-orm@^0.45.2` to dependencies. |

Unchanged: `types.ts`, `schemas.ts` (Zod), `validate.ts`, `database.ts`, migrations, seed/config, `sqliteWeb.ts`, `engine*.ts`, `backup*.ts`, `photoCleanup.ts`, `configDefaults.ts`, `index.ts` exports, and every screen/component that consumes `accountRepository` … `tagRepository`.

---

## Key decisions

- **`sqlite-proxy` over the shared `DatabaseHandle`.** One repo implementation drives both native (expo-sqlite) and web (sql.js) with zero dual-path drift. The proxy returns positional rows because Drizzle maps results by column index (`mapResultRow` → `row[columnIndex]`).
- **Writes go through `.run()`, never `.returning()`.** On web, `.returning()` executes via `getAllAsync` and skips persistence; `.run()` routes to `runAsync`, which persists at commit. Creates read `lastInsertRowId` from the run result instead.
- **No Drizzle transactions.** `db.transaction()` would push raw `BEGIN`/`COMMIT` statements through the proxy, bypassing web's persist-on-commit batching. `withTransaction(task)` wraps the existing `DatabaseHandle.withTransactionAsync`.
- **`sql` fragments allowed for what the builder cannot express** (the one trade-off the developer accepted): `COLLATE NOCASE`, `LOWER()`, `TRIM()`, `LIKE` with ranking `CASE WHEN`, `COALESCE(SUM(CASE …))` breakdowns. All values inside fragments are parameters; the only raw literal is the constant `UNTAGGED_LABEL`.
- **No `drizzle-kit`, no codegen, no config file.** The app keeps its own migration runner (`PRAGMA user_version`) and Zod validation. Drizzle is a typed query builder only.
- **Backup tooling stays on the raw handle.** `backup.ts`/`backupService.ts` operate on exported DB bytes, not SQL, and are untouched.
- **Dead helpers deleted.** `buildUpdateQuery`/`buildNameExistsQuery` had no callers left after the rewrite; their SQL-string-building behavior is replaced by the builder.

---

## Dependencies

- `drizzle-orm@^0.45.2` (runtime dependency; pure ESM/JS, no native code, works in Metro).
- No `drizzle-kit`, no config file.

---

## Estimate

~13 files touched (5 repos, 3 new source, 1 helper, 2 tests new, 2 tests modified, 1 dependency manifest), ~1,200 lines. Implementation + spec + verification ~1 day.
