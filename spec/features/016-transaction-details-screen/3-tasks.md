# Tasks — 016 Transaction details

---

### Phase 1 — Infrastructure

[x] T1 — Add new i18n keys `details_*` and `type_expense`/`type_income` to `en.ts`, `es.ts`, and `ca.ts`.

[x] T2 — Add `formatDateLong(date, language)` to `src/utils/formatters.ts`.

[x] T3 — Add `TransactionDetails: { transactionId: number }` and `ModifyTransaction: { transactionId: number }` to `RootStackParamList` in `src/constants/types.ts`.

[x] T4 — Create `TransactionDetailsScreenProps` in `src/constants/types.ts`.

[x] T5 — Add `TransactionDetails` and `ModifyTransaction` to the Stack in `AppNavigator.tsx`.

---

### Phase 2 — Details screen

[x] T6 — Create `TransactionDetailsScreen.tsx` with:
  - Data card with 5 rows (Amount, Account, Category, Date, Comment).
  - Each row: label on the left (textSecondary), value on the right.
  - Amount with type color (green income / red expense) and sign (+/-).
  - Account and Category: icon 28×28 + name, right-aligned.
  - Comment shows "No comment" in textSecondary if empty.

[x] T7 — Load data from context (transactions, categories, accounts).

[x] T8 — Add the footer "Created HH:mm dd MMM yyyy" with year always visible.

---

### Phase 3 — Action buttons

[x] T9 — Implement "Delete" button with confirmation modal:
  - Modal with title "Delete this transaction?"
  - "No" button (closes modal) and "Yes" button (deletes + goBack).
  - On delete, call `refresh()` from AppContext.

[x] T10 — Implement "Edit" button that navigates to `ModifyTransaction` with `transactionId` (TODO — placeholder screen).

---

### Phase 4 — Listing integration

[x] T11 — Modify `TransactionGroup.tsx` so each transaction is tappable with `onTransactionPress`.

[x] T12 — Modify `TransactionsScreen.tsx` and `AllTransactionsScreen.tsx` to pass `onTransactionPress` and use `useFocusEffect` + `refreshTrigger` to reload data when returning.

---

### Phase 5 — Auto-refresh

[x] T13 — Add `refreshTrigger` parameter to `useTransactionFilters.ts` so listing screens reload data when regaining focus (after delete/edit).

---

### Phase 6 — Verification

[x] T14 — Verification: test on web and native that tapping a transaction shows the correct details, delete works, listing refreshes, and the edit button navigates to the placeholder.

[x] T15 — Validate that `npx tsc --noEmit` compiles without errors.
