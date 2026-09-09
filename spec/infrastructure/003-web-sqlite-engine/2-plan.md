# 003 — Implementation plan

## Architecture

### New files

| File | Purpose |
|---|---|
| `src/database/sqliteWeb.ts` | `SqlJsDatabase` class (implements `DatabaseHandle` over sql.js) + `initSqlJsEngine()` / `createSqlJsDatabase()`. Shared by the web engine and the vitest mock. |
| `src/database/storage/indexedDb.ts` | `createIndexedDbStorage()` — IndexedDB-backed `DatabaseStorage` (get/set bytes). |
| `src/database/engine.ts` | Native engine factory: `openEngine(name)` → `openDatabaseSync(name)`. |
| `src/database/engine.web.ts` | Web engine factory: loads the wasm asset (`locateFile`), reads persisted bytes, returns a `SqlJsDatabase` bound to IndexedDB storage. |
| `src/database/wasm.d.ts` | `declare module '*.wasm'` so the asset import type-checks. |
| `metro.config.js` | Adds `wasm` to `assetExts` so Metro bundles `sql-wasm-browser.wasm`. |
| `tests/database/sqliteWebEngine.test.ts` | Engine unit tests: API results, migration boot on the engine, persistence round-trip across "reload", transaction persist/rollback behavior. |

### Modified files

| File | Change |
|---|---|
| `src/database/types.ts` | Add `DatabaseBindValue`, `DatabaseRunResult`, `DatabaseHandle` (the async API subset). |
| `src/database/database.ts` | `getDatabase()` becomes async, backed by `openEngine`; `initDatabase()`/`resetDatabase()` work on any `DatabaseHandle`. |
| `src/database/migrations/001_initial.ts`, `002_seed.ts`, `003_config.ts` | Parameter type `SQLiteDatabase` → `DatabaseHandle`. |
| `src/database/repositories/*.ts`, `photoCleanup.ts` | `const db = getDatabase()` → `const db = await getDatabase()`. |
| `src/database/index.ts` | Remove the `isWeb` swap; export only the native repositories. |
| `src/database/webStorage.ts` | **Deleted** (all `web*` repos, `initWebStorage`, `@Finly/` keys). |
| `App.tsx` | Always `await initDatabase()`. |
| `src/screens/settings/DataScreen.tsx` | Always `await resetDatabase()`; drop the `localStorage.clear()`/`initWebStorage` branch. |
| `package.json` | `sql.js` moves from devDependencies → dependencies. |
| `tests/database/sqliteMock.ts` | Re-uses `SqlJsDatabase`/`initSqlJsEngine` from `src/database/sqliteWeb.ts`; same public exports. |
| `tests/database/webContract.test.ts` | **Deleted** — replaced by `sqliteWebEngine.test.ts`. The repo contract now runs once (`sqliteContract`) over the shared engine. |
| `tests/database/dbDrift.test.ts` | Remove the localStorage parity test; `SQLiteDatabase` casts → `DatabaseHandle`. |

Unchanged: repo logic/SQL, migration semantics, seed data, the `PRAGMA user_version` runner, and every screen/component that consumes `accountRepository` … `tagRepository`.

---

## Key decisions

- **sql.js, one engine, both backends.** The exact engine the Phase B contract suite already runs on becomes the production web engine, so web parity is structural instead of enforced by a second repo set.
- **Async `getDatabase()`.** The web engine init (`initSqlJs` + IndexedDB read) is genuinely async, so `getDatabase()` returns `Promise<DatabaseHandle>` on every platform. The change is mechanical (repos already `await` every call).
- **`getDatabase()` throws if used before `initDatabase()` on web.** The app always awaits `initDatabase()` before rendering; native keeps lazy open for the test mock. `engine.web.ts` returns an engine created eagerly; `database.ts` guards the first call.
- **Persistence: serialize + await, batched at transaction boundaries.** A `persistQueue` writes `db.export()` after each committed mutation at transaction depth 0; statements inside a transaction never persist mid-flight. `runAsync`/`execAsync`/`withTransactionAsync` resolve only after their write is durable.
- **No `@Finly/` data migration.** Web is a dev/preview target and its `localStorage` rows are test data; first run on the new engine starts empty and reseeds (recorded in this plan, `fresh start` decision).
- **Tests: single contract, engine-level web tests.** With one repo set there is no second backend to parity-test. `sqliteContract.test.ts` becomes the repo contract; the new engine test covers web-specific concerns (boot migrations, persistence round-trip, transaction boundaries).
- **WASM as a Metro asset, not base64.** `sql.js` ships a browser build (`sql-wasm-browser.wasm`) and its `locateFile` hook; Metro serves the asset URL. If the asset approach proves flaky in the browser spike, fall back to base64-embedding the wasm in a module.

---

## Dependencies

- `sql.js@^1.14.1` → production (already in devDependencies; used by tests today).
- `@types/sql.js` stays a dev dependency.
- No new runtime packages for IndexedDB (native browser API).

---

## Estimate

~16 files touched (9 source incl. deletions, 4 tests, 1 dependency manifest, 2 app/config), ~700 lines. Implementation + spec + verification ~1 day.
