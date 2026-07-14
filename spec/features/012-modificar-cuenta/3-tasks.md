# Tareas — 012 Página de modificar cuenta
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`: `modify_account_title`, `modify_account_name`, `modify_account_note`, `modify_account_save`.

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `ModifyAccount` al `RootStackParamList` con parámetro `accountId: number` y crear `ModifyAccountScreenProps`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `ModifyAccountScreen` al `HomeStack` con título multilingual y estilo de header.

---

### Fase 2 — Base de datos

[ ] T4 — Añadir campo `description?: string` a la interfaz `Account` en `src/database/types.ts`.

[ ] T5 — Crear migración `006_account_description.ts` con `ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT ''`.

[ ] T6 — Actualizar `DATABASE_VERSION` en `src/database/database.ts` y añadir la migración.

[ ] T7 — Actualizar `accountRepo.update()` y `webAccountRepo.update()` para incluir el campo `description`.

---

### Fase 3 — Pantalla principal

[ ] T8 — Crear archivo `src/constants/accountIcons.ts` con la lista `ACCOUNT_ICONS` (~20 iconos financieros).

[ ] T9 — Crear `ModifyAccountScreen.tsx` con:
  - Header con retroceso + título "Modificar cuenta" (multilingual).
  - Input de nombre con contador 0/30 y validación de vacío.
  - Grid de iconos (reutilizar patrón de CreateCategoryScreen) con icono actual preseleccionado.
  - Grid de colores (reutilizar `ColorGrid`) con color actual preseleccionado.
  - `ColorPickerModal` para el "+".
  - Input multilínea "Nota" con contador 0/200.
  - Botón "Guardar" deshabilitado si nombre vacío.

[ ] T10 — Implementar el botón "Guardar":
  - Validación: deshabilitado si nombre vacío.
  - Al pulsar: actualizar nombre, icono, color y descripción en `accountRepository.update()`.
  - Navegar de vuelta a AccountsScreen.

---

### Fase 4 — Tema y accesibilidad

[ ] T11 — Aplicar `useConfig().activeColors`, `useFontSize()` y `accessibilityLabel` a todos los elementos.

---

### Verificación

[ ] T12 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar carga de datos, edición de nombre, cambio de icono/color, nota y guardado.
