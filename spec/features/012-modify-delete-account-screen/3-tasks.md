# Tasks — 012 Edit/Delete Account Page
Execution order. Mark each task when completed.

---

### Phase 1 — Infrastructure and Navigation

[ ] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`: `modify_account_title`, `modify_account_name`, `modify_account_note`, `modify_account_save`, `modify_account_error_empty`, `modify_account_error_duplicate`, `modify_account_delete`, `modify_account_delete_confirm_title`, `modify_account_delete_confirm_message`, `modify_account_delete_confirm_cancel`, `modify_account_delete_confirm_delete`.

[ ] T2 — Update `src/constants/types.ts`: add `ModifyAccount` to `RootStackParamList` with parameter `accountId: number` and create `ModifyAccountScreenProps`.

[ ] T3 — Update `src/navigation/AppNavigator.tsx`: add `ModifyAccountScreen` to `HomeStack` with multilingual title and header style.

---

### Phase 2 — Database

[ ] T4 — Add `description?: string` field to the `Account` interface in `src/database/types.ts`.

[ ] T5 — Create migration `006_account_description.ts` with `ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT ''`.

[ ] T6 — Update `DATABASE_VERSION` in `src/database/database.ts` and add the migration.

[ ] T7 — Update `accountRepo.update()` and `webAccountRepo.update()` to include the `description` field.

[ ] T8 — Add `deleteByAccountId(id: number)` function to `transactionRepo.ts` and `webTransactionRepo.ts` to delete all transactions associated with an account.

---

### Phase 3 — Main Screen

[ ] T9 — Create `src/constants/accountIcons.ts` file with the `ACCOUNT_ICONS` list (~20 financial icons). This list is shared with 013-pagina-crear-cuenta.

[ ] T10 — Create `ModifyAccountScreen.tsx` with:
  - Header with back button + title "Modify account" (multilingual).
  - Name input with 0/30 counter, empty validation and duplicate validation (300ms debounce, exclude current account).
  - Icon grid (reuse pattern from CreateCategoryScreen) with current icon preselected. When selecting an icon, background color changes to selected color.
  - Color grid 8 columns (reuse `ColorGrid` with "modify" mode): 6 predefined + custom circle (only if current color is not predefined) + "+". Current color preselected.
  - `ColorPickerModal` for the "+".
  - Multiline "Note" input with 0/200 counter.
  - "Save" button disabled if name is empty or duplicate.

[ ] T11 — Implement "Save" button:
  - Validation: disabled if name is empty or duplicate (excluding current account).
  - Dynamic red helper text: "Enter an account name" or "An account with this name already exists".
  - When tapped: update name, icon, color and description via `accountRepository.update()`.
  - Navigate back to AccountsScreen.

[ ] T12 — Implement "Delete" button + confirmation modal:
  - "Delete" button (red) located before the "Save" button.
  - Confirmation modal: title with account name, message about transaction deletion, "Cancel" and "Delete" buttons (red).
  - When tapping "Delete": call `transactionRepo.deleteByAccountId(id)`, `accountRepo.delete(id)`, `refreshAccounts()`, navigate back.

---

### Phase 4 — Theme and Accessibility

[ ] T13 — Apply `useConfig().activeColors`, `useFontSize()` and `accessibilityLabel` to all elements.

---

### Verification

[ ] T14 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test data loading, name editing, icon/color change, note, saving and account deletion with transactions.
