# 003 — Settings page

- **Objective**
  A settings screen accessible from the hamburger menu (Drawer) that allows the user to customize the behavior, appearance, and defaults of the application. Settings are organized into subsections. All values have sensible defaults and are persisted locally (SQLite on native, IndexedDB via sql.js on web).

---

## Functional Requirements

### 1. Access and Navigation

- The Drawer includes a "Settings" item with `settings-outline` icon.
- When tapped, it navigates to the `SettingsScreen` within the Stack.
- The screen has a native back button to return to Home.
- The main settings screen shows a list of subsection rows. Each row is tappable and navigates to a detail screen.

### 2. Main Settings Screen

The main screen displays 4 subsection rows:

| # | Icon | Label | Rows |
|---|------|-------|------|
| 1 | `color-palette-outline` | Appearance | Theme, Text size, Account icon shape, Category icon shape |
| 2 | `globe-outline` | Regional | Language, Currency, Decimal separator, First day of week |
| 3 | `options-outline` | Personalization | Home screen defaults, Add transaction defaults, Privacy |
| 4 | `server-outline` | Data | Delete all transactions, Delete all data, Reset to factory state |

- Each row shows the subsection icon (24px, primary color), label (fs(15), bold), and a chevron-right (`chevron-forward-outline`, textSecondary).
- Tapping a row navigates to the corresponding detail screen.
- The screen has a centered header title "Settings" (multilingual).

### 3. Appearance Subsection

**Access:** tap "Appearance" row on the main settings screen.
**Header:** back arrow + "Appearance" (multilingual).

#### 3.1 — Theme

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Theme | Selector (radio) | Dark | Dark, Light, System |

- **Dark**: current palette (Slate 900/800 backgrounds).
- **Light**: inverse palette (white background, dark text, primary keeps cyan-600).
- **System**: follows OS `Appearance.addChangeListener` (native) / `prefers-color-scheme` (web).

When changing the theme, the entire app re-renders in real time (no restart required).

#### 3.2 — Text size

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Text size | Selector (radio) | Medium | Small, Medium, Large |

- Modifies a global scale factor applied to text `fontSize` via `scaleFontSize()`.
- Scale factors: Small = 0.85, Medium = 1.0, Large = 1.15.

#### 3.3 — Account icon shape

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Account icon shape | Selector (radio) | Square | Square, Circle |

- **Square**: borderRadius 12.
- **Circle**: borderRadius equal to half the size.
- Affects: AccountsScreen, HomeScreen, AccountSelector, AccountModal, CreateAccountScreen, ModifyAccountScreen.

#### 3.4 — Category icon shape

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Category icon shape | Selector (radio) | Square | Square, Circle |

- **Square**: borderRadius 12.
- **Circle**: borderRadius equal to half the size.
- Affects: CategoryGrid, CategoryList, CategoriesScreen, AddCategoryScreen, CreateCategoryScreen, ModifyCategoryScreen, TransactionDetailsScreen.

### 4. Regional Subsection

**Access:** tap "Regional" row on the main settings screen.
**Header:** back arrow + "Regional" (multilingual).

#### 4.1 — Language

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Language | Selector (radio) | English | English, Spanish, Catalan |

- Affects: all UI labels via `t()`, month names, day names.
- Flags: UK (EN), Spain (ES), Senyera (CA).

#### 4.2 — Currency

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Currency | Picker modal (searchable) | Euro € | Euro €, Dollar $, Pound £, Yen ¥ |

- Opens a scrollable modal with radio selection and a search bar.
- Affects: `formatCurrency()` across all screens.

#### 4.3 — Decimal separator

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Decimal separator | Selector (radio) | Comma (1.234,56) | Comma (1.234,56), Period (1,234.56) |

- Comma: thousands `.`, decimal `,`.
- Period: thousands `,`, decimal `.`.

#### 4.4 — First day of week

| Option | Type | Default | Values |
|--------|------|---------|--------|
| First day of week | Selector (radio) | Monday | Monday, Sunday |

- Affects: DayPicker (headers + grid), WeekPicker (range calculation).

### 5. Personalization Subsection

**Access:** tap "Personalization" row on the main settings screen.
**Header:** back arrow + "Personalization" (multilingual).

#### 5.1 — Home Screen Defaults

Subtitle: "Home screen" (multilingual).

