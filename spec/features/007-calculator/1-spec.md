# 007 — Calculator

- **Objective**
Modal with a basic calculator that allows the user to perform simple mathematical operations and paste the result into the amount field of the "Add Transaction" screen. Reusable component that can be used in other screens.

---

## Functional Requirements

### 1. Access

- Accessed by pressing the calculator button (icon `calculator-outline`) on the amount field of `AddTransactionScreen`.
- Opens a modal overlay on top of the current screen.
- Does not navigate to another screen (keeps form context).

### 2. Calculator screen

- **Display**: shows the entered expression (e.g. `123.45 / 5`) and the current result (e.g. `24.69`).
- **Numeric buttons**: `0-9` and `.` (decimal).
- **Operation buttons**: `+`, `-`, `*`, `/`.
- **`=` button**: evaluates the expression, displays the result and commits it as the base for the next operation.
- **`C` button**: clears the entire expression and result.
- **`⌫` button** (backspace): removes the last character from the expression.

### 3. Calculator logic

- The expression is built by pressing buttons and displayed in real time.
- Operator precedence applies within a single expression (e.g. `2 + 3 * 4 = 14`).
- When `=` is pressed, the full expression is evaluated and the rounded result is committed as the new expression.
- After `=`, an operator continues from the committed result (e.g. `100 - 50 = / 3 =` -> `16.67`).
- After `=`, a digit or decimal starts a new calculation; backspace edits the committed result.
- The calculator resets to a blank expression every time it is opened.
- If the expression is invalid (e.g. `5 + * 3`), an error is shown and accepting is not allowed.
- Decimals use the separator configured in the app (`.` or `,`).
- The result is rounded to a maximum of 2 decimal places.
- Accept is disabled when the result is zero or negative: the amount field only accepts positive values.
- A negative result is still a valid intermediate value: pressing an operator after `=` continues from it (e.g. `5 - 10 = -5`, then `+ 10 = 5`), and pressing `=` on a negative expression does not error.

### 4. Action buttons (outside the calculator keypad)

- **Accept** (multilingual): closes the modal and pastes the result into the amount field of `AddTransactionScreen`.
- **Cancel** (multilingual): closes the modal without modifying the amount field.
- The buttons are at the bottom of the modal, outside the calculator button area.

### 5. Behavior on accept

- The numeric result is converted to a string using the decimal separator from the configuration.
- The current value of the amount field is replaced with the result.
- Focus remains on the amount field so the user can continue editing.

### 6. Integration with AddTransactionScreen

- The calculator button (icon `calculator-outline`) opens the modal.
- When the modal is closed (accept or cancel), focus returns to the amount field.
- The calculator does NOT modify the transaction state until "Accept" is pressed.

### 7. Theme and accessibility

- The calculator uses the colors of the active theme (dark/light) via `useConfig().activeColors`.
- Buttons have a descriptive `accessibilityLabel`.
- The display uses a legible font size.

---

## Acceptance Criteria

- [x] The calculator button opens a modal with the calculator.
- [x] Numeric and operation buttons build the expression correctly.
- [x] The `=` button evaluates the expression and displays the result.
- [x] `=` commits the result and a following operator continues from it.
- [x] A digit after `=` starts a new calculation, and reopening the calculator resets it.
- [x] The `C` button clears the expression and result.
- [x] The `⌫` button removes the last character.
- [x] The "Accept" button pastes the result into the amount field; it is disabled for zero and negative results, but negative intermediate results can still be used in further operations (e.g. `5 - 10 = -5`, then `+ 10 = 5`).
- [x] The "Cancel" button closes without modifying the field.
- [x] The calculator respects the dark/light theme.
- [x] Works on iOS, Android and Web.

---

## Out of scope (for now)

- Scientific operations (sin, cos, log, etc.).
- Calculation history.
- Memory (M+, M-, MR, MC).
- Parentheses.
