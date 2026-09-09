# Implementation plan — 008 Categories page

## Architecture

### New components

- **CategoriesScreen.tsx**: Main screen with header (hamburger menu + title), `TypeTabs`, 4×N grid of categories filtered by type, and a "Create" button in the last position of the grid.

### Modified files

- **AppNavigator.tsx**: Add `CategoriesScreen` to `HomeStack`. Connect the "Categories" `DrawerItem` (currently `onPress={() => {}}`) to navigate to the new screen.
- **types.ts**: Add `Categories` to `RootStackParamList` and `CategoriesScreenProps`.
- **i18n/en.ts, es.ts, ca.ts**: Add key `nav_categories` (if not already present as a visible title) and any other necessary keys.

### Navigation flow

```
Drawer → "Categories" → CategoriesScreen
  ├── tap category → ModifyCategoryScreen (009) { categoryId }
  └── tap "Create" → CreateCategoryScreen (006) { type }
```

### Categories grid

- Reuse the 4×N grid pattern with icon + name from `AddCategoryScreen`.
- Each cell displays the category icon with its color as background + name below.
- Vertical scroll with FlatList or ScrollView.
- Last position: "+" button with label "Create" (multilingual).

### Dependencies

- Existing i18n system (`src/i18n/index.ts`).
- ConfigContext for colors and text scaling.
- Category repository (`categoryRepository`).
- React Navigation v7 navigation (HomeStack + Drawer).
- Existing `TypeTabs` component.
- Existing `CreateCategoryScreen` (006).
- `ModifyCategoryScreen` to be implemented (009).

---

## UI states

```
┌─────────────────────────────────┐
│ ☰  Categories                   │  ← Header with hamburger menu
├─────────────────────────────────┤
│ [Expenses]  [Income]            │  ← TypeTabs
├─────────────────────────────────┤
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │  ← 4×N categories grid
│ └──┘ └──┘ └──┘ └──┘           │     Icon + color + name
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐           │
│ │  │ │  │ │  │ │  │           │
│ └──┘ └──┘ └──┘ └──┘           │
│ ...                            │
│ ┌──────────────┐               │
│ │ [+] Create   │               │  ← Last position
│ └──────────────┘               │
└─────────────────────────────────┘
```

---

## i18n

New keys needed:

| Key | EN | ES | CA |
|---|---|---|---|
| `categories_title` | Categories | Categorías | Categories |

If `nav_categories` already exists in the i18n files, it can be reused for the header title.

---

## Estimation

- **Tasks**: 8 tasks in 3 phases
- **Estimated time**: 1-2 hours
