# Plan de implementación — 009 Página de modificar/eliminar categoría

## Arquitectura

### Componentes nuevos

- **ModifyCategoryScreen.tsx**: Pantalla principal con icono actual + input de nombre editable, selector de tipo (informativo), grid de iconos, grid de colores, botón "Eliminar" con doble modal de confirmación y botón "Guardar".
- **ConfirmDeleteModal.tsx** (o inline en ModifyCategoryScreen): Modal de confirmación de borrado con título dinámico, mensaje y botones Cancelar/Borrar.
- **SelectCategoryModal.tsx** (o inline): Modal con lista de categorías del mismo tipo con radio button para seleccionar la categoría de destino.

### Archivos modificados

- **AppNavigator.tsx**: Añadir `ModifyCategoryScreen` al `HomeStack`.
- **types.ts**: Añadir `ModifyCategory` al `RootStackParamList` (con parámetro `categoryId: number`) y `ModifyCategoryScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Añadir claves multilingües para la nueva pantalla, modales y botones.
- **categoryRepo.ts / webCategoryRepo.ts**:
  - Modificar `existsByName` para aceptar un parámetro opcional `excludeId?: number` que excluya una categoría específica de la comprobación.
  - Añadir función `update(id, data)` si no existe ya.
  - Añadir función `remove(id)` si no existe ya.
- **transactionRepo.ts / webTransactionRepo.ts**: Añadir función `reassignCategory(oldCategoryId, newCategoryId)` para reasignar transacciones.

### Componentes reutilizados

- `IconGrid` existente (o el grid inline de CreateCategoryScreen).
- `ColorGrid` existente.
- `ColorPickerModal` existente.

### Flujo de navegación

```
CategoriesScreen → pulsar categoría → ModifyCategoryScreen { categoryId }
  ├── pulsar "Guardar" → updateCategory() → navegar de vuelta
  └── pulsar "Eliminar" → Modal1 confirmación → "Borrar"
       → Modal2 seleccionar categoría → "Seleccionar"
       → reassignTransactions() + deleteCategory() → navegar de vuelta
```

### Validación de duplicados (con exclusión)

- Modificar `existsByName(name: string, excludeId?: number): Promise<boolean>` en `categoryRepo` y `webCategoryRepo`.
- SQL: `SELECT COUNT(*) FROM categories WHERE user_id = 1 AND LOWER(name) = LOWER(?) AND id != ?`.
- Web: filtrado case-insensitive en localStorage excluyendo el ID actual.
- Se ejecuta con debounce de 300ms al cambiar el nombre.

### Reasignación de transacciones

- Añadir `reassignCategory(oldCategoryId: number, newCategoryId: number): Promise<void>` a `transactionRepo`.
- SQL: `UPDATE transactions SET category_id = ? WHERE category_id = ?`.
- Web: actualizar todas las transacciones en localStorage con `category_id === oldCategoryId`.

---

## Estados de la UI

### ModifyCategoryScreen

```
┌─────────────────────────────────┐
│ ← Modificar categoría           │  ← Header con retroceso
├─────────────────────────────────┤
│ ┌────────┐ ┌──────────────────┐ │
│ │  icono │ │ Nombre           │ │  ← Icono actual + input editable
│ │ (color)│ │ categoría        │ │
│ └────────┘ └──────────────────┘ │
│ 0/30                           │  ← Contador
│ [Texto error en rojo]          │  ← Solo si nombre vacío o duplicado
├─────────────────────────────────┤
│ Tipo                           │  ← Título sección
│ Gastos / Ingresos              │  ← Solo informativo
├─────────────────────────────────┤
│ Símbolos                       │  ← Título sección
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← Grid 4 cols, ~40 iconos
│ └──┘ └──┘ └──┘ └──┘           │     (icono actual preseleccionado)
│ ...                            │
├─────────────────────────────────┤
│ Color                          │  ← Título sección
│ ( ) ( ) ( ) ( ) ( ) ( ) (+)    │  ← Color actual preseleccionado
├─────────────────────────────────┤
│ ┌─────────────────────────┐     │
│ │     Eliminar (rojo)     │     │  ← Botón eliminar
│ └─────────────────────────┘     │
│ ┌─────────────────────────┐     │
│ │       Guardar           │     │  ← Botón (deshabilitado si nombre inválido)
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### Modal de confirmación 1 — Eliminar

```
┌─────────────────────────────────┐
│ Eliminar la categoría           │
│ "{categoryName}"                │  ← Título dinámico
├─────────────────────────────────┤
│ Todas las transacciones         │
│ vinculadas a esta categoría     │  ← Mensaje
│ se moverán a una categoría      │
│ que usted elija                 │
├─────────────────────────────────┤
│ [Cancelar]         [Borrar]     │  ← Borrar en rojo
└─────────────────────────────────┘
```

### Modal de selección 2 — Seleccionar categoría de destino

```
┌─────────────────────────────────┐
│ Seleccione la categoría         │  ← Título
├─────────────────────────────────┤
│ ○ icono Nombre categoría 1      │  ← Radio + icono + nombre
│ ● icono Nombre categoría 2      │     (solo mismo tipo que la
│ ○ icono Nombre categoría 3      │      categoría a eliminar)
├─────────────────────────────────┤
│ [Cancelar]     [Seleccionar]    │
└─────────────────────────────────┘
```

---

## i18n

Nuevas claves necesarias:

| Clave | EN | ES | CA |
|---|---|---|---|
| `modify_cat_title` | Modify category | Modificar categoría | Modificar categoria |
| `modify_cat_type` | Type | Tipo | Tipus |
| `modify_cat_delete` | Delete | Eliminar | Eliminar |
| `modify_cat_save` | Save | Guardar | Guardar |
| `modify_cat_delete_confirm_title` | Delete category "{name}" | Eliminar la categoría "{name}" | Eliminar la categoria "{name}" |
| `modify_cat_delete_confirm_message` | All transactions linked to this category will be moved to a category of your choice | Todas las transacciones vinculadas a esta categoría se moverán a una categoría que usted elija | Totes les transaccions vinculades a aquesta categoria es mouran a una categoria que vostè triï |
| `modify_cat_delete_confirm_cancel` | Cancel | Cancelar | Cancel·lar |
| `modify_cat_delete_confirm_delete` | Delete | Borrar | Esborrar |
| `modify_cat_select_title` | Select category | Seleccione la categoría | Seleccioneu la categoria |
| `modify_cat_select_cancel` | Cancel | Cancelar | Cancel·lar |
| `modify_cat_select_confirm` | Select | Seleccionar | Seleccionar |

---

## Repositorios

### categoryRepo — funciones adicionales

```ts
// Ya existe:
existsByName(name: string): Promise<boolean>

// Modificar:
existsByName(name: string, excludeId?: number): Promise<boolean>

// Añadir si no existen:
update(id: number, data: Partial<CreateCategoryInput>): Promise<void>
remove(id: number): Promise<void>
```

### transactionRepo — función adicional

```ts
reassignCategory(oldCategoryId: number, newCategoryId: number): Promise<void>
```

---

## Dependencias

- Sistema i18n existente (`src/i18n/index.ts`).
- ConfigContext para colores y escalado de texto.
- Repositorios: `categoryRepository`, `transactionRepository`.
- Navegación React Navigation v7 (HomeStack).
- Componentes existentes: `ColorGrid`, `ColorPickerModal`, `IconGrid` (o grid inline de CreateCategoryScreen).
- `@expo/vector-icons` (Ionicons) para los iconos.

---

## Estimación

- **Tareas**: 14 tareas en 5 fases
- **Tiempo estimado**: 3-4 horas
