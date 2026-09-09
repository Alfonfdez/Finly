# Tasks — 008 Categories page
Execution order. Mark each task when completed.

---

### Phase 1 — Infrastructure and navigation

[x] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts` for the screen title (`categories_title` or reuse `nav_categories` if it already exists). *(nav_categories already existed)*

[x] T2 — Update `src/constants/types.ts`: add `Categories` to `RootStackParamList` and create `CategoriesScreenProps`.

[x] T3 — Update `src/navigation/AppNavigator.tsx`:
  - Add `CategoriesScreen` to `HomeStack` with multilingual title and header style.
  - Connect the "Categories" `DrawerItem` (currently `onPress={() => {}}`) to navigate to `CategoriesScreen`.
  - Moved "Categories" DrawerItem out of the "Coming soon" section.

---

### Phase 2 — Main screen

[x] T4 — Create `CategoriesScreen.tsx` with:
  - Header with hamburger menu button (opens Drawer) + "Categories" title (multilingual).
  - `TypeTabs` with local state to filter by type (expense/income).
  - 4×N grid of categories loaded from `categoryRepository.list()` filtered by active type.
  - Each cell: icon with colored background + name below.
  - Vertical scroll if there are many categories.
  - "Create" button (icon "+" + text) in the last position.

[x] T5 — Connect grid actions:
  - Tap a category: navigate to `ModifyCategoryScreen` with `{ categoryId }` as parameter.
  - Tap "Create": navigate to `CreateCategoryScreen` with `{ type }` as parameter.

---

### Phase 3 — Theme and accessibility

[x] T6 — Apply `useConfig().activeColors` to all new components for dark/light theme support.

[x] T7 — Apply `useFontSize()` to all screen texts for scaling.

[x] T8 — Add `accessibilityLabel` and `accessibilityRole` to all interactive elements.

---

### Verification

[ ] T9 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test all acceptance criteria from `1-spec.md`. Verify Drawer navigation, type filtering, categories grid, and navigation to create/modify category.
