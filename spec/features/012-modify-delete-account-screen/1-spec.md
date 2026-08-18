# 012 — Edit/Delete Account Page

- **Goal**
  A screen accessible from the accounts screen (011) that allows the user to edit an existing account (name, icon, color, note), as well as delete it with cascade deletion of its transactions. All texts are multilingual (es/en/ca).

---

## Functional Requirements

### 1. Access and Navigation

- The screen is accessed from `AccountsScreen` (011) by tapping an account.
- The screen has a back button (left arrow) in the header to return to `AccountsScreen`.
- The header title is "Modify account" (multilingual).

### 2. Account Name

- Title: "Account name" (multilingual).
- Text input with the current account name.
- Maximum 30 characters with a "0/30" counter.
- **Total account (id=2, `is_total=1`)**: the name field is **read-only** (disabled). Shows the i18n "Total" in the active language. Validation and duplicate checks are skipped.
- **Validation**: empty name is not allowed. If empty, a red error text is shown and the "Save" button remains disabled.
- **Duplicate validation**: when editing the name, it checks that no other account already exists with the same name (case-insensitive), **excluding the current account**. Keeping the same name should not trigger an error; only if the new name matches a different account.
  - "Account", "account" and "ACCOUNT" are considered duplicates.
  - **Reserved default name**: the default account name is checked via a language-aware guard. The entered name is mapped to a default account ID using the current language (`getDefaultAccountIdByName`). If a match is found, the English name for that default is checked against the DB (`existsByName`, excluding the current account). If the default account still exists in the DB, the name is blocked. If the default was deleted, the name is allowed. This applies even when editing the default account (id 1) itself.
  - If there is a duplicate, a red error text is shown below the input: "An account with this name already exists" (multilingual) and the "Save" button remains disabled.
  - The check is executed with a 300ms debounce to avoid querying on every keystroke.

### 3. Symbols (Icons)

