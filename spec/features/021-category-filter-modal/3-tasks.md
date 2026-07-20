# Tasks — 021 Category filter modal
Execution order. Mark each task when completed.

---

### Phase 1 — Component

[ ] T1 — Create `src/components/CategoryFilterModal.tsx`: full-screen modal with SafeAreaView, header (title + close X), SearchBar, "All" chip, category grid (4×N), type-aware sections, Apply button with count. Internal state: `localSelectedIds`, `searchText`. Props: `visible`, `categories`, `selectedIds`, `type`, `onApply`, `onClose`.

[ ] T2 — Implement "All" chip logic: when tapped, set `localSelectedIds` to all category IDs. When all individual categories are selected, show "All" as active. When type changes, reset "All" state.

[ ] T3 — Implement type-aware sections: when `type='all'`, split categories into expense/income groups with section headers. When `type='expense'` or `'income'`, filter to that type only, no headers.

[ ] T4 — Implement search filtering: case-insensitive substring match on `getDisplayCategoryName(cat)`. Show empty state when no results.

---

### Phase 2 — Integration

[ ] T5 — Wire CategoryFilterModal into AllTransactionsScreen: add `categoryModalVisible` state, `selectedCategoryIds` state. Category button opens modal. Modal `onApply` updates `selectedCategoryIds`. Pass `type` tab value to modal.

[ ] T6 — Update AllTransactionsScreen transaction loading to pass `category_ids: selectedCategoryIds` (when non-empty) to `transactionRepository.list()`.

---

### Verification

[ ] T7 — Manual verification: open modal, test multi-select, test "All" chip, test search, test type-aware sections, test Apply and Close, verify filtering works on AllTransactionsScreen.
