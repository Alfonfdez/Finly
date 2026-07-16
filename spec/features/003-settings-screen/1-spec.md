# 003 — Settings page

- **Objective**
A settings screen accessible from the hamburger menu (Drawer) that allows the user to customize the behavior and appearance of the application. All values have sensible defaults and are persisted locally (SQLite on native, localStorage on web).

---

## Functional requirements

### 1. Access
- The Drawer includes an existing "Settings" item (currently a placeholder).
- When tapped, it navigates to the `SettingsScreen` within the Stack.
- The screen has a native back button to return to Home.

### 2. Settings sections

The screen is organized into sections with a header and `key → value` rows with a toggle, selector, or chevron depending on the type.

#### 2.1 — Appearance

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| Theme | Selector (radio) | Dark | Dark, Light, System |

- **Dark**: uses the current palette (Slate 900/800).
- **Light**: inverse palette (white background, dark text, primary keeps cyan).
- **System**: follows `Appearance.addChangeListener` from React Native / `prefers-color-scheme` on web.

When changing the theme, the entire app re-renders in real time (no restart required).

#### 2.2 — Calendar

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| First day of week | Selector (radio) | Monday | Monday, Sunday |

- Affects the `DayPicker` (headers and grid) and the `WeekPicker` (range calculation).
- The current `DayPicker` has an alignment bug between headers and grid (headers on Sunday, grid on Monday). This option fixes it by unifying both to the configured value.

#### 2.3 — Money format

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| Currency | Selector (radio) | Euro € | Euro €, Dollar $, Pound £, Yen ¥ |
| Decimal separator | Selector (radio) | Comma (1.234,56) | Comma (1.234,56), Period (1,234.56) |

- The currency affects the symbol shown in `formatearMoneda` and across all screens.
- The separator affects the numeric format: with comma the decimal is `,` and thousands is `.`; with period it's the reverse.
- Resulting formats:
  - Comma: `1.234,56 €`
  - Period: `1,234.56 €`

#### 2.4 — Language

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| Language | Selector (radio) | Spanish | Spanish, English |

- Affects: month names, day of the week names, UI labels (tabs, buttons, placeholder text).
- For now only the infrastructure and static label changes are implemented. Full app-wide translation is a future feature.

#### 2.5 — Text

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| Text size | Selector (radio) | Medium | Small, Medium, Large |

- Modifies a global scale factor applied to text `fontSize`.
- Scale factor values: Small = 0.85, Medium = 1.0, Large = 1.15.
- Implemented as a `multiplier` in the config context that components consult when rendering.

#### 2.6 — Category icon shape

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| Category icon shape | Selector (radio) | Square | Square, Circle |

- **Square**: category icons are shown with a square background and rounded corners (borderRadius 12), which is the current app design.
- **Circle**: category icons are shown with a circular background (borderRadius equal to half the size), with the icon centered inside the circle.
- Affects all components that display category icons: `CategoryGrid`, `CategoryList`, grid in `CategoriesScreen`, grid in `AddCategoryScreen`, grid in `CreateCategoryScreen`, category icon in transaction details, and the preview in `ModifyCategoryScreen`.
- Shape selection does not require an app restart; it applies in real time.

#### 2.7 — Account icon shape

| Option | Type | Default values | Possible values |
|--------|------|----------------|-----------------|
| Account icon shape | Selector (radio) | Square | Square, Circle |

- **Square**: account icons are shown with a square background and rounded corners (borderRadius 12).
- **Circle**: account icons are shown with a circular background (borderRadius equal to half the size), with the icon centered inside the circle.
- Affects all components that display account icons: `AccountsScreen` (list), `HomeScreen` (header), `AccountSelector` (trigger and modal), `AccountModal` (bottom sheet), grid in `CreateAccountScreen`, grid in `ModifyAccountScreen`.
- Shape selection does not require an app restart; it applies in real time.

---

## Non-functional requirements

- **Persistence**: all settings are saved in the SQLite `configuracion` table (native) or `localStorage` (web) as a single key-value row.
- **Initialization**: on app startup, settings are read and applied before the first render (avoid incorrect theme flash).
- **Performance**: theme changes must be instantaneous; no animated transitions.
- **Accessibility**: each settings row must have appropriate `accessibilityLabel` and `accessibilityRole`.

---

## Acceptance criteria

- [ ] The Drawer shows "Settings" and tapping it navigates to the settings screen.
- [ ] 7 sections are displayed: Appearance, Calendar, Money format, Language, Text, Category icon shape, Account icon shape.
- [ ] Each option shows the current value and allows changing it.
- [ ] The Dark/Light theme is applied immediately across the entire app.
- [ ] The System theme respects the device OS preference.
- [ ] The calendar starts on Monday by default; when changed to Sunday, DayPicker and WeekPicker adjust.
- [ ] The default currency is €; when changed to $, all amounts display $.
- [ ] The default decimal separator is comma; when changed to period, numeric formats change.
- [ ] The default language is Spanish; when changed to English, visible labels change.
- [ ] The default text size is Medium; when changed to Large/Small, the app scales.
- [ ] Settings persist across app restarts.
- [ ] On web, settings are stored in localStorage and work the same way.
