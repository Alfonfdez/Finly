# Finly — Testing & Verification Harnesses

This document describes the harnesses that guarantee the code generated in this project is
correct, tested, and aligned with its specs. It is the single reference for how Finly is
verified, and it is updated as new harnesses land (each phase).

## How to run

All commands run from the `FinlyApp/` directory.

| Harness | Command |
|---------|---------|
| Everything (typecheck + lint + tests) | `npm run test:all` |
| Unit tests (pure-logic + component) | `npm run test` (`npx vitest run`) |
| Component tests | `npx vitest run tests/component/` |
| Dual-storage contract suite | `npx vitest run tests/database/` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Web E2E (spec criteria) | `npx expo start --web` then run the `verification-loop` skill (Playwright, 375px viewport) |
| Mobile E2E (Maestro flows) | boot the emulator (`emulator -avd finly_test`), `adb reverse tcp:8081 tcp:8081`, `npx expo start`, then `maestro test .maestro/<flow>.yaml` |

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
| Component unit tests | Vitest + vitest-native + RNTL 14 | ✅ Implemented (Phase D) | 12 presentational components (79 tests) with ConfigContext stubbed |
| Type-checking | `tsc --noEmit` (strict) | ✅ Implemented | Whole codebase types, `verbatimModuleSyntax` enforced |
| Linting | `npx expo lint` (eslint-config-expo) | ✅ Implemented | Code style, unused imports, React hooks rules |
| Module-boundary linting | `eslint-plugin-boundaries` | ✅ Implemented (Phase E) | `src/` layer DAG — inverted/cyclic imports are lint errors |
| Schema layer + validation | Zod 4 (`src/database/schemas.ts`) | ✅ Implemented (Phase F) | Row types derived via `z.infer`; read-path validation in native + web backends; schema-vs-migration drift test |
| Dual-storage contract suite | Vitest + sql.js (real SQLite in Node) | ✅ Implemented (Phase B) | One shared SQLite engine (native parity via expo-sqlite mock + web via sql.js/IndexedDB), repo contract + DB drift vs types |
| UI / E2E verification | Playwright MCP + `verification-loop` skill | ✅ Implemented (Phase C) | Spec acceptance criteria in a live Expo web app |
| CI pipeline | GitHub Actions (`.github/workflows/ci.yml`) | ✅ Implemented | `npm run test:all` on every PR to `develop`/`main` and push to those branches |
| SDD alignment | `spec/` + changelog + test mapping | ✅ In use | Every feature spec maps to tests + changelog entries |

