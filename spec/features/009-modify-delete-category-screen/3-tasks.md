# Tasks — 009 Edit/Delete Category Page
Execution order. Check each task as you complete it.

---

### Phase 1 — Infrastructure and Navigation

[x] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts` for all screen texts (title, type, delete, save, confirmation and selection modals).

[x] T2 — Update `src/constants/types.ts`: add `ModifyCategory` to `RootStackParamList` with parameter `categoryId: number` and create `ModifyCategoryScreenProps`. *(Already added by 008)*

[x] T3 — Update `src/navigation/AppNavigator.tsx`: add `ModifyCategoryScreen` to `HomeStack` with multilingual title and header style.

---

### Phase 2 — Repositories

[x] T4 — Modify `existsByName` in `categoryRepo.ts` and `webCategoryRepo.ts` to accept optional parameter `excludeId?: number` that excludes the current category from the check.

[x] T5 — Add `update(id, data)` function to `categoryRepo.ts` and `webCategoryRepo.ts` to update name, icon and/or color of an existing category. *(Already existed)*

[x] T6 — Add `remove(id)` function to `categoryRepo.ts` and `webCategoryRepo.ts` to delete a category. *(Already existed as `delete`)*

[x] T7 — Add `reassignCategory(oldCategoryId, newCategoryId)` function to `transactionRepo.ts` and `webTransactionRepo.ts` to reassign transactions from one category to another.

---

### Phase 3 — Delete Confirmation Modal Components

[x] T8 — Create delete confirmation modal (inline in ModifyCategoryScreen or separate component): dynamic title with category name, explanatory message, "Cancel" and "Delete" (red) buttons.

[x] T9 — Create target category selection modal (inline or separate component): "Select category" title, list of categories of the same type (excluding the current one) with radio button + icon + name, "Cancel" and "Select" buttons.

---

### Phase 4 — Main Screen

[x] T10 — Create `ModifyCategoryScreen.tsx` with:
  - Header with back button + title "Edit category" (multilingual).
  - Row with current category icon (background color) + editable input with current name.
  - Duplicate validation with 300ms debounce, excluding the current category.
  - Category type (informational, not editable).
  - Icon grid (reuse pattern from CreateCategoryScreen) with current icon pre-selected. When selecting an icon, the background color changes to the selected color.
  - Color grid (reuse `ColorGrid`) with current color pre-selected.
  - 7th circle: custom color if the current one is not among the 6 predefined.
  - `ColorPickerModal` for the "+".
  - "Delete" button (red) with double confirmation modal.

[x] T11 — Implement the complete deletion flow:
  - Modal 1: confirmation → choice between moving transactions or permanent delete.
  - Modal 2 (only when "Move transactions first"): select target category → when tapping "Select":
    - Call `transactionRepo.reassignCategory(oldId, newId)`.
    - Call `categoryRepo.remove(id)`.
    - Refresh categories and transactions (`refresh()`), navigate back.

[x] T11b — Make transaction deletion optional (not compulsory):
  - On delete confirm, check whether the category has linked transactions.
  - If it has transactions: show message + "Move transactions first" and "Permanent delete" buttons.
  - If it has no transactions: show empty message + only "Permanent delete" (no "Move" button).
  - "Permanent delete" deletes the category and its transactions directly (no reassignment).
  - Add i18n keys: `modify_cat_delete_confirm_message_empty`, `modify_cat_delete_confirm_move`; rename `modify_cat_delete_confirm_delete` to "Permanent delete".

[x] T12 — Implement the "Save" button:
  - Validation: disabled if name empty or duplicate.
  - On tap: update name, icon and color via `categoryRepository.update()`.
  - Refresh categories and navigate back.

---

### Phase 5 — Theme and Accessibility

[x] T13 — Apply `useConfig().activeColors` to all new components for dark/light theme support.

[x] T14 — Apply `useFontSize()` to all screen texts for scaling.

[x] T15 — Add `accessibilityLabel` and `accessibilityRole` to all interactive elements.

---

### Verification

[ ] T16 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test all acceptance criteria from `1-spec.md`. Verify:
  - Loading of current category data.
  - Name editing with duplicate validation.
  - Icon and color changes.
  - Deletion with reassignment to another category (via "Move transactions first").
- Deletion with permanent delete of the category and its transactions.
- Deletion of a category with no transactions (no "Move" button shown).
  - Language switching, theme, and text size.
