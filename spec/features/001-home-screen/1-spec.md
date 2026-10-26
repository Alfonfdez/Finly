# 001 — Home screen (mobile app)

- **Objective**
A main screen in the app that displays the current Account, the Total (income/expense difference), with the option to switch between Expenses or Income and a time period. There is a "+" button that navigates to the add expense/income screen.

- **Functional requirements**
1. Header with hamburger menu (Drawer) on the left for future features:
   a) Add, modify or delete "Accounts".
   b) Add, modify or delete "Categories".
   c) "Settings": light/dark mode, customization (first day of week, decimal separator, currency, language).

2. In the center of the header, a clickable "Total" text that opens a modal to select an account. Below the Total, a summary of Income and Expenses is displayed.
   - Editing the active account's name/icon/color refreshes the header immediately after the accounts reload; a restart is not required.
   - Deleting a tag selected in the Home tag filter prunes that id from the filter (the untagged pseudo-filter is preserved), so Home never stays invisibly empty.

3. On the right side of the header, a button that navigates to the "Transactions" screen (transaction list filterable by type and period).

4. "Expenses" / "Income" tabs to toggle the displayed type.
   After adding or modifying a transaction, the tab automatically
   switches to the type of that transaction (e.g. adding an Income
   while on Expenses switches to Income automatically).

5. Period tabs: "Day", "Week", "Month", "Year", "Period".
   Selecting a period opens the calendar modal:
   - Day: day picker (no future dates).
   - Week: week picker.
   - Month: month picker.
   - Year: year picker.
   - Period: custom date range picker.
- **Fast period arrows** next to the period text (Day/Week/Month/Year only): `<` steps one period back and is always available, `>` steps forward and is hidden once the next period would be in the future (today / the current week, month or year), and a double-chevron `»` just left of `>` jumps to the current period - offered only from two or more periods back, since on the penultimate one a single `>` already reaches it. The `Period` (custom range) tab keeps its picker with no arrows. Steps follow the same period math as the pickers (weeks are Monday-based) and never step into the future.
- **Calendar picker standard:** inside the modal, arrows only browse; the selected value changes only by tapping. The calendar floor is 01 January 1900, `YearGrid` pages are fixed 12-year ranges anchored at 1900, and `WeekPicker` keeps six fixed rows (weeks entirely outside the active month are blank placeholders).
     - The compact CalendarPicker box shows the concrete range with full month names and is centred; verbose languages wrap to two centred lines.
     - The calendar modal header has two left-aligned information lines: Day/Month/Year show the selected value plus a blank second line; Week shows both full start/end dates with their years; Period shows the localized start/end range.
     - The Period picker offers four quick presets: This year, 12 months, 30 days and 90 days. This year covers January 1 of the current year to today; 30/90 days include today; 12 months is a rolling 12-calendar-month range.
     - The checked preset is derived from the current range: manual edits uncheck it, and manually selecting a matching range checks it automatically. Applying a preset keeps the calendar visible, and the next calendar tap starts a new range selection.
     - The "Select start/end date" hint is always visible under the calendar; after an end date is chosen, the next tap starts a new start date.
     - The default range (before any pick) runs from January 1 to the **end of today**, so transactions recorded later today are part of it (the built-in periods already end at end-of-day).

6. Donut chart (SVG) showing expenses/income for the selected period, broken down by categories with their color. Tapping the chart toggles it to a horizontal bar chart. The selected chart type is saved as a config preference (`homeChartType`, donut by default), so it survives navigation and restarts. The total is centered inside the donut hole: the text is constrained to the hole's inner diameter and its font size auto-shrinks (`fitFontSize`) so the full formatted amount always stays inside the hole. The bar chart shows the **same** formatted total, centered **above** the bar (same style as the donut centre: `c.text`, weight 700, auto-fit to the chart width), whether or not there are transactions; the legend below lists each category with its percentage.

7. "+" button (Floating Action Button) centered at the bottom. Background: primary color (`c.primary`). Icon: `Ionicons "add"` with color `c.background` (theme-adaptive). Position: `position: absolute`, `bottom: 56`, `alignSelf: 'center'`. Navigates to the "Add Expense/Income" screen.

8. Category breakdown list: SVG icon, name, percentage, numeric total with 2 decimal places and currency symbol (€ by default). Tapping a category navigates to "Transactions" filtered by that category.
- The chart total and every category total above follow the privacy setting ("Hide balances and totals", spec 003 §5.6): masked while it is on, revealed temporarily by the Home eye icon.

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
[x] After adding or modifying a transaction, the type tab switches to the transaction's type automatically.
[x] The 5 period tabs are displayed correctly.
[x] When selecting a period, a date can be chosen with the calendar modal.
[x] The date picker does not allow selecting future dates.
[x] Calendar pickers cannot go before 01 January 1900; inside the modal, arrows only browse and YearGrid pages stay fixed when a year is selected.
[x] The Period picker offers This year, 12 months, 30 days and 90 days, auto-checks a matching range, and unchecks after manual edits.
[x] The calendar modal header keeps two information lines; Week shows both full dates with their years.
[x] The donut chart is displayed correctly with period data.
[x] The total in the center of the donut stays fully visible inside the hole even for large amounts (font auto-shrinks to fit).
[x] Tapping the donut chart shows the bar chart, and vice versa.
[x] The selected chart type survives navigation/restart and defaults to the donut chart.
[x] The bar chart always shows the period total (centered above the bar, same style as the donut centre) with or without transactions.
[x] The "+" button navigates to the "Add Expense/Income" screen.
[x] The category list displays icon, name, percentage and total correctly.
[x] Tapping a category navigates to "Transactions" with that filter.
