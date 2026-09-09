# Tasks — 017 Modify transaction

Execution order. Mark each task when completed.

---

### Phase 1 — i18n infrastructure

[ ] T1 — Add i18n keys `modify_title`, `modify_save`, `modify_error_title`, `modify_error_message` to `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`.

---

### Phase 2 — Replace placeholder screen

[ ] T2 — Replace `ModifyTransactionScreen.tsx` (TODO placeholder) with the full implementation:
  - Import `useRoute`, `useNavigation`, `useApp`, `useConfig`, `useFontSize`, `t()`.
  - Get `transactionId` from `route.params`.
  - Find the transaction from `useApp().transactions`.
  - Find the associated category and account.
  - Preload local state with the transaction data.

[ ] T3 — Implement header (back arrow + "Modify transaction" title multilingual) using `useLayoutEffect` + `navigation.setOptions` or the Stack navigator header.

---

### Phase 3 — Form sections

[ ] T4 — Implement "Expenses/Income" tabs with `TypeTabs`, preloaded with the transaction's type. When changing type, reset `categoryId` and reload the grid.

[ ] T5 — Implement amount field:
  - Preload with `String(transaction.amount)` parsed.
  - Input with validation (`parseAmountInput`, `formatAmountDisplay`).
  - Currency symbol to the right.
  - Calculator icon that opens `CalculatorModal`.

[ ] T6 — Implement "Account" section:
  - Show the current transaction's account name.
  - When tapped, open `AccountModal` to change.

[ ] T7 — Implement category grid with `CategoryGrid`:
  - The transaction's current category must appear in the first position.
  - Fill with the next categories of the same type (up to 7).
  - "More" button with conditional logic (>7 → AddCategory, ≤7 → CreateCategory).

[ ] T8 — Implement day selector with `DaySelector`:
  - Preload with the day from `transaction.date`.
  - Calendar icon that opens `CalendarModal`.

[ ] T9 — Implement tags section with `TagSection`:
  - Selected tags state empty (TODO persistence).
  - Search and creation buttons functional.

[ ] T10 — Implement comment field with `CommentInput`:
  - Preload with `transaction.description || ''`.
  - Autocomplete with debounced search of existing comments.

[ ] T11 — Implement photo section with `PhotoSection`:
  - Same behavior as 004 (TODO functional).

---

### Phase 4 — Save button and persistence

[ ] T12 — Implement "Save" button validation:
  - Enabled only if: category selected, amount > 0, day selected, account selected.
  - Dynamic help text when disabled (reuse hints from 004).

[ ] T13 — Connect "Save" button:
  - Call `transactionRepository.update(transactionId, data)`.
  - Call `refresh()` from AppContext.
  - Navigate back (`navigation.goBack()`).
  - Handle errors with Alert.

---

### Phase 5 — Theme and accessibility

[ ] T14 — Verify all colors use `useConfig().activeColors` (not hardcoded).

[ ] T15 — Verify all texts use `fs()` for scaling.

[ ] T16 — Verify `npx tsc --noEmit` compiles without errors (or `npx expo lint`).

---

### Phase 6 — Verification

[ ] T17 — Verification: test on web and native:
  - Navigate from details to modify.
  - Verify correct preloading of all fields.
  - Change type, amount, account, category, day, comment.
  - Save and verify changes persist.
  - Verify the list refreshes when returning.
  - Verify changing language updates all texts.
  - Verify dark/light theme works.
  - Verify text scaling works.