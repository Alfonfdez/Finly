# Implementation Plan — 005 Add Category Page

## Architecture

### New Components

- **AddCategoryScreen.tsx**: Main screen with header, categories grid filtered by type, and "Create" button in the last position of the grid.
- **SearchBar.tsx**: Reusable search bar component with input and "x" button.

### Modified Files

- **AppNavigator.tsx**: Add `AddCategoryScreen` to the `HomeStack`.
- **types.ts**: Add `AddCategoryScreenProps` to the `HomeStackParamList`.
- **CategoryGrid.tsx**: Modify `onAddMore` to navigate to `AddCategoryScreen`.
- **i18n/en.ts, es.ts, ca.ts**: Add multilingual keys for the new screen.

### Navigation Flow

```
AddTransactionScreen → CategoryGrid ("More") → AddCategoryScreen → AddTransactionScreen (with selected category)
```

### Type Filtering

1. `AddTransactionScreen` passes the active type (`tipo`) as a navigation parameter.
2. `AddCategoryScreen` receives the type and filters categories accordingly.
3. Only categories of the active type (expense or income) are displayed.

### Search Logic

1. The user presses the search button → the input is displayed.
2. When typing in the input, categories whose name contains the typed characters are filtered (in any order, case-insensitive).
3. If there are no matches, the empty state is displayed.
4. When pressing "x", the input is closed and all categories of the active type are restored.

### "Create" Button

1. The "Create" button is displayed in the last position of the categories grid.
2. It has a "+" icon and "Create" text (multilingual).
3. When pressed, navigation goes to a new "Create category" screen (TODO: future implementation).

### Category Selection

1. The user presses a category in the grid.
2. Navigation returns to `AddTransactionScreen` with the selected category as a parameter.
3. `AddTransactionScreen` updates the `categoriaId` state with the received category.

---

## Dependencies

- Existing i18n system (`src/i18n/index.ts`).
- ConfigContext for colors and text scaling.
- Category repositories (native SQLite or web localStorage).
- React Navigation v7 navigation (HomeStack).

---

## Estimation

- **Tasks**: 10 tasks
- **Estimated time**: 1-2 hours
