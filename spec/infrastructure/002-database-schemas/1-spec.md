# 002 — Zod schema layer

- **Objective**
Make the Zod schemas in `src/database/schemas.ts` the single source of truth for every stored row shape (types derived via `z.infer`), and validate data at the storage boundary of both backends (SQLite native + localStorage web) so corrupt rows or invalid stored config never silently reach the UI.

---

## Background

Before this feature, the row shapes were **duplicated by hand** in three places:

- `src/database/migrations/001_initial.ts` — the SQL DDL (`CREATE TABLE`).
- `src/database/types.ts` — hand-written TypeScript interfaces (`User`, `Account`, …).
- `tests/database/dbDrift.test.ts` — a hard-coded expected-column table plus `satisfies` samples.

Nothing validated data at runtime. A corrupt `localStorage` row, a stale database value, or an invalid config value (e.g. `theme: "neon"` after a manual edit or an old app version) flowed silently into the UI and could produce confusing state.

The migration *runner* (`PRAGMA user_version` steps with seeds in `src/database/database.ts`) is idempotent and proven; this feature does not replace it. Drizzle ORM was considered and **deferred**: its `expo-sqlite` driver covers native only, while web uses `localStorage` (not SQLite in the browser), so Drizzle cannot cover both layers without forking the dual-storage parity that the Phase B contract suite enforces.

---

## Functional requirements

### 1. Single source of truth

- A new `src/database/schemas.ts` defines one Zod schema per table: `userSchema`, `accountSchema`, `categorySchema`, `transactionSchema`, `tagSchema`, `transactionTagSchema`, plus `configSchema` for the in-memory `Config` object.
- Schemas mirror the DDL constraints: `type` enums (`expense`/`income`), `amount > 0`, integer ids and foreign keys, nullability of `email`/`avatar`/`description`/`photo`/`updated_at`, `is_total` 0/1, `created_at`/`date` as non-empty strings.
- Config enums are built from the existing constant objects (`THEMES`, `TEXT_SIZES`, `CONFIG_ICON_SHAPES`, `PERIODS`, `LANGUAGES`, `FIRST_DAYS`, `DECIMAL_SEPARATORS`, `TRANSACTION_TYPES`) so the schema can never drift from the UI options.
- `src/database/types.ts` becomes a facade: the hand-written interfaces are replaced by `z.infer<typeof …>` types exported under the **same names** (`User`, `Account`, `Category`, `Transaction`, `Tag`, `TransactionTag`, `Config`). No import site changes anywhere in the app.

### 2. Storage-boundary validation

- `src/database/validate.ts` provides `parseRow`, `parseRows`, and `parseRowOrNull`. On failure they throw a descriptive `Data validation failed for <table>: …` error instead of returning corrupt data.
- **Native repos** validate every `SELECT *` full-row read: `accountRepo.list`/`getById`, `categoryRepo.list`, `tagRepo.list`, `transactionRepo.list`/`getById`. Aggregate/derived queries (balances, breakdowns, usage counts) are not full rows and are left unvalidated.
- **Web storage** validates in `getStore` (the single read path) for every entity store (`users`, `accounts`, `categories`, `transactions`, `tags`, `transaction_tags`).
- **Config** is validated via `configSchema` in both backends; invalid values fall back to `DEFAULT_CONFIG` (via `sanitizeConfig` in `configDefaults.ts`), so one corrupt key never nukes working settings through a full default reset while still guaranteeing a valid config object.

### 3. Drift detection

- `dbDrift.test.ts` gains a test asserting that the Zod schema keys **exactly match** the migration columns for the 6 entity tables. Adding a column to a migration without updating the schema (or vice versa) now fails the suite.

---

## Non-functional requirements

- **No behavior change** for valid data — the contract suite, component tests, and util tests pass unchanged.
- **Performance:** validation is O(rows) with a plain schema parse; negligible for the app's data volume.
- **No new runtime cost on writes** — validation happens on the read path only.
- **New dependency:** `zod` (pure JS, works on native, web, and vitest).
- **Platforms:** both native (SQLite) and web (localStorage) get the same guarantees.

---

## Acceptance criteria

- [ ] `src/database/types.ts` derives all row types from Zod schemas (`z.infer`) under the same exported names; the app compiles without touching any screen/import.
- [ ] `src/database/schemas.ts` covers all 7 tables + config, with enums sourced from the existing constant sets.
- [ ] Native repos validate full-row reads and throw on invalid rows.
- [ ] Web `getStore` validates entity rows on read.
- [ ] `configRepo.get` and `webConfigRepo.get` return `DEFAULT_CONFIG` when stored config is invalid (corrupt value or malformed JSON).
- [ ] `tests/database/schemas.test.ts` covers valid rows, invalid type/amount/id/missing-field cases, and config fallback.
- [ ] `dbDrift.test.ts` asserts schema keys == migration columns for all entity tables.
- [ ] `npm run test:all` passes.
- [ ] `changelog.md` is updated.
