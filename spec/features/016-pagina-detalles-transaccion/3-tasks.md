# Tareas — 016 Detalles de transacción

---

### Fase 1 — Infraestructura

[x] T1 — Añadir nuevas claves i18n `details_*` y `type_expense`/`type_income` a `en.ts`, `es.ts` y `ca.ts`.

[x] T2 — Añadir `formatDateLong(date, language)` a `src/utils/formatters.ts`.

[x] T3 — Añadir `TransactionDetails: { transactionId: number }` y `ModifyTransaction: { transactionId: number }` a `RootStackParamList` en `src/constants/types.ts`.

[x] T4 — Crear `TransactionDetailsScreenProps` en `src/constants/types.ts`.

[x] T5 — Añadir `TransactionDetails` y `ModifyTransaction` al Stack en `AppNavigator.tsx`.

---

### Fase 2 — Pantalla de detalles

[x] T6 — Crear `TransactionDetailsScreen.tsx` con:
  - Ficha de datos con 5 filas (Cantidad, Cuenta, Categoría, Fecha, Comentario).
  - Cada fila: label a la izquierda (textSecondary), valor a la derecha.
  - Cantidad con color del tipo (verde ingreso / rojo gasto) y signo (+/-).
  - Cuenta y Categoría: icono 28×28 + nombre, alineados a la derecha.
  - Comentario muestra "Sin comentario" en textSecondary si está vacío.

[x] T7 — Cargar datos desde context (transactions, categories, accounts).

[x] T8 — Añadir el pie "Creado HH:mm dd MMM aaaa" con año siempre visible.

---

### Fase 3 — Botones de acción

[x] T9 — Implementar botón "Eliminar" con modal de confirmación:
  - Modal con título "¿Quiere eliminar la transacción?"
  - Botones "No" (cierra modal) y "Sí" (elimina + goBack).
  - Al eliminar, llamar a `refresh()` del AppContext.

[x] T10 — Implementar botón "Editar" que navega a `ModifyTransaction` con `transactionId` (TODO — pantalla placeholder).

---

### Fase 4 — Conexión con listados

[x] T11 — Modificar `TransactionGroup.tsx` para que cada transacción sea pulsable con `onTransactionPress`.

[x] T12 — Modificar `TransactionsScreen.tsx` y `AllTransactionsScreen.tsx` para pasar `onTransactionPress` y usar `useFocusEffect` + `refreshTrigger` para recargar datos al volver.

---

### Fase 5 — Refresco automático

[x] T13 — Añadir parámetro `refreshTrigger` a `useTransactionFilters.ts` para que las pantallas de listado recarguen datos al recibir foco (tras eliminar/editar).

---

### Fase 6 — Verificación

[x] T14 — Verificación: probar en web y nativo que al pulsar una transacción se vean los detalles correctos, eliminar funciona y el listado se refresca, y el botón editar navega al placeholder.

[x] T15 — Validar que `npx tsc --noEmit` compila sin errores.
