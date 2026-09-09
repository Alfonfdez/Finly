# 002 — Tasks

## Phase 1 — Schema layer

- [x] T1 — Add `zod@^4` dependency to `package.json`.
- [x] T2 — Create `src/database/schemas.ts` with `userSchema`, `accountSchema`, `categorySchema`, `transactionSchema`, `tagSchema`, `transactionTagSchema`, `configSchema` (enums sourced from the constant sets).
- [x] T3 — Replace `src/database/types.ts` interfaces with `z.infer` types under the same names.
- [x] T4 — Create `src/database/validate.ts` (`parseRow`, `parseRows`, `parseRowOrNull`).
- [x] T5 — Add `sanitizeConfig` to `src/database/configDefaults.ts`.

## Phase 2 — Boundary validation

- [x] T6 — Validate full-row reads in native repos (`accountRepo.list`/`getById`, `categoryRepo.list`, `tagRepo.list`, `transactionRepo.list`/`getById`).
- [x] T7 — Validate entity rows in `webStorage.getStore` and pass the right schema at every call site.
- [x] T8 — Sanitize config in `configRepo.get` and `webConfigRepo.get`.

## Phase 3 — Tests

- [x] T9 — New `tests/database/schemas.test.ts`: valid rows, invalid type/amount/id/missing-field cases, config accept + corrupt-value fallback.
- [x] T10 — Extend `tests/database/dbDrift.test.ts`: Zod schema keys exactly match migration columns for all entity tables.

## Phase 4 — Verification

- [x] T11 — `npm run test:all` passes (typecheck + lint + 229 tests).

## Phase 5 — Documentation

- [x] T12 — Write `spec/infrastructure/002-database-schemas/` (spec + plan + tasks).
- [x] T13 — Add `002-database-schemas` entry to `spec/constitution/3-roadmap.md`.
- [x] T14 — Add Phase F row + update the deferred line in `docs/harnesses.md`.
- [x] T15 — Update `docs/changelog.md`.
