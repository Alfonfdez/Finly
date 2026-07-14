# Tareas — 012 Página de modificar cuenta
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`: `modify_account_title`, `modify_account_name`, `modify_account_note`, `modify_account_save`, `modify_account_error_empty`, `modify_account_error_duplicate`, `modify_account_delete`, `modify_account_delete_confirm_title`, `modify_account_delete_confirm_message`, `modify_account_delete_confirm_cancel`, `modify_account_delete_confirm_delete`.

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `ModifyAccount` al `RootStackParamList` con parámetro `accountId: number` y crear `ModifyAccountScreenProps`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `ModifyAccountScreen` al `HomeStack` con título multilingual y estilo de header.

---

### Fase 2 — Base de datos

[ ] T4 — Añadir campo `description?: string` a la interfaz `Account` en `src/database/types.ts`.

[ ] T5 — Crear migración `006_account_description.ts` con `ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT ''`.

[ ] T6 — Actualizar `DATABASE_VERSION` en `src/database/database.ts` y añadir la migración.

[ ] T7 — Actualizar `accountRepo.update()` y `webAccountRepo.update()` para incluir el campo `description`.

[ ] T8 — Añadir función `deleteByAccountId(id: number)` a `transactionRepo.ts` y `webTransactionRepo.ts` para eliminar todas las transacciones asociadas a una cuenta.

---

### Fase 3 — Pantalla principal

[ ] T9 — Crear archivo `src/constants/accountIcons.ts` con la lista `ACCOUNT_ICONS` (~20 iconos financieros). Esta lista se comparte con 013-pagina-crear-cuenta.

[ ] T10 — Crear `ModifyAccountScreen.tsx` con:
  - Header con retroceso + título "Modificar cuenta" (multilingual).
  - Input de nombre con contador 0/30, validación de vacío y validación de duplicados (debounce 300ms, excluir cuenta actual).
  - Grid de iconos (reutilizar patrón de CreateCategoryScreen) con icono actual preseleccionado. Al seleccionar icono, el color de fondo cambia al color seleccionado.
  - Grid de colores 8 columnas (reutilizar `ColorGrid` con modo "modify"): 6 predefinidos + círculo personalizado (solo si color actual no es predefinido) + "+". Color actual preseleccionado.
  - `ColorPickerModal` para el "+".
  - Input multilínea "Nota" con contador 0/200.
  - Botón "Guardar" deshabilitado si nombre vacío o duplicado.

[ ] T11 — Implementar el botón "Guardar":
  - Validación: deshabilitado si nombre vacío o duplicado (excluyendo cuenta actual).
  - Texto de ayuda dinámico en rojo: "Introduzca un nombre para la cuenta" o "Ya existe una cuenta con este nombre".
  - Al pulsar: actualizar nombre, icono, color y descripción en `accountRepository.update()`.
  - Navegar de vuelta a AccountsScreen.

[ ] T12 — Implementar botón "Eliminar" + modal de confirmación:
  - Botón "Eliminar" (rojo) ubicado antes del botón "Guardar".
  - Modal de confirmación: título con nombre de la cuenta, mensaje sobre borrado de transacciones, botones "Cancelar" y "Eliminar" (rojo).
  - Al pulsar "Eliminar": llamar a `transactionRepo.deleteByAccountId(id)`, `accountRepo.delete(id)`, `refreshAccounts()`, navegar de vuelta.

---

### Fase 4 — Tema y accesibilidad

[ ] T13 — Aplicar `useConfig().activeColors`, `useFontSize()` y `accessibilityLabel` a todos los elementos.

---

### Verificación

[ ] T14 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar carga de datos, edición de nombre, cambio de icono/color, nota, guardado y eliminación de cuenta con transacciones.