Deferred (not planned yet): Drizzle ORM (its `expo-sqlite` driver cannot drive the web's custom `DatabaseHandle` — see Phase F).

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

## Phase B — Unified SQLite engine + contract suite (implemented)

Finly stores data in **SQLite on both platforms** through one shared engine: `expo-sqlite`
on native and a **sql.js (WASM)** engine on web persisted to **IndexedDB** (the same DB bytes
are reloaded on each launch). Both expose the same `DatabaseHandle` interface
(`src/database/types.ts`), so `src/database/` holds one set of migrations and repositories
used identically on every platform. The harness guarantees that parity:

- One shared scenario suite (CRUD, `existsByName` + `excludeId`, balances/total-account,
  `reassignAndDelete`, `totalByPeriod`, breakdowns, tag cascade, config defaults, category
  usage counts) executed against the real repos over the shared sql.js engine, asserting
  exact values **and order**.
- **Engine tests**: `sqliteWebEngine.test.ts` asserts the sql.js engine's own semantics —
  `lastInsertRowId`/`changes`, persist-on-commit + reload restore, one persist per committed
  transaction (not per statement), never persisting uncommitted state, and a full schema
  boot with the expected seed counts.
- **Native parity**: the same engine backs the `expo-sqlite` mock (`sqliteMock.ts`), so the
  native repos run against real SQLite semantics in Node (WASM) without a device.
- **DB drift test**: after running migrations on sql.js, `PRAGMA table_info` must match
  `src/database/types.ts`; seed row counts must match the seed data, `user_version` must be
  3, config rows must equal `DB_KEY_MAP`, and re-init must be idempotent. This catches a
  column added to a migration that the types forgot.

Test files (under `FinlyApp/tests/database/`):

| Test file | What it verifies |
|-----------|------------------|
| `contractSuite.ts` + `contractTypes.ts` | The shared scenario suite run against a `ContractBackend` (repos over the shared engine) |
| `sqliteContract.test.ts` | The repos (`account/category/tag/transaction/config`) over the sql.js engine pass the suite |
| `sqliteMock.ts` | `expo-sqlite` → shared sql.js engine adapter (`openDatabaseSync` backed by `SqlJsDatabase`) |
| `sqliteWebEngine.test.ts` | Engine semantics: results, persistence, transactions, schema boot + seed counts |
| `dbDrift.test.ts` | Schema drift: 7 tables' `PRAGMA table_info` vs declared columns, every `types.ts` field covered by a migration column, `user_version` 3, seed counts (1 user / 2 accounts / 31 categories / 0 transactions), config rows == `DB_KEY_MAP`, init idempotence |

Run the suite alone with `npx vitest run tests/database/` (or all harnesses with `npm run
test:all`).

**Drift found and fixed by the contract suite** — native name sorts were binary
(`ORDER BY name`) while web used `localeCompare` (case-insensitive), so `alpha` sorted after
`Beta` on native. Standardized native to case-insensitive collation:
`accountRepo.list` and `categoryRepo.list` → `ORDER BY name COLLATE NOCASE`,
`transactionRepo.searchComments` → `ORDER BY description COLLATE NOCASE`, and
`transactionRepo.getCategoryUsageCounts` → `ORDER BY count DESC, c.name COLLATE NOCASE ASC`.
A mixed-case ordering test in the suite guards this.

## Phase C — Codified loop + E2E (implemented)

Spec acceptance criteria are checked in the **real Expo web app** via the **Playwright MCP**
server and the **`verification-loop`** skill, instead of by reading code.

- `opencode.jsonc` runs the Playwright MCP pinned to `@playwright/mcp@0.0.78` in headless
  system **Chrome** (`--browser chrome`, no browser download) and adds a bash permission
  allowlist for the loop's commands (`npm run test:all`, `npx vitest *`, `npx expo start*`).
- `AGENTS.md` documents that "verified" means `npm run test:all` green and that changes to
  `src/utils/` / `src/database/` logic must include or update tests.
- `verification-loop` skill: runs `test:all`, boots `npx expo start --web` on port 8081,
  opens the app in a fresh browser context (cleared `localStorage`, since web persists
  there), and checks each spec's acceptance criteria by real interaction — viewport 375px
  for mobile/responsive criteria, 3-attempt cap per criterion, dev server terminated when
  done. Native-only criteria (camera/photo) are reported as not checkable on web, never
  marked done.
- Config changes to `opencode.jsonc` (MCP server, permissions) require restarting opencode
  — config is loaded once at startup.

### Pilot results (2026-08-03)

First two features verified end-to-end through the loop: **022-total-account** (15 criteria)
and **008-categories-screen** (12 criteria). All 27 criteria PASS; 25/27 on the first pass,
2 spec deviations found, fixed, re-verified and documented in `docs/changelog.md`:

- **022 c10**: the Total account name field is shown **disabled/read-only** (grayed out,
  i18n `Total`) instead of hidden — `AccountForm` gained a `nameDisabled` prop and
  `ModifyAccountScreen` passes `showNameField + nameDisabled={isTotal}`.
- **008 c7**: Create is the spec's **dashed "+ Create" tile** in the last grid position
  (`CategoryGrid` `showAddMore` + `addMoreLabel`), replacing the floating `Fab "+"`.

Both features kept `npm run test:all` green (138 tests / 10 files) after each fix. Full
per-criterion evidence is in the changelog entry.

### Mobile mode — Maestro on Android emulator (2026-08-05)

Native-only criteria (camera/photo capture, native pickers, file system) cannot be checked
on web, so Finly added a **Maestro** harness for the Android emulator:

- Flows live in `FinlyApp/.maestro/` (`flow-smoke`, `flow-004-add-transaction`,
  `flow-007-amount-calculator`, `flow-008-categories`, `flow-015-all-transactions`,
  `flow-016-transaction-details`, `flow-017-modify-transaction`,
  `flow-021-category-filter`, `flow-022-total-account`, `flow-023-photo-attachment`)
  plus `helpers/`
  (`state-reset.yaml`, `open-drawer.yaml`, `dismiss-dev-menu.yaml`).
- The app is verified on the **dev-client debug build** (`com.anonymous.FinlyApp`, built
  with `npx expo run:android`), not Expo Go — the dev-client does not register the
  `exp://` scheme, so every flow starts with `helpers/state-reset.yaml`
  (`launchApp` + `clearState`) to reset the SQLite DB to the seeded state, then drives the
  activity directly over the `adb reverse tcp:8081 tcp:8081` tunnel to Metro.
- `flow-023` covers PhotoSection visibility, the source modal (Take photo / Add from
  gallery), and the Settings → Personalization "Photo" toggle at the modal/UI level.
  Camera capture and gallery picking open system UIs Maestro cannot drive reliably on an
  emulator, so the full capture path is reported "not automatable on emulator".
- All ten flows PASS on the emulator (2026-08-05 for smoke/022/008/023,
  2026-08-06 for flow-015-all-transactions and flow-021-category-filter,
  2026-08-07 for flow-004-add-transaction, flow-007-amount-calculator,
  flow-016-transaction-details and flow-017-modify-transaction).
- `flow-015-all-transactions` covers 015's drawer entry, back arrow + title, type and
  period tabs, the "N categories" pill, empty state, account modal, FAB to Add
  Transaction, and the stats-icon entry path. `flow-021-category-filter` covers the
  full-screen modal (header + Close X, All chip, category grid, multi-select Apply
  count, Close without applying) and the type='expense' variant.
- Android note found while writing the 021 flow: on a freshly-opened `Modal` the first
  tap inside its `ScrollView` was swallowed, and the search field's `autoFocus` keyboard
  covered the Apply footer (pruning it from the accessibility tree). Fixed in the app:
  the modal ScrollView sets `keyboardShouldPersistTaps="handled"` and `SearchBar`'s
  `autoFocus` is now a prop defaulting to `false` (the modal search no longer
  auto-focuses; `AddCategoryScreen` passes it explicitly).

### Transaction-core flows — 004 / 007 / 016 / 017 (2026-08-07)

Native Maestro coverage for the transaction-core features, all PASS on the emulator:
- `flow-004-add-transaction` — Home "+" → Add transaction; Expenses/Income tabs; default
  account My Wallet; amount input (comma decimal separator, `42,50`); category grid
  (Groceries); 3-day selector; inline tag creation (modal, auto-selected and persisted);
  comment with counter; submit returns Home; row persists in All transactions with the
  tag chip.
- `flow-007-amount-calculator` — calculator modal: `123 + 5 = 128` → Accept pastes "128";
  `C` clears the expression; Cancel leaves the amount unchanged.
- `flow-016-transaction-details` — row tap → details; header back arrow ("Navigate up")
  + title; Amount/Account/Category/Date/Comment rows; Tags row with chip; "Created:"
  footer; Edit → Modify and back; Delete → confirmation modal, "No" keeps, "Yes" deletes
  and returns to an empty list.
- `flow-017-modify-transaction` — Edit from details; amount preloaded (current value) and
  replaced (`42,50` → `99,99`); category switched (Groceries → Games); comment replaced;
  Save updates and returns to details; the list reflects the change.

Android / Maestro notes found and fixed while writing them:
- **`hideKeyboard` is a BACK keyevent.** When the soft keyboard is not actually shown
  (emulator headless text input without Maestro's IME), `hideKeyboard` pops the whole
  screen or closes the open native `Modal` instead of just dismissing the keyboard. The
  flows now never call `hideKeyboard` after typing; a `waitForAnimationToEnd` after
  `inputText` lets the keyboard settle so the next tap (modal "Add", submit "Add"/"Save")
  is reachable.
- **016 c2 back arrow**: the details screen's native-stack back button is exposed to the
  accessibility tree as "Navigate up", not "Back" (the All transactions screen uses a
  custom `HeaderBackButton` labelled "Back"). The flow asserts "Navigate up" on details.
- **017 c5 amount preload**: the amount is stored as a numeric DB value (42.5), so the
  preloaded formatted input shows "42,5" (not "42,50"); the flow asserts the formatted
  current value.
- **App fix — tag auto-select on inline create**: `handleCreateTag` created the tag and
  refreshed the list but never added it to `selectedTags`, so transactions created with an
  inline tag were saved WITHOUT the `transaction_tags` link (details screen showed the
  "no tags" dash). Now the created tag is auto-selected, matching the 019 spec ("On
  create: `tagRepo.create()` → `refreshTags()` → auto-select the new tag → close modal").
  The tag-modal flows only passed on the list screen before because its tag-filter chip
  shows every tag regardless of link.

### CI pipeline — GitHub Actions (2026-08-05)

The local "done" gate (`npm run test:all`) is now enforced automatically on a server:

- **Workflow:** `.github/workflows/ci.yml` — runs on pull requests targeting
  `develop`/`main` and on pushes to those branches.
- **Steps:** `checkout` → `setup-node` (Node 24, npm cache via
  `FinlyApp/package-lock.json`) → `npm ci` → `npm run test:all`, all with
  `working-directory: FinlyApp` on an Ubuntu runner. The suite is pure Node (Vitest +
  happy-dom + sql.js WASM), so no native build or Expo dev server is needed.
- **`concurrency`** cancels superseded runs when a new commit is pushed to the same branch
  (saves runner minutes).
- **Node version** is pinned to 24 (matching the dev machines) both in the workflow and in
  `FinlyApp/.nvmrc`.
- **Merge gating** (branch protection "require status checks to pass") is a manual GitHub
  settings step and can only be enabled after the `CI` check has run at least once.

## Phase D — Component unit tests (implemented)

Runner: **Vitest + `vitest-native` + React Native Testing Library 14** (happy-dom, tests
under `FinlyApp/tests/component/`).

`vitest-native`'s `reactNative()` plugin lets RNTL mount real components (babel-preset
transforms) without a device. `@expo/vector-icons` is aliased to a plain-`Text` mock
(`tests/mocks/expo-vector-icons.tsx`, `IconProps = TextProps & { name: string }`) in
`vitest.config.mts`, and `ConfigContext` is stubbed via `tests/component/helpers/configStub.ts`,
registered as a vitest **`setupFiles`** entry. The stub's live value lives on
`globalThis.__finlyConfigStub__` (exporting a `vi.hoisted` stub fails with `Cannot export
hoisted variable`), the `vi.mock` factory reads it at call time so components see live state,
and each suite calls `resetStub()` in `beforeEach`. i18n is NOT stubbed — the real `t()` from
`src/i18n` returns English labels by default.

| Test file | Module under test |
|-----------|-------------------|
| `tests/component/IconBadge.test.tsx` | `IconBadge` — shape/color badge, `BADGE_SHAPES` circle/rounded |
| `tests/component/SearchBar.test.tsx` | `SearchBar` — input, clear button, onChangeText |
| `tests/component/TabBar.test.tsx` | `TabBar<T>` — tabs, active styling, font scaling, onChange |
| `tests/component/PeriodTabs.test.tsx` | `PeriodTabs` — period options, active highlight |
| `tests/component/SortToggle.test.tsx` | `SortToggle` — date/amount, ASC/DESC arrow, direction toggle |
| `tests/component/AmountInput.test.tsx` | `AmountInput` — decimal separator, formatting, error, calculator hook |
| `tests/component/CategoryGrid.test.tsx` | `CategoryGrid` — selection, dashed add-more tile, onSelect/onAddMore |
| `tests/component/TransactionGroup.test.tsx` | `TransactionRow` + `TransactionDateHeader` — formats, tag chips, divider, press |
| `tests/component/RadioButton.test.tsx` | `RadioButton` — selection dot, custom color |
| `tests/component/EyeToggle.test.tsx` | `EyeToggle` — eye/eye-off toggle, hitSlop |
| `tests/component/EmptyState.test.tsx` | `EmptyState` — icon, title, message |
| `tests/component/Fab.test.tsx` | `Fab` — icon, onPress, a11y label |

## Phase E — Module-boundary linting (implemented)

`src/` layering is enforced as lint errors by **`eslint-plugin-boundaries`** (dev dep,
`FinlyApp/eslint.config.js`). It guards the architecture from inverted or cyclic imports.

- One element descriptor per `src/` folder (`boundaries/elements`, `partialMatch: false`,
  patterns are the folder path, e.g. `src/components` — the plugin expands them to
  `<pattern>/**/*`, so a trailing `/*` would NOT match files directly in the folder).
- `boundaries/dependencies` with `default: "disallow"` plus an allow-list policy set, and
  `boundaries/no-unknown-files` enabled.

Allowed dependency DAG (each layer may also import its own folder and external packages):

```
constants   (leaf — external only)
utils       → constants, i18n, database (type-only)
i18n        → constants
database    → constants, utils
context     → constants, utils, i18n, database
hooks       → constants, utils, i18n, database, context
components  → + hooks
screens     → + components
navigation  → + screens
```

`utils → database` is restricted to `dependency: { kind: "type" }` (e.g.
`utils/categoryUtils.ts` imports the `Category` type); any value/runtime import from `utils`
into `database` is an error.

The 5 pre-existing violations were resolved by moving the shared type/constant into the
lower layer and re-exporting from the old location (no test changes needed): `IconName` →
`constants/types.ts` (re-exported by `components/IconGrid`), `Config` → `database/types.ts`
(re-exported by `context/ConfigContext`), `Language`/`LANGUAGES` →
`constants/languages.ts` (re-exported by `utils/language`), `QUICK_COLORS` →
`constants/colors.ts`. This also broke the `i18n ⇄ utils` and `database → context` cycles.

Run with `npm run lint` (already part of `npm run test:all`); a violation fails the "done"
gate and CI.

## Phase F — Zod schema layer (implemented)

`src/database/schemas.ts` is the **single source of truth** for every stored row shape, and
data is validated at the storage boundary of both backends (spec
`infrastructure/002-database-schemas`).

- One Zod schema per table (`userSchema`, `accountSchema`, `categorySchema`,
  `transactionSchema`, `tagSchema`, `transactionTagSchema`) plus `configSchema`. Enums are
  built from the existing constant sets in `src/constants/` (types, languages), so the
  schema can't drift from the UI options.
- `src/database/types.ts` now re-exports `z.infer` types under the same names (`User`,
  `Account`, `Category`, `Transaction`, `Tag`, `TransactionTag`, `Config`) — no import-site
  changes were needed anywhere in the app.
- **Read-path validation:** native repos parse `SELECT *` rows (`parseRows`/`parseRowOrNull`
  from `src/database/validate.ts`, throwing a descriptive error on invalid rows); web
  `getStore` validates every entity read. Aggregate/derived queries are left unvalidated.
- **Config:** both `configRepo.get` and `webConfigRepo.get` run stored config through
  `configSchema` via `sanitizeConfig` (`src/database/configDefaults.ts`) and fall back to
  `DEFAULT_CONFIG` on any invalid value (or malformed JSON on web).
- **Drift guard:** `tests/database/dbDrift.test.ts` asserts that the Zod schema keys exactly
  match the migration columns for all entity tables — a column added to a migration without
  the schema (or vice versa) fails the suite. `tests/database/schemas.test.ts` covers the
  accept/reject matrix and config fallback.
- **Drizzle is deferred:** web storage now runs real SQLite (sql.js) but through a custom
  `DatabaseHandle` that is not an `expo-sqlite` driver, so Drizzle's `expo-sqlite` driver
  still cannot cover it. It stays deferred until the web engine is exposed through an
  ORM-compatible driver.

## Adding a test

1. Create `FinlyApp/tests/<area>/<module>.test.ts` (mirror the module path).
2. Import only pure modules (no `react-native` / `expo-*` runtime imports); if a module
   imports those, mock them or keep it out of Phase A scope.
3. Cover: normal cases, edge cases, and at least one regression seed per previously fixed bug.
4. Run `npm run test` (or `npm run test:watch`) and `npm run test:all` before finishing.

For component tests (`.test.tsx` under `tests/component/`, see Phase D): render with
`await render(...)`, stub `ConfigContext` via `tests/component/helpers/configStub.ts`
(`resetStub()` in `beforeEach`), and rely on the `@expo/vector-icons` alias — no other
component mocks are needed.