**Default account:**

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Default account | Picker modal | Total | Total, My Wallet, [other accounts...] |

- Opens a scrollable modal with radio selection. Total is listed first, then all other accounts sorted alphabetically.
- This determines which account is selected when the app starts.
- When "Total" is selected, the HomeScreen shows aggregated data from all accounts.
- **Acceptance:** changing this setting and restarting the app shows the selected account as active on HomeScreen.

**Default period:**

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Default period | Selector (radio) | Month | Day, Week, Month, Year |

- This determines which period tab is active when the app starts.
- "Period" (custom range) is NOT an option here.
- **Acceptance:** changing this setting and restarting the app shows the selected period tab as active on HomeScreen.

#### 5.2 — Add Transaction Defaults

Subtitle: "Add transaction" (multilingual).

**Default account:**

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Default account | Picker modal | Not selected | Not selected, My Wallet, [other accounts...] |

- Opens a scrollable modal with radio selection. Excludes Total, sorted alphabetically.
- **"Not selected" (default):** preserves current behavior — the account selected in AddTransactionScreen is the one that was active on HomeScreen. If the HomeScreen account is Total, the first non-Total account is selected instead.
- **Specific account selected (e.g., "My Wallet"):** always pre-selects that account in AddTransactionScreen, regardless of what's selected on HomeScreen.
- **Acceptance:** setting "My Wallet" here → go to HomeScreen with "Test" selected → tap "+" → AddTransactionScreen opens with "My Wallet" selected.

**Optional fields:**

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Labels | Checkbox | On | On/Off |
| Comments | Checkbox | On | On/Off |
| Photo | Checkbox | On | On/Off |

- When a checkbox is unchecked, the corresponding section is hidden in both AddTransactionScreen and ModifyTransactionScreen.
- When ALL checkboxes are unchecked, only the core fields remain: Type, Amount, Account, Category, Date.
- **Acceptance:** unchecking "Comments" → the CommentInput section disappears from AddTransactionScreen and ModifyTransactionScreen.

#### 5.3 — Privacy

Subtitle: "Privacy" (multilingual).

**Hide account balances:**

| Option | Type | Default | Values |
|--------|------|---------|--------|
| Hide account balances | Toggle | Off | On/Off |

- **Off (default):** account balances are visible across the app.
- **On:** account balances are masked with `•••••` across the app.

**Affected screens:**
- HomeScreen: total balance, income subtotal, and expenses subtotal below account name.
- AccountsScreen: each account balance in the list + total balance in header.
- AccountModal/AccountSelector: balances in the account list.

