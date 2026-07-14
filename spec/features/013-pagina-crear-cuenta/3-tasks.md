# Tareas — 013 Página de crear cuenta
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts`: `create_account_title`, `create_account_name`, `create_account_note`, `create_account_button`, `create_account_error_empty`, `create_account_error_duplicate`, `create_account_error_icon`, `create_account_error_color`, `create_account_error_icon_color`.

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `CreateAccount` al `RootStackParamList` (sin parámetros) y crear `CreateAccountScreenProps`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `CreateAccountScreen` al `HomeStack` con título multilingual y estilo de header.

---

### Fase 2 — Base de datos

[x] T4 — Función `existsByName(name: string, excludeId?: number): Promise<boolean>` ya existe en `accountRepo` y `webAccountRepo` (añadida en 012, case-insensitive).

[x] T5 — `accountRepository.create()` ya acepta los campos necesarios (`name`, `icon`, `color`, `initial_balance`, `description`). Añadida en 012.

---

### Fase 3 — Pantalla principal

[ ] T6 — Crear `CreateAccountScreen.tsx` con:
  - Header con retroceso + título "Crear cuenta" (multilingual).
  - Input de nombre con contador 0/30, placeholder y validación de vacío + duplicados (debounce 300ms).
  - Grid de iconos (reutilizar patrón de CreateCategoryScreen/ModifyAccountScreen) con ~20 iconos financieros. Al seleccionar un icono, el fondo cambia al color seleccionado.
  - Grid de colores (reutilizar `ColorGrid`) con 6 predefinidos + "+" para `ColorPickerModal`.
  - Input multilínea "Nota" con contador 0/200.
  - Botón "Crear" deshabilitado si falta nombre, icono o color (o nombre duplicado).

[ ] T7 — Implementar validación del botón "Crear":
  - Deshabilitado si: nombre vacío, nombre duplicado, falta icono, falta color.
  - Texto de ayuda dinámico en rojo según prioridad: nombre vacío > duplicado > falta icono > falta color > faltan ambos.

[ ] T8 — Implementar el botón "Crear":
  - Al pulsar: insertar cuenta en `accountRepository.create()` con `user_id: 1`, `initial_balance: 0`.
  - Navegar de vuelta a AccountsScreen (011).

---

### Fase 4 — Tema y accesibilidad

[ ] T9 — Aplicar `useConfig().activeColors`, `useFontSize()` y `accessibilityLabel` a todos los elementos.

---

### Verificación

[ ] T10 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar navegación desde FAB, validación de nombre (vacío + duplicado), selección de icono/color, nota y creación de cuenta.
