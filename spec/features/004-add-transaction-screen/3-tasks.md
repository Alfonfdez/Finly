# Tasks — 004 Add transaction page
Execution order. Mark each task as completed.

---

### Phase 1 — Infrastructure and navigation

[x] T1 — Add i18n keys in `src/i18n/en.ts`, `src/i18n/es.ts` and `src/i18n/ca.ts` for all screen texts (titles, placeholders, errors, day names, labels, etc.).

[x] T2 — Update `src/constants/types.ts`: add `AddTransactionScreenProps` to `HomeStackParamList`.

[x] T3 — Update `src/navigation/AppNavigator.tsx`: add `AddTransactionScreen` to `HomeStack` with multilingual title and header options.

[x] T4 — Connect the HomeScreen "+" FAB to navigate to `AddTransactionScreen`.

---

### Phase 2 — TypeTabs component and header

[x] T5 — Verify that `TypeTabs.tsx` works correctly with the "Expenses"/"Income" multilingual tabs. Adjust if needed.

[x] T6 — Create `AddTransactionScreen.tsx` with the header (back arrow + multilingual title), the `TypeTabs` and the initial form state.

---

### Phase 3 — Amount field

[x] T7 — Implement the amount input with numeric keyboard, validation of maximum 2 decimals and red error message with multilingual text.

[x] T8 — Add the calculator icon to the right of the input (UI only, TODO functional).

---

### Phase 4 — Account and category selection

[x] T9 — Implement the "Account" section that shows the account selected from Home and opens `AccountModal` when tapped.

[x] T10 — Create `CategoryGrid.tsx`: 4×2 grid with 7 most used categories (icon + name) and "More" button with "+" icon.

[x] T11 — Integrate `CategoryGrid` in `AddTransactionScreen`. The "More" button is TODO (not functional).

---

### Phase 5 — Day selection

[x] T12 — Create `DaySelector.tsx`: 3×1 grid with Today, Yesterday and dynamic position + calendar icon.

[x] T13 — Implement the logic for the third position (dynamic based on the selected day).

[x] T14 — Integrate existing `CalendarModal` for the calendar button.

---

### Phase 6 — Tags

[x] T15 — Create `TagSection.tsx`: search button, search input, existing tag list (toggle), "+ Add tag" button.

[x] T16 — Create `AddTagModal.tsx`: modal with "Tag name" input, "0/20" counter, "Cancel"/"Add" buttons. 20-character validation.

[x] T17 — Integrate `TagSection` in `AddTransactionScreen`.

---

### Phase 7 — Comment and photo

[x] T18 — Create `CommentInput.tsx`: multiline input with multilingual placeholder and dynamic "0/4096" counter.

[x] T19 — Create `PhotoSection.tsx`: "+" icon that opens modal with "Take photo" / "Add from gallery". UI only (TODO functional).

[x] T20 — Integrate `CommentInput` and `PhotoSection` in `AddTransactionScreen`.

---

### Phase 8 — Submit button and persistence

[x] T21 — Add "Add" button at the bottom of the form with consistent styling.

[ ] T22 — Implement `crearTransaccion()` in `transactionRepo.ts` with all form fields.

[ ] T23 — Connect the "Add" button to call `crearTransaccion()` and navigate back to Home.

---

### Phase 9 — Theme and accessibility

[x] T24 — Apply `useConfig().coloresActivos` to all new components for dark/light theme support.

[x] T25 — Apply `useFontSize()` to all screen texts for scaling.

[x] T26 — Add `accessibilityLabel` and `accessibilityRole` to all interactive elements.

---

### Verification

[ ] T27 — Manual verification: `npx expo start --web` and `npx expo start` (Expo Go). Test all acceptance criteria from `1-spec.md`. Verify language change, theme and text size.
