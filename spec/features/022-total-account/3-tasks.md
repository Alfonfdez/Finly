# Tasks — 022 Total Account
Execution order. Mark each task when completed.

---

### Phase 1 — Database and Infrastructure

[x] T1 — Update `src/database/types.ts`: add `is_total?: number` to `Account` interface.

[x] T2 — Update `src/database/migrations/001_initial.ts`: add `is_total INTEGER NOT NULL DEFAULT 0` to accounts CREATE TABLE.

[x] T3 — Update `src/database/migrations/002_seed.ts`: add Total account (id=2, icon=`layers-outline`, color=`#475569`, `is_total=1`). Update existing account insert to include `is_total` column.

[x] T4 — Update `src/database/webStorage.ts`: add Total to seed, sort Total first in `list()`, skip delete if `is_total`, default `is_total: 0` on create.

[x] T5 — Update `src/database/repositories/accountRepo.ts`: `list()` returns `ORDER BY is_total DESC, name`.

[x] T6 — Update `src/database/repositories/transactionRepo.ts` and webStorage: `totalByPeriod()` accepts `accountId: number | null` — when null, query all accounts.

---

### Phase 2 — i18n and Context

[x] T7 — Add i18n keys:
  - `src/i18n/en.ts`, `es.ts`, `ca.ts`: `account_total: 'Total'`
  - `src/i18n/index.ts`: add `2: 'account_total'` to `ACCOUNT_I18N_KEYS`

[x] T8 — Update `src/context/AppContext.tsx`:
  - `loadTransactions()` / `refresh()`: if `activeAccount.is_total`, skip `account_id` filter.
  - `accountsWithBalance`: after calculation, fix Total's balance = sum of all non-total accounts.
  - `totalIncomeAll`/`totalExpensesAll`: when Total is active, call `totalByPeriod(null, ...)`.

---

### Phase 3 — Screens

[x] T9 — Update `src/screens/AddTransactionScreen.tsx` and `src/screens/ModifyTransactionScreen.tsx`: filter `accountsWithBalance` → `.filter(a => !a.is_total)`.

[x] T10 — Update `src/screens/ModifyAccountScreen.tsx`:
  - When `account.is_total`: disable name field (read-only, i18n "Total"), hide delete button.
  - Save sends only icon, color, description (skip name).
  - Skip duplicate validation for Total.

---

### Verification

[x] T11 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test Total account in HomeScreen selector, combined data view, absence from transaction screens, appearance in Accounts list, and modification (icon/color/note only, no delete, read-only name).
