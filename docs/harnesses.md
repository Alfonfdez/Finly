# Finly — Testing & Verification Harnesses

This document describes the harnesses that guarantee the code generated in this project is
correct, tested, and aligned with its specs. It is the single reference for how Finly is
verified, and it is updated as new harnesses land (each phase).

## Verification loop (what "done" means)

After every code change, the agent runs:

```bash
cd FinlyApp
npm run test:all
```

`test:all` = `npm run typecheck && npm run lint && npm run test`. A change is only "done"
when all three stages pass. For spec features, the `verification-loop` skill then checks the
acceptance criteria in a real browser.

## Harness stack

| Harness | Tooling | Status | Covers |
|---------|---------|--------|--------|
| Pure-logic unit tests | Vitest + happy-dom | ✅ Implemented (Phase A) | Calculator, formatters, amount input, category sorting, tag maps, color utils, DB query builders |
| Type-checking | `tsc --noEmit` (strict) | ✅ Implemented | Whole codebase types, `verbatimModuleSyntax` enforced |
| Linting | `npx expo lint` (eslint-config-expo) | ✅ Implemented | Code style, unused imports, React hooks rules |
| Dual-storage contract suite | Vitest + sql.js (real SQLite in Node) | ✅ Implemented (Phase B) | Web (`localStorage`) vs native (SQLite) repo parity + DB drift vs types |
| UI / E2E verification | Playwright MCP + `verification-loop` skill | 🔜 Planned (Phase C) | Spec acceptance criteria in a live Expo web app |
| SDD alignment | `spec/` + changelog + test mapping | ✅ In use | Every feature spec maps to tests + changelog entries |

Deferred (not planned yet): React Native Testing Library (RNTL) component tests, Zod/Drizzle
schemas, eslint-plugin-boundaries, CI pipeline.

## Phase A — Pure-logic unit tests (implemented)

Runner: **Vitest** (`environment: 'happy-dom'`, tests under `FinlyApp/tests/`).

Only modules free of React Native / Expo imports are tested, so the suite runs in plain Node.
Regression seeds come from real bugs previously fixed in this project.

| Test file | Module under test |
|-----------|-------------------|
| `tests/utils/calculator.test.ts` | `src/utils/calculator.ts` — precedence, decimals, comma separator, `MAX_VALUE`, division by zero, invalid operator sequences |
| `tests/utils/formatters.test.ts` | `src/utils/formatters.ts` — `formatCurrency` (2-decimal rounding / float artifacts), signed currency, DB date conversion, period ranges, font scaling, week/day helpers |
| `tests/utils/amountInput.test.ts` | `src/utils/amountInput.ts` — 9-integer / 2-decimal rules, separator normalization, display formatting |
| `tests/utils/categoryUtils.test.ts` | `src/utils/categoryUtils.ts` — `Others`/`Other` forced last, alphabetical order, no input mutation |
| `tests/utils/transactionTags.test.ts` | `src/utils/transactionTags.ts` — tag grouping by transaction |
| `tests/utils/color.test.ts` | `src/utils/color.ts` — `withAlpha` clamping and rounding |
| `tests/database/helpers.test.ts` | `src/database/helpers.ts` — `isTotalAccount`, `buildUpdateQuery`, `buildNameExistsQuery` |

## Phase B — Dual-storage contract suite (implemented)

Finly stores data in **SQLite (native)** and **localStorage (web)** through mirror
repositories selected in `src/database/index.ts`. The two layers have historically drifted
(sort order, `COALESCE`/`HAVING` untagged rows, category usage type filter). The contract
suite eliminates that drift:

- One shared scenario suite (CRUD, `existsByName` + `excludeId`, balances/total-account,
  `reassignAndDelete`, `totalByPeriod`, breakdowns, tag cascade, config defaults, category
  usage counts) executed against **both** backends, asserting exact values **and order**.
- **Web backend**: `webStorage.ts` repos over a fresh `localStorage` (happy-dom).
- **Native backend**: native repos over `expo-sqlite` **mocked with sql.js** — real SQLite
  running in Node (WASM), so true SQL semantics are exercised without a device.
- **DB drift test**: after running migrations on sql.js, `PRAGMA table_info` must match
  `src/database/types.ts` and the web storage fields; seed row counts must match the seed
  data. This catches a column added to a migration that types or web storage forgot.

Test files (under `FinlyApp/tests/database/`):

| Test file | What it verifies |
|-----------|------------------|
| `contractSuite.ts` + `contractTypes.ts` | The shared scenario suite run against a `ContractBackend` (web and native runners are two instances of it) |
| `sqliteContract.test.ts` | Native repos (`account/category/tag/transaction/config`) over the sql.js mock pass the suite |
| `webContract.test.ts` | Web repos (`webStorage.ts`) pass the same suite |
| `sqliteMock.ts` | `expo-sqlite` → sql.js adapter (`run/getAll/getFirst/exec/withTransaction`, `lastInsertRowid` via `SELECT last_insert_rowid()`, eager sql.js init so fresh module copies work after `vi.resetModules()`) |
| `dbDrift.test.ts` | Schema drift: 7 tables' `PRAGMA table_info` vs declared columns, every `types.ts` field covered by a migration column, `user_version` 3, seed counts (1 user / 2 accounts / 31 categories / 0 transactions), config rows == `DB_KEY_MAP`, init idempotence, web parity |

Run the suite alone with `npx vitest run tests/database/` (or all harnesses with `npm run
test:all`).

**Drift found and fixed by the contract suite** — native name sorts were binary
(`ORDER BY name`) while web used `localeCompare` (case-insensitive), so `alpha` sorted after
`Beta` on native. Standardized native to case-insensitive collation:
`accountRepo.list` and `categoryRepo.list` → `ORDER BY name COLLATE NOCASE`,
`transactionRepo.searchComments` → `ORDER BY description COLLATE NOCASE`, and
`transactionRepo.getCategoryUsageCounts` → `ORDER BY count DESC, c.name COLLATE NOCASE ASC`.
A mixed-case ordering test in the suite guards this.

## Phase C — Codified loop + E2E (planned)

- `opencode.jsonc`: enable the Playwright MCP server and allow the verification scripts.
- `AGENTS.md`: document that "verified" means `npm run test:all` green and that changes to
  `src/utils/` / `src/database/` logic must include or update tests.
- `verification-loop` skill: run `test:all`, then boot `npx expo start --web` and check each
  spec's acceptance criteria in a real browser (viewport 375px for responsive criteria).

## Adding a test

1. Create `FinlyApp/tests/<area>/<module>.test.ts` (mirror the module path).
2. Import only pure modules (no `react-native` / `expo-*` runtime imports); if a module
   imports those, mock them or keep it out of Phase A scope.
3. Cover: normal cases, edge cases, and at least one regression seed per previously fixed bug.
4. Run `npm run test` (or `npm run test:watch`) and `npm run test:all` before finishing.
