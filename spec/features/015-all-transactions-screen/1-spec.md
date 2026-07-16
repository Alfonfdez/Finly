# 015 — Transactions page (from hamburger menu)

- **Objective**
  Screen accessible from the hamburger menu (drawer) showing the user's full transaction list, without category or period filters. Allows filtering by account, sorting transactions, and navigating to add a new transaction. All texts are multilingual (es/en/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessible from two points:
  - **Hamburger menu (drawer):** pressing "Transactions".
  - **HomeScreen:** pressing the statistics icon (stats-chart-outline) at the top right.
- The screen has a back button (left arrow) in the header to return to the previous screen.
- The header title is "All transactions" (multilingual: es: "Todas las transacciones", en: "All transactions", ca: "Totes les transaccions").
- **No navigation parameters are passed** (no `categoryId`, `type`, `period`, `startDate`, `endDate`).
- All transactions from all categories, types, and periods are shown.

### 2. Account selector and balance

- Same as 014 (section 2).
- The default account is the one selected on HomeScreen (`activeAccount` from `AppContext`).
- Below the account selector, the total balance for the period for the selected account is shown:
  - Formatted with `formatCurrency()`.
  - Green color with "+" prefix if positive, red with "-" prefix if negative.

### 3. Sorting

- Same as 014 (section 3).

### 4. Transaction list

- FlatList with **all** user transactions, filtered only by:
  - Selected account (item 2).
- **Not filtered by category or period** (unlike 014).
- **Grouping by date:** same as 014 (section 4).
- If there are no transactions for the selected account, an empty state is shown: "No transactions" (multilingual).

### 5. Floating "+" button

- Floating "+" button centered at the bottom (same style as in 014 and 011).
- Background: `c.primary`. Icon: `Ionicons "add"` with color `c.background`.
- Position: `position: absolute`, `bottom: 56`, `alignSelf: 'center'`.

---

## Non-functional requirements

- **Screen:** `AllTransactionsScreen.tsx` (standalone screen, does not share component with 014).
- **Layout structure:** `SafeAreaView > [controls, SectionList, FAB(absolute)]`. The FAB is a direct child of SafeAreaView with `position: absolute`. No `keyboardSpacer` is used.
- **Shared components:** reuses `AccountSelector`, `SortToggle`, and `TransactionGroup` from 014.
- **Shared hook:** reuses `useTransactionFilters` for filtering, sorting, and grouping.
- Same as 014 for the remaining non-functional requirements (multilingual, config, text, icons).
- **Persistence**: transactions are loaded from `transactionRepository.list()` **without `account_id` filter** (loads all accounts), and filtered locally by the selected account.

---

## Acceptance criteria

- [ ] The screen is accessible from the hamburger menu and from the statistics icon on HomeScreen.
- [ ] The header shows a back arrow and title "All transactions" in the active language.
- [ ] The selected account is shown with icon + name + chevron-down.
- [ ] Pressing the account opens the modal with the account list (radio + icon + name + balance).
- [ ] The modal allows canceling or selecting a different account.
- [ ] Below the account selector, the total balance is shown with color (green/red) and prefix (+/-).
- [ ] The sort toggle with "By date" and "By amount" is shown.
- [ ] The active option has primary color and direction arrow.
- [ ] Pressing the arrow reverses the direction (ASC ↔ DESC).
- [ ] Pressing the other option changes the sort criterion.
- [ ] By default, transactions are sorted by date descending.
- [ ] All transactions from all categories and types are shown (no category or period filter).
- [ ] Transactions are grouped by day with a formatted date header.
- [ ] Each transaction shows category icon + name + description + amount with color.
- [ ] The list is filtered only by the selected account.
- [ ] If there are no transactions, an empty state is shown.
- [ ] The floating "+" button centered navigates to "Add transaction" (004).
- [ ] All texts change when changing the language.
- [ ] The screen respects the active theme and text size.
