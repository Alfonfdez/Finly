# Implementation plan — 016 Transaction details

## Files to create

```
src/
├── screens/
│   ├── TransactionDetailsScreen.tsx   ← new details screen
│   └── ModifyTransactionScreen.tsx    ← placeholder (TODO) for editing transaction
│
└── i18n/
    ├── en.ts                          ← add keys details_*
    ├── es.ts                          ← add keys details_*
    └── ca.ts                          ← add keys details_*
```

## Files to modify

```
src/
├── navigation/
│   └── AppNavigator.tsx               ← add TransactionDetails + ModifyTransaction to Stack
│
├── constants/
│   └── types.ts                       ← add TransactionDetails + ModifyTransaction to RootStackParamList
│
├── components/
│   └── TransactionGroup.tsx           ← make each transaction tappable (onPress)
│
├── screens/
│   └── TransactionsScreen.tsx         ← pass onPress + refreshTrigger to TransactionGroup
│   └── AllTransactionsScreen.tsx      ← pass onPress + refreshTrigger to TransactionGroup
│
├── hooks/
│   └── useTransactionFilters.ts       ← add refreshTrigger parameter to reload on focus
│
└── utils/
    └── formatters.ts                  ← add formatDateLong(date, language)
```

## New i18n keys

| Key | en | es | ca |
|---|---|---|---|
| `details_title` | Transaction details | Detalles de la transacción | Detalls de la transacció |
| `details_amount` | Amount | Cantidad | Quantitat |
| `details_account` | Account | Cuenta | Compte |
| `details_category` | Category | Categoría | Categoria |
| `details_date` | Date | Fecha | Data |
| `details_comment` | Comment | Comentario | Comentari |
| `details_no_comment` | No comment | Sin comentario | Sense comentari |
| `details_delete` | Delete | Eliminar | Eliminar |
| `details_delete_title` | Delete this transaction? | ¿Quiere eliminar la transacción? | Voleu eliminar la transacció? |
| `details_delete_yes` | Yes | Sí | Sí |
| `details_delete_no` | No | No | No |
| `details_edit` | Edit | Editar | Editar |
| `details_created` | Created | Creado | Creat |
| `type_expense` | Expense | Gasto | Despesa |
| `type_income` | Income | Ingreso | Ingrés |

## Component architecture

```
AppNavigator (Stack)
  └── TransactionDetailsScreen
        ├── DataCard (label/value rows)
        │   ├── Amount (with type color: green/red)
        │   ├── Account (icon 28×28 + name, right-aligned)
        │   ├── Category (icon 28×28 + name, right-aligned)
        │   ├── Date (long format: "July 14, 2026")
        │   └── Comment (or "No comment" in gray)
        ├── DeleteButton → DeleteConfirmationModal
        ├── EditButton → navigates to ModifyTransaction (TODO)
        └── CreatedFooter ("Created HH:mm dd MMM yyyy")
```

## Navigation

```ts
// RootStackParamList
TransactionDetails: { transactionId: number };
ModifyTransaction: { transactionId: number };  // TODO
```

From `TransactionGroup.tsx`, each transaction item is wrapped in a `TouchableOpacity` that navigates to `TransactionDetails`.

## Long date format

```ts
function formatDateLong(date: Date, language: string): string {
  // en: "July 14, 2026"
  // es: "14 de julio de 2026"
  // ca: "14 de juliol de 2026"
}
```

## Deletion flow

1. User taps "Delete"
2. Modal appears with title "Delete this transaction?"
3. User taps "Yes"
4. `transactionRepository.delete(transactionId)` is called
5. `refresh()` from AppContext is called
6. Navigation goes back (`navigation.goBack()`)
7. When returning to the listing, `useFocusEffect` increments `refreshTrigger`, which forces `useTransactionFilters` to reload from the database.

## Verification

1. `npx expo start --web` — test in browser: tap transaction, view details, delete, edit (TODO).
2. `npx expo start` + Expo Go — test on native: same navigation.
3. Validate all acceptance criteria from `1-spec.md`.
