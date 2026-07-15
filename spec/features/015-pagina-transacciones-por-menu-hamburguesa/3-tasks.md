# Tareas — 015 Página de transacciones (desde menú hamburguesa)
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Implementación

[x] T1 — Crear `src/screens/AllTransactionsScreen.tsx`: SafeAreaView > View.container(flex:1) con AccountSelector, saldo total del período, SortToggle, SectionList con TransactionGroup, FAB "+", estado vacío. Sin `keyboardSpacer`.

[x] T2 — Añadir `AllTransactions: undefined` a `RootStackParamList` en `src/constants/types.ts`.

[x] T3 — Registrar `AllTransactionsScreen` en `src/navigation/AppNavigator.tsx` con header del Stack navigator (icono list-outline + "Todas las transacciones" i18n `nav_all_transactions`).

[x] T4 — Actualizar DrawerItem "Transacciones" para navegar a `'Main', { screen: 'AllTransactions' }`. Actualizar icono de estadísticas en HomeScreen para navegar a `'AllTransactions'`.

[x] T5 — Crear `src/hooks/useTransactionFilters.ts` hook compartido para filtrado, ordenación y agrupación de transacciones.

---

### Fase 2 — Verificación manual

[ ] T6 — Abrir menú hamburguesa → pulsar "Transacciones" → verificar que se muestra la pantalla con header "Todas las transacciones" + AccountSelector + saldo + SortToggle.

[ ] T6b — Pulsar icono de estadísticas en HomeScreen → verificar que abre la misma pantalla AllTransactions.

[ ] T7 — Cambiar cuenta con el selector → verificar que se muestran las transacciones de la otra cuenta.

[ ] T8 — Verificar que no se aplica filtro de categoría ni de período (se ven todas las transacciones históricas).

[ ] T9 — Verificar ordenación (fecha/cantidad, ASC/DESC), FAB "+", estado vacío, cambio de idioma y tema.

---

### Verificación

[ ] T10 — Verificación final: `npx expo start --web` y `npx expo start` (Expo Go). Probar navegación desde drawer, selector de cuenta, ordenación, FAB, estado vacío. Verificar cambio de idioma, tema y tamaño de texto.
