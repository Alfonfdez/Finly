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

### 5. TransactionsScreen (Category Drill-Down) and TransactionDetailsScreen

- When navigating from HomeScreen, the `selectedAccountId` initializes to the active account from HomeScreen (`activeAccount`), including Total.
- The AccountModal includes Total as a selectable option alongside all other accounts.
- When Total is selected, the `filtered` memo skips the `account_id` filter → shows all transactions for the selected category and period across all accounts.
- When a specific (non-Total) account is selected, transactions are filtered normally by that account.
- Category totals (header) reflect the active filter (all accounts when Total, single account otherwise).
- **TransactionDetailsScreen**: fetches the transaction directly from the database (not from AppContext) to ensure it works when navigating from any screen, including when Total is selected.

### 6. Account Selector Behavior

- **HomeScreen**: AccountModal includes the Total account as the first option.
- **TransactionsScreen / AllTransactionsScreen**: AccountModal includes Total. The `selectedAccountId` initializes to the active account from HomeScreen (including Total). When Total is selected, the account filter is skipped and all transactions are shown.
- **AddTransactionScreen / ModifyTransactionScreen**: Total account is filtered out (`!a.is_total`) — it never appears in the account selector.
- **AddTransactionScreen fallback**: When navigated from HomeScreen with Total selected, `accountId` initializes to the first non-Total account (not Total).
- The AccountModal component itself needs no changes; callers control what accounts they pass.

### 7. Accounts Screen

- The Total account appears as the first card in the accounts list.
- Tapping it navigates to `ModifyAccountScreen` with `accountId: 2`.
- The existing "Total:" header section (sum of all balances) stays as-is — it is separate from the Total account card.

### 8. Modify Account Screen (Total Mode)

When the Total account (id=2) is loaded in ModifyAccountScreen:

- **Name field**: disabled (read-only, grayed out). Shows the i18n "Total" in the active language.
- **Duplicate validation**: skipped for Total (name is read-only).
- **Delete button**: hidden entirely.
- **Save button**: updates only `icon`, `color`, and `description` (note). Name is never sent to the repository.
- Otherwise, the screen works the same (icon grid, color grid, note field).

### 9. Default Account Name (multilingual)

- The Total account follows the same i18n pattern as "My Wallet":
  - Stored in English as `'Total'`.
  - `ACCOUNT_I18N_KEYS` maps id=2 to `account_total`.
  - `getDisplayAccountName(account)` returns the i18n translation if the stored name matches the English default.
  - Since the name field is read-only, users cannot customize it.

### 10. Default Account Description (multilingual)

- The Total account has a default description explaining its purpose.
- Stored in English in the seed data (`002_seed.ts` and `webStorage.ts`).
- `ACCOUNT_DESCRIPTION_I18N_KEYS` maps id=2 to `account_total_description`.
- In ModifyAccountScreen, when the stored description matches the English default, the i18n translation is displayed instead.
- Users can still edit the description freely.

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

- [x] The Total account appears as the first option in the HomeScreen account selector.
- [x] When Total is selected, HomeScreen shows combined data from all accounts.
- [x] Total is not shown in the AddTransaction or ModifyTransaction account selectors.
- [x] When navigating to AddTransactionScreen from HomeScreen with Total selected, the first non-Total account is pre-selected.
- [x] Total is shown in the TransactionsScreen and AllTransactionsScreen account selectors.
- [x] When Total is selected in TransactionsScreen or AllTransactionsScreen, all transactions for the active filters are shown (not filtered by account).
- [x] When a specific account is selected in TransactionsScreen or AllTransactionsScreen, transactions are filtered by that account.
- [x] Total appears as the first card in the Accounts screen list.
- [x] Tapping Total navigates to ModifyAccountScreen with id=2.
- [x] In ModifyAccountScreen for Total: name is read-only, delete button is hidden, save updates icon/color/note only.
- [x] Tapping a transaction from any screen (including when Total is selected) opens TransactionDetailsScreen with the correct data.
- [x] The Total account name follows the active language (en "Total", es "Total", ca "Total").
- [x] Total's balance equals the sum of all non-total accounts.
- [x] All texts change when switching language.
- [x] The screen respects the active theme and text size.
