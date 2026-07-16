# Tasks — 005 Add Category Page
Execution order. Mark each task when completed.

---

### Phase 1 — Infrastructure and Navigation

[x] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts` for all screen texts (title, placeholders, error messages, buttons, etc.).

[x] T2 — Update `src/constants/types.ts`: add `AddCategoryScreenProps` to `HomeStackParamList`.

[x] T3 — Update `src/navigation/AppNavigator.tsx`: add `AddCategoryScreen` to the `HomeStack` with multilingual title and header options.

---

### Phase 2 — Search Component

[x] T4 — Create `SearchBar.tsx`: reusable component with text input, "x" button to close, and text change callback.

[x] T5 — Integrate `SearchBar` in `AddCategoryScreen`. When typing, filter categories by characters contained in the name (case-insensitive).

---

### Phase 3 — Category Grid

[x] T6 — Create `AddCategoryScreen.tsx` with header (back arrow + multilingual title), `SearchBar`, and 4×N grid of categories filtered by type.

[x] T7 — Implement filtering logic: if no matches are found, display "search not found" icon + "Nothing found".

[x] T8 — Implement category selection: when pressed, navigate back to `AddTransactionScreen` with the selected category as a parameter.

---

### Phase 4 — "Create" Button and Navigation

[x] T9 — Add "Create" button in the last position of the grid in `AddCategoryScreen`. The button is a TODO (non-functional).

[x] T10 — Connect the "More" button in `CategoryGrid.tsx` to navigate to `AddCategoryScreen` passing the active type.

---

### Phase 5 — Theme and Accessibility

[x] T11 — Apply `useConfig().coloresActivos` to all new components for dark/light theme support.

[x] T12 — Apply `useFontSize()` to all screen texts for scaling.

[x] T13 — Add `accessibilityLabel` and `accessibilityRole` to all interactive elements.

---

### Verification

[ ] T14 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test all acceptance criteria from `1-spec.md`. Verify language switching, theme, and text size.
