# 020 — Tag filter on HomeScreen

- **Objective**
  On the HomeScreen, replace the current flat CategoryList with a per-category expandable tag section (3 visible tags + "View all (N)") and a horizontal multi-select tag chip filter bar below the period tabs. When tags are selected in the filter bar, transactions are filtered by those tags (OR logic), and the category breakdown updates accordingly. An "Untagged" chip handles transactions with no tags.

---

## Functional requirements

### 1. Tag filter bar (horizontal chips)

- Located below PeriodTabs and above the chart section.
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

### 4. Tag filter inheritance

- When tapping a category on the HomeScreen, the active `activeTagIds` are passed as navigation parameter `tagIds` to the TransactionsScreen.
- The TransactionsScreen filters its transaction list by the received `tagIds` (OR logic, same as HomeScreen).
- The tag filter parameter is optional — if not passed, all transactions for the category are shown (current behavior).

### 5. Database queries

- `transactionRepo.breakdownByCategoryAndTag(accountId, categoryId, type, startDate, endDate)`: returns `{ tag_id: number; name: string; total: number }[]` for a specific category and period. Includes an "Untagged" row (tag_id = -1, name from i18n) for untagged transactions.
- `transactionRepo.listWithFilters(filters)`: extends existing `list()` with optional `tagIds: number[]` filter (OR logic). When tagIds contains -1, includes untagged transactions.
- `transactionRepo.getTagsByTransactionIds(transactionIds: number[])`: batch query returning `{ transaction_id: number; tag_id: number; name: string }[]` for a set of transaction IDs. Used by TransactionGroup to display tags per row.

### 6. AppContext changes

- Add `activeTagIds: number[]` state (empty array = "All").
- Add `toggleTagId(id: number)` function (handles exclusive Untagged logic).
- Add `clearTagFilter()` function (resets to empty array).
- `filteredTransactions` memo adds tag filtering when `activeTagIds.length > 0`.
- `activeCategories` recalculates with the tag-filtered transactions.

### 7. Web localStorage support

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
- [ ] TransactionsScreen filters by received `tagIds` (OR logic).
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
