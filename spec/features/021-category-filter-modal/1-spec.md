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

### 4. Preset chips

- A wrapping row of preset chips above the category grid, replacing the old "All" chip:
  - `type = all`: **All categories** (`filter_all_categories`), **All expenses** (`filter_all_expense_categories`), **All income** (`filter_all_income_categories`).
  - `type = expense`: only **All expenses**; `type = income`: only **All income** (never a preset of a type hidden by the tab).
- Tapping a preset selects its exact set: all category IDs, the expense IDs or the income IDs (it replaces any individual selection). Tapping the active preset again clears the selection (no filter), matching the old toggle.
- Visually: selected = `c.primary` background + `c.background` text; unselected = `surface` background + `text` text. Chips expose `accessibilityRole="button"` and `accessibilityState.selected`.

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
- Label is based on the **selection**, not the type tab:
  - Nothing selected: the type-aware no-filter label - "Apply (All categories)" on the All tab, "Apply (All expenses)" / "Apply (All income)" on a type tab.
  - Every category selected: "Apply (All categories)".
  - Exactly every expense category selected (even when chosen manually, or from the All tab): "Apply (All expenses)".
  - Exactly every income category selected: "Apply (All income)".
  - Any other selection: "Apply (N)" with the selected count.
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

- [x] The modal opens as a full-screen overlay when triggered.
- [x] The header shows "Select categories" and a close (X) button.
- [x] Pressing X closes the modal without applying changes.
- [x] A SearchBar filters categories by name (case-insensitive).
- [x] Empty state shows when search returns no results.
- [x] The All tab shows the three presets (All categories / All expenses / All income); a type tab shows only its matching preset.
- [x] Tapping a preset selects its exact set; tapping the active preset clears the selection.
- [x] Manually selecting every category of one type shows the matching "Apply (All expenses)" / "Apply (All income)" label.
- [x] The category grid shows icon + color + name in a 4×N layout.
- [x] Multi-select works: tapping toggles selection, checkmark shown on selected items.
- [x] When type='all', categories are grouped under "Expenses" and "Income" headers.
- [x] When type='expense' or 'income', only that type's categories are shown without headers.
- [x] The Apply button shows the count of selected categories.
- [x] An empty selection on the All tab shows "Apply (All categories)"; the type tabs keep "Apply (All expenses)" / "Apply (All income)".
- [x] Pressing Apply calls onApply with the selected IDs and closes the modal.
- [x] The modal respects the active theme and text size.
- [x] All texts change when switching language.
