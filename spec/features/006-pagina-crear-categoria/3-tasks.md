# Tareas — 006 Página de crear categoría
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts` para todos los textos de la pantalla (nombre, tipo, símbolos, color, botones, textos de error, modal de colores).

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `CreateCategory` al `RootStackParamList` (con `type?: TransactionType` como parámetro opcional) y crear `CreateCategoryScreenProps`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `CreateCategoryScreen` al `HomeStack` con título multilingual y estilo de header.

[ ] T4 — Conectar el botón "Crear" del grid en `AddCategoryScreen.tsx` para que navegue a `CreateCategoryScreen`.

---

### Fase 2 — Validación de nombre y duplicados

[ ] T5 — Añadir función `existsByName(name: string): Promise<boolean>` al `categoryRepo` (SQL: `SELECT COUNT(*) ... WHERE LOWER(name)=LOWER(?) AND user_id=1`) y al `webCategoryRepo` (filtrado case-insensitive en localStorage).

[ ] T6 — Crear el input de nombre en `CreateCategoryScreen` con placeholder multilingual, contador "0/30" y validación de duplicados con debounce de 300ms. Mostrar texto de error en rojo si el nombre está vacío o es duplicado.

---

### Fase 3 — Componentes de selección

[ ] T7 — Crear `IconGrid.tsx`: grid de 4 columnas con ~40 iconos Ionicons predefinidos (fondo gris `#334155`). Scroll vertical si no caben. Selección única con resaltado visual (borde primario).

[ ] T8 — Crear `ColorGrid.tsx`: grid 1×8 con 7 colores predefinidos (círculos) + "+" gris. Selección única con anillo de selección + checkmark superpuesto. Al pulsar "+", abrir `ColorPickerModal`.

[ ] T8b — Crear `ColorPickerModal.tsx`: modal con paleta ampliada de ~20 colores en grid 4×5. Al seleccionar un color, cerrar automáticamente y actualizar la selección en ColorGrid. Botón "Cancelar" para cerrar sin seleccionar.

---

### Fase 4 — Pantalla principal

[ ] T9 — Crear `CreateCategoryScreen.tsx` con header (retroceso + título), input de nombre con validación, radios de tipo (Gastos/Ingresos), `IconGrid`, `ColorGrid` con `ColorPickerModal`, texto de ayuda dinámico y botón "Añadir".

[ ] T10 — Implementar la validación del botón "Añadir": deshabilitado si nombre vacío, nombre duplicado, falta icono o falta color. Mostrar texto de ayuda en rojo con prioridad (nombre → duplicado → icono/color).

[ ] T11 — Implementar `handleCreate`: llamar a `categoryRepository.create()` para insertar la categoría, luego navegar de vuelta a `AddCategoryScreen` con `{ type, categoryId }` usando `setPendingCategory` (mismo patrón que `AddTransactionScreen`).

---

### Fase 5 — Tema y accesibilidad

[ ] T12 — Aplicar `useConfig().activeColors` a todos los componentes nuevos para soporte de tema oscuro/claro.

[ ] T13 — Aplicar `useFontSize()` a todos los textos de la pantalla para escalado.

[ ] T14 — Añadir `accessibilityLabel` y `accessibilityRole` a todos los elementos interactivos.

---

### Verificación

[ ] T15 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar todos los criterios de aceptación de `1-spec.md`. Verificar:
  - Input de nombre con validación de vacío y duplicado.
  - Selección de tipo, icono y color.
  - Botón "Añadir" deshabilitado hasta cumplir todos los requisitos.
  - Creación de categoría y retorno a `AddCategoryScreen` con la categoría seleccionada.
  - Cambio de idioma, tema y tamaño de texto.
