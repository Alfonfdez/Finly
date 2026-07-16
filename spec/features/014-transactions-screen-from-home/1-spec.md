# 014 — Transactions page (from home screen)

- **Objective**
  Screen accessible from the home screen (HomeScreen) that displays the transaction list filtered by category, account, and period. Allows changing the account, sorting transactions, and navigating to add a new transaction. All texts are multilingual (en/es/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessed from `HomeScreen` by tapping a category from the breakdown (CategoryList).
- **Stack navigator header** with back button and title "Transactions" (multilingual).
- Category section below the header:
  - **Row 1:** category icon (with background color) + category name.
  - **Row 2:** formatted category total (`formatCurrency`), green with "+" prefix if positive, red with "-" prefix if negative.
- Navigation parameters passed: `categoryId` (optional), `type` (expense/income), `period`, `startDate`, `endDate`.

### 2. Account selector

- Horizontal row at the top, left side.
- Shows: account icon (with background color) + account name + chevron-down icon.
- Default account is the one selected on the HomeScreen (`activeAccount` from `AppContext`).
- On tap, opens an account selection modal:

**"Select an account" modal**
- Title: "Select an account" (multilingual).
- List of all user accounts, each row with:
  - Radio button (single selection).
  - Account icon (with background color).
  - Account name.
  - Balance formatted with `formatCurrency()`.
- Only one account can be selected at a time.
- Buttons: "Cancel" (multilingual) and "Select" (multilingual).
- On tapping "Cancel", the modal closes without changing the account.
- On tapping "Select", the selected account is updated and filtered transactions are reloaded for that account.

### 3. Sorting

- Horizontal row at the top, right side.
- Two sorting options that work as a toggle:
  - **"By date"** (multilingual): sorts by transaction date.
  - **"By amount"** (multilingual): sorts by transaction amount.
- The active option is displayed in primary color; the inactive one in a soft color.
- Next to the active option text, an arrow icon (↓ or ↑) indicates the direction:
  - ↓ = descending (highest to lowest / most recent to oldest).
  - ↑ = ascending (lowest to highest / oldest to most recent).
- On tapping the arrow icon, the direction is inverted (ASC ↔ DESC).
- On tapping the text of the other option, the sort criterion changes while keeping the current direction.
- **Default values:** sort by date descending (↓, most recent first).

### 4. Transaction list

- FlatList with transactions filtered by:
  - Selected account (point 2).
  - Category (navigation parameter `categoryId`).
  - Period (navigation parameters `startDate` and `endDate`).
- **Grouping by date:** transactions are grouped by day. Each group has:
  - **Header row:** formatted date (e.g., "July 14, 2026", multilingual).
  - **Transaction rows:** one per transaction of the day, with:
    - Category icon (with background color).
    - Category name.
    - Transaction description/message.
    - Amount formatted with `formatCurrency()`, green if income, red if expense.
- If there are no transactions for the selected filters, an empty state is shown: "No transactions" (multilingual).

### 5. Floating "+" button

- Floating "+" button centered at the bottom (same style as AccountsScreen).
- On tap, navigates to `AddTransactionScreen` (004).
- The button overlays the transaction list (position absolute).

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()` from the existing i18n system.
- **Configuration**: use `useConfig().activeColors` for colors.
- **Text**: use `useFontSize()` for scaling.
- **Navigation**: added to `HomeStack` in `AppNavigator.tsx`.
- **Layout structure:** `SafeAreaView > [categoryInfo, controls, SectionList, FAB(absolute)]`. The FAB is a direct child of SafeAreaView with `position: absolute`. `keyboardSpacer` is not used.
- **Persistence**: transactions are loaded from `transactionRepository` (native SQLite / web localStorage).
- **Monetary format**: use existing `formatCurrency()` (maximum 2 decimals).
- **Icons**: `@expo/vector-icons` (Ionicons).

---

## Acceptance criteria

- [ ] The Stack header shows a back button and title "Transactions".
- [ ] Below the header, the category icon + category name is displayed.
- [ ] Below the category name, the formatted total with color (green/red) and prefix (+/-) is displayed.
- [ ] The selected account is shown with icon + name + chevron-down.
- [ ] On tapping the account, the modal opens with the account list (radio + icon + name + balance).
- [ ] The modal allows canceling or selecting a different account.
- [ ] The sort toggle is displayed with "By date" and "By amount".
- [ ] The active option has primary color and a direction arrow.
- [ ] On tapping the arrow, the direction is inverted (ASC ↔ DESC).
- [ ] On tapping the other option, the sort criterion changes.
- [ ] By default, transactions are sorted by date descending.
- [ ] Transactions are grouped by day with a formatted date header.
- [ ] Each transaction shows category icon + name + description + amount with color.
- [ ] The list is filtered by account, category, and period.
- [ ] If there are no transactions, the empty state is displayed.
- [ ] The centered floating "+" button navigates to "Add transaction" (004).
- [ ] All texts change when the language is changed.
- [ ] The screen respects the active theme and text size.
