# Tasks — 013 Create account page
Execution order. Mark each task as completed.

---

### Phase 1 — Infrastructure and navigation

[ ] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`: `create_account_title`, `create_account_name`, `create_account_note`, `create_account_button`, `create_account_error_empty`, `create_account_error_duplicate`, `create_account_error_icon`, `create_account_error_color`, `create_account_error_icon_color`.

[ ] T2 — Update `src/constants/types.ts`: add `CreateAccount` to `RootStackParamList` (no params) and create `CreateAccountScreenProps`.

[ ] T3 — Update `src/navigation/AppNavigator.tsx`: add `CreateAccountScreen` to the `HomeStack` with multilingual title and header style.

---

### Phase 2 — Database

[x] T4 — Function `existsByName(name: string, excludeId?: number): Promise<boolean>` already exists in `accountRepo` and `webAccountRepo` (added in 012, case-insensitive).

[x] T5 — `accountRepository.create()` already accepts the required fields (`name`, `icon`, `color`, `initial_balance`, `description`). Added in 012.

---

### Phase 3 — Main screen

[ ] T6 — Create `CreateAccountScreen.tsx` with:
  - Header with back button + title "Create account" (multilingual).
  - Name input with counter 0/30, placeholder, and empty + duplicate validation (300ms debounce).
  - Icon grid (reuse pattern from CreateCategoryScreen/ModifyAccountScreen) with ~20 financial icons. When selecting an icon, the background changes to the selected color.
  - Color grid (reuse `ColorGrid`) with 6 predefined + "+" for `ColorPickerModal`.
  - "Note" multiline input with counter 0/200.
  - "Create" button disabled if name, icon, or color is missing (or name is duplicate).

[ ] T7 — Implement "Create" button validation:
  - Disabled if: name empty, duplicate name, icon missing, color missing.
  - Dynamic red helper text by priority: empty name > duplicate > icon missing > color missing > both missing.

[ ] T8 — Implement the "Create" button:
  - On press: insert account in `accountRepository.create()` with `user_id: 1`, `initial_balance: 0`.
  - Navigate back to AccountsScreen (011).

---

### Phase 4 — Theme and accessibility

[ ] T9 — Apply `useConfig().activeColors`, `useFontSize()` and `accessibilityLabel` to all elements.

---

### Verification

[ ] T10 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test navigation from FAB, name validation (empty + duplicate), icon/color selection, note, and account creation.
