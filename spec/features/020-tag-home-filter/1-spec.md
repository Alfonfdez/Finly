# 020 — Tag filter on HomeScreen, TransactionsScreen, and AllTransactionsScreen

- **Objective**
  On the HomeScreen, replace the current flat CategoryList with a per-category expandable tag section (3 visible tags + "View all (N)") and a horizontal multi-select tag chip filter bar below the chart. When tags are selected in the filter bar, transactions are filtered by those tags (OR logic), and the category breakdown updates accordingly. An "Untagged" chip handles transactions with no tags. The TransactionsScreen also displays a tag filter bar that inherits tags from the HomeScreen and allows independent refinement. The AllTransactionsScreen displays its own tag filter bar with local state and a dynamic balance that reflects filtered transactions.

---

## Functional requirements

### 1. Tag filter bar (horizontal chips)

- **HomeScreen**: located below the chart and above the CategoryList.
- **TransactionsScreen**: located below the controls section (AccountSelector + SortToggle) and above the SectionList. Inherits tags from HomeScreen via nav params; allows user to toggle/clear independently.
- Horizontal ScrollView of tag chips, same visual style as TagSection (rounded pills).
- **Multi-select**: multiple chips can be active simultaneously. OR logic — selecting [Urgent] + [Family] shows transactions that have either tag.
- **"All" chip** (always first, sticky): when tapped, clears all selections (resets to unfiltered). Visually active when no chips are selected.
- **"Untagged" chip** (always second, after "All"): represents transactions with zero tags. Exclusive with regular tags — tapping [Untagged] deselects all regular tags, and tapping a regular tag deselects [Untagged].
- Remaining chips are the user's tags ordered by name.
- Tapping a chip toggles its selection state.
- When no tags exist in the database, the filter bar is not rendered (hidden).
- Visual: selected chip = `primary` background + `background` text; unselected = `surface` background + `text` text.

### 2. Per-category tag breakdown

- In the CategoryList, each category row shows an expandable section.
- **Collapsed** (default): shows the top 3 tags used in that category's transactions for the active period, displayed as small chips (name only, no icon). If fewer than 3 tags, shows all. The "Untagged" chip is included if the category has untagged transactions.
- **Expanded**: shows all tags used in that category's transactions, plus a "View all (N)" text if there are more than 3. The count includes "Untagged" as a distinct entry.
- Tapping the "View all (N)" text expands the tag section in-place (no navigation).
- Tapping the category row still navigates to TransactionsScreen (existing behavior).
- Tags are loaded per-category from the database using a new repository method.

### 3. Filtering logic

- When tag(s) are selected in the filter bar:
  - `filteredTransactions` in AppContext is further filtered:
    - **Regular tags (OR)**: include transactions that have at least one of the selected tags.
    - **Untagged only**: include transactions with zero tags.
  - `activeCategories` recalculates totals based on the filtered set.
  - The donut/bar chart updates accordingly.
- When "All" is selected (empty `activeTagIds`): no additional filtering (current behavior).
- Tag filtering works across all period types (day, week, month, year, custom).
- Tag filtering works across both expense and income types.

### 4. Tag filter inheritance and TransactionsScreen filter bar

- When tapping a category on the HomeScreen, the active `activeTagIds` are passed as navigation parameter `tagIds` to the TransactionsScreen.
- The TransactionsScreen displays its own TagFilterBar, initialized with the inherited `tagIds` from the navigation params.
- The user can toggle or clear tags independently on the TransactionsScreen — this does NOT affect the HomeScreen's `activeTagIds`.
- When no `tagIds` are passed (navigating from the hamburger menu or other entry points), the filter bar shows "All" selected (unfiltered).
- When tags are selected on the TransactionsScreen, the transaction list filters in real-time (OR logic, same as HomeScreen).
- The tag filter parameter is optional — if not passed, all transactions for the category are shown (current behavior).

### 5. AllTransactionsScreen filter bar

