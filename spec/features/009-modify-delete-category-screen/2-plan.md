# Implementation Plan — 009 Edit/Delete Category Page

## Architecture

### New Components

- **ModifyCategoryScreen.tsx**: Main screen with current icon + editable name input, type selector (informational), icon grid, color grid, "Delete" button with double confirmation modal and "Save" button.
- **ConfirmDeleteModal.tsx** (or inline in ModifyCategoryScreen): Delete confirmation modal with dynamic title, message, and Cancel/Delete buttons.
- **SelectCategoryModal.tsx** (or inline): Modal with a list of categories of the same type with radio button to select the target category.

### Modified Files

- **AppNavigator.tsx**: Add `ModifyCategoryScreen` to `HomeStack`.
- **types.ts**: Add `ModifyCategory` to `RootStackParamList` (with parameter `categoryId: number`) and `ModifyCategoryScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Add multilingual keys for the new screen, modals, and buttons.
- **categoryRepo.ts / webCategoryRepo.ts**:
  - Modify `existsByName` to accept an optional parameter `excludeId?: number` to exclude a specific category from the check.
  - Add `update(id, data)` function if it does not already exist.
  - Add `remove(id)` function if it does not already exist.
- **transactionRepo.ts / webTransactionRepo.ts**: Add `reassignCategory(oldCategoryId, newCategoryId)` function to reassign transactions.

### Reused Components

- Existing `IconGrid` (or the inline grid from CreateCategoryScreen).
- Existing `ColorGrid`.
- Existing `ColorPickerModal`.

### Navigation Flow

```
CategoriesScreen → tap category → ModifyCategoryScreen { categoryId }
  ├── tap "Save" → updateCategory() → navigate back
  └── tap "Delete" → Modal1 confirmation → "Delete"
       → Modal2 select category → "Select"
       → reassignTransactions() + deleteCategory() → navigate back
```

### Duplicate Validation (with exclusion)

- Modify `existsByName(name: string, excludeId?: number): Promise<boolean>` in `categoryRepo` and `webCategoryRepo`.
- SQL: `SELECT COUNT(*) FROM categories WHERE user_id = 1 AND LOWER(name) = LOWER(?) AND id != ?`.
- Web: case-insensitive filtering in localStorage excluding the current ID.
- Runs with a 300ms debounce when the name changes.

### Transaction Reassignment

- Add `reassignCategory(oldCategoryId: number, newCategoryId: number): Promise<void>` to `transactionRepo`.
- SQL: `UPDATE transactions SET category_id = ? WHERE category_id = ?`.
- Web: update all transactions in localStorage with `category_id === oldCategoryId`.

---

## UI States

### ModifyCategoryScreen

```
┌─────────────────────────────────┐
│ ← Edit category                 │  ← Header with back button
├─────────────────────────────────┤
│ ┌────────┐ ┌──────────────────┐ │
│ │  icon  │ │ Name             │ │  ← Current icon + editable input
│ │(color) │ │ category         │ │
│ └────────┘ └──────────────────┘ │
│ 0/30                           │  ← Counter
│ [Error text in red]            │  ← Only if name empty or duplicate
├─────────────────────────────────┤
│ Type                           │  ← Section title
│ Expenses / Income              │  ← Informational only
├─────────────────────────────────┤
│ Symbols                        │  ← Section title
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← Grid 4 cols, ~40 icons
│ └──┘ └──┘ └──┘ └──┘           │     (current icon pre-selected)
│ ...                            │
├─────────────────────────────────┤
│ Color                          │  ← Section title
│ ( ) ( ) ( ) ( ) ( ) ( ) (+)    │  ← Current color pre-selected
├─────────────────────────────────┤
│ ┌─────────────────────────┐     │
│ │     Delete (red)        │     │  ← Delete button
│ └─────────────────────────┘     │
│ ┌─────────────────────────┐     │
│ │        Save             │     │  ← Button (disabled if name invalid)
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Confirmation Modal — Delete (Scenario A: category HAS transactions)