- Title: "Symbols" (multilingual).
- Grid of 4 columns × dynamic rows (vertical ScrollView if they don't all fit).
- List of predefined Ionicons icons for accounts (~20 finance/bank/wallet related icons).
- The current account icon must appear preselected when opening the screen.
- When tapping an icon, it is highlighted with a primary color border and the background changes slightly.
- Only one icon can be selected at a time.
- Icon selection **is not required** to save.
- When selecting an icon, the icon background color changes to the color selected in the color section to show the user how the icon will look.
- Predefined icons (~20):

| # | Icon (Ionicons) | # | Icon (Ionicons) |
|---|---|---|---|
| 1 | `wallet-outline` | 11 | `trending-up-outline` |
| 2 | `cash-outline` | 12 | `trending-down-outline` |
| 3 | `card-outline` | 13 | `pie-chart-outline` |
| 4 | `business-outline` | 14 | `bar-chart-outline` |
| 5 | `bank-outline` | 15 | `analytics-outline` |
| 6 | `savings-outline` | 16 | `stats-chart-outline` |
| 7 | `account-balance-outline` | 17 | `briefcase-outline` |
| 8 | `credit-card-outline` | 18 | `cash-outline` |
| 9 | `money-outline` | 19 | `pricetag-outline` |
| 10 | `receipt-outline` | 20 | `ellipsis-horizontal-outline` |

### 4. Color

- Title: "Color" (multilingual).
- Grid of 1 row × 8 columns (same structure as in 009).
- The first 6 positions are predefined circular colors.
- The 7th position shows the custom color chosen from the picker (if the current account color is not among the 6 predefined) **or** the current account color if it is a custom color.
- The 8th position is a "+" with gray color that opens the dynamic color picker modal (`ColorPickerModal` existing).
- The current account color must appear preselected when opening the screen. If the color matches one of the 6 predefined, that circle is marked as selected.
- When tapping a color, it is highlighted with a darker ring/border and a checkmark overlay.
- Only one color can be selected at a time.
- Color selection **is not required** to save.
- Predefined colors (same 6 as in the rest of the app):

| # | Color | Hex |
|---|---|---|
| 1 | Cyan (primary) | `#22D3EE` |
| 2 | Red | `#F87171` |
| 3 | Green | `#34D399` |
| 4 | Yellow | `#FBBF24` |
| 5 | Pink | `#F472B6` |
| 6 | Blue | `#60A5FA` |

#### Color Modal (reanimated-color-picker)

- Opens when tapping "+" in the color grid.
- Uses the `reanimated-color-picker` library with:
  - Panel1 (saturation/brightness selector)
  - HueSlider (hue selector)
  - OpacitySlider (opacity selector)
  - Preview (shows the selected color in hex format)
- OK/Cancel buttons to confirm or cancel the selection.
- When tapping OK, the color is selected in the main grid and the custom circle (7th position) is updated.

### 5. Note (Description)

- Title: "Note" (multilingual).
- Multiline text input for an optional account description.
- Maximum 200 characters with a "0/200" counter.
- Default value: empty or the current `description` value if the account has one.

#### Default Descriptions (multilingual)

- Default accounts (My Wallet id=1, Total id=2) have a stored English description in the seed data.
- `ACCOUNT_DESCRIPTION_I18N_KEYS` maps account ids to i18n keys (`account_my_wallet_description`, `account_total_description`).
- When the stored description matches the English default, `getDisplayAccountDescription(account)` returns the i18n translation instead.
- Users can edit the description freely. Once edited (no longer matches English default), the literal user text is shown.
- Non-default accounts always show their stored description as-is (or empty).

### 6. "Delete" Button

- **Total account (id=2, `is_total=1`)**: the "Delete" button is **hidden entirely**. The Total account cannot be deleted.
- "Delete" button (multilingual) with red style (`c.red`), located before the "Save" button.
- **Last account protection**: when the account being edited is the only account in the database (account count ≤ 1), the "Delete" button is **disabled**:
  - The button border and icon/text use the secondary text color (`c.textSecondary`) and the button has reduced opacity (`0.5`).
  - The button is not tappable (`disabled` + `accessibilityState.disabled`).
  - A helper hint is shown below the button: "You need at least one account, so this one cannot be deleted" (multilingual, `modify_account_delete_last`).
- When tapped (and not the last account), a confirmation modal opens:

**Confirmation Modal — "Delete account?"**
- Title: "Delete account "{accountName}"" (multilingual, interpolates the account name).
- Message: "All transactions linked to this account will also be deleted" (multilingual).
- Buttons: "Cancel" (multilingual) and "Delete" (multilingual, red color).
- When tapping "Cancel", the modal closes.
- When tapping "Delete":
  1. All transactions associated with the account are deleted via `transactionRepository.deleteByAccountId(id)`.
  2. The account is deleted from the `accounts` table via `accountRepository.delete(id)`.
  3. The account list is refreshed (`refreshAccounts()` from `AppContext`).
  4. Navigation returns to `AccountsScreen`.

### 7. "Save" Button

- "Save" button (multilingual) at the bottom.
- Disabled if ANY of these conditions is met:
  - The name is empty.
  - The name already exists (case-insensitive duplicate excluding the current account).
- Dynamic red helper text based on what is missing (only the first unmet requirement is shown, in priority order):
  1. "Enter an account name" (if name is empty)
  2. "An account with this name already exists" (if name is duplicate)
- When tapped:
  1. The account is updated in the database with the form values (name, icon, color, description).
  2. Navigation returns to `AccountsScreen`.

---

## Non-Functional Requirements

- **Multilingual**: all visible texts must use `t()`.
- **Configuration**: use `useConfig().activeColors`.
- **Text**: use `useFontSize()`.
- **Navigation**: added to `HomeStack` in `AppNavigator.tsx`.
- **Persistence**: `accountRepository.update()` and `accountRepository.delete()` (SQLite / localStorage).
- **Cascade deletion**: when deleting an account, all its transactions are deleted first (`transactionRepository.deleteByAccountId`) and then the account itself. Refresh the account list after deletion.
- **Icons**: `@expo/vector-icons` (Ionicons).
- **DB**: add `description TEXT` column to the `accounts` table via migration.
- **Duplicate validation**: use `existsByName(name: string, excludeId?: number)` function from `accountRepo` and `webAccountRepo` (created in 013). The `excludeId` parameter excludes the current account from the check.

---

## Acceptance Criteria

- [x] The header shows a back arrow and title "Modify account" in the active language.
- [x] "Account name" is shown with an editable input, counter 0/30.
- [x] If the name is empty, a red error is shown and "Save" is disabled.
- [x] Duplicate validation excludes the current account (keeping the same name does not cause an error).
- [x] Renaming to a reserved default name is blocked with the duplicate error only when the corresponding default account still exists in the DB (language-aware check via `getDefaultAccountIdByName`), including for the default account (id 1) itself. Deleted default names can be reused.
- [x] If there is a duplicate, "An account with this name already exists" is shown in red and "Save" is disabled.
- [x] ~20 icons are shown in a 4-column grid with the current icon preselected.
- [x] When selecting an icon, the icon background color changes to the selected color.
- [x] 6 predefined colors + custom circle (if current color is not predefined) + "+" in the 8th position are shown.
- [x] If the current color matches one of the 6 predefined, that circle appears selected.
- [x] The "+" opens `ColorPickerModal` (reanimated-color-picker).
- [x] "Note" is shown with a multiline input, maximum 200 characters, counter 0/200.
- [x] The "Save" button is disabled if the name is empty or is a duplicate.
- [x] When tapping "Save", the account is updated and navigation returns.
- [x] The red "Delete" button opens a confirmation modal with "Cancel" and "Delete".
- [x] When tapping "Delete" in the modal, the account transactions are deleted, the account is deleted, the list is refreshed, and navigation returns.
- [x] When the account is the last one remaining, the "Delete" button is disabled (secondary color, reduced opacity, not tappable) and a hint explaining it cannot be deleted is shown.
- [x] When the account is the Total account (id=2, `is_total=1`), the name field is read-only, the "Delete" button is hidden, and save updates only icon/color/note.
- [x] All texts change when switching language.
- [x] The screen respects the active theme and text size.
