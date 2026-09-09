# Implementation plan — 017 Modify transaction

## Files to create

```
src/
├── i18n/
│   ├── en.ts          ← add modify_* keys
│   ├── es.ts          ← add modify_* keys
│   └── ca.ts          ← add modify_* keys
```

## Files to modify

```
src/
├── screens/
│   └── ModifyTransactionScreen.tsx   ← replace placeholder with full implementation
│
├── navigation/
│   └── AppNavigator.tsx              ← update title to multilingual if not already
│
└── i18n/
    ├── en.ts                         ← add modify_*
    ├── es.ts                         ← add modify_*
    └── ca.ts                         ← add modify_*
```

## Existing files REUSED (without modification)

```
src/
├── components/
│   ├── TypeTabs.tsx                  ← Expenses/Income tabs
│   ├── AccountModal.tsx              ← account selection modal
│   ├── CategoryGrid.tsx              ← 4×2 category grid + "More" button
│   ├── DaySelector.tsx               ← 3×1 day grid
│   ├── CalendarModal.tsx             ← calendar modal for day selector
│   ├── CalculatorModal.tsx           ← calculator for amount input
│   ├── TagSection.tsx                ← tags section
│   ├── CommentInput.tsx              ← comment field with counter
│   └── PhotoSection.tsx              ← photo section
│
├── hooks/
│   └── useFontSize.ts                ← text scaling
│
├── context/
│   ├── AppContext.tsx                ← refresh() to reload after saving
│   └── ConfigContext.tsx             ← config (currency, separator, language)
│
├── constants/
│   └── types.ts                      ← ModifyTransaction already in RootStackParamList
│
├── database/
│   └── index.ts                      ← transactionRepository already exported
│
└── utils/
    └── formatters.ts                 ← formatCurrency, formatDateForDB, isSameDay
```

---

## Architecture

### ModifyTransactionScreen

Screen that replaces the current placeholder. Copies the layout and logic of `AddTransactionScreen.tsx` with these differences:

1. **Data preloading**: when the screen mounts, loads the transaction from `transactions.find(tx => tx.id === transactionId)` and preloads:
   - `type` → `transaction.type`
   - `amountRaw` → `parseAmountInput(String(transaction.amount))` (or formatted)
   - `accountId` → `transaction.account_id`
   - `categoryId` → `transaction.category_id`
   - `day` → new Date(transaction.date)
   - `comment` → `transaction.description || ''`
   - `selectedTags` → `[]` (tags are not persisted, TODO)

2. **Category grid**: the transaction's current category is placed in the first position of the visible grid, followed by the remaining categories of the same type (excluding the one already displayed), until completing 7 items + "More" button.

3. **Submit button**: changes from "Add" to "Save". When tapped, calls `transactionRepository.update()` instead of `create()`.

4. **After saving**: calls `refresh()` and `navigation.goBack()`.

### Data flow

```
TransactionDetailsScreen
  └── [Edit] → navigation.navigate('ModifyTransaction', { transactionId })
                    │
                    ▼
            ModifyTransactionScreen
              ├── useRoute → transactionId
              ├── useApp() → transactions, accounts, categories, refresh()
              ├── Preload: find transactionById
              ├── Same components as AddTransaction:
              │   ├── TypeTabs (preloaded)
              │   ├── AmountInput (preloaded) + CalculatorModal
              │   ├── AccountSelector (preloaded) + AccountModal
              │   ├── CategoryGrid (preloaded, current in first position)
              │   ├── DaySelector (preloaded) + CalendarModal
              │   ├── TagSection (preloaded, TODO persistence)
              │   ├── CommentInput (preloaded)
              │   └── PhotoSection (TODO)
              └── "Save" button
                    │
                    ▼
            transactionRepository.update(transactionId, {
              account_id, category_id, type, amount, description, date
            })
                    │
                    ▼
            refresh() + goBack()
```

## New i18n keys

| Key | es | en | ca |
|---|---|---|---|
| `modify_title` | Modificar transacción | Modify transaction | Modificar transacció |
| `modify_save` | Guardar | Save | Guardar |
| `modify_error_title` | Error | Error | Error |
| `modify_error_message` | No se ha podido guardar la transacción | Failed to save transaction | No s'ha pogut guardar la transacció |

## Decisions

- **Maximum reuse**: all components from `AddTransactionScreen` are reused without modification. Only the screen that orchestrates them changes.
- **Preloading in local state**: transaction data is loaded from the Context (`transactions.find()`) and copied to the form's local state.
- **Single update method**: `transactionRepository.update()` already exists and supports `Partial<Transaction>`, so only modified fields are sent.
- **Non-persistent tags**: tags are not saved to the database currently, so they are not preloaded. The TODO is documented.

## Verification

1. `npx expo start --web` — test in browser: navigation from details, correct preloading, modifying fields, saving.
2. `npx expo start` + Expo Go — test on native.
3. Validate all acceptance criteria from `1-spec.md`.
4. Verify that changing the language updates all texts.
5. Verify that returning to the list refreshes data.