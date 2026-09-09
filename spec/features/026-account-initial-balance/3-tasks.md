# Tasks — 026 Account initial balance
Execution order. Mark each task as completed.

---

### Phase 1 — Component and i18n

[x] T1 — Add optional `label` and `accessibilityLabel` props to `AmountInput` (`src/components/AmountInput.tsx`). Render a label above the amount row when provided; use `accessibilityLabel` for the input (fallback `a11y_amount`).

[x] T2 — Add optional `showInitialBalance`, `initialBalanceLabel`, `initialBalanceA11yLabel`, `initialBalanceRaw`, `onInitialBalanceChange` props to `AccountForm` (`src/components/AccountForm.tsx`). Render a labeled `AmountInput` (no calculator) between the icon/color section and the Note field when `showInitialBalance` is true.

[x] T3 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`: `create_account_initial_balance`, `modify_account_initial_balance`, `a11y_initial_balance`.

---

### Phase 2 — Screens

[x] T4 — `CreateAccountScreen`: add `initialBalanceRaw` state; pass the new props to `AccountForm` with `showInitialBalance`; on create store `initial_balance: parseAmountValue(initialBalanceRaw) ?? 0`; disable Create when the non-empty raw value does not parse.

[x] T5 — `ModifyAccountScreen`: add `initialBalanceRaw` state preloaded from the loaded account; pass the new props with `showInitialBalance={!isTotal}`; on save include `initial_balance` in `updateData` only for non-total accounts; disable Save on a non-empty invalid value.

---

### Verification

[ ] T6 — Run `npm run test:all` (typecheck + lint + tests). Then `npx expo start --web` and verify at 375px:
  - Create an account with initial balance 100 → Accounts list shows 100 and Total = 100.
  - Modify the account's initial balance to 250 → account and Total update.
  - Leave the field empty on a new account → balance 0.
  - The Total account hides the field.
  - Non-empty invalid value disables Create/Save.
