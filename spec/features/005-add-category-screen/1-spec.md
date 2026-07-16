# 005 — Add Category Page

- **Objective**
Screen accessible from the "More" button in the categories section of `AddTransactionScreen` that allows the user to view the categories of the active type (expense or income) and select one to add it to the transaction. All texts are multilingual (en/es/ca).

---

## Functional Requirements

### 1. Access and Navigation

- The screen is accessed from the "More" button in the categories section of `AddTransactionScreen`.
- The screen has a back button (left arrow) in the header to return to `AddTransactionScreen`.
- The header title is "Add category" (multilingual).

### 2. Category Types to Display

- The screen receives the active type from the previous screen (`AddTransactionScreen`): "expense" or "income".
- Only categories matching the active type are displayed.
- If the user switches tabs in `AddTransactionScreen` and reopens "Add category", the categories for the new type are displayed.

### 3. Search

- To the right of the title, a search button (magnifying glass icon).
- When pressing the search button, a text input appears below the title.
- The input has placeholder "Search category" (multilingual).
- To the right of the input, an "x" button to close the search without selecting a category.

**Search Logic:**
- Search is by characters contained in the category name.
- Case-insensitive.
- Example: typing "d" shows all categories containing the letter "d" in their name.
- Example: typing "du" shows only categories containing both letters "d" and "u" (in any order).
- If there are no matches, a "search not found" icon is shown with the text "Nothing found" (multilingual).

### 4. Category Grid

- Below the title bar (and the search bar if open), the active type categories are displayed in a 4-column × N-row grid.
- Each category is displayed as: icon with category color background + name below.
- The grid is vertically scrollable if there are many categories.
- When pressing a category, navigation returns to `AddTransactionScreen` with the selected category as the first category in the categories grid.

### 5. "Create" Button

- In the last position of the grid, a "Create" button (multilingual) with a "+" icon is displayed.
- When pressing the "Create" button, navigation goes to a new "Create category" screen (TODO: future implementation).

---

## Non-Functional Requirements

- **Multilingual**: all visible texts (titles, placeholders, buttons, error messages) must use `t()` from the existing i18n system. No hardcoded strings are allowed.
- **Configuration**: the screen must use `useConfig().coloresActivos` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is added to the `HomeStack` in `AppNavigator.tsx`.
- **Persistence**: categories are loaded from the existing repository (native SQLite or web localStorage).

---

## Acceptance Criteria

- [x] The "More" button in `AddTransactionScreen` navigates to the add category screen.
- [x] The header shows a back arrow and title "Add category" in the active language.
- [x] Only categories of the active type (expense or income) are displayed.
- [x] The search button opens/closes the search input below the title.
- [x] Search filters categories by characters contained in the name (case-insensitive).
- [x] If there are no matches, a "search not found" icon + "Nothing found" is displayed.
- [x] The "x" button on the input closes the search without selecting a category.
- [x] Categories are displayed in a 4×N grid with icon and name.
- [x] The "Create" button is in the last position of the grid.
- [x] When pressing a category, navigation returns to `AddTransactionScreen` with that category selected.
- [x] All texts change when switching language in settings.
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.
