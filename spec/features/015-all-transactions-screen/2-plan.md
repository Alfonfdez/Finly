# Implementation plan — 015 Transactions page (from hamburger menu)

## Architecture

This feature implements a standalone `AllTransactionsScreen.tsx` screen with a simple header (back arrow + "All transactions"). It reuses the components and hook from 014.

### Data flow

```
Drawer → navigation.navigate('AllTransactions')  [no params]
HomeScreen icon → navigation.navigate('AllTransactions')  [no params]
       → AllTransactionsScreen
       → useTransactionFilters({})  [loads ALL transactions]
       → local filtering by selectedAccountId
```

### Files

| File | Action |
|---------|--------|
| `src/screens/AllTransactionsScreen.tsx` | **Create** — screen SafeAreaView > [AccountSelector + total balance + SortToggle + SectionList + FAB(absolute)] |
| `src/navigation/AppNavigator.tsx` | **Modify** — register `AllTransactions` in Stack with title "All transactions" (i18n `nav_all_transactions`), update DrawerItem |
| `src/constants/types.ts` | **Modify** — add `AllTransactions` to `RootStackParamList` |

### Components reused from 014

- `AccountSelector.tsx` — account selector with modal.
- `SortToggle.tsx` — date/amount sort toggle.
- `TransactionGroup.tsx` — date header + transaction rows.
- `useTransactionFilters.ts` — filtering, sorting, and grouping hook.

---

## Verification criteria

1. Open hamburger menu → press "Transactions" → the transaction list for the active account is shown.
2. Change account with the selector → the transactions for the other account are shown.
3. No category or period filter is applied (all historical transactions for the account are shown).
4. Sorting works correctly (date/amount, ASC/DESC).
5. FAB "+" navigates to "Add transaction".
6. Empty state if the account has no transactions.
7. Header shows back arrow + "All transactions" (no category or period info).
