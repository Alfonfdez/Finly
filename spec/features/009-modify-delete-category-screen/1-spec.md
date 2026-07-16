# 009 — Edit/Delete Category Page

- **Objective**
Screen accessible from the categories screen (008) that allows the user to edit an existing category (name, icon, color), as well as delete it with transaction reassignment to another category of the same type. All texts are multilingual (en/es/ca).

---

## Functional Requirements

### 1. Access and Navigation

- The screen is accessed from the `CategoriesScreen` (008) grid by tapping a category.
- The screen has a back button (left arrow) in the header to return to `CategoriesScreen`.
- The header title is "Edit category" (multilingual).

### 2. Category Icon and Name

- Horizontal row: on the left, the category icon with its current background color. On the right, a text input with the current category name.
- The name is editable. Maximum 30 characters with a "0/30" counter.
- **Duplicate validation**: when editing the name, it checks that no other category already exists with the same name (case-insensitive), **excluding the current category**. That is, keeping the same name should not trigger an error; only if the new name matches a different category.
  - "Food", "food" and "FOOD" are considered duplicates.
  - If there is a duplicate, a red error text is shown below the input and the "Save" button remains disabled.
  - The check runs with a 300ms debounce.
- If the name is empty, the "Save" button is disabled.

### 3. Type

- Title: "Type" (multilingual).
- Shows the category type: "Expenses" if `expense`, "Income" if `income`.
- The type is not editable (informational only).

### 4. Symbols (Icons)

- Title: "Symbols" (multilingual).
- Grid of 4 columns × dynamic rows (vertical ScrollView if not all fit).
- Same ~40 predefined Ionicons as on the create category screen (006), with gray background.
- The current category icon must appear pre-selected when opening the screen.
- When tapping an icon, it is highlighted with a primary color border and the background changes slightly.
- Only one icon can be selected at a time.
- Icon selection is **not required** to save; if the user only wants to change the name, they can leave the current icon.
- When selecting an icon, the icon background color changes to the color selected in the color section so the user can see how the icon looks.

### 5. Color

- Title: "Color" (multilingual).
- Grid of 1 row × 8 columns.
- The first 6 positions are predefined circular colors.
- The 7th position shows the custom color chosen from the picker (if the current category color is not among the 6 predefined) **or** the current category color if it is a custom color.
- The 8th position is a "+" with gray color that opens the dynamic color picker modal (`ColorPickerModal` existing).
- The current category color must appear pre-selected when opening the screen. If the color matches one of the 6 predefined, that circle is marked as selected.
- When tapping a color, it is highlighted with a darker ring/border and an overlay checkmark.
- Only one color can be selected at a time.
- Color selection is **not required** to save.

#### Color Modal (reanimated-color-picker)

- Same existing `ColorPickerModal` component (created in 006).
- Opens when tapping "+".
- Panel1 + HueSlider + OpacitySlider + Preview + OK/Cancel buttons.
- When tapping OK, the color is selected and the custom circle is updated.

### 6. "Delete" Button

- "Delete" button (multilingual) with red style (`c.red`), located before the "Save" button.
- When tapped, a confirmation modal opens:

**Confirmation Modal 1 — "Delete category?"**
- Title: "Delete category "{categoryName}"" (multilingual, interpolates the category name).
- Message: "All transactions linked to this category will be moved to a category of your choice" (multilingual).
- Buttons: "Cancel" (multilingual) and "Delete" (multilingual, red color).
- When tapping "Cancel", the modal closes.
- When tapping "Delete", a second modal opens.

**Confirmation Modal 2 — "Select target category"**
- Title: "Select category" (multilingual).
- List of categories of the **same type** as the category to be deleted (excluding the current category), with:
  - Radio button (single selection).
  - Category icon.
  - Category name.
- Only one category can be selected at a time.
- Buttons: "Cancel" (multilingual) and "Select" (multilingual).
- When tapping "Cancel", the modal closes and returns to the edit screen.
- When tapping "Select":
  1. All transactions with `category_id = {deletedCategory}` are updated to `category_id = {selectedCategory}`.
  2. The category is deleted from the `categories` table.
  3. Navigation returns to `CategoriesScreen` (008).

### 7. "Save" Button

- "Save" button (multilingual) at the bottom.
- The button is disabled (gray) if ANY of these conditions apply:
  - The name is empty.
  - The name already exists (case-insensitive duplicate excluding the current one).
- Icon and color selection are **not required** — if the user does not modify them, the current values are kept.
- When tapping "Save":
  1. The category is updated in the database with the new values (name, icon, color).
  2. Navigation returns to `CategoriesScreen`.

### 8. Save Behavior

- The row in the `categories` table is updated with the form values.
- Only the fields the user modified are updated: name (if changed), icon (if changed), color (if changed).
- After the update, navigation goes to `CategoriesScreen` and categories are refreshed.

---

## Non-Functional Requirements

- **Multilingual**: all visible texts (titles, placeholders, buttons, errors, modals) must use `t()` from the existing i18n system.
- **Configuration**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is added to `HomeStack` in `AppNavigator.tsx`.
- **Persistence**: the category is updated/deleted in the `categoryRepository` (native SQLite or web localStorage).
- **Reassignment**: when deleting, transactions are reassigned via `transactionRepository` and then the category is deleted.
- **Icons**: use `@expo/vector-icons` (Ionicons) as in the rest of the app.

---

## Acceptance Criteria

- [ ] The header shows a back arrow and title "Edit category" in the active language.
- [ ] The current category icon with its background color + input with the current name is displayed.
- [ ] The name input has a maximum of 30 characters with a "0/30" counter.
- [ ] Duplicate validation excludes the current category (keeping the same name does not trigger an error).
- [ ] If there is a duplicate, "A category with this name already exists" is shown in red.
- [ ] If the name is empty, the "Save" button is disabled.
- [ ] The category type is displayed (informational only, not editable).
- [ ] ~40 icons are shown in a 4-column grid with the current icon pre-selected.
- [ ] When selecting an icon, the icon background color changes to the selected color.
- [ ] Colors are shown with the current color pre-selected.
- [ ] The 7th color circle shows the custom color if the current one is not among the 6 predefined.
- [ ] The "+" opens the existing `ColorPickerModal`.
- [ ] The "Save" button is disabled if the name is empty or is a duplicate.
- [ ] The red "Delete" button opens a confirmation modal with "Cancel" and "Delete".
- [ ] When tapping "Delete", a second modal opens with a list of categories of the same type (radio + icon + name).
- [ ] When tapping "Select", transactions are reassigned and the category is deleted.
- [ ] When tapping "Save", the category is updated and navigation returns to CategoriesScreen.
- [ ] All texts change when switching the language in settings.
- [ ] The screen respects the active theme (dark/light).
- [ ] The screen respects the configured text size.
