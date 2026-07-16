# Implementation plan — 004 Add transaction page

## Files to create

```
src/
├── screens/
│   └── AddTransactionScreen.tsx    ← main screen (replace current placeholder)
│
├── components/
│   ├── TypeTabs.tsx                ← Expenses/Income tabs (already exists, verify usage)
│   ├── AccountModal.tsx            ← account selection modal (already exists)
│   ├── CategoryGrid.tsx            ← 4×2 category grid + "More" button
│   ├── DaySelector.tsx             ← 3×1 day grid (Today, Yesterday, dynamic) + calendar icon
│   ├── TagSection.tsx              ← tags section (search, creation, selection)
│   ├── AddTagModal.tsx             ← modal to create new tag
│   ├── PhotoSection.tsx            ← photo section with options modal
│   └── CommentInput.tsx            ← comment field with counter
```

## Files to modify

```
src/
├── i18n/
│   ├── en.ts                       ← add keys for AddTransaction
│   ├── es.ts                       ← add keys for AddTransaction
│   └── ca.ts                       ← add keys for AddTransaction
│
├── navigation/
│   └── AppNavigator.tsx            ← add AddTransactionScreen to HomeStack
│
├── screens/
│   └── HomeScreen.tsx              ← connect FAB "+" to navigation
│
├── constants/
│   └── types.ts                    ← add AddTransactionScreenProps
│
└── database/
    └── repositories/
        └── transactionRepo.ts      ← add crearTransaccion() function
```

---

## Architecture

### AddTransactionScreen

Main screen that orchestrates all sub-sections. Local state:

```ts
interface AddTransactionState {
  tipo: 'gasto' | 'ingreso';       // inherited from Home or changeable via tabs
  cantidad: string;                 // text input, parsed on submit
  cuentaId: number;                 // ID of the selected account
  categoriaId: number;              // ID of the selected category
  dia: Date;                        // selected day (default: today)
  etiquetas: number[];              // IDs of selected tags
  comentario: string;               // free text
  fotoUri: string | null;           // photo URI (future)
}
```

### TypeTabs

Reusable component (already exists `TypeTabs.tsx`). Receives `tipo` and `onChange`. Displays "Expenses" / "Income" according to language.

### CategoryGrid

- Receives `categorias: Categoria[]` (the 7 most used) and `onSelect(id)`.
- 4×2 grid: 7 categories + 1 "More" button.
- Each cell displays an icon (emoji or component) + name below.
- The "More" button has a "+" icon and "More" text.

### DaySelector

- Receives `diaSeleccionado: Date` and `onChange(fecha: Date)`.
- Calculates the 3 positions:
  - Pos 1: `hoy` → text "Today".
  - Pos 2: `ayer` → text "Yesterday".
  - Pos 3: dynamic logic (see spec).
- Calendar icon that opens `CalendarModal` (reuse existing component).
- Uses `formatearFecha(fecha, 'dd MM')` to display dates.

### TagSection

- Receives `etiquetasDisponibles: Etiqueta[]`, `etiquetasSeleccionadas: number[]`, `onToggle(id)`, `onCrear(nombre)`.
- Search button that shows/hides input.
- Input with placeholder "Search and create tags" and "x" button.
- List of existing tag buttons (toggle selection).
- "+ Add tag" button that opens `AddTagModal`.

### AddTagModal

- Modal with "Tag name" input, "0/20" counter, "Cancel"/"Add" buttons.
- Validation: maximum 20 characters, name not empty.
- On confirm, calls `onCrear(nombre)` and closes.

### PhotoSection

- Large "+" icon that opens modal with options.
- Modal: "Add photo" → "Take photo" / "Add from gallery".
- TODO: permissions and capture implementation. For now only UI.

### CommentInput

- Multiline input with placeholder "Comment".
- Dynamic counter "0/4096" that updates as you type.

### Navigation

```ts
// types.ts
type HomeStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Settings: undefined;
};

// AppNavigator.tsx — HomeStack
<Stack.Screen name="AddTransaction" component={AddTransactionScreen}
  options={{ title: t().add_transaction_title }} />
```

The HomeScreen FAB uses `navigation.navigate('AddTransaction')`.

### i18n

New keys in all language files:

```ts
// Required keys (example in Spanish)
add_transaction_title: 'Añadir transacción',
tab_expenses: 'Gastos',
tab_income: 'Ingresos',
add_amount_placeholder: 'Cantidad',
add_amount_error: 'La cantidad que se ha introducido no es válida',
add_account: 'Cuenta',
add_categories: 'Categorías',
add_more: 'Más',
add_day: 'Día',
add_today: 'Hoy',
add_yesterday: 'Ayer',
add_day_before_yesterday: 'Anteayer',
add_selected: 'Seleccionado',
add_tags: 'Etiquetas',
add_tag_search: 'Buscar y crear etiquetas',
add_tag_new: 'Añadir etiqueta',
add_tag_modal_title: 'Añadir etiqueta',
add_tag_name_placeholder: 'Nombre de la etiqueta',
add_comment: 'Comentario',
add_photo: 'Foto',
add_photo_title: 'Añadir foto',
add_photo_camera: 'Sacar foto',
add_photo_gallery: 'Añadir desde galería',
add_submit: 'Añadir',
```

### Persistence

The `crearTransaccion` function in `transactionRepo.ts` inserts into the `transacciones` table with all fields. It is called when tapping "Add".

---

## Decisions

- **Modular components**: each section (category, day, tags, comment, photo) is an independent component to facilitate testing and maintenance.
- **Reuse of existing components**: `TypeTabs`, `AccountModal`, `CalendarModal` already exist and are reused.
- **Local state**: the screen uses local state (not Context) since it is a temporary form that is discarded when navigating.
- **Marked TODOs**: calculator, add category, photo capture — are implemented in future features.
- **Hardcoded string = error**: all visible texts go through `t()`.

## Verification

1. `npx expo start --web` — test in browser: navigation from FAB, complete form, amount validation.
2. `npx expo start` + Expo Go — test on native: modals, camera/gallery permissions (future).
3. Validate all acceptance criteria from `1-spec.md`.
4. Change language and verify that all texts update.
5. Change theme and verify colors.
6. Change text size and verify scaling.
