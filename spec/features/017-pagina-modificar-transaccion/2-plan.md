# Plan de implementación — 017 Modificar transacción

## Archivos a crear

```
src/
├── i18n/
│   ├── en.ts          ← añadir claves modify_*
│   ├── es.ts          ← añadir claves modify_*
│   └── ca.ts          ← añadir claves modify_*
```

## Archivos a modificar

```
src/
├── screens/
│   └── ModifyTransactionScreen.tsx   ← reemplazar placeholder por implementación completa
│
├── navigation/
│   └── AppNavigator.tsx              ← actualizar título a multilingual si no lo está
│
└── i18n/
    ├── en.ts                         ← añadir modify_*
    ├── es.ts                         ← añadir modify_*
    └── ca.ts                         ← añadir modify_*
```

## Archivos existentes que se REUTILIZAN (sin modificar)

```
src/
├── components/
│   ├── TypeTabs.tsx                  ← tabs Gastos/Ingresos
│   ├── AccountModal.tsx              ← modal de selección de cuenta
│   ├── CategoryGrid.tsx              ← grid 4×2 de categorías + botón "Más"
│   ├── DaySelector.tsx               ← grid 3×1 de días
│   ├── CalendarModal.tsx             ← modal de calendario para selector de día
│   ├── CalculatorModal.tsx           ← calculadora para input de cantidad
│   ├── TagSection.tsx                ← sección de etiquetas
│   ├── CommentInput.tsx              ← campo de comentario con contador
│   └── PhotoSection.tsx              ← sección de foto
│
├── hooks/
│   └── useFontSize.ts                ← escalado de texto
│
├── context/
│   ├── AppContext.tsx                ← refresh() para recargar tras guardar
│   └── ConfigContext.tsx             ← config (divisa, separador, idioma)
│
├── constants/
│   └── types.ts                      ← ModifyTransaction ya está en RootStackParamList
│
├── database/
│   └── index.ts                      ← transactionRepository ya exportado
│
└── utils/
    └── formatters.ts                 ← formatCurrency, formatDateForDB, isSameDay
```

---

## Arquitectura

### ModifyTransactionScreen

Pantalla que reemplaza el placeholder actual. Copia el layout y la lógica de `AddTransactionScreen.tsx` con estas diferencias:

1. **Precarga de datos**: al montar la pantalla, carga la transacción desde `transactions.find(tx => tx.id === transactionId)` y precarga:
   - `type` → `transaction.type`
   - `amountRaw` → `parseAmountInput(String(transaction.amount))` (o formateado)
   - `accountId` → `transaction.account_id`
   - `categoryId` → `transaction.category_id`
   - `day` → new Date(transaction.date)
   - `comment` → `transaction.description || ''`
   - `selectedTags` → `[]` (las etiquetas no se persisten, TODO)

2. **Grid de categorías**: la categoría actual de la transacción se coloca en la primera posición del grid visible, seguida de las demás categorías del mismo tipo (sin incluir la ya mostrada), hasta completar 7 ítems + botón "Más".

3. **Botón de envío**: cambia de "Añadir" a "Guardar". Al pulsarlo llama a `transactionRepository.update()` en lugar de `create()`.

4. **Después de guardar**: llama a `refresh()` y `navigation.goBack()`.

### Flujo de datos

```
TransactionDetailsScreen
  └── [Editar] → navigation.navigate('ModifyTransaction', { transactionId })
                    │
                    ▼
            ModifyTransactionScreen
              ├── useRoute → transactionId
              ├── useApp() → transactions, accounts, categories, refresh()
              ├── Precarga: find transactionById
              ├── Mismos componentes que AddTransaction:
              │   ├── TypeTabs (precargado)
              │   ├── AmountInput (precargado) + CalculatorModal
              │   ├── AccountSelector (precargado) + AccountModal
              │   ├── CategoryGrid (precargado, current en primera posición)
              │   ├── DaySelector (precargado) + CalendarModal
              │   ├── TagSection (precargado, TODO persistencia)
              │   ├── CommentInput (precargado)
              │   └── PhotoSection (TODO)
              └── Botón "Guardar"
                    │
                    ▼
            transactionRepository.update(transactionId, {
              account_id, category_id, type, amount, description, date
            })
                    │
                    ▼
            refresh() + goBack()
```

## Nuevas claves i18n

| Clave | es | en | ca |
|---|---|---|---|
| `modify_title` | Modificar transacción | Modify transaction | Modificar transacció |
| `modify_save` | Guardar | Save | Guardar |
| `modify_error_title` | Error | Error | Error |
| `modify_error_message` | No se ha podido guardar la transacción | Failed to save transaction | No s'ha pogut guardar la transacció |

## Decisiones

- **Reutilización máxima**: todos los componentes de `AddTransactionScreen` se reutilizan sin modificar. Solo se cambia el screen que los orquesta.
- **Precarga en local state**: los datos de la transacción se cargan desde el Context (`transactions.find()`) y se copian al estado local del formulario.
- **Un solo método de update**: `transactionRepository.update()` ya existe y soporta `Partial<Transaction>`, por lo que solo se envían los campos modificados.
- **Tags no persistentes**: las etiquetas no se guardan en BD actualmente, por lo que no se precargan. El TODO queda documentado.

## Verificación

1. `npx expo start --web` — probar en navegador: navegación desde detalles, precarga correcta, modificar campos, guardar.
2. `npx expo start` + Expo Go — probar en nativo.
3. Validar todos los criterios de aceptación de `1-spec.md`.
4. Verificar que al cambiar idioma todos los textos se actualizan.
5. Verificar que al volver al listado los datos se refrescan.
