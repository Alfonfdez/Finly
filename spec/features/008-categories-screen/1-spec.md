# 008 — Categories page

- **Goal**
Screen accessible from the Drawer (hamburger menu) that displays all existing categories organized by type (expense/income) and allows navigating to creating new categories or modifying existing ones. All texts are multilingual (en/es/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessed from the "Categories" item in the Drawer Navigator (hamburger menu).
- The header has a hamburger menu button on the left to open/close the Drawer.
- The header title is "Categories" (multilingual).
- To the right of the title, a search button (magnifying glass icon) toggles the search bar (section 5).

### 2. Type tabs

- Two tabs below the header: "Expenses" / "Income" (multilingual).
- Reuses the existing `TypeTabs` component.
- "Expenses" is selected by default.
- When switching tabs, the categories of the selected type are displayed.

### 3. Categories grid

- Below the tabs, the categories of the active type are displayed in a 4-column × N-row grid (vertical scroll if they don't fit).
- Each category is displayed as: icon with the category color as background + name below.
- The grid is vertically scrollable if there are many categories.
- Tapping a category navigates to the "Modify category" screen (009) with the selected category as a parameter (`categoryId`).

### 4. "Create" button

- In the last position of the grid, a "+" button with the text "Create" (multilingual) is displayed.
- Tapping the "Create" button navigates to the existing "Create category" screen (006), passing the active type as a parameter.
- The limit is per type (30, `MAX_CATEGORIES_PER_TYPE`): when the active tab's type already has 30 categories, the "Create" button is hidden and the message "Maximum of 30 categories per type reached" (reuse `create_cat_error_limit`) is shown centered below the grid, so the user understands why the button is missing.
- The check is reactive: switching tabs re-evaluates the limit for the other type (if income is below 30, the "Create" button is shown on the Income tab even when expense is at the cap).
- The "Create category" screen (006) keeps its own guard (Add button disabled + message) as a safety net for other entry points.
- A counter below the tabs shows how many categories the active type has out of the maximum, e.g. "21 of 30 categories" (`categories_counter`), updating when switching tabs.

### 5. Search

- To the right of the header title, a search button (magnifying glass icon) that toggles the search bar.
- When active, a `SearchBar` appears below the tabs with placeholder "Search category" (multilingual, reuse `add_cat_search`).
- To the right of the input, an "x" button closes the search and restores the full grid.
- Search filters the categories of the currently active type (expense/income) client-side.
- Matching is case-insensitive and by characters contained in the category's display name in the current language (via `getDisplayCategoryName`), so default categories are searchable by their translated name in the active language only. Multi-word terms must all be contained in the name.
- When a search returns no results, the empty state shows a search icon + "No results found" (reuse `add_cat_no_results`).

### 6. Multi-select bulk delete

- The header shows a "Select" (`categories_select`) text button next to the search icon, only when the active type has at least one category; pressing it toggles selection mode (label switches to "Done", `categories_select_done`).
- In selection mode each tile shows a checkmark and tapping toggles its selection instead of navigating to Modify category; the "Create" tile, the limit message and the counter are hidden; the header search keeps filtering during selection.
- Selection is scoped to the active type: switching the Expense/Income tabs exits selection mode and clears the selection.
- In selection mode a bottom action bar (reuse `SelectionActionBar`) shows "Cancel" and `Delete (N)` (`categories_bulk_delete(n)`), where N is the number of selected categories; the delete button is disabled while no categories are selected.
- Deleting must keep at least one category per type so a transaction can still be created: selecting every category of the active type and pressing Delete blocks with the message "You cannot delete all the categories of a type. Keep at least one." (`categories_bulk_delete_min_one`).
- If no selected category has transactions, pressing Delete opens a single `ConfirmationModal`: `Delete N categories?` (`categories_bulk_delete_confirm_title(n)`) with "The selected categories will be permanently deleted." (`categories_bulk_delete_confirm_message_empty`).
- If any selected category has transactions, the modal message states how many of the selected categories have transactions (`categories_bulk_delete_confirm_message_tx(n, total)`) and offers two actions:
  - "Move transactions first" (`categories_bulk_delete_confirm_move`) opens a resolution modal (`BulkCategoryTransferModal`, `categories_bulk_move_title`) listing each selected category with transactions (icon + name + transaction count, `categories_bulk_move_transactions(n)`). Each row opens a nested `CategoryTransferModal` with an extra destructive "Delete transactions" option (`categories_bulk_move_delete_option`); unresolved rows show "Choose…" (`categories_bulk_move_choose`). The confirm button "Move & delete" (`categories_bulk_move_confirm`) stays disabled until every listed category has a decision. On confirm, `categoryRepo.bulkDeleteWithTargets(items)` runs: categories with a numeric target have their transactions moved there, categories set to "Delete transactions" — and all selected categories without transactions — are deleted together in one transaction. A footer note (`categories_bulk_move_note`) states that categories without transactions are deleted directly.
  - "Permanent delete" (`categories_bulk_delete_confirm_delete`) calls `categoryRepo.deleteMany(ids)` (transactions and their photos are removed too).
- After any bulk delete, `refreshCategories()` and `refresh()` reload the lists and the screen exits selection mode.

---

## Non-functional requirements

- **Multilingual**: all visible texts (titles, tabs, buttons) must use `t()` from the existing i18n system. No hardcoded strings are allowed.
- **Configuration**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is added to `HomeStack` in `AppNavigator.tsx` and the "Categories" DrawerItem is connected to navigate to it.
- **Persistence**: categories are loaded from the existing repository (`categoryRepository`), filtered by type and active user.

---

## Acceptance criteria

- [x] The Drawer shows "Categories" and tapping it navigates to the categories screen.
- [x] The header shows the hamburger menu button and the title "Categories" in the active language.
- [x] Two tabs "Expenses"/"Income" are shown with "Expenses" selected by default.
- [x] When switching tabs, the categories of the corresponding type are displayed in a 4×N grid.
- [x] Each category shows an icon with a colored background + name below.
- [x] The grid is vertically scrollable if there are many categories.
- [x] The "Create" button (icon "+" + text) is in the last position of the grid.
- [x] Tapping "Create" navigates to "Create category" (006) with the active type.
- [x] When the active tab's type has 30 categories, the "Create" button is hidden and "Maximum of 30 categories per type reached" is shown below the grid.
- [x] Switching to a type below the cap restores the "Create" button.
- [x] A counter below the tabs shows how many categories the active type has out of the maximum and updates when switching tabs.
- [x] Tapping a category navigates to "Modify category" (009) with the selected category.
- [x] The header shows a search button that opens/closes the "Search category" bar below the tabs.
- [x] Typing filters the active type's categories by the current-language display name (case-insensitive, multi-term).
- [x] Closing the search restores the full grid.
- [x] A search with no matches shows a search icon + "No results found".
- [x] "Select" in the header enters selection mode (shown only when the active type has categories); tiles show checkmarks and tapping toggles selection instead of navigating.
- [x] In selection mode the "Create" tile, the limit message and the counter are hidden; the action bar shows `Delete (N)` with the selected count and is disabled when nothing is selected.
- [x] Switching the Expense/Income tabs exits selection mode and clears the selection.
- [x] Selecting every category of the active type blocks deletion with the "keep at least one per type" message.
- [x] Bulk delete of categories without transactions confirms once and removes them all.
- [x] Bulk delete of categories with transactions offers "Move transactions first" (target limited to same-type categories not selected) or "Permanent delete".
- [x] Bulk delete with transactions lets choosing a different destination per category ("Delete transactions" included) and confirms only once every category with transactions has a decision.
- [x] After a bulk delete, the category grid and transaction data update.
- [x] All texts change when switching the language in settings.
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.
