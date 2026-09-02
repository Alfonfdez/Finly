# 014 — Transactions page (from home screen)

- **Objective**
  Screen accessible from the home screen (HomeScreen) that displays the transaction list filtered by category, account, and period. Allows changing the account, sorting transactions, searching, multi-selecting transactions for bulk delete, and navigating to add a new transaction. All texts are multilingual (en/es/ca).

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
- Default account is the one selected on the HomeScreen (`activeAccount` from `AppContext`), including Total.
- On tap, opens an account selection modal:

**"Select an account" modal**
- Title: "Select an account" (multilingual).
- List of all user accounts **including Total**, each row with:
  - Radio button (single selection).
  - Account icon (with background color).
  - Account name.
  - Balance formatted with `formatCurrency()`.
- Only one account can be selected at a time.
- Buttons: "Cancel" (multilingual) and "Select" (multilingual).
- On tapping "Cancel", the modal closes without changing the account.
- On tapping "Select", the selected account is updated and filtered transactions are reloaded for that account.
- **Total account behavior**: when Total is selected, the account filter is skipped and all transactions for the category and period are shown (across all accounts).

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
- On tap, navigates to `AddTransactionScreen` (004), passing the route's `type` (expense/income).
- The button overlays the transaction list (position absolute).
- The button is hidden in selection mode (section 7).

### 6. Transaction search

- The header has a search icon (search-outline) toggle, same as Transactions/All-transactions management screens.
- Pressing the icon toggles a `SearchBar` below the category section and clears any active search text.
- Search is client-side, case-insensitive, multi-term (space-separated terms, all must match / AND).
- A term matches a transaction if it appears (substring, any position) in any of:
  - The transaction **comment/description** (`description` field).
  - The **category display name** (current language, via `getDisplayCategoryName`).
  - The **tag names** attached to the transaction.
  - The **account name**.
- Search composes with all other filters (account selector, tag filter, sort) — it filters the already-filtered set. The route-applied category and period filters are applied at load time.
- Closing the search bar restores the full filtered list.
- When a search yields no results, the empty state shows "No results found" (multilingual) with a search icon.

### 7. Multi-select bulk delete

- The header shows a "Select" (`a11y_select_mode`) button next to the search icon; pressing it toggles selection mode.
- When there are 0 transactions, the header Select and Search buttons are both hidden.
- In selection mode each transaction row shows a leading checkbox (`checkbox-outline` unchecked / `checkbox` checked in primary color); tapping a row toggles its selection instead of navigating to transaction details.
- The header search and search filtering keep working during selection mode; selection applies to the filtered list. The account selector and tag filter also keep working; selection persists across filter changes.
- The floating "+" button is hidden in selection mode.
- A bottom `SelectionActionBar` with "Cancel" and `Delete (N)` (`transactions_bulk_delete(n)`) appears; the delete button is disabled while no transactions are selected.
- Deleting opens a single `ConfirmationModal`: `Delete N transactions?` (`transactions_bulk_delete_confirm_title(n)`) with message "The selected transactions will be permanently deleted. This cannot be undone." (`transactions_bulk_delete_confirm_message`) and Cancel / Delete buttons.
- On confirm: `transactionRepository.deleteMany(ids)` cleans up photos, removes junction rows, and deletes the transactions in a single database transaction; the selection and selection mode reset, and the list reloads.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()` from the existing i18n system.
- **Configuration**: use `useConfig().activeColors` for colors.
- **Text**: use `useFontSize()` for scaling.
- **Navigation**: added to `HomeStack` in `AppNavigator.tsx`.
- **Layout structure:** `SafeAreaView > [categoryInfo, SearchBar(conditional), controls, SectionList, FAB(absolute)], SelectionActionBar(conditional), ConfirmationModal`. The FAB is a direct child of SafeAreaView with `position: absolute`. `keyboardSpacer` is not used.
- **Persistence**: transactions are loaded from `transactionRepository` (native SQLite / web localStorage).
- **Monetary format**: use existing `formatCurrency()` (maximum 2 decimals).
- **Icons**: `@expo/vector-icons` (Ionicons).

---

## Acceptance criteria

- [x] The Stack header shows a back button and title "Transactions".
- [x] Below the header, the category icon + category name is displayed.
- [x] Below the category name, the formatted total with color (green/red) and prefix (+/-) is displayed.
- [x] The selected account is shown with icon + name + chevron-down.
- [x] On tapping the account, the modal opens with the account list (radio + icon + name + balance).
- [x] The modal allows canceling or selecting a different account.
- [x] The sort toggle is displayed with "By date" and "By amount".
- [x] The active option has primary color and a direction arrow.
- [x] On tapping the arrow, the direction is inverted (ASC ↔ DESC).
- [x] On tapping the other option, the sort criterion changes.
- [x] By default, transactions are sorted by date descending.
- [x] Transactions are grouped by day with a formatted date header.
- [x] Each transaction shows category icon + name + description + amount with color.
- [x] The list is filtered by account, category, and period.
- [x] The Total account is shown in the account selector modal.
- [x] When the active account is Total (is_total=1), the account filter is skipped and all transactions for the category and period are shown.
- [x] If there are no transactions, the empty state is displayed.
- [x] The centered floating "+" button navigates to "Add transaction" (004).
- [x] All texts change when the language is changed.
- [x] The screen respects the active theme and text size.
- [x] The header shows a search icon; pressing it toggles a SearchBar.
- [x] The search matches comment/description, category display name, tag names and account name, case-insensitive.
- [x] Multi-term searches require all terms to match (AND).
- [x] Search composes with the account selector and the tag filter.
- [x] Closing the search bar clears it and restores the full filtered list.
- [x] An active search with no matches shows "No results found".
- [x] When there are no transactions, the header Select and Search actions are hidden.
- [x] "Select" in the header enters selection mode; transaction rows show checkboxes and tapping toggles selection instead of navigating.
- [x] The action bar shows `Delete (N)` with the selected count; it is disabled when nothing is selected.
- [x] Bulk delete confirms once for the whole batch and permanently deletes the selected transactions (including photos and tag links).
- [x] The floating "+" button navigates to "Add transaction" and is hidden in selection mode.
