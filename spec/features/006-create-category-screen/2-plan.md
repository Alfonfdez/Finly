# Implementation Plan — 006 Create Category Page

## Architecture

### New Components

- **CreateCategoryScreen.tsx**: Main screen with name input, type selector (radio), icon grid, color grid and "Add" button.
- **IconGrid.tsx**: 4-column grid with ~40 selectable Ionicons with gray background. Vertical scroll if they don't all fit.
- **ColorGrid.tsx**: 1×8 color grid: 6 predefined circular colors + custom color circle (if exists) + "+" that opens a dynamic color picker.
- **ColorPickerModal.tsx**: Modal with `reanimated-color-picker` (Panel1 + HueSlider + OpacitySlider + Preview) and OK/Cancel buttons.

### Modified Files

- **AppNavigator.tsx**: Add `CreateCategoryScreen` to the `HomeStack`.
- **types.ts**: Add `CreateCategory` to `RootStackParamList` and `CreateCategoryScreenProps`.
- **AddCategoryScreen.tsx**: Connect the "Create" button to navigate to `CreateCategoryScreen`.
- **categoryRepo.ts / webCategoryRepo.ts**: Add `existsByName(name, type)` function for duplicate validation.
- **i18n/en.ts, es.ts, ca.ts**: Add multilingual keys for the new screen.

### Navigation Flow

```
AddCategoryScreen → grid ("Create") → CreateCategoryScreen → AddCategoryScreen (with created category selected)
```

### Dependencies

- Existing i18n system (`src/i18n/index.ts`).
- ConfigContext for colors and text scaling.
- Category repository (`categoryRepo` / `webCategoryRepo`).
- React Navigation v7 navigation (HomeStack).
- `@expo/vector-icons` (Ionicons) for icons.

---

## UI States

### CreateCategoryScreen

```
┌─────────────────────────────────┐
│ ← Create category               │  ← Header with back button
├─────────────────────────────────┤
│ Category name                   │  ← Section title
│ ┌───────────────────────────┐   │
│ │                           │   │  ← Text input, max 30 chars
│ └───────────────────────────┘   │
│ 0/30                            │  ← Counter
│ [Red error text]                │  ← Only if name empty or duplicate
├─────────────────────────────────┤
│ [●] Expenses  [○] Incomes       │  ← Type radio buttons
├─────────────────────────────────┤
│ Symbols                         │  ← Section title
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← 4-col grid, ~40 icons
│ └──┘ └──┘ └──┘ └──┘           │     (vertical scroll)
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│ ...                            │
├─────────────────────────────────┤
│ Color                          │  ← Section title
│ ( ) ( ) ( ) ( ) ( ) ( ) (+)    │  ← "+" opens modal
├─────────────────────────────────┤
│ [Red help text]                 │  ← Only if requirement missing
│ ┌─────────────────────────┐     │
│ │           Add           │     │  ← Button (disabled if missing)
│ └─────────────────────────┘     │
└─────────────────────────────────┘
```

### ColorPickerModal

```
┌─────────────────────────────────┐
│ Select color                    │  ← Modal header
├─────────────────────────────────┤
│ ┌───────────────────────────┐   │
│ │ Panel1 (saturation/bright)│   │  ← Color selector
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ HueSlider (hue)           │   │  ← Horizontal slider
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ OpacitySlider (opacity)   │   │  ← Horizontal slider
│ └───────────────────────────┘   │
│ ┌───────────────────────────┐   │
│ │ Preview (#hex)            │   │  ← Color preview
│ └───────────────────────────┘   │
├─────────────────────────────────┤
│ [Cancel]                [Ok]    │  ← Action buttons
└─────────────────────────────────┘
```

### Local State

```ts
interface CreateCategoryState {
  name: string;                    // category name
  nameError: string | null;        // name error (empty | duplicate)
  type: TransactionType;           // 'expense' | 'income'
  selectedIcon: string | null;     // Ionicons icon name
  selectedColor: string | null;    // hex of selected color
  customColor: string | null;      // hex of custom color from picker
  checkingName: boolean;           // true while checking duplicate
}
```

### Validations

- `canCreate`: `name.trim().length > 0 && nameError === null && selectedIcon !== null && selectedColor !== null`
- Help text priority (only the first unmet requirement is shown):
  1. `name.trim() === ''`: "Enter a category name"
  2. `nameError === 'duplicate'`: "A category with this name already exists"
  3. `!selectedIcon && !selectedColor`: "Select an icon and a color"
  4. `!selectedIcon`: "Select an icon"
  5. `!selectedColor`: "Select a color"

### Duplicate Check

- `existsByName(name: string): Promise<boolean>` is added to `categoryRepo` and `webCategoryRepo`.
- SQL: `SELECT COUNT(*) FROM categories WHERE user_id = 1 AND LOWER(name) = LOWER(?)`.
- Web: case-insensitive filtering in localStorage.
- Runs with 300ms debounce when the name changes.
- While checking (checkingName = true), the button remains disabled.

---

## Predefined Icons (4-column grid, ~40 icons)

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

## Predefined Colors (1×8 grid)

| # | Hex | # | Hex |
|---|---|---|---|
| 1 | `#22D3EE` | 5 | `#F472B6` |
| 2 | `#F87171` | 6 | `#60A5FA` |
| 3 | `#34D399` | 7 | Custom color (picker) |
| 4 | `#FBBF24` | 8 | + (opens picker) |

## ColorPickerModal (reanimated-color-picker)

- Panel1: saturation/brightness selector (200px height)
- HueSlider: hue selector (30px height)
- OpacitySlider: opacity selector (30px height)
- Preview: shows the selected color in hex format
- OK/Cancel buttons to confirm or cancel

---

## Persistence

`categoryRepo.create()` inserts into the `categories` table. Form data is passed directly:

```ts
await categoryRepository.create({
  user_id: 1,
  name: name.trim(),
  icon: selectedIcon,
  color: selectedColor,
  type: selectedType,
});
```

The newly created category is passed back to `AddCategoryScreen` via the `setPendingCategory` pattern (exported from `AddTransactionScreen` or from a shared module), the same way it's done with transactions.

---

## i18n

New keys needed:

| Key | EN | ES | CA |
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
| `create_cat_color_picker_ok` | Ok | Ok | D'acord |
| `create_cat_color_picker_cancel` | Cancel | Cancelar | Cancel·lar |

---

## Estimate

- **Tasks**: 15 tasks in 5 phases
- **Estimated time**: 3-4 hours
