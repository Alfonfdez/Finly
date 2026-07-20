# 021 — Category filter modal

- **Objective**
  Full-screen modal component for multi-select category filtering on the AllTransactionsScreen. Displays categories in a 4×N grid with search, an "All" chip, type-aware sections, and an Apply button. Used as a reusable component.

---

## Functional requirements

### 1. Modal trigger and props

- The modal is triggered by tapping the category filter button on AllTransactionsScreen.
- Props interface:
  ```typescript
  interface CategoryFilterModalProps {
    visible: boolean;
    categories: Category[];
    selectedIds: number[];
    type: 'all' | TransactionType;
    onApply: (ids: number[]) => void;
    onClose: () => void;
  }
  ```

### 2. Header and close

- Full-screen modal with `SafeAreaView`.
- Header with "Select categories" title (multilingual) and close (X) button at top right.
- Pressing X calls `onClose()` without applying changes.

### 3. Search bar

- `SearchBar` component at the top (same as AddCategoryScreen).
- Placeholder: "Search category" (multilingual, reuse `add_cat_search`).
- Filters categories by name (case-insensitive substring match).
- When search is active and returns no results, show empty state with search icon + "No results found" text.

### 4. "All" chip

- Always shown as the first element above the category grid.
- Label: "All" (multilingual, reuse `home_tag_all`).
- When tapped: selects ALL categories (clears individual selections, sets selectedIds to all category IDs).
- Visually: selected = `c.primary` background + `c.background` text; unselected = `surface` background + `text` text.
- The "All" chip is considered active when `selectedIds` contains all category IDs.

### 5. Category grid

- 4×N grid of categories (same layout as AddCategoryScreen).
- Each item shows: icon (with category color) + name.
- **Multi-select**: tapping a category toggles its selection state.
- Selected categories show a checkmark overlay (Ionicons `checkmark-circle`) in the top-right corner of the icon.
- Selected item background: `cat.color + '33'` with 2px border of `cat.color` (same as CategoryGrid selected style).

### 6. Type-aware sections

- When `type = 'all'`: categories are grouped into two sections with headers:
  - "Expenses" header → expense categories sorted with `sortCategoriesWithOthersLast`.
  - "Income" header → income categories sorted with `sortCategoriesWithOthersLast`.
- When `type = 'expense'`: only expense categories shown, no section header.
- When `type = 'income'`: only income categories shown, no section header.
- Section headers use `fs(13)`, `fontWeight: '600'`, `c.textSecondary` color, with 16px top margin.

### 7. Apply button

- Fixed at the bottom of the modal (inside SafeAreaView).
- Label: "Apply (N)" where N is the number of selected categories (multilingual).
- When all categories are selected (or "All" is active), label shows "Apply (All)".
- Background: `c.primary`. Text: `c.background`, `fontWeight: '700'`.
- Pressing Apply calls `onApply(selectedIds)` and closes the modal.

### 8. Empty state

- When search returns no matching categories: centered search icon + "No results found" text (reuse `add_cat_no_results`).

---

## Non-functional requirements

- **Component:** `src/components/CategoryFilterModal.tsx`.
- **Multilingual**: all texts use `t()`.
- **Configuration**: `useConfig().activeColors` for colors, `config.categoryIconShape` for round/square.
- **Text**: `useFontSize()` for scaling.
- **Categories sorted**: use `sortCategoriesWithOthersLast` from `constants/types.ts`.
- **Category grid**: 4 columns, `gap: 12`, `aspectRatio: 1` per item (same as AddCategoryScreen).

---

## Acceptance criteria

- [ ] The modal opens as a full-screen overlay when triggered.
- [ ] The header shows "Select categories" and a close (X) button.
- [ ] Pressing X closes the modal without applying changes.
- [ ] A SearchBar filters categories by name (case-insensitive).
- [ ] Empty state shows when search returns no results.
- [ ] The "All" chip is shown above the grid and is visually distinct.
- [ ] Tapping "All" selects all categories.
- [ ] When all categories are individually selected, "All" appears active.
- [ ] The category grid shows icon + color + name in a 4×N layout.
- [ ] Multi-select works: tapping toggles selection, checkmark shown on selected items.
- [ ] When type='all', categories are grouped under "Expenses" and "Income" headers.
- [ ] When type='expense' or 'income', only that type's categories are shown without headers.
- [ ] The Apply button shows the count of selected categories.
- [ ] When all are selected, Apply shows "Apply (All)".
- [ ] Pressing Apply calls onApply with the selected IDs and closes the modal.
- [ ] The modal respects the active theme and text size.
- [ ] All texts change when switching language.