**NOT affected:**
- TransactionDetailsScreen: amount is shown (it's a specific transaction, not an account balance).
- AddTransactionScreen / ModifyTransactionScreen: no balance displayed.

**Hidden balance styling:**
- Masked balances display `•••••` in `textSecondary` (gray) color, with no `+`/`-` sign.
- This avoids leaking positive/negative hints about the balance value.

**Eye icon behavior:**

An eye icon appears next to every masked balance. The icon represents the current privacy mode state:

| Setting | Balances | Default icon | Icon meaning |
|---|---|---|---|
| Off | Visible | `eye-off-outline` | "Privacy off, tap to temporarily hide" |
| On | Hidden (`•••••`) | `eye-outline` | "Privacy on, tap to temporarily reveal" |

**Tap behavior (symmetric for both settings):**
- Tap the eye icon → toggles visibility of ALL balances on the current screen.
- Icon changes to the opposite state (eye ↔ eye-off).
- The reveal/hide is **temporary** — it resets to the setting default when navigating away and coming back.
- **No timer** — the visibility persists until the user navigates away or taps the eye again.

**Example flow (setting ON):**
1. Open HomeScreen → balances hidden, icon = `eye-outline`.
2. Tap eye → balances revealed, icon = `eye-off-outline`.
3. Navigate to AccountsScreen → balances hidden again (reset to setting).
4. Navigate back to HomeScreen → balances hidden again (reset to setting).

**Implementation:** each screen manages local `isRevealed` state via `useState`. State resets on screen focus via `useFocusEffect` (screens) or `useEffect` on `visible` change (modals). The `isBalanceHidden` derived value is `config.hideBalances !== isRevealed`.

### 6. Data Subsection

**Access:** tap "Data" row on the main settings screen.
**Header:** back arrow + "Data" (multilingual).

#### 6.1 — Delete all transactions

- Row with icon `trash-outline` (red), label "Delete all transactions" (multilingual), and chevron-right.
- Tapping opens a **confirmation modal**:

**Modal — "Delete all transactions?"**
- Title: "Delete all transactions?" (multilingual).
- Message: "All transaction history will be permanently deleted. Accounts, categories, and tags are kept." (multilingual).
- Buttons: "Cancel" (neutral) and "Delete" (red).
- When tapping "Cancel": modal closes.
- When tapping "Delete":
  1. All rows from `transactions` table are deleted.
  2. All rows from `transaction_tags` junction table are deleted (cleanup).
  3. AppContext state is refreshed via `resetAll()` so all screens reflect changes immediately.
  4. Modal closes.
  5. An alert dialog confirms: "All transactions deleted" (multilingual).

#### 6.2 — Delete all data

- Row with icon `warning-outline` (red), label "Delete all data" (multilingual), description "Deletes all accounts, categories, tags, and transactions. Your settings are kept." (multilingual), and chevron-right.
- Tapping opens a **first confirmation modal**:

**Modal 1 — "Delete all data?"**
- Title: "Delete all data?" (multilingual).
- Message: "All accounts, categories, tags, and transactions will be permanently deleted. Your settings (language, theme, currency, and defaults) are kept. This cannot be undone." (multilingual).
- Buttons: "Cancel" (neutral) and "Delete all" (red).
- When tapping "Cancel": modal closes.
- When tapping "Delete all": opens a **second confirmation modal**.

**Modal 2 — "Are you sure?"**
- Title: "Are you sure?" (multilingual).
- Message: "Type DELETE to confirm" (multilingual).
- Text input: placeholder "Type DELETE here" (multilingual). Only the word "DELETE" (case-insensitive) enables the confirm button.
- Buttons: "Cancel" (neutral) and "Confirm" (red, disabled until correct text is typed).
- When tapping "Cancel": both modals close.
- When tapping "Confirm":
  1. All data is cleared (transactions, transaction_tags, accounts, categories, tags).
  2. Default data is re-seeded: My Wallet, Total, 31 categories, 4 tags.
  3. The `config` table is **preserved**: language, theme, currency and all other settings are kept.
  4. `home_default_account_id` / `add_default_account_id` fall back to "null" **only** when the referenced account no longer exists after the wipe (e.g. a custom account). Defaults referencing surviving seed accounts (e.g. "My Wallet") are kept.
  5. AppContext state is fully refreshed via `resetAll()`, re-applying home defaults from config.
  6. Both modals close.
  7. All screens reflect the fresh seed state immediately.
  8. An alert dialog confirms: "All data deleted. App reset to factory state." (multilingual).

#### 6.3 — Reset to factory state

- Row with icon `refresh-outline` (red), label "Reset to factory state" (multilingual), description "Deletes everything and restores defaults: language, theme, currency, and settings." (multilingual), and chevron-right.
- Tapping opens a **first confirmation modal**:

**Modal 1 — "Reset to factory state?"**
- Title: "Reset to factory state?" (multilingual).
- Message: "This will reset the app to factory state. All accounts, categories, tags, transactions, and settings will be deleted and returned to their defaults. This cannot be undone." (multilingual).
- Buttons: "Cancel" (neutral) and "Reset" (red).
- When tapping "Cancel": modal closes.
- When tapping "Reset": opens a **second confirmation modal**.

**Modal 2 — "Are you sure?"**
- Title: "Are you sure?" (multilingual).
- Message: "Type DELETE to confirm" (multilingual).
- Text input: placeholder "Type DELETE here" (multilingual). Only the word "DELETE" (case-insensitive) enables the confirm button.
- Buttons: "Cancel" (neutral) and "Confirm" (red, disabled until correct text is typed).
- When tapping "Cancel": both modals close.
- When tapping "Confirm":
  1. All data is cleared (transactions, transaction_tags, accounts, categories, tags).
  2. The `config` table is cleared and re-seeded with default values: language English, dark theme, EUR, comma separator, Monday, and all default account/period settings.
  3. Default data is re-seeded: My Wallet, Total, 31 categories, 4 tags.
  4. AppContext state is fully refreshed via `resetAll()`, re-applying home defaults from config.
  5. Both modals close.
  6. All screens reflect the fresh seed state immediately.

---

## Non-Functional Requirements

- **Persistence**: all settings are saved in the SQLite `configuracion` table (native) or IndexedDB via sql.js (web).
- **Initialization**: on app startup, settings are read and applied before the first render (avoid incorrect theme flash).
- **Performance**: theme changes must be instantaneous; no animated transitions.
- **Multilingual**: all visible texts use `t()`.
- **Configuration**: use `useConfig().activeColors`.
- **Text**: use `useFontSize()` / `scaleFontSize()`.
- **Navigation**: main SettingsScreen + 4 detail screens (Appearance, Regional, Personalization, Data).
- **Icons**: `@expo/vector-icons` (Ionicons).

---

## Acceptance Criteria

### Main Screen
- [x] The Drawer shows "Settings" and tapping it navigates to the settings screen.
- [x] 4 subsection rows are displayed: Appearance, Regional, Personalization, Data.
- [x] Each row has an icon, label, and chevron-right.
- [x] Tapping a row navigates to the corresponding detail screen.

### Appearance
- [x] Theme selector: Dark/Light/System with immediate app-wide effect.
- [x] System theme respects the device OS preference.
- [x] Text size selector: Small/Medium/Large with immediate scaling.
- [x] Account icon shape selector: Square/Circle with immediate effect.
- [x] Category icon shape selector: Square/Circle with immediate effect.

### Regional
- [x] Language selector: English/Spanish/Catalan with immediate label changes.
- [x] Currency selector: €/$/£/¥ with immediate amount formatting changes.
- [x] Decimal separator: Comma/Period with immediate format changes.
- [x] First day of week: Monday/Sunday with immediate calendar adjustment.

### Personalization — Home Screen
- [x] Default account selector includes Total and all other accounts. Default is Total.
- [x] Changing default account and restarting the app shows the selected account on HomeScreen.
- [x] Deleting the account set as Home default resets to Total.
- [x] Default period selector: Day/Week/Month/Year. Default is Month.
- [x] Changing default period and restarting the app shows the selected period tab.

### Personalization — Add Transaction
- [x] Default account selector excludes Total. Default is "Not selected".
- [x] "Not selected" preserves current behavior (inherit from HomeScreen; if Total, fallback to first non-Total).
- [x] Selecting a specific account always pre-selects it in AddTransactionScreen.
- [x] Deleting the account set as Add Transaction default resets to "Not selected".
- [x] Optional fields: 3 checkboxes (Labels, Comments, Photo), all checked by default.
- [x] Unchecking a field hides the corresponding section in AddTransactionScreen and ModifyTransactionScreen.

### Personalization — Privacy
- [x] Hide account balances toggle (default: off).
- [x] When on, total balance, income subtotal, and expenses subtotal show `•••••` on HomeScreen.
- [x] When on, balances show `•••••` on AccountsScreen and AccountModal.
- [x] Hidden balances use gray (`textSecondary`) color with no `+`/`-` sign.
- [x] Eye icon appears next to masked balances.
- [x] Tapping eye temporarily reveals/hides ALL balances on screen.
- [x] Visibility resets to setting default when navigating away and coming back.
- [x] No timer — visibility persists until manual toggle or navigation.

### Data
- [x] "Delete all transactions" row opens a single confirmation modal.
- [x] Confirming deletes all transactions and transaction_tags, not accounts/categories/tags.
- [x] After deletion, all screens (HomeScreen, AccountsScreen, etc.) reflect updated data immediately via `resetAll()`.
- [x] Each destructive row shows a short description of what it deletes/keeps.
- [x] "Delete all data" row opens a double confirmation modal (second requires typing "DELETE").
- [x] Confirming "Delete all data" deletes all data, re-seeds seed data, and keeps settings (language, theme, currency, and other config).
- [x] After "Delete all data", default-account settings fall back to Total/"Not selected" only when the referenced account no longer exists; defaults referencing surviving accounts (e.g. "My Wallet") are kept.
- [x] "Reset to factory state" row opens a double confirmation modal (second requires typing "DELETE").
- [x] Confirming "Reset to factory state" deletes all data and re-seeds config to defaults (language English, dark theme, etc.).
- [x] After reset, all screens reflect fresh seed state immediately via `resetAll()`.
- [x] Settings persist across app restarts.
