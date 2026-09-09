# 026 — Account initial balance

- **Objective**
  Let the user set an optional starting balance for an account when creating (013) or modifying (012) it. The `initial_balance` column already exists in the schema and is already folded into the account and Total balances, so this phase only adds the UI and the corresponding i18n strings.

---

## Functional requirements

### 1. Create account screen (013)

- The "Initial balance" field appears on `CreateAccountScreen` between the color section and the Note field.
- Title: "Initial balance" (multilingual).
- It reuses the existing `AmountInput` component (currency symbol, decimal separator aware, thousand separators, localized parsing).
- No calculator button is shown.
- The field is optional: leaving it empty stores `initial_balance = 0`.
- **Validation**: if the field is non-empty and does not parse to a valid amount, the amount error text is shown and the "Create" button is disabled.
- On "Create", the account is inserted with `initial_balance = parseAmountValue(raw) ?? 0`.

### 2. Modify account screen (012)

- The "Initial balance" field appears on `ModifyAccountScreen` between the color section and the Note field.
- On load, the field is preloaded with the account's current `initial_balance` (formatted with the active decimal separator).
- The same validation rules apply: non-empty invalid input disables "Save".
- On "Save", `initial_balance` is updated via `accountRepository.update()` (the column is already in the update whitelist).

### 3. Total account exclusion

- The special "Total" aggregate account never shows the field: `showInitialBalance={!isTotal}`.
- Saving the Total account never writes `initial_balance`.

### 4. Balance integration

- The value flows into the existing balance computation without code changes: `accountRepo.getBalances()` already returns `a.initial_balance + SUM(...)` for non-total accounts, and the Total balance is the sum of the non-total balances (`AppContext`).
- Account list, account selector totals, and Home totals reflect the initial balance automatically.

---

## Non-functional requirements

- **Multilingual**: all new texts use `t()` (en/es/ca).
- **Reuse**: the field reuses the tested `AmountInput` + `amountInput` parsing utils (`parseAmountInput`, `formatAmountDisplay`, `parseAmountValue`).
- **No schema/migration changes**: the `initial_balance` column already exists (migration `001_initial`).
- **Theme/text size**: the field inherits `useConfig().activeColors` and `useFontSize()` from `AmountInput`.
- **Accessibility**: the input exposes `a11y_initial_balance` as its accessibility label.

---

## Acceptance criteria

- [x] "Initial balance" appears on the Create account screen between the color section and the Note field.
- [x] "Initial balance" appears on the Modify account screen between the color section and the Note field.
- [x] The field is empty by default on Create and stores `initial_balance = 0` when left empty.
- [x] On Modify, the field is preloaded with the current initial balance.
- [x] A non-empty invalid value shows the amount error and disables Create/Save.
- [x] Creating an account with initial balance 100 shows 100 in the Accounts list and Total.
- [x] Modifying an account's initial balance updates the account and Total balances.
- [x] The Total account does not show the field.
- [x] All texts are multilingual and respect theme + text size.
