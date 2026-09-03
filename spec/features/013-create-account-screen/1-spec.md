# 013 — Create account page

- **Objective**
  Screen accessible from the floating "+" button (FAB) in `AccountsScreen` (011) that allows the user to create a new account with name, icon, color, and optional note. All texts are multilingual (en/es/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessed from the floating "+" button (FAB) in `AccountsScreen` (011).
- The screen has a back button (left arrow) in the header to return to `AccountsScreen`.
- The header title is "Create account" (multilingual).

### 2. Account name

- Title: "Account name" (multilingual).
- Text input with placeholder "Account name" (multilingual).
- Maximum 30 characters with counter "0/30".
- **Validation**: empty name is not allowed. If empty, a red error text is shown and the "Create" button remains disabled.
- **Duplicate validation**: when typing, it verifies that an account with the same name does not already exist (case-insensitive).
  - "Cuenta", "cuenta" and "CUENTA" are considered duplicates.
  - If a duplicate exists, a red error text is shown below the input: "An account with this name already exists" (multilingual) and the "Create" button remains disabled.
  - **Reserved default name**: the default account name is checked via a language-aware guard. The entered name is mapped to a default account ID using the current language (`getDefaultAccountIdByName`). If a match is found, the English name for that default is checked against the DB (`existsByName`). If the default account still exists in the DB, the name is blocked with the duplicate error. If the default was deleted, the name is allowed. Attempting to use an existing default name shows the same duplicate error and disables "Create".
  - The check runs with a 300ms debounce to avoid querying on every keystroke.

### 3. Symbols (icons)

- Title: "Symbols" (multilingual).
- Grid of 4 columns × dynamic rows (vertical ScrollView if they don't all fit).
- ~20 predefined Ionicons for accounts are shown with a flat gray background (`#334155` in dark theme).
- When an icon is pressed, it is highlighted with a primary color border and the background changes slightly.
- Only one icon can be selected at a time (radios, not checkboxes).
- Predefined icons (~20):

| # | Icon (Ionicons) | # | Icon (Ionicons) |
|---|---|---|---|
| 1 | `wallet-outline` | 11 | `trending-up-outline` |
| 2 | `cash-outline` | 12 | `trending-down-outline` |
| 3 | `card-outline` | 13 | `pie-chart-outline` |
| 4 | `business-outline` | 14 | `bar-chart-outline` |
| 5 | `home-outline` | 15 | `analytics-outline` |
| 6 | `shield-outline` | 16 | `stats-chart-outline` |
| 7 | `layers-outline` | 17 | `briefcase-outline` |
| 8 | `scan-outline` | 18 | `storefront-outline` |
| 9 | `swap-horizontal-outline` | 19 | `pricetag-outline` |
| 10 | `receipt-outline` | 20 | `ellipsis-horizontal-outline` |

- When selecting an icon, the icon's background color changes to the color selected in the color section to show the user how the icon looks.

### 4. Color

- Title: "Color" (multilingual).
- Grid of 1 row × 8 columns.
- The first 6 positions are predefined colors in circular shape.
- The 7th position is a gray "+" that opens a **modal** with a dynamic color picker.
- When a color is pressed, it is highlighted with a darker ring/border and an overlaid checkmark.
- Only one color can be selected at a time.
- If a color is chosen from the picker, the 7th position updates to that custom color.
- Predefined colors:

| # | Color | Hex |
|---|---|---|
| 1 | Cyan (primary) | `#22D3EE` |
| 2 | Red | `#F87171` |
| 3 | Green | `#34D399` |
| 4 | Yellow | `#FBBF24` |
| 5 | Pink | `#F472B6` |
| 6 | Blue | `#60A5FA` |
| 7 | + (opens picker) | gray `#94A3B8` |

#### Color modal (reanimated-color-picker)

- Opens when pressing "+" in the color grid.
- Uses the `reanimated-color-picker` library with:
  - Panel1 (saturation/brightness picker)
  - HueSlider (hue picker)
  - OpacitySlider (opacity picker)
  - Preview (shows selected color in hex format)
- OK/Cancel buttons to confirm or cancel the selection.
- When OK is pressed, the color is selected in the main grid and the custom circle updates.

### 5. Note (description)

- Title: "Note" (multilingual).
- Multiline text input for an optional account description.
- Maximum 200 characters with counter "0/200".
- Default value: empty.

### 6. "Create" button

- "Create" button (multilingual) at the bottom.
- The button is disabled (gray) if ANY of these conditions are met:
  - The name is empty.
  - The name already exists (case-insensitive duplicate).
  - No icon has been selected.
  - No color has been selected.
- Dynamic red helper text based on what is missing (only the first unmet requirement is shown, in priority order):
  1. "Enter an account name" (if name empty)
  2. "An account with this name already exists" (if duplicate name)
  3. "Select an icon" (if icon missing)
  4. "Select a color" (if color missing)
  5. "Select an icon and a color" (if both missing)
- When "Create" is pressed, the account is created in the database (native SQLite / web localStorage) and navigation goes back to `AccountsScreen` (011).

### 7. Create behavior

- The account is inserted into the `accounts` table with:
  - `user_id`: 1 (default user)
  - `name`: the name entered by the user.
  - `icon`: the selected icon.
  - `color`: the selected color.
  - `initial_balance`: 0 (default).
  - `description`: the note entered by the user (or empty).
- After insertion, navigation goes to `AccountsScreen` (011).

---

## Non-functional requirements

- **Multilingual**: all visible texts (titles, placeholders, buttons, errors) must use `t()` from the existing i18n system.
- **Configuration**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is added to the `HomeStack` in `AppNavigator.tsx`.
- **Persistence**: the account is saved in the `accountRepository` (native SQLite or web localStorage).
- **Icons**: use `@expo/vector-icons` (Ionicons) as in the rest of the app.
- **Duplicate validation**: a function `existsByName(userId: number, name: string, excludeId?: number)` must be added to `accountRepo` and `webAccountRepo` that returns `true` if an account with that name already exists (case-insensitive) for the given user. The `excludeId` parameter is used in 012 to exclude the current account from the check.

---

## Acceptance criteria

- [x] The floating "+" button (FAB) in `AccountsScreen` (011) navigates to `CreateAccountScreen`.
- [x] The header shows a back arrow and title "Create account" in the active language.
- [x] The name input appears first below the header, with placeholder "Account name".
- [x] The input has a maximum of 30 characters with counter "0/30".
- [x] The "Create" button is disabled if the name is empty.
- [x] If the name is empty, "Enter an account name" is shown in red.
- [x] Duplicate validation checks case-insensitive against existing accounts.
- [x] Reserved default account names are blocked with the duplicate error only when the corresponding default account still exists in the DB (language-aware check via `getDefaultAccountIdByName`). Deleted default names can be reused.
- [x] If a duplicate exists, "An account with this name already exists" is shown in red and the button is disabled.
- [x] ~20 icons are shown in a 4-column grid with vertical scroll.
- [x] When an icon is pressed, it is selected and visually highlighted.
- [x] Only one icon can be selected at a time.
- [x] When selecting an icon, the icon's background color changes to the selected color.
- [x] 6 colors are shown in a 1×7 grid + "+" in the 7th position.
- [x] When a color is pressed, it is selected and highlighted with ring + checkmark.
- [x] The "+" opens a modal with color picker (reanimated-color-picker).
- [x] When a color is selected in the modal, it closes and the color is selected.
- [x] "Note" is shown with a multiline input, maximum 200 characters, counter 0/200.
- [x] The "Create" button is disabled if name, icon, or color is missing (or name is duplicate).
- [x] The red helper text appears with the appropriate message based on what is missing (only the first unmet requirement).
- [x] When "Create" is pressed, the account is created with `initial_balance: 0` and navigation goes back.
- [x] All texts change when the language is changed in settings.
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.