- The AllTransactionsScreen displays its own TagFilterBar, located below the controls section (AccountSelector + SortToggle) and above the SectionList.
- **No navigation params** — the filter always starts with "All" selected (unfiltered).
- The user can toggle or clear tags independently on the AllTransactionsScreen — this does NOT affect the HomeScreen's or TransactionsScreen's `activeTagIds`.
- When tags are selected, the transaction list filters in real-time (OR logic, same as HomeScreen and TransactionsScreen).
- **Dynamic balance**: the period total balance shown below the AccountSelector updates to reflect only the tag-filtered transactions (not all transactions). When "All" is selected, the balance shows the total for all transactions on the selected account.
- Uses the same `TagFilterBar` component, `localTagIds` state, and `tagsByTransaction` loading pattern as TransactionsScreen.
- Filter bar is hidden when no tags exist in the database (same behavior as other screens).

### 6. Database queries

- `transactionRepo.breakdownByCategoryAndTag(accountId, categoryId, type, startDate, endDate)`: returns `{ tag_id: number; name: string; total: number }[]` for a specific category and period. Includes an "Untagged" row (tag_id = -1, name from i18n) for untagged transactions.
- `transactionRepo.listWithFilters(filters)`: extends existing `list()` with optional `tagIds: number[]` filter (OR logic). When tagIds contains -1, includes untagged transactions.
- `transactionRepo.getTagsByTransactionIds(transactionIds: number[])`: batch query returning `{ transaction_id: number; tag_id: number; name: string }[]` for a set of transaction IDs. Used by TransactionGroup to display tags per row.

### 7. AppContext changes

- Add `activeTagIds: number[]` state (empty array = "All").
- Add `toggleTagId(id: number)` function (handles exclusive Untagged logic).
- Add `clearTagFilter()` function (resets to empty array).
- `filteredTransactions` memo adds tag filtering when `activeTagIds.length > 0`.
- `activeCategories` recalculates with the tag-filtered transactions.

### 8. Web localStorage support

- Add `webTransactionRepo.breakdownByCategoryAndTag()` with JS filtering.
- Add `tagIds` filter to `webTransactionRepo.list()`.
- Add `getTagsByTransactionIds()` to `webTransactionRepo`.

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()`.
- **Configuration**: `useConfig().activeColors` for colors.
- **Text**: `useFontSize()` for scaling.
- **Performance**: tag breakdown queries should be efficient (indexed).
- **Layout**: tag chips use horizontal ScrollView, no wrapping.
- **Tag chips in CategoryList**: small size (fs(11)), compact padding, no icon.

---

## Acceptance criteria

- [ ] A horizontal tag filter bar appears below PeriodTabs on HomeScreen.
- [ ] The "All" chip is always first and selected by default (when no tags are selected).
- [ ] The "Untagged" chip is always second after "All".
- [ ] Multiple tag chips can be selected simultaneously (OR logic).
- [ ] Selecting [Untagged] deselects all regular tags, and vice versa.
- [ ] Tapping "All" clears all tag selections.
- [ ] Tapping a tag chip filters the category breakdown and chart to show only transactions with that tag.
- [ ] When no tags exist, the filter bar is hidden.
- [ ] Each category row in CategoryList shows up to 3 tags as small chips (including "Untagged" if applicable).
- [ ] If a category has more than 3 tags, a "View all (N)" text is shown (count includes "Untagged").
- [ ] Tapping "View all (N)" expands the tag section in-place to show all tags.
- [ ] The tag breakdown is per-category and per-period.
- [ ] Tag filtering works with all period types (day, week, month, year, custom).
- [ ] Tag filtering works with both expense and income types.
- [ ] Tapping a category passes `tagIds` to TransactionsScreen.
- [ ] TransactionsScreen displays a TagFilterBar initialized with inherited tags.
- [ ] TransactionsScreen tag filter is independent from HomeScreen (toggle/clear doesn't affect Home).
- [ ] TransactionsScreen filters transactions by selected tags (OR logic).
- [ ] When navigating without tagIds, TagFilterBar shows "All" selected (unfiltered).
- [ ] AllTransactionsScreen displays a TagFilterBar below controls, initialized with "All" selected.
- [ ] AllTransactionsScreen tag filter is independent from HomeScreen and TransactionsScreen.
- [ ] AllTransactionsScreen filters transactions by selected tags (OR logic).
- [ ] AllTransactionsScreen balance updates dynamically to reflect tag-filtered transactions.
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
