# Plan de implementación — 006 Página de crear categoría

## Arquitectura

### Componentes nuevos

- **CreateCategoryScreen.tsx**: Pantalla principal con input de nombre, selector de tipo (radio), grid de iconos, grid de colores y botón "Añadir".
- **IconGrid.tsx**: Grid de 4 columnas con ~40 iconos Ionicons seleccionables con fondo gris. Scroll vertical si no caben.
- **ColorGrid.tsx**: Grid 1×8 de colores preseleccionados circulares + "+" que abre un modal de colores expandido.
- **ColorPickerModal.tsx**: Modal con paleta ampliada de ~20 colores en grid 4×5.
- **ColorPickerModal.tsx**: Modal con paleta ampliada de ~20 colores en grid 4×5.

### Archivos modificados

- **AppNavigator.tsx**: Añadir `CreateCategoryScreen` al `HomeStack`.
- **types.ts**: Añadir `CreateCategory` al `RootStackParamList` y `CreateCategoryScreenProps`.
- **AddCategoryScreen.tsx**: Conectar el botón "Crear" para navegar a `CreateCategoryScreen`.
- **categoryRepo.ts / webCategoryRepo.ts**: Añadir función `existsByName(name, type)` para validación de duplicados.
- **i18n/en.ts, es.ts, ca.ts**: Añadir claves multilingües para la nueva pantalla.

### Flujo de navegación

```
AddCategoryScreen → grid ("Crear") → CreateCategoryScreen → AddCategoryScreen (con categoría creada seleccionada)
```

### Dependencias

- Sistema i18n existente (`src/i18n/index.ts`).
- ConfigContext para colores y escalado de texto.
- Repositorio de categorías (`categoryRepo` / `webCategoryRepo`).
- Navegación React Navigation v7 (HomeStack).
- `@expo/vector-icons` (Ionicons) para los iconos.

---

## Estados de la UI

### CreateCategoryScreen

```
┌─────────────────────────────────┐
│ ← Crear categoría               │  ← Header con retroceso
├─────────────────────────────────┤
│ Nombre de la categoría          │  ← Título sección
│ ┌───────────────────────────┐   │
│ │                           │   │  ← Input text, max 30 chars
│ └───────────────────────────┘   │
│ 0/30                           │  ← Contador
│ [Texto error en rojo]          │  ← Solo si nombre vacío o duplicado
├─────────────────────────────────┤
│ [●] Gastos  [○] Ingresos        │  ← Radio buttons de tipo
├─────────────────────────────────┤
│ Símbolos                       │  ← Título sección
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← Grid 4 cols, ~40 iconos
│ └──┘ └──┘ └──┘ └──┘           │     (scroll vertical)
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│ ...                            │
├─────────────────────────────────┤
│ Color                          │  ← Título sección
│ ( ) ( ) ( ) ( ) ( ) ( ) (+)    │  ← "+" abre modal
├─────────────────────────────────┤
│ [Texto ayuda en rojo]          │  ← Solo si falta requisito
│ ┌─────────────────────────┐     │
│ │         Añadir          │     │  ← Botón (deshabilitado si falta)
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### ColorPickerModal

```
┌─────────────────────────────────┐
│ Seleccionar color        Cancelar│  ← Header modal
├─────────────────────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← Grid 4×5, ~20 colores
│ └──┘ └──┘ └──┘ └──┘           │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│ ...                            │
└─────────────────────────────────┘
```

### Estados locales

```ts
interface CreateCategoryState {
  name: string;                    // nombre de la categoría
  nameError: string | null;        // error de nombre (vacío | duplicado)
  type: TransactionType;           // 'expense' | 'income'
  selectedIcon: string | null;     // nombre del icono Ionicons
  selectedColor: string | null;    // hex del color
  checkingName: boolean;           // true mientras se verifica duplicado
}
```

### Validaciones

- `canCreate`: `name.trim().length > 0 && nameError === null && selectedIcon !== null && selectedColor !== null`
- Prioridad del texto de ayuda (solo se muestra el primer incumplimiento):
  1. `name.trim() === ''`: "Introduzca un nombre para la categoría"
  2. `nameError === 'duplicate'`: "Ya existe una categoría con este nombre"
  3. `!selectedIcon && !selectedColor`: "Selecciona un icono y un color"
  4. `!selectedIcon`: "Selecciona un icono"
  5. `!selectedColor`: "Selecciona un color"

### Verificación de duplicados

- Se añade `existsByName(name: string): Promise<boolean>` a `categoryRepo` y `webCategoryRepo`.
- SQL: `SELECT COUNT(*) FROM categories WHERE user_id = 1 AND LOWER(name) = LOWER(?)`.
- Web: filtrado case-insensitive en localStorage.
- Se ejecuta con debounce de 300ms al cambiar el nombre.
- Mientras se verifica (checkingName = true), el botón permanece deshabilitado.

---

## Iconos predefinidos (grid 4 columnas, ~40 iconos)

| # | Ionicons name | # | Ionicons name |
|---|---|---|---|
| 1 | `wallet-outline` | 21 | `cash-outline` |
| 2 | `cart-outline` | 22 | `card-outline` |
| 3 | `bus-outline` | 23 | `pricetag-outline` |
| 4 | `home-outline` | 24 | `storefront-outline` |
| 5 | `musical-notes-outline` | 25 | `coffee-outline` |
| 6 | `game-controller-outline` | 26 | `car-outline` |
| 7 | `bag-outline` | 27 | `bicycle-outline` |
| 8 | `film-outline` | 28 | `train-outline` |
| 9 | `restaurant-outline` | 29 | `key-outline` |
| 10 | `heart-outline` | 30 | `book-outline` |
| 11 | `fitness-outline` | 31 | `barbell-outline` |
| 12 | `school-outline` | 32 | `globe-outline` |
| 13 | `airplane-outline` | 33 | `compass-outline` |
| 14 | `shirt-outline` | 34 | `map-outline` |
| 15 | `gift-outline` | 35 | `star-outline` |
| 16 | `briefcase-outline` | 36 | `notifications-outline` |
| 17 | `code-slash-outline` | 37 | `football-outline` |
| 18 | `trending-up-outline` | 38 | `wine-outline` |
| 19 | `dice-outline` | 39 | `ellipsis-horizontal-outline` |
| 20 | `people-outline` | 40 | `phone-portrait-outline` |

## Colores predefinidos (grid 1×8)

| # | Hex | # | Hex |
|---|---|---|---|
| 1 | `#22D3EE` | 5 | `#F472B6` |
| 2 | `#F87171` | 6 | `#60A5FA` |
| 3 | `#34D399` | 7 | `#A78BFA` |
| 4 | `#FBBF24` | 8 | `+` (abre modal) |

