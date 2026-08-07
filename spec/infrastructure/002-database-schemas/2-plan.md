# 002 — Implementation plan

## Architecture

### New files

| File | Purpose |
|---|---|
| `src/database/schemas.ts` | One Zod schema per table + `configSchema`; enums built from `src/constants/types.ts` and `src/constants/languages.ts`. |
| `src/database/validate.ts` | `parseRow` / `parseRows` / `parseRowOrNull` — safeParse + descriptive throw. |
| `tests/database/schemas.test.ts` | Schema accept/reject matrix + config fallback. |

### Modified files

| File | Change |
|---|---|
| `src/database/types.ts` | Interfaces replaced by `z.infer<typeof …>` re-exports (same names). |
| `src/database/configDefaults.ts` | Add `sanitizeConfig(config)` (safeParse → data or `DEFAULT_CONFIG`). |
| `src/database/repositories/accountRepo.ts` | Validate `list` / `getById` reads. |
| `src/database/repositories/categoryRepo.ts` | Validate `list` reads. |
| `src/database/repositories/tagRepo.ts` | Validate `list` reads. |
| `src/database/repositories/transactionRepo.ts` | Validate `list` / `getById` reads. |
| `src/database/repositories/configRepo.ts` | `get()` returns `sanitizeConfig(...)`. |
| `src/database/webStorage.ts` | `getStore(key, schema)` validates reads; all entity stores pass their schema; `webConfigRepo.get()` sanitizes. |
| `tests/database/dbDrift.test.ts` | New test: schema keys exactly match migration columns. |
| `package.json` | `zod@^4` dependency. |

Unchanged: migrations (`001_initial`/`002_seed`/`003_config`), the migration runner in `database.ts`, and every screen/component that consumes the types.

---

## Key decisions

- **Zod only, not Drizzle.** Drizzle's `expo-sqlite` driver cannot cover the web backend (`localStorage`, not SQLite-in-browser), so adopting it would fork the query paths and break the Phase B parity contract. Drizzle stays deferred until web storage moves to a real SQLite engine. Zod is pure JS and validates both backends identically.
- **Validate on read, not write.** Reads are the boundary where drift/corruption surfaces; writes already go through typed create/update signatures. This keeps validation cost off hot save paths.
- **Schema keys vs columns exact-match test** makes the Zod schema the drift source of truth, replacing the hand-maintained column table for entity tables.
- **Config fallback to `DEFAULT_CONFIG` on any invalid field** is intentionally coarse: defaults are the guaranteed-valid baseline, and a corrupt stored value (manual edit, stale version) is a rare external event.

---

## Dependencies

- `zod@^4` — pure-JS validation, compatible with React Native 0.81 / Expo SDK 54 / vitest.
- Existing repos, contract suite, and seed data — unchanged semantics.

---

## Estimate

~10 files touched (7 source, 2 tests, 1 dependency manifest), ~350 lines. Implementation + spec + verification ~half a day.
