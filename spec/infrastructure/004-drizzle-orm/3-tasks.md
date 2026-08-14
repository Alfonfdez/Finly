# 004 — Tasks

## Phase 0 — Dependency

- [x] T1 — Install `drizzle-orm@^0.45.2` (runtime dependency).

## Phase 1 — Adapter and schema

- [x] T2 — `src/database/drizzle/proxy.ts`: `createSqliteProxyCallback(getHandle)` mapping `run`/`get`/`all`/`values` onto `DatabaseHandle` with positional rows; `runResultOf` helper.
- [x] T3 — `src/database/drizzle/schema.ts`: seven tables mirroring `001_initial` (names, types, NOT NULL, defaults, composite PK on `transaction_tags`).
- [x] T4 — `src/database/drizzle/engine.ts`: lazy `getDrizzle()` singleton + `withTransaction(task)`.

## Phase 2 — Repository rewrite

- [x] T5 — `accountRepo.ts` via Drizzle (order `is_total DESC, name COLLATE NOCASE`; `getBalances` left join + `COALESCE(SUM(CASE …))`; delete inside `withTransaction`).
- [x] T6 — `categoryRepo.ts` via Drizzle (`delete`/`reassignAndDelete` inside `withTransaction`).
- [x] T7 — `tagRepo.ts` via Drizzle (`deleteMany` via `inArray`).
- [x] T8 — `transactionRepo.ts` via Drizzle (filter list + untagged `NOT EXISTS`; `createWithTags`/`updateWithTags`/`deleteAllTransactions` via `withTransaction`; TRIM/LIKE comment queries; tag breakdown with `sql` fragments; category usage counts).
- [x] T9 — `configRepo.ts` via Drizzle (`onConflictDoUpdate` upsert; typed `select` + existing parsing).
- [x] T10 — Delete `buildUpdateQuery`/`buildNameExistsQuery` from `helpers.ts` (keep `UNTAGGED_ID`/`isTotalAccount`); trim `helpers.test.ts`.
- [x] T11 — Confirm `src/database/index.ts` public exports unchanged.

## Phase 3 — Tests

- [x] T12 — `tests/database/drizzleProxy.test.ts`: run/get/all/values semantics, positional rows, `{ rows: null }`, error propagation, `runResultOf`.
- [x] T13 — `tests/database/drizzleDrift.test.ts`: Drizzle columns equal `PRAGMA table_info` after migration (NOT NULL skipped for PK columns, as PRAGMA reports `notnull=0`).
- [x] T14 — `npm run test:all` passes (typecheck + lint + full suite incl. unchanged contract suite: 34 files / 271 tests).

## Phase 4 — Verification

- [x] T15 — Web verification loop (375px): transactions CRUD, backup export/import, tag/category limit indicators over the Drizzle-backed repos.

## Phase 5 — Documentation

- [x] T16 — Add `004-drizzle-orm` to `spec/constitution/3-roadmap.md`; update `docs/programming-concepts.md` (Drizzle entries) and `docs/changelog.md`; add a `## DATABASE` line to `AGENTS.md`.
