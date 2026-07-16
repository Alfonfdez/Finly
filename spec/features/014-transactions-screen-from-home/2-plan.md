# Implementation plan — 014 Transactions page (from home screen)

## Files to create

```
src/
├── screens/
│   └── TransactionsScreen.tsx       ← rewrite existing screen (currently basic)
│
├── components/
│   ├── AccountSelector.tsx          ← account row + selection modal
│   ├── SortToggle.tsx               ← By date / By amount toggle with arrow
│   └── TransactionGroup.tsx         ← group of transactions by day (header + rows)
```

## Files to modify

```
src/
├── i18n/
│   ├── en.ts                        ← add keys for Transactions
│   ├── es.ts                        ← add keys for Transactions
│   └── ca.ts                        ← add keys for Transactions
│
├── navigation/
│   └── AppNavigator.tsx             ← update TransactionsScreen options
│
├── constants/
│   └── types.ts                     ← extend Transactions parameters
│
└── context/
    └── AppContext.tsx                ← verify that activeAccount is available
```

---

## Architecture

### TransactionsScreen (rewrite)

Screen that displays filtered and sorted transactions. Layout structure: `SafeAreaView > [categoryInfo, controls, SectionList, FAB(absolute)]`. `keyboardSpacer` is not used. Local state:

```ts
interface TransactionsState {
  selectedAccountId: number;         // active account (default: activeAccount from AppContext)
  sortBy: 'date' | 'amount';        // sort criterion
  sortDirection: 'asc' | 'desc';    // direction
}
```

Navigation parameters:

```ts
Transactions: {
  categoryId?: number;
  type?: TransactionType;
  period?: Period;
  startDate?: string;
  endDate?: string;
} | undefined;
```

Header: uses the Stack navigator header (icon + "Transactions").
Category section: icon + name + total with color (green/red) and prefix (+/-).

### AccountSelector

- Shows a row with account icon (background color) + name + chevron-down.
- On tap, opens a modal with the account list (radio + icon + name + balance).
- Props: `accounts: Account[]`, `selectedId: number`, `onSelect(id: number)`, `onCancel()`.
- Reuses the existing account modal pattern from HomeScreen (`AccountModal`).

### SortToggle

- Horizontal row with two texts: "By date" and "By amount".
- The active option has primary color + arrow icon (↓/↑).
- The inactive option has a soft color.
- On tapping the other option's text: changes criterion, keeps direction.
- On tapping the arrow: inverts direction (ASC ↔ DESC).
- Props: `sortBy: 'date' | 'amount'`, `direction: 'asc' | 'desc'`, `onToggleSort(field)`, `onToggleDirection()`.

### TransactionGroup

- Header: formatted date (e.g., "July 14, 2026").
- Transaction list for the day: category icon + category name + description + amount.
- Props: `date: string`, `transactions: Transaction[]`, `categories: Category[]`.

### Data flow

```
HomeScreen → tap category → TransactionsScreen { categoryId, type, period, startDate, endDate }
  ├── load filtered transactions (account + category + period)
  ├── AccountSelector → change account → reload transactions
  ├── SortToggle → change sort → reorder list
  └── FAB "+" → navigate to AddTransactionScreen
```

### i18n

| Key | EN | ES | CA |
|---|---|---|---|
| `transactions_title` | Transactions | Transacciones | Transaccions |
| `transactions_empty` | No transactions | No hay transacciones | No hi ha transaccions |
| `transactions_select_account` | Select account | Seleccionar cuenta | Seleccionar compte |
| `transactions_cancel` | Cancel | Cancelar | Cancel·lar |
| `transactions_confirm` | Select | Seleccionar | Seleccionar |
| `transactions_sort_date` | By date | Por fecha | Per data |
| `transactions_sort_amount` | By amount | Por cantidad | Per quantitat |

### Persistence

Transactions are loaded from `transactionRepository.list()` with filters:
- `account_id = selectedAccountId`
- `category_id = categoryId` (if provided)
- `date >= startDate AND date <= endDate` (if provided)

Sorting is done in memory after loading.

---

## Decisions

- **Rewrite vs create new**: the existing `TransactionsScreen.tsx` is rewritten (currently a basic placeholder).
- **Reuse components**: the existing `AccountModal` is adapted for the account selector with radio buttons.
- **In-memory sorting**: transactions are loaded filtered from the DB and sorted in JS to keep things simple.
- **Extended navigation parameters**: `period`, `startDate`, `endDate` are added to filter by the period from the HomeScreen.

## Verification

1. `npx expo start --web` — test navigation from home category, account selector, sorting.
2. `npx expo start` + Expo Go — test on native.
3. Validate all acceptance criteria from `1-spec.md`.
4. Change language and verify texts.
5. Change theme and verify colors.
6. Change text size and verify scaling.
