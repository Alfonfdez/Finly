# Tasks — 014 Transactions page (from home screen)
Execution order. Check each task as you complete it.

---

### Phase 1 — Infrastructure and navigation

[ ] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts`: `transactions_title`, `transactions_empty`, `transactions_select_account`, `transactions_cancel`, `transactions_confirm`, `transactions_sort_date`, `transactions_sort_amount`.

[ ] T2 — Update `src/constants/types.ts`: extend `Transactions` parameters in `RootStackParamList` with `period`, `startDate`, `endDate`.

[ ] T3 — Verify `src/navigation/AppNavigator.tsx`: `TransactionsScreen` is already registered in `HomeStack`.

---

### Phase 2 — Components

[ ] T4 — Create `AccountSelector.tsx`: row with account icon (background color) + name + chevron-down. On tap, opens modal with account list (radio + icon + name + balance), Cancel/Select buttons.

[ ] T5 — Create `SortToggle.tsx`: row with "By date" and "By amount". Active option in primary color with arrow ↓/↑. On tapping text changes criterion; on tapping arrow inverts direction.

[ ] T6 — Create `TransactionGroup.tsx`: formatted date header + transaction list (category icon + category name + description + amount with color).

---

### Phase 3 — Main screen

[ ] T7 — Rewrite `TransactionsScreen.tsx` with:
  - Structure: `SafeAreaView > [categoryInfo, controls, SectionList, FAB(absolute)]`.
  - Stack navigator header (icon + "Transactions").
  - Category section: icon + name + total with color (green/red) and prefix (+/-).
  - `AccountSelector` with default account from AppContext.
  - `SortToggle` with default values (date, descending).
  - SectionList with `TransactionGroup` for each day.
  - Centered FAB "+" with `position: absolute` that navigates to `AddTransactionScreen`.
  - Empty state when there are no transactions.
  - No `keyboardSpacer`.

[ ] T8 — Implement transaction filtering: by selected account, category (route params), and period (route params startDate/endDate).

[ ] T9 — Implement sorting: by date or amount, ASC/DESC according to `SortToggle`.

---

### Phase 4 — Theme and accessibility

[ ] T10 — Apply `useConfig().activeColors`, `useFontSize()` and `accessibilityLabel` to all elements.

---

### Verification

[ ] T11 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test navigation from home category, account selector, sorting, FAB, empty state. Verify language change, theme, and text size change.
