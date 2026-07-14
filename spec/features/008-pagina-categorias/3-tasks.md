# Tareas — 008 Página de categorías
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[x] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts` para el título de la pantalla (`categories_title` o reutilizar `nav_categories` si ya existe). *(nav_categories ya existía)*

[x] T2 — Actualizar `src/constants/types.ts`: añadir `Categories` al `RootStackParamList` y crear `CategoriesScreenProps`.

[x] T3 — Actualizar `src/navigation/AppNavigator.tsx`:
  - Añadir `CategoriesScreen` al `HomeStack` con título multilingual y estilo de header.
  - Conectar el `DrawerItem` de "Categorías" (actualmente `onPress={() => {}}`) para navegar a `CategoriesScreen`.
  - Movido DrawerItem de "Categorías" fuera de la sección "Coming soon".

---

### Fase 2 — Pantalla principal

[x] T4 — Crear `CategoriesScreen.tsx` con:
  - Header con botón de menú hamburguesa (abre Drawer) + título "Categorías" (multilingual).
  - `TypeTabs` con estado local para filtrar por tipo (gasto/ingreso).
  - Grid 4×N de categorías cargadas desde `categoryRepository.list()` filtradas por tipo activo.
  - Cada celda: icono con fondo de color + nombre debajo.
  - Scroll vertical si hay muchas categorías.
  - Botón "Crear" (icono "+" + texto) en la última posición.

[x] T5 — Conectar acciones del grid:
  - Al pulsar una categoría: navegar a `ModifyCategoryScreen` con `{ categoryId }` como parámetro.
  - Al pulsar "Crear": navegar a `CreateCategoryScreen` con `{ type }` como parámetro.

---

### Fase 3 — Tema y accesibilidad

[x] T6 — Aplicar `useConfig().activeColors` a todos los componentes nuevos para soporte de tema oscuro/claro.

[x] T7 — Aplicar `useFontSize()` a todos los textos de la pantalla para escalado.

[x] T8 — Añadir `accessibilityLabel` y `accessibilityRole` a todos los elementos interactivos.

---

### Verificación

[ ] T9 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar todos los criterios de aceptación de `1-spec.md`. Verificar navegación Drawer, filtrado por tipo, grid de categorías, y navegación a crear/modificar categoría.
