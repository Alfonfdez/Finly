# Tareas — 005 Página de añadir categoría
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[ ] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts` para todos los textos de la pantalla (título, placeholders, mensajes de error, botones, etc.).

[ ] T2 — Actualizar `src/constants/types.ts`: añadir `AddCategoryScreenProps` al `HomeStackParamList`.

[ ] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `AddCategoryScreen` al `HomeStack` con título multilingual y opciones de header.

---

### Fase 2 — Componente de búsqueda

[ ] T4 — Crear `SearchBar.tsx`: componente reutilizable con input de texto, botón "x" para cerrar, y callback de cambio de texto.

[ ] T5 — Integrar `SearchBar` en `AddCategoryScreen`. Al escribir, filtrar categorías por caracteres contenidos en el nombre (case-insensitive).

---

### Fase 3 — Grid de categorías

[ ] T6 — Crear `AddCategoryScreen.tsx` con header (flecha retroceso + título multilingual), `SearchBar` y grid 4×N de categorías.

[ ] T7 — Implementar la lógica de filtrado: si no hay coincidencias, mostrar icono de búsqueda no encontrada + "No se ha encontrado nada".

[ ] T8 — Implementar la selección de categoría: al pulsar, navegar de vuelta a `AddTransactionScreen` con la categoría seleccionada como parámetro.

---

### Fase 4 — Botón "Crear" y navegación

[ ] T9 — Añadir botón fijo "Crear" en la parte inferior de `AddCategoryScreen`. El botón es TODO (no funcional).

[ ] T10 — Conectar el botón "Más" de `CategoryGrid.tsx` para navegar a `AddCategoryScreen`.

---

### Fase 5 — Tema y accesibilidad

[ ] T11 — Aplicar `useConfig().coloresActivos` a todos los componentes nuevos para soporte de tema oscuro/claro.

[ ] T12 — Aplicar `useFontSize()` a todos los textos de la pantalla para escalado.

[ ] T13 — Añadir `accessibilityLabel` y `accessibilityRole` a todos los elementos interactivos.

---

### Verificación

[ ] T14 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar todos los criterios de aceptación de `1-spec.md`. Verificar cambio de idioma, tema y tamaño de texto.
