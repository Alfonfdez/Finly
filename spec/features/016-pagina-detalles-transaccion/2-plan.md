# Plan de implementación — 016 Detalles de transacción

## Archivos a crear

```
src/
├── screens/
│   ├── TransactionDetailsScreen.tsx   ← nueva pantalla de detalles
│   └── ModifyTransactionScreen.tsx    ← placeholder (TODO) para editar transacción
│
└── i18n/
    ├── en.ts                          ← añadir claves details_*
    ├── es.ts                          ← añadir claves details_*
    └── ca.ts                          ← añadir claves details_*
```

## Archivos a modificar

```
src/
├── navigation/
│   └── AppNavigator.tsx               ← añadir TransactionDetails + ModifyTransaction al Stack
│
├── constants/
│   └── types.ts                       ← añadir TransactionDetails + ModifyTransaction a RootStackParamList
│
├── components/
│   └── TransactionGroup.tsx           ← hacer cada transacción pulsable (onPress)
│
├── screens/
│   └── TransactionsScreen.tsx         ← pasar onPress + refreshTrigger a TransactionGroup
│   └── AllTransactionsScreen.tsx      ← pasar onPress + refreshTrigger a TransactionGroup
│
├── hooks/
│   └── useTransactionFilters.ts       ← añadir parámetro refreshTrigger para recargar al enfocar
│
└── utils/
    └── formatters.ts                  ← añadir formatDateLong(date, language)
```

## Nuevas claves i18n

| Clave | es | en | ca |
|---|---|---|---|
| `details_title` | Detalles de la transacción | Transaction details | Detalls de la transacció |
| `details_amount` | Cantidad | Amount | Quantitat |
| `details_account` | Cuenta | Account | Compte |
| `details_category` | Categoría | Category | Categoria |
| `details_date` | Fecha | Date | Data |
| `details_comment` | Comentario | Comment | Comentari |
| `details_no_comment` | Sin comentario | No comment | Sense comentari |
| `details_delete` | Eliminar | Delete | Eliminar |
| `details_delete_title` | ¿Quiere eliminar la transacción? | Delete this transaction? | Voleu eliminar la transacció? |
| `details_delete_yes` | Sí | Yes | Sí |
| `details_delete_no` | No | No | No |
| `details_edit` | Editar | Edit | Editar |
| `details_created` | Creado | Created | Creat |
| `type_expense` | Gasto | Expense | Despesa |
| `type_income` | Ingreso | Income | Ingrés |

## Arquitectura del componente

```
AppNavigator (Stack)
  └── TransactionDetailsScreen
        ├── DataCard (label/value rows)
        │   ├── Cantidad (con color del tipo: verde/rojo)
        │   ├── Cuenta (icono 28×28 + nombre, alineado a la derecha)
        │   ├── Categoría (icono 28×28 + nombre, alineado a la derecha)
        │   ├── Fecha (formato largo: "14 de julio de 2026")
        │   └── Comentario (o "Sin comentario" en gris)
        ├── DeleteButton → DeleteConfirmationModal
        ├── EditButton → navega a ModifyTransaction (TODO)
        └── CreatedFooter ("Creado HH:mm dd MMM aaaa")
```

## Navegación

```ts
// RootStackParamList
TransactionDetails: { transactionId: number };
ModifyTransaction: { transactionId: number };  // TODO
```

Desde `TransactionGroup.tsx`, cada item de transacción se envuelve en un `TouchableOpacity` que navega a `TransactionDetails`.

## Formato de fecha larga

```ts
function formatDateLong(date: Date, language: string): string {
  // es: "14 de julio de 2026"
  // en: "July 14, 2026"
  // ca: "14 de juliol de 2026"
}
```

## Flujo de eliminación

1. Usuario pulsa "Eliminar"
2. Aparece modal con título "¿Quiere eliminar la transacción?"
3. Usuario pulsa "Sí"
4. Se llama a `transactionRepository.delete(transactionId)`
5. Se llama a `refresh()` del AppContext
6. Se navega de vuelta (`navigation.goBack()`)
7. Al regresar al listado, `useFocusEffect` incrementa `refreshTrigger`, lo que fuerza a `useTransactionFilters` a recargar desde la BD.

## Verificación

1. `npx expo start --web` — probar en navegador: pulsar transacción, ver detalles, eliminar, editar (TODO).
2. `npx expo start` + Expo Go — probar en nativo: misma navegación.
3. Validar todos los criterios de aceptación de `1-spec.md`.