## Colores expandidos (ColorPickerModal, grid 4×5)

| # | Hex | # | Hex |
|---|---|---|---|
| 1 | `#22D3EE` | 11 | `#FB923C` |
| 2 | `#F87171` | 12 | `#E879F9` |
| 3 | `#34D399` | 13 | `#C084FC` |
| 4 | `#FBBF24` | 14 | `#38BDF8` |
| 5 | `#F472B6` | 15 | `#4ADE80` |
| 6 | `#60A5FA` | 16 | `#FB7185` |
| 7 | `#A78BFA` | 17 | `#FCA5A5` |
| 8 | `#94A3B8` | 18 | `#86EFAC` |
| 9 | `#FCD34D` | 19 | `#FDE68A` |
| 10 | `#6EE7B7` | 20 | `#A5B4FC` |

---

## Persistencia

`categoryRepo.create()` inserta en la tabla `categories`. Los datos del formulario se pasan directamente:

```ts
await categoryRepository.create({
  user_id: 1,
  name: name.trim(),
  icon: selectedIcon,
  color: selectedColor,
  type: selectedType,
});
```

La categoría recién creada se pasa de vuelta a `AddCategoryScreen` mediante el patrón `setPendingCategory` (exportado desde `AddTransactionScreen` o desde un módulo compartido), igual que se hace con las transacciones.

---

## i18n

Nuevas claves necesarias:

| Clave | EN | ES | CA |
|---|---|---|---|
| `create_cat_title` | Create category | Crear categoría | Crear categoria |
| `create_cat_name` | Category name | Nombre de la categoría | Nom de la categoria |
| `create_cat_name_placeholder` | Category name | Nombre de la categoría | Nom de la categoria |
| `create_cat_type` | Type | Tipo | Tipus |
| `create_cat_expense` | Expense | Gasto | Despesa |
| `create_cat_income` | Income | Ingreso | Ingreso |
| `create_cat_symbols` | Symbols | Símbolos | Símbols |
| `create_cat_color` | Color | Color | Color |
| `create_cat_add` | Add | Añadir | Afegir |
| `create_cat_error_name_empty` | Enter a category name | Introduzca un nombre para la categoría | Introdueix un nom per a la categoria |
| `create_cat_error_name_duplicate` | A category with this name already exists | Ya existe una categoría con este nombre | Ja existeix una categoria amb aquest nom |
| `create_cat_hint_icon` | Select an icon | Selecciona un icono | Selecciona una icona |
| `create_cat_hint_color` | Select a color | Selecciona un color | Selecciona un color |
| `create_cat_hint_icon_color` | Select an icon and a color | Selecciona un icono y un color | Selecciona una icona i un color |
| `create_cat_color_picker_title` | Select color | Seleccionar color | Seleccionar color |
| `create_cat_color_picker_cancel` | Cancel | Cancelar | Cancel·lar |

---

## Estimación

- **Tareas**: 15 tareas en 5 fases
- **Tiempo estimado**: 3-4 horas
