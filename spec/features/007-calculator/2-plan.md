# Implementation plan — 007 Calculator

## Architecture

### New components

- **CalculatorModal.tsx**: Container modal with display, button keypad and action buttons (Accept/Cancel).
- **calculator.ts**: Pure utility to safely evaluate mathematical expressions.

### Modified files

- **AddTransactionScreen.tsx**: Add `calculatorVisible` state and connect the calculator button with the modal.
- **i18n/en.ts, es.ts, ca.ts**: Add multilingual keys for the calculator.
- **spec/constitution/3-roadmap.md**: Add feature 007.

### External dependencies

- None. Pure React Native implementation.

---

## UI states

### CalculatorModal

```
┌─────────────────────────────────┐
│ Calculator                      │  ← Modal header
├─────────────────────────────────┤
│                                 │
│   123.45 / 5                    │  ← Expression display
│                     = 24.69     │  ← Result display
│                                 │
├─────────────────────────────────┤
│   7   8   9   ÷                │
│   4   5   6   ×                │  ← Calculator keypad
│   1   2   3   −                │
│   C   0   .   +                │
│   ⌫           =                │
├─────────────────────────────────┤
│ [Cancel]              [Accept]  │  ← Action buttons
└─────────────────────────────────┘
```

### Local states

```ts
interface CalculatorState {
  expression: string;     // current expression (e.g. "123.45 / 5")
  result: string | null;  // result of evaluating the expression
  hasError: boolean;      // true if the expression is invalid
}
```

### Validations

- Starting with an operator is not allowed (except `-` for negatives).
- Two consecutive operators are not allowed (the previous one is replaced).
- More than one decimal point per number is not allowed.
- The `=` button is disabled if the expression is empty or has an error.

---

## Expression evaluator

### `calculator.ts`

Pure function `evaluate(expression: string): { result: number | null; error: boolean }`

**Rules:**
- Parses the expression from left to right.
- Respects operator precedence (`*` and `/` before `+` and `-`).
- Division by zero → error.
- Empty or invalid expression → error.

**Implementation:**
- Use `Function` constructor with allowed character sanitization (digits, operators, dot, spaces).
- Or alternatively, implement a manual parser for greater security.

---

## Calculator keypad

### Grid layout

| Row | Col 1 | Col 2 | Col 3 | Col 4 |
|-----|-------|-------|-------|-------|
| 1 | 7 | 8 | 9 | ÷ |
| 2 | 4 | 5 | 6 | × |
| 3 | 1 | 2 | 3 | − |
| 4 | C | 0 | . | + |
| 5 | ⌫ | | | = |

### Styles

- Numeric buttons: background `c.surface`, text `c.text`.
- Operation buttons: background `c.primary` with white text.
- `=` button: background `c.green` (or success color) with white text.
- `C` button: background `c.red` (or error color) with white text.
- Grid with uniform gap (8-10px).
- Buttons with border radius: 10-12px.
- Display font size: 20-24px.
- Button font size: 18-20px.

---

## i18n keys

| Key | EN | ES | CA |
|-----|----|----|-----|
| `calc_title` | Calculator | Calculadora | Calculadora |
| `calc_accept` | Accept | Aceptar | Acceptar |
| `calc_cancel` | Cancel | Cancelar | Cancel·lar |
| `calc_error` | Error | Error | Error |

---

## AddTransactionScreen wireframe (amount section)

```
┌─────────────────────────────────┐
│         [ ] Expense  [ ] Income │  ← TypeTabs
├─────────────────────────────────┤
│  ┌─────────────────────────┬─┐ │
│  │ 0                       │€│ │  ← Amount input
│  └─────────────────────────┴🧪│  ← Calculator button
├─────────────────────────────────┤
```

- The calculator button (`🧪`) is to the right of the currency symbol.
- Pressing it opens CalculatorModal.
