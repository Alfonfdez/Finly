# Tasks — 015 Transactions page (from hamburger menu)
Execution order. Mark each task when completed.

---

### Phase 1 — Implementation

[x] T1 — Create `src/screens/AllTransactionsScreen.tsx`: SafeAreaView > [AccountSelector, total period balance, SortToggle, SectionList with TransactionGroup, FAB "+", empty state]. FAB is a direct child of SafeAreaView. No `keyboardSpacer`.

[x] T2 — Add `AllTransactions: undefined` to `RootStackParamList` in `src/constants/types.ts`.

[x] T3 — Register `AllTransactionsScreen` in `src/navigation/AppNavigator.tsx` with Stack navigator header (list-outline icon + "All transactions" i18n `nav_all_transactions`).

[x] T4 — Update DrawerItem "Transactions" to navigate to `'Main', { screen: 'AllTransactions' }`. Update stats icon in HomeScreen to navigate to `'AllTransactions'`.

[x] T5 — Create `src/hooks/useTransactionFilters.ts` shared hook for transaction filtering, sorting, and grouping.

---

### Phase 2 — Manual verification

[ ] T6 — Open hamburger menu → press "Transactions" → verify that the screen is shown with header "All transactions" + AccountSelector + balance + SortToggle.

[ ] T6b — Press stats icon on HomeScreen → verify it opens the same AllTransactions screen.

[ ] T7 — Change account with the selector → verify that the transactions for the other account are shown.

[ ] T8 — Verify that no category or period filter is applied (all historical transactions are shown).

[ ] T9 — Verify sorting (date/amount, ASC/DESC), FAB "+", empty state, language change, and theme.

---

### Verification

[ ] T10 — Final verification: `npx expo start --web` and `npx expo start` (Expo Go). Test drawer navigation, account selector, sorting, FAB, empty state. Verify language change, theme, and text size.
