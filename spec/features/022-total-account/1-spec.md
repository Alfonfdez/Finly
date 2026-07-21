# 022 — Total Account

- **Objective**
  Add a special "Total" virtual account that aggregates data from all existing accounts. The Total account appears as the first option in the HomeScreen account selector and as a card in the Accounts screen list. It can be customized (icon, color, note) but cannot be deleted or renamed. All texts are multilingual (en/es/ca).

---

## Functional Requirements

### 1. Database Schema

- Add an `is_total INTEGER NOT NULL DEFAULT 0` column to the `accounts` table.
- The Total account (id=2, user_id=1, name="Total", icon=`layers-outline`, color=`#475569`, `is_total=1`) is seeded in `002_seed.ts`.
- The `is_total` flag distinguishes the Total account from regular accounts.
- The `accountRepo.list()` query sorts with Total first (`ORDER BY is_total DESC, name`).

### 2. Account List Queries

- `accountRepo.list()` returns all accounts (including Total), sorted with Total first.
- Screens that need only real accounts (AddTransaction, ModifyTransaction) filter client-side: `accounts.filter(a => !a.is_total)`.
- Web localStorage (`webAccountRepo.list()`) sorts with Total first using the same logic.

### 3. Balance Calculation

- The Total account has `initial_balance = 0` and no transactions assigned to it (it is not selectable in transaction forms).
- Its balance is dynamically computed as the sum of all non-total accounts' balances.
- In `AppContext`, after calculating individual balances via `accountRepo.getCurrentBalance()`, the Total account's balance is replaced with the sum of all others.

### 4. Transaction Filtering (All Accounts Mode)

- When the Total account is active in HomeScreen:
  - `transactionRepo.list()` is called **without** `account_id` filter → returns transactions from all accounts.
  - `totalByPeriod()` is called with `accountId = null` → returns totals across all accounts.
  - All HomeScreen views (donut chart, category breakdown, totals) reflect the combined data.

### 5. Account Selector Behavior

- **HomeScreen**: AccountModal includes the Total account as the first option.
- **AddTransactionScreen / ModifyTransactionScreen**: Total account is filtered out (`!a.is_total`) — it never appears in the account selector.
- The AccountModal component itself needs no changes; callers control what accounts they pass.

### 6. Accounts Screen

- The Total account appears as the first card in the accounts list.
- Tapping it navigates to `ModifyAccountScreen` with `accountId: 2`.
- The existing "Total:" header section (sum of all balances) stays as-is — it is separate from the Total account card.

### 7. Modify Account Screen (Total Mode)

When the Total account (id=2) is loaded in ModifyAccountScreen:

- **Name field**: disabled (read-only, grayed out). Shows the i18n "Total" in the active language.
- **Duplicate validation**: skipped for Total (name is read-only).
- **Delete button**: hidden entirely.
- **Save button**: updates only `icon`, `color`, and `description` (note). Name is never sent to the repository.
- Otherwise, the screen works the same (icon grid, color grid, note field).

### 8. Default Account Name (multilingual)

- The Total account follows the same i18n pattern as "My Wallet":
  - Stored in English as `'Total'`.
  - `ACCOUNT_I18N_KEYS` maps id=2 to `account_total`.
  - `getDisplayAccountName(account)` returns the i18n translation if the stored name matches the English default.
  - Since the name field is read-only, users cannot customize it.

---

## Non-functional Requirements

- **Multilingual**: all visible texts must use `t()`.
- **Configuration**: use `useConfig().activeColors`.
- **Text**: use `useFontSize()`.
- **Navigation**: Total account is edited through the existing ModifyAccountScreen (012) with conditional behavior based on `account.is_total`.
- **Persistence**: Total account customization (icon, color, note) persists via `accountRepository.update()`.
- **DB schema**: `is_total` column added to `accounts` table in `001_initial.ts`. DB is reset manually (no migration).

---

## Acceptance Criteria

- [ ] The Total account appears as the first option in the HomeScreen account selector.
- [ ] When Total is selected, HomeScreen shows combined data from all accounts.
- [ ] Total is not shown in the AddTransaction or ModifyTransaction account selectors.
- [ ] Total appears as the first card in the Accounts screen list.
- [ ] Tapping Total navigates to ModifyAccountScreen with id=2.
- [ ] In ModifyAccountScreen for Total: name is read-only, delete button is hidden, save updates icon/color/note only.
- [ ] The Total account name follows the active language (en "Total", es "Total", ca "Total").
- [ ] Total's balance equals the sum of all non-total accounts.
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