```
┌─────────────────────────────────┐
│ Delete category                 │
│ "{categoryName}"                │  ← Dynamic title
├─────────────────────────────────┤
│ Before deleting the category,   │
│ its transactions will be moved  │  ← Message (has transactions)
│ to another category             │
├─────────────────────────────────┤
│ [Cancel] [Move transactions     │  ← Move first opens target modal
│  first] [Permanent delete]      │  ← Permanent delete in red
└─────────────────────────────────┘
```

### Confirmation Modal — Delete (Scenario B: category has NO transactions)

```
┌─────────────────────────────────┐
│ Delete category                 │
│ "{categoryName}"                │  ← Dynamic title
├─────────────────────────────────┤
│ This category will be           │
│ permanently deleted.            │  ← Message (no transactions)
├─────────────────────────────────┤
│ [Cancel]           [Permanent   │  ← Permanent delete in red
│                    delete]      │     (no "Move" button)
└─────────────────────────────────┘
```

### Selection Modal 2 — Select Target Category

```
┌─────────────────────────────────┐
│ Select category                 │  ← Title
├─────────────────────────────────┤
│ ○ icon Category name 1          │  ← Radio + icon + name
│ ● icon Category name 2          │     (only same type as the
│ ○ icon Category name 3          │      category to be deleted)
├─────────────────────────────────┤
│ [Cancel]       [Select]         │
└─────────────────────────────────┘
```

---

## i18n

New keys needed:

| Key | EN | ES | CA |
|---|---|---|---|
| `modify_cat_title` | Edit category | Modificar categoría | Modificar categoria |
| `modify_cat_type` | Type | Tipo | Tipus |
| `modify_cat_delete` | Delete | Eliminar | Eliminar |
| `modify_cat_save` | Save | Guardar | Guardar |
| `modify_cat_delete_confirm_title` | Delete category "{name}" | Eliminar la categoría "{name}" | Eliminar la categoria "{name}" |
| `modify_cat_delete_confirm_message` | Before deleting the category, its transactions will be moved to another category | Antes de eliminar la categoría, sus transacciones se moverán a otra categoría | Abans d'eliminar la categoria, les seves transaccions es mouran a una altra categoria |
| `modify_cat_delete_confirm_message_empty` | This category will be permanently deleted. | Esta categoría se eliminará permanentemente. | Aquesta categoria s'eliminarà permanentment. |
| `modify_cat_delete_confirm_cancel` | Cancel | Cancelar | Cancel·lar |
| `modify_cat_delete_confirm_delete` | Permanent delete | Eliminar permanentemente | Eliminar permanentment |
| `modify_cat_delete_confirm_move` | Move transactions first | Mover transacciones primero | Moure les transaccions primer |
| `modify_cat_select_title` | Select category | Seleccione la categoría | Seleccioneu la categoria |
| `modify_cat_select_cancel` | Cancel | Cancelar | Cancel·lar |
| `modify_cat_select_confirm` | Select | Seleccionar | Seleccionar |

---

## Repositories

### categoryRepo — additional functions

```ts
// Already exists:
existsByName(name: string): Promise<boolean>

// Modify:
existsByName(name: string, excludeId?: number): Promise<boolean>

// Add if they don't exist:
update(id: number, data: Partial<CreateCategoryInput>): Promise<void>
remove(id: number): Promise<void>
```

### transactionRepo — additional function

```ts
reassignCategory(oldCategoryId: number, newCategoryId: number): Promise<void>
```

---

## Dependencies

- Existing i18n system (`src/i18n/index.ts`).
- ConfigContext for colors and text scaling.
- Repositories: `categoryRepository`, `transactionRepository`.
- React Navigation v7 (HomeStack).
- Existing components: `ColorGrid`, `ColorPickerModal`, `IconGrid` (or inline grid from CreateCategoryScreen).
- `@expo/vector-icons` (Ionicons) for icons.

---

## Estimation

- **Tasks**: 15 tasks in 5 phases
- **Estimated time**: 3-4 hours
