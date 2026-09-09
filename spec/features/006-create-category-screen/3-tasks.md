# Tasks — 006 Create Category Page
Execution order. Check each task as you complete it.

---

### Phase 1 — Infrastructure and Navigation

[ ] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts` for all screen texts (name, type, symbols, color, buttons, error texts, color modal).

[ ] T2 — Update `src/constants/types.ts`: add `CreateCategory` to `RootStackParamList` (with `type?: TransactionType` as optional parameter) and create `CreateCategoryScreenProps`.

[ ] T3 — Update `src/navigation/AppNavigator.tsx`: add `CreateCategoryScreen` to `HomeStack` with multilingual title and header style.

[ ] T4 — Connect the "Create" button in the grid on `AddCategoryScreen.tsx` to navigate to `CreateCategoryScreen`.

---

### Phase 2 — Name Validation and Duplicates

[ ] T5 — Add `existsByName(name: string): Promise<boolean>` function to `categoryRepo` (SQL: `SELECT COUNT(*) ... WHERE LOWER(name)=LOWER(?) AND user_id=1`) and to `webCategoryRepo` (case-insensitive filtering in localStorage).

[ ] T6 — Create the name input in `CreateCategoryScreen` with multilingual placeholder, "0/30" counter and duplicate validation with 300ms debounce. Show red error text if the name is empty or is a duplicate.

---

### Phase 3 — Selection Components

[ ] T7 — Create `IconGrid.tsx`: 4-column grid with ~40 predefined Ionicons (gray background `#334155`). Vertical scroll if they don't all fit. Single selection with visual highlight (primary border).

[ ] T8 — Create `ColorGrid.tsx`: 1×8 grid with 6 predefined colors (circles) + custom color circle (if exists) + gray "+". Single selection with selection ring + overlaid checkmark. When tapping "+", open `ColorPickerModal`.

[ ] T8b — Create `ColorPickerModal.tsx`: modal with `reanimated-color-picker` (Panel1 + HueSlider + OpacitySlider + Preview). OK/Cancel buttons to confirm or cancel. Custom color persists in the grid once chosen.

---

### Phase 4 — Main Screen

[ ] T9 — Create `CreateCategoryScreen.tsx` with header (back + title), name input with validation, type radios (Expenses/Incomes), `IconGrid`, `ColorGrid` with `ColorPickerModal`, dynamic help text and "Add" button.

[ ] T10 — Implement "Add" button validation: disabled if name empty, name duplicate, icon missing or color missing. Show red help text with priority (name → duplicate → icon/color).

[ ] T11 — Implement `handleCreate`: call `categoryRepository.create()` to insert the category, then navigate back to `AddCategoryScreen` with `{ type, categoryId }` using `setPendingCategory` (same pattern as `AddTransactionScreen`).

---

### Phase 5 — Theme and Accessibility

[ ] T12 — Apply `useConfig().activeColors` to all new components for dark/light theme support.

[ ] T13 — Apply `useFontSize()` to all screen texts for scaling.

[ ] T14 — Add `accessibilityLabel` and `accessibilityRole` to all interactive elements.

---

### Verification

[ ] T15 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test all acceptance criteria from `1-spec.md`. Verify:
  - Name input with empty and duplicate validation.
  - Type, icon and color selection.
  - "Add" button disabled until all requirements are met.
  - Category creation and return to `AddCategoryScreen` with the category selected.
  - Language change, theme and text size.
