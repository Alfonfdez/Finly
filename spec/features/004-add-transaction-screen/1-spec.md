# 004 — Add transaction page

- **Goal**
Screen accessible from the Home "+" button that allows the user to record a new expense or income. The transaction is created with type (expense/income), amount, account, category, day, tags, comment and optional photo. All texts are multilingual (en/es/ca).

---

## Functional requirements

### 1. Access and navigation

- The "+" button (FAB) on the HomeScreen navigates to `AddTransactionScreen`.
- The screen has a back button (left arrow) in the header to return to Home.
- The header title is "Add transaction" (multilingual).

### 2. Type selector (tabs)

- Two tabs: "Expenses" / "Income" (multilingual).
- The default selected tab matches the last type used on the main screen (HomeScreen).
- When changing tabs, the transaction type to create is updated.

### 3. Amount field

- Numeric input with number keyboard.
- Shows "0" as gray placeholder when empty.
- When focusing the input, it is cleared to allow direct typing.
- The formatted value with thousands separators is only shown when there is a value entered.
- Validation: maximum 2 decimals.
- If the user enters more than 2 decimals:
  - The input border is displayed in red.
  - The error text is shown: "The amount entered is not valid" (multilingual).
- To the right of the input, the symbol of the currency selected in settings is displayed (e.g.: €, $, £, ¥).
- To the right of the currency symbol, a calculator icon that opens a "Calculator" screen (TODO: future implementation).

### 4. Account selection

- Title: "Account" (multilingual).
- Below it shows the name of the selected account.
- The default account is the account selected on the main screen (HomeScreen).
- **Fallback**: if the active account is the Total account (`is_total=1`), the first non-Total account is pre-selected instead.
- When tapping on the account name, a modal (`AccountModal`) opens to select another account. The Total account is excluded from the modal.

### 5. Category selection

- Title: "Categories" (multilingual).
- 4-column × 2-row grid (8 positions):
  - The first 7 positions show categories sorted by **usage frequency** (most used first) within a **90-day window** from today, **scoped to the selected account**. This means the sort order adapts when the user switches accounts, showing the most relevant categories for that specific account.
  - Categories with 0 transactions in the last 90 days for the selected account appear after used categories, sorted alphabetically among themselves.
  - The eighth position always shows a "+" icon with the text "More" (multilingual).
- Sorting logic:
  - Primary sort: transaction count descending (categories used more often appear first).
  - Secondary sort (ties or 0 usage): alphabetical by name.
  - No special treatment for "Other" or "Others" — they follow the same usage-based ranking.
- When tapping "More":
  - If the active type has **more than 7 categories**: the "Add category" screen opens to select from existing ones.
  - If the active type has **7 or fewer categories**: the "Create category" screen opens directly to create a new one.

### 6. Day selection

- Title: "Day" (multilingual).
- 3-column × 1-row grid:

| Pos. | Content | Text below | Selection |
|------|---------|------------|-----------|
| 1 | Today's date (dd MMM) | "Today" | Selected if the active day is today |
| 2 | Yesterday's date (dd MMM) | "Yesterday" | Selected if the active day is yesterday |
| 3 | Dynamic date or "Day before yesterday" | "Day before yesterday" / "Selected" | See rule below |

**Date format:**
- Spaces 1 and 2: "dd MMM" (e.g.: "Jul 12", "Jul 11").
- Space 3: "dd MMM" if the year is the current one (e.g.: "Jul 10"), "dd MMM yyyy" if it is a different year (e.g.: "Jul 10, 2025").

**Selection logic based on the main screen state:**

| Main tab | Selected date | Space 1 (Today) | Space 2 (Yesterday) | Space 3 (Dynamic) |
|---|---|---|---|---|
| Day | Today | Selected | - | "Day before yesterday", not selected |
| Day | Yesterday | - | Selected | "Day before yesterday", not selected |
| Day | Other day | - | - | That date, **selected** |
| Week / Month / Year | Any | Selected | - | "Day before yesterday", not selected |
| Period | Range > 1 day | Selected | - | "Day before yesterday", not selected |
| Period | Range = 1 day = today | Selected | - | "Day before yesterday", not selected |
| Period | Range = 1 day = yesterday | - | Selected | "Day before yesterday", not selected |
| Period | Range = 1 day = other | - | - | That date, **selected** |

