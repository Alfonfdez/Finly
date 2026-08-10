# Implementation plan — 026 Account initial balance

## Architecture

### New components

None. The field reuses the existing `AmountInput` component with two new optional props.

### Modified files

- **src/components/AmountInput.tsx**: add optional `label?: string` and `accessibilityLabel?: string` props. When `label` is set, a small field label renders above the amount row; `accessibilityLabel` overrides the input's a11y label (defaults to `a11y_amount`).
- **src/components/AccountForm.tsx**: add optional props `showInitialBalance`, `initialBalanceLabel`, `initialBalanceA11yLabel`, `initialBalanceRaw`, `onInitialBalanceChange`. Renders a labeled `AmountInput` (no calculator) between the icon/color section and the Note field when `showInitialBalance` is true.
- **src/screens/CreateAccountScreen.tsx**: new `initialBalanceRaw` state; create uses `initial_balance: parseAmountValue(initialBalanceRaw) ?? 0`; non-empty invalid value disables Create.
- **src/screens/ModifyAccountScreen.tsx**: new `initialBalanceRaw` state preloaded from the loaded account; save writes `initial_balance` for non-total accounts; `showInitialBalance={!isTotal}`.
- **src/i18n/en.ts, es.ts, ca.ts**: new keys.

### Reused components / utils

- `AmountInput` (`src/components/AmountInput.tsx`).
- `parseAmountValue` (`src/utils/amountInput.ts`, already tested).
- `IconColorSection`, `LabeledTextField`, existing form primitives.

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `create_account_initial_balance` | Initial balance | Saldo inicial | Saldo inicial |
| `modify_account_initial_balance` | Initial balance | Saldo inicial | Saldo inicial |
| `a11y_initial_balance` | Initial balance input | Campo de saldo inicial | Camp de saldo inicial |

*(`add_amount_error` reused for invalid amount.)*

### Navigation flow

Unchanged. The field is part of the existing Create/Modify account forms.

---

## UI states

```
┌─────────────────────────────────┐
│ Name / Symbols / Color sections │
├─────────────────────────────────┤
│ Initial balance                  │
│ [  0            ] €             │  ← AmountInput (no calculator)
├─────────────────────────────────┤
│ Note                             │
│ [_____________________________] │  ← Multiline input 0/200
├─────────────────────────────────┤
│ [          Create          ]    │
└─────────────────────────────────┘
```

## Dependencies

- Existing `accountRepository` (create/update already persist `initial_balance`).
- Existing `AmountInput` + `amountInput` utils.
- `useConfig()`, `useFontSize()`, i18n.

## Tests

- No new test files: `initial_balance` is already exercised by the Phase B contract suite (create/update/getBalances), and parsing reuses the tested `parseAmountValue`. `npm run test:all` must stay green.

## Estimate

- **Tasks**: 6 tasks in 2 phases
- **Estimated time**: 1-1.5 hours
