# Tareas — 016 Detalles de transacción
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura

[ ] T1 — Añadir nuevas claves i18n `details_*` y `type_expense`/`type_income` a `en.ts`, `es.ts` y `ca.ts`.

[ ] T2 — Añadir `formatDateLong(date, language)` a `src/utils/formatters.ts`.

[ ] T3 — Añadir `TransactionDetails: { transactionId: number }` y `ModifyTransaction: { transactionId: number }` a `RootStackParamList` en `src/constants/types.ts`.

[ ] T4 — Crear `TransactionDetailsScreenProps` en `src/constants/types.ts`.

[ ] T5 — Añadir `TransactionDetails` al Stack en `AppNavigator.tsx` con título i18n `details_title`.

---

### Fase 2 — Pantalla de detalles

[ ] T6 — Crear `TransactionDetailsScreen.tsx` con:
  - Header con tipo (Gasto/Ingreso) + importe formateado con color.
  - Ficha de datos con 5 filas (Cantidad, Cuenta, Categoría, Fecha, Comentario).
  - Cada fila: label a la izquierda (textSecondary), valor a la derecha.
  - Cuenta y Categoría muestran icono + nombre.
  - Comentario muestra "Sin comentario" en textSecondary si está vacío.

[ ] T7 — Implementar la carga de datos: recibir `transactionId` de la ruta, cargar transacción con `transactionRepository`, cargar cuenta y categoría desde los repositorios o context.

[ ] T8 — Añadir el pie "Creado HH:mm dd MMM" en la parte inferior izquierda.

---

### Fase 3 — Botones de acción

[ ] T9 — Implementar botón "Eliminar" con modal de confirmación:
  - Modal con título "¿Quiere eliminar la transacción?"
  - Botones "No" (cierra modal) y "Sí" (elimina + goBack).
  - Al eliminar, llamar a `refresh()` del AppContext.

[ ] T10 — Implementar botón "Editar" que navega a `ModifyTransaction` con `transactionId` (TODO).

---

### Fase 4 — Conexión con listados

[ ] T11 — Modificar `TransactionGroup.tsx` para que cada transacción sea pulsable. Aceptar prop `onTransactionPress?: (transactionId: number) => void`.

[ ] T12 — Modificar `TransactionsScreen.tsx` y `AllTransactionsScreen.tsx` para pasar `onTransactionPress` a `TransactionGroup` que navegue a `TransactionDetails`.

---

### Fase 5 — Verificación

[ ] T13 — Verificación: probar en web y nativo que al pulsar una transacción se vean los detalles correctos, eliminar funciona, y el botón editar navega al placeholder TODO.

[ ] T14 — Validar todos los criterios de aceptación de `1-spec.md`.
