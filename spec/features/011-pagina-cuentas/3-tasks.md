# Tareas — 011 Página de cuentas
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir clave i18n `accounts_total` en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`. *(nav_accounts ya existe)*

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `Accounts` al `RootStackParamList` y crear `AccountsScreenProps`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`:
  - Añadir `AccountsScreen` al `HomeStack` con título multilingual y estilo de header.
  - Conectar el `DrawerItem` de "Cuentas" (actualmente `onPress={() => {}}`) para navegar a `AccountsScreen`.

---

### Fase 2 — Pantalla principal

[ ] T4 — Crear `AccountsScreen.tsx` con:
  - Header con botón de menú hamburguesa (abre Drawer) + título "Cuentas" (multilingual).
  - Sección "Total:" con saldo total de todas las cuentas (verde/rojo según signo).
  - FlatList de cuentas cargadas desde `accountRepository.list()` con saldo de `getCurrentBalance()`.
  - Cada fila: icono con color de fondo + nombre + saldo formateado.
  - Estado vacío si no hay cuentas.
  - Al pulsar una cuenta: navegar a `ModifyAccountScreen` con `{ accountId }`.

[ ] T5 — Aplicar `useConfig().activeColors`, `useFontSize()` y `accessibilityLabel` a todos los elementos.

---

### Verificación

[ ] T6 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar navegación Drawer, lista de cuentas, saldo total y navegación a modificar cuenta.
