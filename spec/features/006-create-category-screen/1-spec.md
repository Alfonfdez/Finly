# 006 — Create Category Page

- **Goal**
Screen accessible from the "Create" button in the last position of the grid in `AddCategoryScreen` that allows the user to create a new custom category with name, type, icon and color. All texts are multilingual (en/es/ca).

---

## Functional Requirements

### 1. Access and Navigation

- The screen is accessed from the "Create" button in the grid on `AddCategoryScreen`.
- The screen has a back button (left arrow) in the header to return to `AddCategoryScreen`.
- The header title is "Create category" (multilingual).

### 2. Category Name

- The first element below the header is a text input with placeholder "Category name" (multilingual).
- The name is required: if empty, the "Add" button is disabled.
- If the name is empty and the user tries to press "Add" (or while the input is empty), a red help text is shown: "Enter a category name" (multilingual).
- **Duplicate validation**: while typing, it verifies that no category with the same name (case-insensitive) already exists in the database, regardless of type (expense/income).
  - "Food", "food" and "FOOD" are considered duplicates, whether they are expenses or incomes.
  - If there is a duplicate, a red error text is shown below the input: "A category with this name already exists" (multilingual) and the "Add" button remains disabled.
  - The check runs with a 300ms debounce to avoid querying on every keystroke.
- Maximum 30 characters for the name with dynamic counter "0/30".

### 3. Type (expense / income)

- Two radio buttons: "Expenses" and "Incomes" (multilingual).
- "Expenses" selected by default.
- The icon of the selected radio button must show a filled circle with the primary color; the unselected one shows an empty circle.

### 4. Symbols (icons)

