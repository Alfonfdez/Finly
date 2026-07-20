# Implementation plan — 021 Category filter modal

## Architecture

A reusable full-screen modal component for multi-select category filtering. It is stateful internally (manages its own selected IDs copy) and communicates the final selection via `onApply`.

### Data flow

```
AllTransactionsScreen
  → state: selectedCategoryIds (number[])
  → CategoryFilterModal
    → internal state: localSelectedIds (copy of selectedCategoryIds)
    → onApply(localSelectedIds) → AllTransactionsScreen updates selectedCategoryIds
    → onClose() → modal closes, no changes
```

### Files

| File | Action |
|------|--------|
| `src/components/CategoryFilterModal.tsx` | **Create** — full-screen modal component |
| `src/screens/AllTransactionsScreen.tsx` | **Modify** — integrate modal trigger and state |

### Components reused

- `SearchBar.tsx` — search input with close button.
- `sortCategoriesWithOthersLast` — category sorting helper.
- `getDisplayCategoryName` — multilingual category name.

---

## Verification criteria

1. Tap category button on AllTransactionsScreen → modal opens full-screen.
2. "All" chip is selected by default when all categories are selected.
3. Search filters categories in real-time.
4. Tap categories → checkmarks appear/disappear.
5. When type='all', sections "Expenses" and "Income" with headers are shown.
6. When type='expense', only expense categories shown.
7. Apply button count updates with selection.
8. Press Apply → modal closes, AllTransactionsScreen filters by selected categories.
9. Press X → modal closes without changes.
