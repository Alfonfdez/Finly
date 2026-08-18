# 001 — Home screen (mobile app)

- **Objective**
A main screen in the app that displays the current Account, the Total (income/expense difference), with the option to switch between Expenses or Income and a time period. There is a "+" button that navigates to the add expense/income screen.

- **Functional requirements**
1. Header with hamburger menu (Drawer) on the left for future features:
   a) Add, modify or delete "Accounts".
   b) Add, modify or delete "Categories".
   c) "Settings": light/dark mode, customization (first day of week, decimal separator, currency, language).

2. In the center of the header, a clickable "Total" text that opens a modal to select an account. Below the Total, a summary of Income and Expenses is displayed.

3. On the right side of the header, a button that navigates to the "Transactions" screen (transaction list filterable by type and period).

4. "Expenses" / "Income" tabs to toggle the displayed type.

5. Period tabs: "Day", "Week", "Month", "Year", "Period".
   When selecting a period, a native date picker can be opened:
   - Day: day picker (no future dates).
   - Week: week picker.
   - Month: month picker.
   - Year: year picker.
   - Period: date range picker.

6. Donut chart (SVG) showing expenses/income for the selected period, broken down by categories with their color. Tapping the chart toggles it to a horizontal bar chart. The total is centered inside the donut hole: the text is constrained to the hole's inner diameter and its font size auto-shrinks (`fitFontSize`) so the full formatted amount always stays inside the hole.

7. "+" button (Floating Action Button) centered at the bottom. Background: primary color (`c.primary`). Icon: `Ionicons "add"` with color `c.background` (theme-adaptive). Position: `position: absolute`, `bottom: 56`, `alignSelf: 'center'`. Navigates to the "Add Expense/Income" screen.

8. Category breakdown list: SVG icon, name, percentage, numeric total with 2 decimal places and currency symbol (€ by default). Tapping a category navigates to "Transactions" filtered by that category.

- **Content**
Initial mock data (accounts, categories, sample transactions). Later, data will come from AsyncStorage with what the user inputs.

- **Non-functional requirements**
- Design: dark mode, defined palette (fondo, fondoAlto, texto, textSuave, primario, acento).
- Responsive: 100% mobile, adaptable to different screen sizes.
- Accessibility: sufficient contrast, TouchableOpacity with wide hitSlop, accessible labels.

- **Out of scope**
Cloud sync, authentication, offline usage (AsyncStorage is already local).

- **Acceptance criteria**
[x] The Drawer Navigator opens correctly with the options (initial mockups).
[x] Tapping "Total" opens a modal with the account list, showing icon, name and total.
[x] The Total balance displays in green if positive, red if negative, with € symbol.
[x] The transactions button navigates to the corresponding screen.
[x] Correct toggle between "Expenses" and "Income".
[x] The 5 period tabs are displayed correctly.
[x] When selecting a period, a date can be chosen with the native picker.
[x] The date picker does not allow selecting future dates.
[x] The donut chart is displayed correctly with period data.
[x] The total in the center of the donut stays fully visible inside the hole even for large amounts (font auto-shrinks to fit).
[x] Tapping the donut chart shows the bar chart, and vice versa.
[x] The "+" button navigates to the "Add Expense/Income" screen.
[x] The category list displays icon, name, percentage and total correctly.
[x] Tapping a category navigates to "Transactions" with that filter.
