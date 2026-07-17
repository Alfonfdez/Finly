# 020 — Tag filter on HomeScreen

- **Objective**
  On the HomeScreen, replace the current flat CategoryList with a per-category expandable tag section (3 visible tags + "View all (N)") and a horizontal tag chip filter bar below the period tabs. When a tag is selected in the filter bar, transactions are filtered by that tag, and the category breakdown updates accordingly.

---

## Functional requirements

### 1. Tag filter bar (horizontal chips)

- Located below PeriodTabs and above the chart section.
- Horizontal ScrollView of tag chips, same visual style as TagSection (rounded pills).
- First chip is "All" (always visible, selected by default). When "All" is selected, no tag filtering is applied.
- Remaining chips are the user's tags ordered by name.
- Tapping a tag chip selects it (single selection, replaces previous).
- The "All" chip is always the first chip (sticky).
- When no tags exist in the database, the filter bar is not rendered (hidden).
- Visual: selected chip = `primary` background + `background` text; unselected = `surface` background + `text` text.

### 2. Per-category tag breakdown

- In the CategoryList, each category row shows an expandable section.
- **Collapsed** (default): shows the top 3 tags used in that category's transactions for the active period, displayed as small chips (name only, no icon). If fewer than 3 tags, shows all.
- **Expanded**: shows all tags used in that category's transactions, plus a "View all (N)" text if there are more than 3.
- Tapping the "View all (N)" text expands the tag section in-place (no navigation).
- Tapping the category row still navigates to TransactionsScreen (existing behavior).
- Tags are loaded per-category from the database using a new repository method.

### 3. Filtering logic

- When a tag is selected in the filter bar:
  - `filteredTransactions` in AppContext is further filtered to only include transactions with the selected tag.
  - `activeCategories` recalculates totals based on the filtered set.
  - The donut/bar chart updates accordingly.
- When "All" is selected: no additional filtering (current behavior).
- Tag filtering works across all period types (day, week, month, year, custom).
- Tag filtering works across both expense and income types.

### 4. Database queries

- `transactionRepo.breakdownByTag(accountId, type, startDate, endDate)`: returns `{ tag_id, name, total }[]` for the period.
- `transactionRepo.breakdownByCategoryAndTag(accountId, categoryId, type, startDate, endDate)`: returns `{ tag_id, name, total }[]` for a specific category.
- `transactionRepo.listWithFilters(filters)`: extends existing `list()` with optional `tag_id` filter.

### 5. AppContext changes

- Add `activeTagId: number | null` state (null = "All").
- Add `setActiveTagId(id: number | null)` function.
- `filteredTransactions` memo adds tag filtering when `activeTagId` is not null.
- `activeCategories` recalculates with the tag-filtered transactions.

### 6. Web localStorage support

- Add `webTransactionRepo.breakdownByCategoryAndTag()` with JS filtering.
- Add `tag_id` filter to `webTransactionRepo.list()`.

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
- [ ] The "All" chip is always first and selected by default.
- [ ] Tapping a tag chip filters the category breakdown and chart to show only transactions with that tag.
- [ ] Tapping "All" removes the tag filter.
- [ ] When no tags exist, the filter bar is hidden.
- [ ] Each category row in CategoryList shows up to 3 tags as small chips.
- [ ] If a category has more than 3 tags, a "View all (N)" text is shown.
- [ ] Tapping "View all (N)" expands the tag section in-place to show all tags.
- [ ] The tag breakdown is per-category and per-period.
- [ ] Tag filtering works with all period types (day, week, month, year, custom).
- [ ] Tag filtering works with both expense and income types.
- [ ] All texts change when switching language.
- [ ] The screen respects the active theme and text size.