**Initialization when opening "Add transaction":**
- If the active tab is Period and the range is 1 day: the inherited day is `fechaPersonalizada.inicio`.
- In any other case: the inherited day is `fechaSeleccionada` from the main screen.

**When interacting with the day selector:**
- The DaySelector component is a controlled component: it receives `diaSeleccionado` as a prop and calls `onSelect(fecha)` when tapped.
- When selecting a day, the local state is updated and the logic is recalculated immediately.
- The calendar button opens a `CalendarModal` (reuse existing component) to select a free date.

- To the right of the grid, a calendar icon that opens a modal similar to the `DayPicker` from the calendar to select a date.

### 7. Tags

- Title: "Tags" (multilingual).
- To the right of the title, a search button that shows/hides a search line below.
- **Search line**: text input with placeholder "Search and create tags" (multilingual) and an "x" button to the right to close without creating or selecting.
- Below the search, the existing tag buttons for selection.
- To the right, a "+ Add tag" button (multilingual) that opens a modal:

**"Add tag" modal:**
- Title: "Add tag" (multilingual).
- Text input with placeholder "Tag name" (multilingual).
- Below the input: dynamic counter "0/20" that updates as you type (maximum 20 characters).
- Buttons: "Cancel" / "Add" (multilingual).

### 8. Comment

- Title: "Comment" (multilingual).
- Multiline text input with placeholder "Comment" (multilingual).
- Below: dynamic counter "0/4096" that updates as you type (maximum 4096 characters).

### 9. Photo

- Title: "Photo" (multilingual).
- Large "+" icon in a square that, when tapped, opens a modal:

**"Add photo" modal:**
- Title: "Add photo" (multilingual).
- Option 1: "Take photo" (multilingual) — opens the camera (requires permissions).
- Option 2: "Add from gallery" (multilingual) — opens the gallery (requires permissions).
- TODO: future implementation of permissions and image capture. For now only the modal with the options is displayed.

### 10. Submit button

- "Add" button (multilingual) at the bottom.
- When tapped, creates the transaction with all entered data and returns to Home.

---

## Non-functional requirements

- **Multilingual**: all visible texts (titles, placeholders, errors, buttons, day names) must use `t()` from the existing i18n system. No hardcoded strings are allowed.
- **Persistence**: the transaction is saved in the `transacciones` table in SQLite (native) or localStorage (web).
- **Configuration**: the currency, decimal separator and language are read from the existing `ConfigContext`.
- **Theme**: the screen must use `useConfig().coloresActivos` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.

---

## Acceptance criteria

- [x] The Home "+" button navigates to the add transaction screen.
- [x] The header shows a back arrow and "Add transaction" title in the active language.
- [x] The "Expenses"/"Income" tabs show the type inherited from Home.
- [x] The amount input validates a maximum of 2 decimals and shows a red error if not valid.
- [x] The calculator icon is visible but not functional (TODO).
- [x] The displayed account matches the one selected in Home.
- [x] The account modal allows changing the selected account.
- [x] 7 categories sorted by usage frequency (last 90 days, per-account) are displayed in a 4×2 grid + "More" button.
- [x] Categories with 0 transactions for the selected account appear after used ones, alphabetically sorted.
- [x] "Other" and "Others" follow the same usage-based ranking (no special position).
- [x] The "More" button is always visible: with >7 categories navigates to Add category, with ≤7 navigates directly to Create category.
- [x] The 3 days show the correct dates according to the described rule.
- [x] The calendar button opens the day selection modal.
- [x] The tags section allows searching, creating and selecting tags.
- [x] The "Add tag" modal validates a maximum of 20 characters.
- [x] The comment field allows up to 4096 characters with a counter.
- [x] The photo button opens the modal with the two options (TODO).
- [ ] The "Add" button creates the transaction and returns to Home.
- [x] All texts change when changing the language in settings.
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.
