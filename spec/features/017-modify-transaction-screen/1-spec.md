# 017 — Modify Transaction Page

- **Goal**
`ModifyTransactionScreen` accessible from the "Edit" button of `TransactionDetailsScreen`. Allows modifying data of an existing transaction: type (expense/income), amount, account, category, day, tags, comment, and photo. All texts are multilingual (es/en/ca). The screen is preloaded with the current data of the transaction.

---

## Functional requirements

### 1. Access and navigation

- The "Edit" button of `TransactionDetailsScreen` navigates to `ModifyTransaction` passing `transactionId` as a parameter.
- The screen has a back button (left arrow) in the header to return to `TransactionDetailsScreen`.
- The header title is "Modify transaction" — i18n key `modify_title` (multilingual).

### 2. Type selector (tabs)

- Two reusable tabs: "Expenses" / "Income" (multilingual) — existing `TypeTabs` component.
- The selected tab by default matches the type of the transaction being edited.
- When switching tabs, the type is updated, the selected category is reset, and the category grid is reloaded for that type.
- The type is displayed as informational (the transaction stores the original type), but **changing the type is allowed** and will be updated when saving.

### 3. Amount field

- Numeric input with number keyboard.
- Displays the **current amount** of the transaction formatted when the screen loads.
- When focusing the input, it clears to allow direct typing.
- The formatted value with thousand separators is only shown when there is an entered value.
- Validation: max 9 integer digits and 2 decimals (max 999,999,999.99).
- Same logic as `parseAmountInput()` and `formatAmountDisplay()` in `AddTransactionScreen`.
- If the user enters invalid format (both separators at once), the input is ignored.
- To the right of the input, the currency symbol selected in settings is displayed (€, $, £, ¥).
- To the right of the currency symbol, a calculator icon (`calculator-outline`) that opens `CalculatorModal` (reuse existing component).

### 4. Account selection

- Title: "Account" (multilingual) — i18n key `add_account` (existing).
- Below it, the name of the current transaction's account is displayed.
- Tapping the account name opens `AccountModal` (existing component) to select another account.
- The account list is loaded from `accountsWithBalance`.

### 5. Category selection

- Title: "Categories" (multilingual) — i18n key `add_categories` (existing).
- 4-column × 2-row grid (8 positions) — existing `CategoryGrid` component.
- **The first grid position shows the transaction's current category** (icon + name), regardless of its priority. The remaining positions are filled with the next most-used categories or alphabetically, excluding the one already displayed.
- The eighth position always shows the "+" button with text "More" (multilingual) — i18n key `add_more` (existing).
- Tapping "More":
  - If the active type has **more than 7 categories**: navigates to `AddCategoryScreen` to select from existing ones.
  - If the active type has **7 or fewer categories**: navigates directly to `CreateCategoryScreen` to create a new one.
- Tapping a category selects it and marks it visually.

### 6. Day selection

- Title: "Day" (multilingual) — i18n key `add_day` (existing).
- 3-column × 1-row grid — existing `DaySelector` component.
- The selected day by default is the **transaction's day** being edited.

| Pos. | Content | Text below |
|------|---------|------------|
| 1 | Today's date (dd MMM) | "Today" |
| 2 | Yesterday's date (dd MMM) | "Yesterday" |
| 3 | Dynamic date (dd MMM [yyyy]) | "Day before yesterday" or "Selected" |

- If the transaction day is today → position 1 selected.
- If the transaction day is yesterday → position 2 selected.
- If the transaction day is any other → position 3 shows that date and is selected.
- To the right of the grid, a calendar icon that opens `CalendarModal` to select any date.

### 7. Tags

- Title: "Tags" (multilingual) — i18n key `add_tags` (existing).
- **The tags currently associated with the transaction appear pre-selected** when the screen loads.
- NOTE: Tags are not currently persisted in the database. The section is included for visual consistency with `AddTransactionScreen`, but the selected tags state does not affect saving. This will be marked as TODO in the spec.
- Search button that shows/hides an input with placeholder "Search and create tags".
- "+ Add tag" button that opens a modal to create a new tag (same behavior as 004).

### 8. Comment

