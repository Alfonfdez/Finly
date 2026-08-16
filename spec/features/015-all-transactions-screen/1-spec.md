# 015 — All transactions screen

- **Objective**
  Screen accessible from the hamburger menu (drawer) showing the user's full transaction list with advanced filtering: type tabs (All/Expenses/Income), multi-select category filter, period selector, account selector, tag filter, free-text search, and sorting. All texts are multilingual (es/en/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessible from two points:
  - **Hamburger menu (drawer):** pressing "Transactions".
  - **HomeScreen:** pressing the statistics icon (stats-chart-outline) at the top right.
- The screen has a back button (left arrow) in the header to return to the previous screen.
- The header title is "All transactions" (multilingual).
- **No navigation parameters are passed** (no `categoryId`, `type`, `period`, `startDate`, `endDate`).

### 2. Type tabs

- Three tabs shown at the top of the screen: **All | Expenses | Income**.
- "All" is selected by default (shows both expense and income transactions).
- Uses the new `AllTypeTabs` component (separate from the 2-tab `TypeTabs` used on HomeScreen).
- Selecting a tab filters the transaction list by `type` field:
  - "All" → no type filter (shows all).
  - "Expenses" → `type = 'expense'`.
  - "Income" → `type = 'income'`.
- The balance below the account selector updates to reflect the selected type.

### 3. Account selector and balance

- Same as 014 (section 2).
- The default account is the one selected on HomeScreen (`activeAccount` from `AppContext`), including Total.
- **Total account behavior**: when the selected account is Total, the `account_id` filter is skipped and all transactions for the active filters are shown.
- **AccountModal**: includes Total as a selectable option alongside all other accounts.
- Below the account selector, the total balance is shown:
  - Formatted with `formatCurrency()`.
  - Green color with "+" prefix if positive, red with "-" prefix if negative.
  - Balance reflects **all active filters** (type, category, period, tags).

### 4. Category filter

- A trigger button/pill in the controls area shows the current category filter state:
  - Default: "All categories" (multilingual).
  - When categories are selected: "N categories" (multilingual, where N is the count).
- Tapping the button opens the `CategoryFilterModal` (spec 021).
- The modal receives the current `type` tab value so it adapts its category display.
- When categories are selected, only transactions matching those categories are shown.
- When "All" is selected (empty array), all categories are shown.

### 5. Period selector

- `PeriodTabs` component with 5 options: Day | Week | Month | Year | Period.
- Default: **Year** (current year).
- `CalendarPicker` shown below the period tabs, same as HomeScreen.
- Period date ranges computed the same way as HomeScreen (day/week/month/year/custom).
- The transaction list filters by the selected period's start/end dates.

### 6. Sorting

- Same as 014 (section 3).

### 7. Tag filter

- `TagFilterBar` below the period section, same as current implementation.
- Local state (`localTagIds`), independent from HomeScreen.

### 8. Transaction search

- The header has a search icon (search-outline) toggle, same as Tags/Categories management screens.
- Pressing the icon toggles a `SearchBar` below the type tabs and clears any active search text.
- Search is client-side, case-insensitive, multi-term (space-separated terms, all must match / AND).
- A term matches a transaction if it appears (substring, any position) in any of:
  - The transaction **comment/description** (`description` field).
  - The **category display name** (current language, via `getDisplayCategoryName`).
  - The **tag names** attached to the transaction.
  - The **account name**.
- Search composes with all other filters (account, type tab, categories, period, tags, sort) — it filters the already-filtered set.
- Closing the search bar restores the full filtered list.
- When a search yields no results, the empty state shows "No results found" (multilingual) with a search icon.

### 9. Transaction list

- FlatList with transactions filtered by **all active filters**:
  - Selected account.
  - Type tab (All/Expenses/Income).
  - Selected categories (from CategoryFilterModal).
  - Selected period (start/end dates).
  - Selected tags (from TagFilterBar).
  - Search text (from the SearchBar).
- **Grouping by date:** same as 014 (section 4).
- If there are no transactions matching the filters, an empty state is shown: "No transactions" (multilingual).

### 10. Floating "+" button

- Floating "+" button centered at the bottom (same style as in 014 and 011).
- Background: `c.primary`. Icon: `Ionicons "add"` with color `c.background`.
- Position: `position: absolute`, `bottom: 56`, `alignSelf: 'center'`.

---

## Non-functional requirements

- **Screen:** `AllTransactionsScreen.tsx` (standalone screen).
- **Layout structure:** `SafeAreaView > [AllTypeTabs, SearchBar(conditional), controls(AccountSelector+Balance+CategoryButton+SortToggle), PeriodTabs, CalendarPicker, TagFilterBar, SectionList, FAB(absolute)]`.
- **Shared components:** reuses `AccountModal`, `SortToggle`, `TransactionGroup`, `TagFilterBar`, `PeriodTabs`, `CalendarPicker`.
- **New components:** `AllTypeTabs`, `CategoryFilterModal` (spec 021).
- **Repository:** `transactionRepository.list()` extended with `category_ids` filter.
- Same as 014 for the remaining non-functional requirements (multilingual, config, text, icons).

---

## Acceptance criteria

- [x] The screen is accessible from the hamburger menu and from the statistics icon on HomeScreen.
- [x] The header shows a back arrow and title "All transactions" in the active language.
- [ ] Three type tabs (All | Expenses | Income) are shown, with "All" selected by default.
- [ ] Selecting "Expenses" shows only expense transactions; "Income" shows only income.
- [ ] The selected account is shown with icon + name + chevron-down.
- [ ] Pressing the account opens the modal with the account list.
- [ ] The Total account is shown in the account selector modal.
- [ ] When the active account is Total, the account filter is skipped and all transactions matching other filters are shown.
- [ ] The balance updates dynamically based on all active filters (type, category, period, tags).
- [ ] A category filter button shows "All categories" by default or "N categories" when filtered.
- [ ] Tapping the category button opens the CategoryFilterModal (021).
- [ ] Selecting categories in the modal filters the transaction list.
- [ ] PeriodTabs (Day/Week/Month/Year/Period) are shown with "Year" selected by default.
- [ ] CalendarPicker updates when the period changes.
- [ ] The transaction list filters by the selected period's date range.
- [ ] The sort toggle works (date/amount, ASC/DESC).
- [ ] TagFilterBar is shown and works with local state.
- [ ] A search icon is shown in the header; pressing it toggles a SearchBar.
- [ ] The search matches comment/description, category display name, tag names and account name, case-insensitive.
- [ ] Multi-term searches require all terms to match (AND).
- [ ] Search composes with the other filters (type, category, period, tags, account).
- [ ] Closing the search bar clears it and restores the full filtered list.
- [ ] An active search with no matches shows "No results found".
- [ ] All filters combine (AND logic) to produce the final transaction list.
- [ ] Transactions are grouped by day with a formatted date header.
- [ ] If no transactions match, an empty state is shown.
- [ ] The floating "+" button navigates to "Add transaction".
- [ ] All texts change when changing the language.
- [ ] The screen respects the active theme and text size.
