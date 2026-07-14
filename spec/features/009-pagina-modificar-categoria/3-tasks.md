# Tareas — 009 Página de modificar categoría
Orden de ejecución. Marca cada tarea al completarlo.

---

### Fase 1 — Infraestructura y navegación

[x] T1 — Añadir claves i18n en `src/i18n/en.ts`, `src/i18n/es.ts` y `src/i18n/ca.ts` para todos los textos de la pantalla (título, tipo, eliminar, guardar, modales de confirmación y selección).

[x] T2 — Actualizar `src/constants/types.ts`: añadir `ModifyCategory` al `RootStackParamList` con parámetro `categoryId: number` y crear `ModifyCategoryScreenProps`. *(Ya estaba añadido por 008)*

[x] T3 — Actualizar `src/navigation/AppNavigator.tsx`: añadir `ModifyCategoryScreen` al `HomeStack` con título multilingual y estilo de header.

---

### Fase 2 — Repositorios

[x] T4 — Modificar `existsByName` en `categoryRepo.ts` y `webCategoryRepo.ts` para aceptar parámetro opcional `excludeId?: number` que excluya la categoría actual de la comprobación.

[x] T5 — Añadir función `update(id, data)` a `categoryRepo.ts` y `webCategoryRepo.ts` para actualizar nombre, icono y/o color de una categoría existente. *(Ya existía)*

[x] T6 — Añadir función `remove(id)` a `categoryRepo.ts` y `webCategoryRepo.ts` para eliminar una categoría. *(Ya existía como `delete`)*

[x] T7 — Añadir función `reassignCategory(oldCategoryId, newCategoryId)` a `transactionRepo.ts` y `webTransactionRepo.ts` para reasignar transacciones de una categoría a otra.

---

### Fase 3 — Componentes de modales de eliminación

[x] T8 — Crear modal de confirmación de borrado (inline en ModifyCategoryScreen o componente separado): título dinámico con nombre de la categoría, mensaje explicativo, botones "Cancelar" y "Borrar" (rojo).

[x] T9 — Crear modal de selección de categoría de destino (inline o componente separado): título "Seleccione la categoría", lista de categorías del mismo tipo (excluyendo la actual) con radio button + icono + nombre, botones "Cancelar" y "Seleccionar".

---

### Fase 4 — Pantalla principal

[x] T10 — Crear `ModifyCategoryScreen.tsx` con:
  - Header con retroceso + título "Modificar categoría" (multilingual).
  - Fila con icono actual de la categoría (color de fondo) + input editable con nombre actual.
  - Validación de duplicados con debounce 300ms, excluyendo la categoría actual.
  - Tipo de categoría (informativo, no editable).
  - Grid de iconos (reutilizar patrón de CreateCategoryScreen) con icono actual preseleccionado.
  - Grid de colores (reutilizar `ColorGrid`) con color actual preseleccionado.
  - 7.º círculo: color personalizado si el actual no está entre los 6 predefinidos.
  - `ColorPickerModal` para el "+".
  - Botón "Eliminar" (rojo) con doble modal de confirmación.

[x] T11 — Implementar el flujo de eliminación completo:
  - Modal 1: confirmación → al pulsar "Borrar" → Modal 2.
  - Modal 2: seleccionar categoría destino → al pulsar "Seleccionar":
    - Llamar a `transactionRepo.reassignCategory(oldId, newId)`.
    - Llamar a `categoryRepo.remove(id)`.
    - Refrescar categorías y navegar de vuelta.

[x] T12 — Implementar el botón "Guardar":
  - Validación: deshabilitado si nombre vacío o duplicado.
  - Al pulsar: actualizar nombre, icono y color en `categoryRepository.update()`.
  - Refrescar categorías y navegar de vuelta.

---

### Fase 5 — Tema y accesibilidad

[x] T13 — Aplicar `useConfig().activeColors` a todos los componentes nuevos para soporte de tema oscuro/claro.

[x] T14 — Aplicar `useFontSize()` a todos los textos de la pantalla para escalado.

[x] T15 — Añadir `accessibilityLabel` y `accessibilityRole` a todos los elementos interactivos.

---

### Verificación

[ ] T16 — Verificación manual: `npx expo start --web` y `npx expo start` (Expo Go). Probar todos los criterios de aceptación de `1-spec.md`. Verificar:
  - Carga de datos actuales de la categoría.
  - Edición de nombre con validación de duplicados.
  - Cambio de icono y color.
  - Eliminación con reasignación a otra categoría.
  - Cambio de idioma, tema y tamaño de texto.
