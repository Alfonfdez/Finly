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
- **`=` button**: evaluates the expression and displays the result.
- **`C` button**: clears the entire expression and result.
- **`⌫` button** (backspace): removes the last character from the expression.

### 3. Calculator logic

- The expression is built by pressing buttons and displayed in real time.
- When `=` is pressed, the full expression is evaluated and the result is displayed.
- If the expression is invalid (e.g. `5 + * 3`), an error is shown and accepting is not allowed.
- Decimals use the separator configured in the app (`.` or `,`).
- The result is rounded to a maximum of 2 decimal places.

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

- [ ] The calculator button opens a modal with the calculator.
- [ ] Numeric and operation buttons build the expression correctly.
- [ ] The `=` button evaluates the expression and displays the result.
- [ ] The `C` button clears the expression and result.
- [ ] The `⌫` button removes the last character.
- [ ] The "Accept" button pastes the result into the amount field.
- [ ] The "Cancel" button closes without modifying the field.
- [ ] The calculator respects the dark/light theme.
- [ ] Works on iOS, Android and Web.

---

## Out of scope (for now)

- Scientific operations (sin, cos, log, etc.).
- Calculation history.
- Memory (M+, M-, MR, MC).
- Parentheses.