- Title: "Comment" (multilingual) — i18n key `add_comment` (existing).
- Multiline text input that is **preloaded with the current comment** of the transaction (`transaction.description`).
- Placeholder: "Comment" (multilingual).
- Dynamic counter "0/4096" that updates as you type (max 4096 characters).
- Autocomplete: debounced search of existing comments (same logic as `AddTransactionScreen`).

### 9. Photo

- Title: "Photo" (multilingual) — i18n key `add_photo` (existing).
- Large "+" icon in a square that, when tapped, opens a modal.
- **"Add photo" modal:**
  - Title: "Add photo" (multilingual).
  - Option 1: "Take photo" (multilingual).
  - Option 2: "Add from gallery" (multilingual).
- When editing a transaction that has an existing photo, the thumbnail is preloaded from `transaction.photo`.
- The user can replace it (camera or gallery) or remove it (× button).
- If the user replaces the photo, the old file is deleted from `documentDirectory`.
- **Web**: the entire PhotoSection is hidden on web (platform guard `Platform.OS !== 'web'`).
- **Implementation**: see spec `023-photo-attachment` for full functional requirements.

### 10. Save button

- "Save" button (multilingual) — i18n key `modify_save` (new).
- **Validation to enable the button:**
  - A category must be selected (`categoryId !== null`).
  - The amount must be a valid number greater than 0 (`numericAmount > 0`).
  - A day must be selected.
  - An account must be selected.
- If the button is disabled, a dynamic help text is shown in red (reuse existing hint from 004).
- Tapping "Save":
  1. Collects all form data.
  2. Calls `transactionRepository.update(transactionId, data)` with the modified fields.
  3. Calls `refresh()` from AppContext to reload transactions.
  4. Calls `changeType(data.type)` from AppContext to sync the active type tab in HomeScreen/AllTransactionsScreen.
  5. Navigates back to the previous screen (`navigation.goBack()`).

---

## Non-functional requirements

- **Multilingual**: all visible texts must use `t()` from the existing i18n system. No hardcoded strings allowed.
- **Persistence**: the modification is saved in the `transactions` table of SQLite (native) or localStorage (web) via `transactionRepository.update()`.
- **Configuration**: currency, decimal separator, and language are read from the existing `ConfigContext`.
- **Theme**: the screen must use `useConfig().activeColors` for colors (not hardcoded).
- **Text**: the screen must use `useFontSize()` for text scaling.
- **Navigation**: the screen is already registered in the Stack navigator with `transactionId` as a parameter.
- **Auto-refresh**: when returning to the list after saving, `useFocusEffect` + `refreshTrigger` reloads data automatically.

---

## Acceptance criteria

- [x] The "Edit" button of TransactionDetailsScreen navigates to ModifyTransaction with the `transactionId`.
- [x] The header shows a back arrow and the title "Modify transaction" in the active language.
- [x] The "Expenses"/"Income" tabs show the current transaction type as selected.
- [x] When changing type, the selected category is reset and the grid is reloaded.
- [x] The amount input is preloaded with the current value of the transaction.
- [x] The amount input validates max 9 integers and 2 decimals.
- [x] The calculator icon opens the CalculatorModal and pastes the result on confirm.
- [x] The displayed account is the current transaction's account.
- [x] The account modal allows changing the selected account.
- [x] The category grid shows the current category in the first position.
- [x] 7 categories + "More" button are shown in the grid.
- [x] The "More" button navigates to Add/Create category based on the number of categories.
- [x] The day selector is preloaded with the current transaction's day.
- [x] The 3 days show the correct dates and the initial selection matches.
- [x] The calendar button opens the day selection modal.
- [x] The tags section exists but pre-selected tags do not affect saving (TODO).
- [x] The comment field is preloaded with the current transaction's comment.
- [x] The comment field allows up to 4096 characters with a counter.
- [x] The comment autocomplete works the same as in AddTransaction.
- [x] The photo section preloads existing photo and allows replacement/removal (full implementation in 023).
- [x] The "Save" button is disabled if category, valid amount, day, or account is missing.
- [x] The help text is shown when the button is disabled.
- [x] Tapping "Save" updates the transaction, syncs the active type tab via `changeType(data.type)`, and returns to the previous screen.
- [x] Data refreshes when returning to the list (useFocusEffect).
- [x] All texts change when changing the language in settings.
- [x] The screen respects the active theme (dark/light).
- [x] The screen respects the configured text size.