- Title: "Symbols" (multilingual).
- Grid of 4 columns × dynamic rows (vertical ScrollView if they don't all fit).
- ~40 predefined Ionicons shown with flat gray background (`#334155` in dark theme).
- When tapping an icon, it is highlighted with a primary color border and the background changes slightly.
- Only one icon can be selected at a time (radios, not checkboxes).
- Predefined icons (40):

| # | Icon (Ionicons) | # | Icon (Ionicons) |
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

### 5. Color

- Title: "Color" (multilingual).
- Grid of 1 row × 8 columns.
- The first 6 positions are predefined circular colors.
- The 7th position shows the custom color chosen from the picker (if any) with a checkmark.
- The 8th position is a gray "+" that opens a **modal** with a dynamic color selector.
- When tapping a color, it is highlighted with a darker ring/border and an overlaid checkmark.
- Only one color can be selected at a time.
- The custom color persists once chosen (it doesn't disappear when selecting another quick color).
- Predefined colors:

| # | Color | Hex |
|---|---|---|
| 1 | Cyan (primary) | `#22D3EE` |
| 2 | Red | `#F87171` |
| 3 | Green | `#34D399` |
| 4 | Yellow | `#FBBF24` |
| 5 | Pink | `#F472B6` |
| 6 | Blue | `#60A5FA` |
| 7 | Custom color | (chosen from picker) |
| 8 | + (opens picker) | gray `#94A3B8` |

#### Color Modal (reanimated-color-picker)

- Opens when tapping "+" in the color grid.
- Uses the `reanimated-color-picker` library with:
  - Panel1 (saturation/brightness selector)
  - HueSlider (hue selector)
  - OpacitySlider (opacity selector)
  - Preview (shows the selected color in hex format)
- OK/Cancel buttons to confirm or cancel the selection.
- When pressing OK, the color is selected in the main grid and the custom circle is updated.

### 6. "Add" Button

- "Add" button (multilingual) at the bottom.
- The button is disabled (gray) if ANY of these conditions is met:
  - The name is empty.
  - The name already exists (case-insensitive duplicate of the same type).
  - No icon has been selected.
  - No color has been selected.
  - The maximum number of categories for the selected type (30) has been reached.
- Dynamic red help text based on what is missing (only the first unmet requirement is shown, in priority order):
  1. "Enter a category name" (if name empty)
  2. "A category with this name already exists" (if name duplicate)
  3. "Select an icon" (if icon missing)
  4. "Select a color" (if color missing)
  5. "Select an icon and a color" (if both missing)
  6. "Maximum of 30 categories per type reached" (if the per-type limit is reached)
- When pressing "Add", the category is created in the database (native SQLite / web localStorage) and navigation returns to `AddCategoryScreen` with the newly created category selected.

### 7. Behavior on Creation

- The category is inserted into the `categories` table with:
  - `user_id`: 1 (default user)
  - `name`: the name entered by the user.
  - `icon`: the selected icon.
  - `color`: the selected color.
  - `type`: the selected type (expense/income).
- After insertion, navigation goes to `AddCategoryScreen` with `{ type, categoryId }` so that the new category appears selected (using the same `setPendingCategory` pattern from `AddTransactionScreen`).

### 8. Limit of categories per type

- There is a maximum of 30 categories per type (expense/income), defined by `MAX_CATEGORIES_PER_TYPE` in `src/constants/types.ts`.
- The limit counts the existing categories of the selected type only (the other type is independent). Default seed data ships 21 expense and 10 income categories, so a fresh install can add up to 9 more expense categories.
- When the selected type already has 30 categories, the "Add" button is disabled and the message "Maximum of 30 categories per type reached" is shown in red.
- The check is reactive: switching the type radio re-evaluates the limit for the other type.
- No database constraint is added; the limit is enforced at the UI layer.
- As a complement, the entry points to this screen (the "Create" tile on the Categories page, spec 008, and on the Add Category screen, spec 005) are hidden when the type is at the cap, so the user never lands on a dead-end disabled form. This screen's guard remains as a safety net.

---

## Non-Functional Requirements

- **Multilingual**: all visible texts (titles, placeholders, buttons, errors) must use the existing i18n `t()` system.
- **Configuration**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is added to the `HomeStack` in `AppNavigator.tsx`.
- **Persistence**: the category is saved in the `categoryRepository` (native SQLite or web localStorage).
- **Icons**: use `@expo/vector-icons` (Ionicons) as in the rest of the app.
- **Duplicate validation**: an `existsByName(name: string, type: TransactionType)` function must be added to `categoryRepo` and `webCategoryRepo` that returns `true` if a category with that name (case-insensitive) already exists for the same type and user.

---

## Acceptance Criteria

- [ ] The "Create" button on `AddCategoryScreen` navigates to `CreateCategoryScreen`.
- [ ] The header shows a back arrow and title "Create category" in the active language.
- [ ] The name input appears first below the header, with placeholder "Category name".
- [ ] The input has a maximum of 30 characters with counter "0/30".
- [ ] The "Add" button is disabled if the name is empty.
- [ ] If the name is empty, "Enter a category name" is shown in red.
- [ ] Duplicate validation checks case-insensitive against existing categories (regardless of type).
- [ ] If there is a duplicate, "A category with this name already exists" is shown in red and the button is disabled.
- [ ] When changing the type, the name duplicate validation re-runs.
- [ ] The "Expenses"/"Incomes" radios work correctly, "Expenses" selected by default.
- [ ] ~40 icons are shown in a 4-column grid with vertical scroll.
- [ ] When tapping an icon, it is selected and visually highlighted.
- [ ] Only one icon can be selected at a time.
- [ ] 7 colors are shown in a 1×8 grid + "+" in the 8th position.
- [ ] When tapping a color, it is selected and highlighted with a ring + checkmark.
- [ ] The "+" opens a modal with ~20 expanded colors in a 4×5 grid.
- [ ] When selecting a color in the modal, it closes and the color remains selected.
- [ ] The "Add" button is disabled if name, icon or color is missing (or name is duplicate).
- [ ] The red help text appears with the appropriate message based on what is missing (only the first unmet requirement).
- [ ] When pressing "Add", the category is created and navigation returns with the category selected.
- [ ] When the selected type already has 30 categories, the "Add" button is disabled and "Maximum of 30 categories per type reached" is shown in red.
- [ ] Switching the type radio re-evaluates the limit (the other type can still add categories if below 30).
- [ ] All texts change when changing the language in settings.
- [ ] The screen respects the active theme (dark/light).
- [ ] The screen respects the configured text size.
