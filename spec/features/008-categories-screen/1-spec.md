# 008 — Categories page

- **Goal**
Screen accessible from the Drawer (hamburger menu) that displays all existing categories organized by type (expense/income) and allows navigating to creating new categories or modifying existing ones. All texts are multilingual (en/es/ca).

---

## Functional requirements

### 1. Access and navigation

- The screen is accessed from the "Categories" item in the Drawer Navigator (hamburger menu), currently a placeholder showing "Coming soon".
- The header has a hamburger menu button on the left to open/close the Drawer.
- The header title is "Categories" (multilingual).

### 2. Type tabs

- Two tabs below the header: "Expenses" / "Income" (multilingual).
- Reuses the existing `TypeTabs` component.
- "Expenses" is selected by default.
- When switching tabs, the categories of the selected type are displayed.

### 3. Categories grid

- Below the tabs, the categories of the active type are displayed in a 4-column × N-row grid (vertical scroll if they don't fit).
- Each category is displayed as: icon with the category color as background + name below.
- The grid is vertically scrollable if there are many categories.
- Tapping a category navigates to the "Modify category" screen (009) with the selected category as a parameter (`categoryId`).

### 4. "Create" button

- In the last position of the grid, a "+" button with the text "Create" (multilingual) is displayed.
- Tapping the "Create" button navigates to the existing "Create category" screen (006), passing the active type as a parameter.

---

## Non-functional requirements

- **Multilingual**: all visible texts (titles, tabs, buttons) must use `t()` from the existing i18n system. No hardcoded strings are allowed.
- **Configuration**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is added to `HomeStack` in `AppNavigator.tsx` and the "Categories" DrawerItem is connected to navigate to it.
- **Persistence**: categories are loaded from the existing repository (`categoryRepository`), filtered by type and active user.

---

## Acceptance criteria

- [ ] The Drawer shows "Categories" and tapping it navigates to the categories screen.
- [ ] The header shows the hamburger menu button and the title "Categories" in the active language.
- [ ] Two tabs "Expenses"/"Income" are shown with "Expenses" selected by default.
- [ ] When switching tabs, the categories of the corresponding type are displayed in a 4×N grid.
- [ ] Each category shows an icon with a colored background + name below.
- [ ] The grid is vertically scrollable if there are many categories.
- [ ] The "Create" button (icon "+" + text) is in the last position of the grid.
- [ ] Tapping "Create" navigates to "Create category" (006) with the active type.
- [ ] Tapping a category navigates to "Modify category" (009) with the selected category.
- [ ] All texts change when switching the language in settings.
- [ ] The screen respects the active theme (dark/light).
- [ ] The screen respects the configured text size.
