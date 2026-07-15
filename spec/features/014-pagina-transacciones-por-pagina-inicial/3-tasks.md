# Tareas — 014 Página de transacciones (desde página inicial)
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`: `transactions_title`, `transactions_empty`, `transactions_select_account`, `transactions_cancel`, `transactions_confirm`, `transactions_sort_date`, `transactions_sort_amount`.

[ ] T2 — Actualizar `src/constants/types.ts`: ampliar parámetros de `Transactions` en `RootStackParamList` con `period`, `startDate`, `endDate`.

[ ] T3 — Verificar `src/navigation/AppNavigator.tsx`: `TransactionsScreen` ya registrado en `HomeStack`.

---

### Fase 2 — Componentes

[ ] T4 — Crear `AccountSelector.tsx`: fila con icono de cuenta (color de fondo) + nombre + chevron-down. Al pulsar, abre modal con lista de cuentas (radio + icono + nombre + saldo), botones Cancelar/Seleccionar.

[ ] T5 — Crear `SortToggle.tsx`: fila con "Por fecha" y "Por cantidad". Opción activa en color primario con flecha ↓/↑. Al pulsar texto cambia criterio; al pulsar flecha invierte dirección.

[ ] T6 — Crear `TransactionGroup.tsx`: encabezado de fecha formateada + lista de transacciones (icono categoría + nombre categoría + descripción + cantidad con color).

---

### Fase 3 — Pantalla principal

[ ] T7 — Reescribir `TransactionsScreen.tsx` con:
  - Estructura: `SafeAreaView > [categoryInfo, controls, SectionList, FAB(absolute)]`.
  - Header del Stack navigator (icono + "Transacciones").
  - Sección de categoría: icono + nombre + total con color (verde/rojo) y prefijo (+/-).
  - `AccountSelector` con cuenta por defecto del AppContext.
  - `SortToggle` con valores por defecto (fecha, descendente).
  - SectionList con `TransactionGroup` por cada día.
  - FAB "+" centrado con `position: absolute` que navega a `AddTransactionScreen`.
  - Estado vacío cuando no hay transacciones.
  - Sin `keyboardSpacer`.

[ ] T8 — Implementar filtrado de transacciones: por cuenta seleccionada, categoría (route params), y período (route params startDate/endDate).

[ ] T9 — Implementar ordenación: por fecha o cantidad, ASC/DESC según `SortToggle`.

---

### Fase 4 — Tema y accesibilidad

[ ] T10 — Aplicar `useConfig().activeColors`, `useFontSize()` y `accessibilityLabel` a todos los elementos.

---

### Verificación

[ ] T11 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar navegación desde categoría del Home, selector de cuenta, ordenación, FAB, estado vacío. Verificar cambio de idioma, tema y tamaño de texto.
