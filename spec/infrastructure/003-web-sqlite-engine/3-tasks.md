# 003 — Tasks

## Phase 0 — Dependency & bundling spike

- [x] T1 — Move `sql.js` from `devDependencies` to `dependencies` in `package.json` (+ lockfile).
- [x] T2 — Add `metro.config.js` with `wasm` in `assetExts`; add `src/database/wasm.d.ts` module declaration.
- [x] T3 — Confirm the web bundle serves `sql-wasm-browser.wasm` and `initSqlJs({ locateFile })` loads in a browser (spike; base64 fallback if the asset path fails).

## Phase 1 — Shared engine

- [x] T4 — Add `DatabaseBindValue` / `DatabaseRunResult` / `DatabaseHandle` to `src/database/types.ts`.
- [x] T5 — Create `src/database/sqliteWeb.ts` (`SqlJsDatabase` + `initSqlJsEngine` + `createSqlJsDatabase`, serialized IndexedDB-style persistence via a `DatabaseStorage` interface, no persistence while a transaction is open).
- [x] T6 — Create `src/database/storage/indexedDb.ts` (`createIndexedDbStorage`).

## Phase 2 — Single backend

- [x] T7 — Create `src/database/engine.ts` (native) and `src/database/engine.web.ts` (web) `openEngine` factories.
- [x] T8 — Rework `src/database/database.ts`: async `getDatabase()` via `openEngine`; `initDatabase()`/`resetDatabase()` unchanged in behavior.
- [x] T9 — Migrations (`001/002/003`) typed against `DatabaseHandle`.
- [x] T10 — Repos + `photoCleanup`: `await getDatabase()`.
- [x] T11 — `src/database/index.ts` exports only native repos; **delete** `src/database/webStorage.ts`.
- [x] T12 — `App.tsx` and `DataScreen.tsx` use `initDatabase()` / `resetDatabase()` on all platforms.

## Phase 3 — Tests

- [x] T13 — Refactor `tests/database/sqliteMock.ts` onto the shared `SqlJsDatabase`.
- [x] T14 — New `tests/database/sqliteWebEngine.test.ts`: API results, migration boot on the engine, persistence round-trip across reload, transaction persist/rollback.
- [x] T15 — Delete `tests/database/webContract.test.ts`; update `dbDrift.test.ts` (drop localStorage parity test, `DatabaseHandle` casts).
- [x] T16 — `npm run test:all` passes (typecheck + lint + tests).

## Phase 4 — Verification

- [x] T17 — Web verification loop: fresh IndexedDB seeds the app, CRUD persists across a reload, "delete all data" reseeds.

## Phase 5 — Documentation

- [x] T18 — Update `.agents/skills/verification-loop/SKILL.md` (fresh install = clear IndexedDB `Finly.db`).
- [x] T19 — Update `AGENTS.md` (DATABASE + VERIFICATION sections) and `spec/constitution/7-platform-differences.md` (storage matrix, SQLite now on both platforms).
- [x] T20 — Add `003-web-sqlite-engine` to `spec/constitution/3-roadmap.md`; update `docs/harnesses.md` and `docs/changelog.md`.
