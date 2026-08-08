# 003 — Unified web data layer on SQLite (sql.js)

- **Objective**
Run the **same** repository implementation and migrations on web as on native by replacing the `localStorage`/JSON backend (`src/database/webStorage.ts`) with a real SQLite engine compiled to WebAssembly (sql.js) persisted in IndexedDB. After this feature there is a single backend: SQLite. Web loses its mirrored repo set, and every SQL-only capability (filtering, joins, aggregates) works identically on all platforms.

---

## Background

Before this feature the storage layer was split:

| Platform | Engine | Repos |
|----------|--------|-------|
| iOS / Android | `expo-sqlite` | `src/database/repositories/*.ts` |
| Web | `localStorage` (JSON) | `src/database/webStorage.ts` (`webAccountRepo` … `webConfigRepo`) |

The two backends had to stay in behavior parity, enforced by a Phase B contract suite running each repo set. Every native SQL feature had to be reimplemented in hand-rolled JavaScript (filtering, tag joins, breakdown aggregates, usage counts), which drifted repeatedly (see changelog history). `localStorage` also caps out around 5 MB, which is why photos are hidden on web.

Drizzle ORM was already deferred in `spec/infrastructure/002-database-schemas` for exactly this reason: its `expo-sqlite` driver covers native only, while web had no SQLite-in-browser engine. This feature removes that blocker by giving web a real SQLite engine.

sql.js is the same SQLite (compiled with Emscripten to WebAssembly) the test suite already uses: `tests/database/sqliteMock.ts` wraps it behind the expo-sqlite async API and every Phase B contract test runs against it today.

---

## Functional requirements

### 1. Production web engine

- A new `src/database/sqliteWeb.ts` provides a `SqlJsDatabase` class that implements the same async API subset the app uses (`execAsync`, `runAsync`, `getFirstAsync`, `getAllAsync`, `withTransactionAsync`) over sql.js, typed as a shared `DatabaseHandle`.
- On web the WASM build loads via `initSqlJs({ locateFile })`; the `sql-wasm-browser.wasm` file ships with the app bundle (static asset; `wasm` added to Metro `assetExts`).
- The engine persists to **IndexedDB** (`Finly.db`): the database bytes are loaded on init (`new SQL.Database(bytes)`), and after every committed mutation the exported bytes (`db.export()`) are written back through a serialized queue. Persistence is a strict superset of the previous `localStorage` behavior, so "fresh install" now means an empty IndexedDB.
- The engine never persists while a transaction is open (only after commit), so a rolled-back transaction can never write uncommitted state to disk.

### 2. Single backend

- `src/database/database.ts` becomes engine-agnostic: `getDatabase()` returns a `DatabaseHandle` obtained from a platform-resolved factory `src/database/engine.ts` (native → `openDatabaseSync`) / `engine.web.ts` (web → sql.js engine + IndexedDB).
- `initDatabase()` runs the exact same migration + seed path on every platform (both are real SQLite, `PRAGMA user_version` logic unchanged). Web no longer needs a separate seed path.
- `src/database/index.ts` drops the `isWeb` switch and always exports the native repositories.
- `src/database/webStorage.ts` (all five `web*` repos + `initWebStorage` + the `@Finly/` localStorage keys) is **deleted**.
- Web persistence layout note: the old `@Finly/` localStorage data is **not migrated**; web is a dev/preview target and starts fresh (decision recorded in `2-plan.md`).

### 3. Init & data-reset cleanup

- `App.tsx` initializes via `initDatabase()` on all platforms (no `initWebStorage`).
- `DataScreen` "Delete all data" calls `resetDatabase()` on every platform (no `localStorage.clear()` branch).

---

## Non-functional requirements

- **No behavior change for native.** The native SQLite path and repos are untouched in behavior; only the `getDatabase()` handoff becomes async.
- **No dual-path drift.** The Phase B contract suite now exercises the single repo set over the single engine.
- **Performance:** sql.js runs synchronously in the browser on a background-free main thread; writes are batched at transaction boundaries (one IndexedDB write per committed transaction, not per statement). Quota is IndexedDB (~50 MB+), far beyond the old 5 MB localStorage ceiling.
- **Dependency change:** `sql.js` moves from `devDependencies` to `dependencies` (it now ships in the web bundle). `@types/sql.js` stays a dev dependency.
- **Platforms:** iOS / Android unchanged (expo-sqlite); web now real SQLite. Photos stay hidden on web (unchanged decision; IndexedDB makes them viable later but that is out of scope).

---

## Acceptance criteria

- [x] `sql.js` is a production dependency and `sql-wasm-browser.wasm` is served/bundled for Expo web via Metro (`assetExts` + `locateFile`).
- [x] `src/database/sqliteWeb.ts` exposes `SqlJsDatabase` (API-subset `DatabaseHandle`) with IndexedDB persistence that survives a simulated reload (create engine → mutate → create engine from stored bytes → data present).
- [x] The engine persists once per committed transaction and never while a transaction is open.
- [x] `database.ts` uses a platform-resolved `openEngine`; `getDatabase()` returns the same `DatabaseHandle` on all platforms; `initDatabase()` migrates + seeds web identically to native (`user_version` 3, 1 user / 2 accounts / 31 categories / 0 transactions / config seeded).
- [x] `src/database/index.ts` exports only the native repositories; `src/database/webStorage.ts` is deleted and no source or test references `initWebStorage` / `web*Repo` / `@Finly/` remain.
- [x] `App.tsx` and `DataScreen` initialize/reset through `database.ts` only.
- [x] `npm run test:all` passes (typecheck + lint + tests).
- [x] Browser verification (verification-loop skill): fresh context seeds the app, transactions CRUD persists across a reload, and "delete all data" reseeds — all with IndexedDB as the store.
- [x] `docs/changelog.md` and `spec/constitution/3-roadmap.md` are updated.
