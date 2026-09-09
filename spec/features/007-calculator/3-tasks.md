# Tasks — 007 Calculator
Execution order. Mark each task upon completion.

---

### Phase 1 — Infrastructure

[ ] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`: calc_title, calc_accept, calc_cancel, calc_error.

[ ] T2 — Create `src/utils/calculator.ts` with function `evaluate(expression: string): { result: number | null; error: boolean }`. Implement a manual parser that respects operator precedence and handles decimals.

---

### Phase 2 — CalculatorModal component

[ ] T3 — Create `src/components/CalculatorModal.tsx` with basic structure: Modal, header with title, display area (expression + result), grid of numeric and operation buttons.

[ ] T4 — Implement calculator keypad: 5×4 grid with buttons 0-9, `.`, `+`, `-`, `*`, `/`, `=`, `C`, `⌫`. Styles according to active theme (useConfig).

[ ] T5 — Implement expression building logic: concatenate digits and operators, validate two consecutive operators, validate only one decimal point per number.

[ ] T6 — Implement evaluation with `=` button: call `evaluate()`, display result or error. Disable `=` if expression is empty or has an error.

[ ] T7 — Implement `C` button (clear all) and `⌫` button (backspace: remove last character).

[ ] T8 — Add "Accept" and "Cancel" action buttons at the bottom of the modal, outside the calculator grid.

---

### Phase 3 — Integration

[ ] T9 — Update `AddTransactionScreen.tsx`: add `calculatorVisible` state, connect `calculator-outline` button to open the modal, and pass `onAccept` callback that updates `amountRaw` with the result.

[ ] T10 — Adjust `onAccept` to use the decimal separator from the configuration (`config.decimalSeparator`).

---

### Phase 4 — Theme and accessibility

[ ] T11 — Apply `useConfig().activeColors` to all calculator elements (display, buttons, modal).

[ ] T12 — Add `accessibilityLabel` to all calculator buttons.

---

### Verification

[ ] T13 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test:
  - Open calculator from AddTransactionScreen.
  - Perform operations: addition, subtraction, multiplication, division.
  - Test decimals and backspace.
  - Accept result and verify it is pasted into the amount field.
  - Cancel and verify the field is not modified.
  - Test division by zero (show error).
  - Switch theme and verify colors.
  - Test on iOS, Android and Web.
