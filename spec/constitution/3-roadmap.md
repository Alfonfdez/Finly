# Roadmap

Mobile app (React Native / Expo) with multiple screens.

## 001-home-screen
Status: completed.

Home screen with:
a) Header with:
  - Hamburger menu (Drawer Navigator) on the left with: Home, Settings, Transactions, and placeholder for Accounts/Categories (coming soon).
  - In the center, an "Account" selector that opens a modal with the account list.
  - Below the account, the "Total" (difference between expenses and income).
  - On the right, a button to open the "Transactions" screen.

b) Bottom section:
  - "Expenses" / "Income" tabs.
  - Period tabs: "Day", "Week", "Month", "Year", "Period".
  - Each period shows a native date picker (DateTimePicker).
    - Day: day picker (no future dates).
    - Week: week picker.
    - Month: month picker.
    - Year: year picker.
    - Period: date range picker.
      - "All" checkbox = whole current year so far (Jan 1 of current year to today).
      - When "All" is checked, the range text explains the resolved period, e.g. `All (from 1 Jan to 2 Sep 2026)` (localized).

c) Chart section:
  - Donut chart (SVG) with expenses/income by category; the period total is centered inside the hole (auto-fit).
  - Can switch to horizontal bar chart by tapping on it; the bar chart shows the same period total centered above the bar, with or without transactions. The selected chart type is saved (`homeChartType`, donut by default).

d) Floating "+" button (FAB) that navigates to the "Add Expense/Income" screen.

e) Category breakdown list (icon, name, percentage, total).

f) Transactions are stored in SQLite on both platforms and loaded on app startup.

Spec: spec/features/001-home-screen/.

## 002-db-design
Status: completed.

Local database design with 7 tables:
- `users`: user with name, email, avatar, currency.
- `accounts`: accounts with initial balance, icon, color, description.
- `categories`: categories with name, icon, color, type (expense/income).
- `transactions`: transactions with account, category, type, amount, description, date, updated_at.
- `tags`: global tags (name).
- `transaction_tags`: many-to-many junction between transactions and tags.
- `config`: key-value configuration table.

Schema created in a single pass (`createSchema` → `seedData` → `seedConfig`) with indexes on frequently queried columns and foreign keys with ON DELETE CASCADE. One SQLite engine on all platforms (expo-sqlite native, sql.js + IndexedDB web). Versioned migrations were introduced later in infrastructure 003-web-sqlite-engine.

Spec: spec/features/002-db-design/.

## 003-settings-screen
Status: completed.

Restructured Settings screen with 4 subsections:
- Appearance: Theme, Text size, Account icon shape, Category icon shape.
- Regional: Language, Currency, Decimal separator, First day of week.
- Personalization: Home screen defaults (account, period), Add/Modify transaction defaults (Add: account + optional fields; Modify: optional fields), New/Edit recurring rule defaults (New: account + optional fields; Edit: optional fields), Privacy (hide account balances with eye icon).
- Data: Delete all transactions, Delete all data (settings kept), Reset to factory state (all double-confirmation flows).

Persistent config in SQLite on both platforms. 15 config fields.
- Fix (2026-10-13): the Data rows' wording now covers recurring rules — "Delete all transactions" states accounts/categories/tags/recurring rules are kept (already the behaviour), while "Delete all data" and "Reset to factory state" state recurring rules are deleted (already implemented via `clearDataKeepSettings`/`resetDatabase`). "Delete all transactions" now also requires the typed DELETE confirmation, matching the other two rows; the spec's non-existent "All data deleted" success alert was removed.
- Update (2026-10-14): a **Recurring screen** section added its own default account (`recurringDefaultAccountId`, independent of the Add-transaction default) plus Labels/Comments optional fields (`recurringShowLabels`/`recurringShowComments`, no Photo — a rule has none); the rule form (create/edit) honoured those flags, and the account resolution shared by the add and recurring forms moved to `utils/defaultAccount.ts`.
- Update (2026-10-14): the Personalization section titles reuse the screens' own titles, and the optional fields are now **per screen** — Add, Modify, New rule and Edit rule each have their own flags (`addShow*`, `modifyShow*`, `createRecurringShow*`, `editRecurringShow*`; the create-rule keys were renamed from `recurring*` for symmetry). The mapping lives in `utils/formFieldVisibility.ts` (`FormMode` derived from `transactionId` / `initialRuleNextDue`); Modify and Edit rule have no Default account (they keep the record's own).
- Fix (2026-10-15): the settings screens were the only screens not wrapped in `ScreenShell`, so with Android edge-to-edge their last section (e.g. Personalization → Privacy) sat under the navigation bar. All five (Settings, Appearance, Regional, Personalization, Data) now render inside `ScreenShell`, applying the bottom safe-area inset.

Spec: spec/features/003-settings-screen/.

## 004-add-transaction-screen
Status: completed.

Screen for adding expense/income with:
- Expense/Income tabs.
- Amount input with validation and currency symbol.
- Account selector.
- Category grid (7 items + "More" button).
- Day selector with 3 modes (Today / Yesterday / Dynamic) + calendar.
- Tags section with search and creation.
- Comment input with character counter (4096 max) and autocomplete.
- Photo section (camera/gallery) — UI ready, functionality pending.
- "Add" button with validation and help text.
- Fix (2026-10-14): the shared transaction form (Add/Modify transaction, New/Edit recurring rule) now scrolls its submit button above the keyboard when the **Comment** field is focused — re-run on `onLayout`/`keyboardDidShow` so it lands after the resize has settled — with the scroll content's bottom padding raised to 112 px for a clear gap. Focusing any other field (recurring Name, Amount, Account, Category) does not scroll.

Spec: spec/features/004-add-transaction-screen/.

## 005-add-category-screen
Status: completed.

Screen for selecting an existing category:
- 4×N grid of categories filtered by type (expense/income).
- Search bar with substring filtering (case-insensitive).
- Empty state when no results.
- "Create" button at the end of the grid (navigates to 006; hidden with a message at the 30-per-type cap).
- Category selection and navigation back to Add Transaction.

Spec: spec/features/005-add-category-screen/.

## 006-create-category-screen
Status: completed.

Screen for creating custom categories:
- Icon selection from a grid of available icons.
- Color selection with 6 predefined colors + dynamic picker (reanimated-color-picker).
- Name field with validation (not empty, not duplicate).
- Category type (expense/income) inherited from the previous screen.
- Maximum of 30 categories per type (Add button disabled + inline message when reached; "Create" tile on the Categories page and Add Category screen hidden at the cap).
- "Create" button that saves to the database and navigates back.

Spec: spec/features/006-create-category-screen/.

## 007-calculator
Status: completed.

Basic calculator modal for the add transaction screen:
- Numeric keypad with basic operations (+, -, *, /).
- "=" button to evaluate the expression and show the result.
- "Accept" and "Cancel" buttons.
- On accept, pastes the result into the amount field.
- Reusable component that can be used on other screens.

Spec: spec/features/007-calculator/.

## 008-categories-screen
Status: completed.

Screen accessible from the Drawer that shows all existing categories organized by type (expense/income) in a 4×N grid:
- Expense/Income tabs to filter by type.
- 4×N grid with icon + color + name per category.
- "Create" button in the last grid position (navigates to 006).
- Header search that filters the active type's categories by the current-language display name.
- Tapping a category navigates to modify category (009).

Spec: spec/features/008-categories-screen/.

## 009-modify-delete-category-screen
Status: completed.

Screen for modifying or deleting an existing category:
- Current icon with color + editable name input (duplicate validation excluding the current one).
- Icon grid with the current one preselected.
- Color grid with the current one preselected + dynamic picker.
- "Delete" button with double modal: confirmation + destination category selection to reassign transactions.
- "Save" button that persists the changes.

Spec: spec/features/009-modify-delete-category-screen/.

## 010-app-logo
Status: completed.

Replace generic Expo icons with the custom Finly logo:
- 6 PNG files in `assets/` for app icon, Android adaptive icon, favicon, and splash screen.
- Configuration in `app.json` with `expo.splash` section (native) and asset references.
- Logo visible in the Drawer header next to the "Finly" text.

Spec: spec/features/010-app-logo/.

## 011-accounts-screen
Status: completed.

Screen accessible from the Drawer that shows all accounts with their balance:
- Header with hamburger menu + "Accounts" title (multilingual).
- "Total:" section with total balance across all accounts (green/red).
- Account list with icon + name + balance.
- Header search toggle + SearchBar: client-side case-insensitive multi-term (AND) search over account display name (current language) and description; Total row always visible; "No results found" empty state.
- Floating "+" button (FAB) that navigates to create account (013).
- Tapping an account navigates to modify account (012).
- Fix (2026-10-14): the FlatList is now unmounted when empty (plain `View` + `EmptyState`), so an emptied list never keeps the old scroll extent — see the "Empty lists" convention in `6-screens.md`.

Spec: spec/features/011-accounts-screen/.

## 012-modify-delete-account-screen
Status: completed.

Screen for modifying or deleting an existing account:
- Editable name with 0/30 counter and empty + duplicate validation.
- Icon grid (~20 financial icons) with the current one preselected.
- Color grid with the current one preselected + dynamic picker.
- "Note" multiline field with 200 character limit.
- "Delete" button with cascading transaction deletion.
- "Save" button that persists the changes.

Spec: spec/features/012-modify-delete-account-screen/.

## 013-create-account-screen
Status: completed.

Screen for creating a new account:
- Name with validation (not empty, not duplicate) and 0/30 counter.
- Icon grid (~20 financial icons) with gray background that changes to the selected color.
- Color grid with 6 predefined colors + dynamic picker.
- Optional "Note" multiline field with 200 character limit.
- "Create" button with validation (name + icon + color).
- On creation, `initial_balance` is set to 0.
- Fix (2026-10-14): tapping the **Note** field no longer hides it (and the Create button) behind the keyboard — `AccountForm`'s `FormScrollView` is now `KeyboardAvoidingView`-wrapped and reveals the bottom button on the Note focus (shared `useKeyboardReveal`); the same applies to Modify account.

Spec: spec/features/013-create-account-screen/.

## 014-transactions-screen-from-home
Status: completed.

Filtered transaction list screen by category, account, and period, accessible from the home screen (HomeScreen) by tapping a category in the breakdown:
- Stack navigator header with "Transactions" title (multilingual).
- Category section: icon + name + total with color (green/red) and prefix (+/-).
- Account selector with selection modal (radio + icon + name + balance).
- Sorting by date or amount with ASC/DESC toggle.
- Recurring view chip (All / One-time / Recurring) in the controls row, filtering recurring-generated vs one-time transactions; the screen total reflects the view and the row scrolls horizontally when needed.
- List grouped by day with date header.
- Centered "+" FAB to navigate to add transaction.
- Passes categoryId, type, period, startDate, endDate as navigation parameters.
- Layout: SafeAreaView > View.container(flex:1) > [categoryInfo, controls, SectionList, FAB].

Spec: spec/features/014-transactions-screen-from-home/.

## 015-all-transactions-screen
Status: completed.

Independent `AllTransactionsScreen` accessible from the hamburger menu (drawer) — "Transactions" — with advanced filtering:
- **Type tabs** (All | Expenses | Income) — default "All", filters by transaction type.
- **Category filter** — multi-select category modal (021) with search, "All" chip, type-aware sections.
- **Period selector** — PeriodTabs + CalendarPicker, shared with HomeScreen via AppContext. Default from `config.homeDefaultPeriod` (Month by default). Custom range: Jan 1 → today.
- Account selector with period total balance (green/red), updated by all active filters.
- Sorting by date or amount with ASC/DESC toggle.
- Recurring view chip (All / One-time / Recurring) in the controls row, filtering recurring-generated vs one-time transactions; the screen total reflects the view and the row scrolls horizontally when needed.
- Tag filter bar with local state.
- Header search toggle + SearchBar: client-side case-insensitive multi-term (AND) search over comment/description, category display name (current language), tag names and account name; composes with all other filters; "No results found" empty state.
- List grouped by day with date header.
- Centered "+" FAB to navigate to add transaction.
- All filters combine (AND logic).
- Category selection resets on type tab switch.
- Type-aware button labels ("All categories" / "All expense categories" / "All income categories").
- Apply button disabled when 0 categories selected.

Spec: spec/features/015-all-transactions-screen/.

## 016-transaction-details-screen
Status: completed.

Transaction details screen for an individual transaction, accessible by tapping any transaction in the lists (TransactionsScreen, AllTransactionsScreen):
- Header with "Transaction details" title and back button.
- Data card rows — each with a muted type symbol to the left of the label (icons reused from the drawer/pickers): Amount (type color), Account (icon + name), Category (icon + name), Date (multilingual long format), Comment, Tags and Recurring. The rows are always present so the card is uniform; empty Comment/Tags/Recurring show the shared `—` placeholder (`details_none`), and the Recurring row is read-only (rule name, or `—`; no toggle).
- "Delete" button with confirmation modal ("No" / "Yes") that deletes and refreshes the list.
- "Edit" button that navigates to ModifyTransaction (017) to edit the transaction.
- Footer "Created HH:mm dd MMM yyyy" with 24h format and year always visible.
- Automatic list refresh on return (useFocusEffect + refreshTrigger).

Spec: spec/features/016-transaction-details-screen/.

## 017-modify-transaction-screen
Status: completed.

Screen for modifying an existing transaction, accessible from the "Edit" button on TransactionDetailsScreen:
- Expense/Income tabs preloaded with the current type.
- Amount input preloaded with the current value, with validation and calculator.
- Account selector preloaded.
- Category grid with the current category in the first position + "More" button.
- Day selector preloaded with the transaction date.
- Tags section (TODO persistence).
- Comment input preloaded with the current text and autocomplete.
- Photo section (UI only, TODO).
- "Save" button with validation that updates the transaction.
- Automatic list refresh on return.

Spec: spec/features/017-modify-transaction-screen/.

## 018-tag-management
Status: completed.

Tag management with database persistence:
- `tags` table and `transaction_tags` junction table (migration 004).
- Tag repository CRUD (SQLite on both platforms).
- Tags screen accessible from the Drawer with tag list, header search toggle and FAB.
- Create tag screen with name validation (empty, duplicate, max 20 chars).
- Maximum of 100 tags (Create button disabled + inline message when reached; "+" FAB on Tags screen and "+ Add tag" chip in the transaction form hidden at the cap).
- Modify/delete tag screen with name edit and delete confirmation.
- Update (2026-10-14): each tag row shows "Used in N transactions" (`tags_used_in`) and "Created <date>" (`tags_created_on`), and the list gained a `SortToggle` strip (name / created / usage, session-only) via the shared `SortRow`.
- Fix (2026-10-14): emptying the list (Select all → Delete from an overflowing list) left the old scroll extent, so the empty state stayed scrollable and off-centre. The list is now **unmounted** when empty and a plain `View` + `EmptyState` is rendered (see the "Empty lists" convention in `6-screens.md`).

Spec: spec/features/018-tag-management/.

## 019-tag-transactions
Status: completed.

Persistent tags in Add/ModifyTransaction screens:
- Replace hardcoded tag UI with tags from the database.
- TagSection loads tags from AppContext, supports inline creation.
- Selected tags saved to `transaction_tags` junction table.
- ModifyTransaction pre-loads existing tags for the transaction.
- createWithTags, updateWithTags, getTagsByTransactionId repository methods.

Spec: spec/features/019-tag-transactions/.

## 020-tag-home-filter
Status: completed.

Tag filter on HomeScreen, TransactionsScreen, and AllTransactionsScreen:
- Horizontal tag filter bar below PeriodTabs (All + tag chips; on web a visible horizontal scrollbar makes every chip reachable when the bar overflows).
- Per-category expandable tag breakdown (3 visible + "View all (N)").
- Tag filtering updates chart and category totals.
- Tag breakdown queries (breakdownByCategoryAndTag).
- Works across all periods and both expense/income types.
- TransactionsScreen: tag filter bar with inherited tags from HomeScreen.
- AllTransactionsScreen: tag filter bar with local state and dynamic balance.

Spec: spec/features/020-tag-home-filter/.

## 021-category-filter-modal
Status: completed.

Full-screen modal component for multi-select category filtering on the AllTransactionsScreen:
- SearchBar with substring filtering.
- "All" chip — toggles all visible-type categories on/off. Active when all of current type are selected.
- 4×N category grid with icon + color + name, multi-select with checkmarks.
- Type-aware sections: when type='all', grouped under "Expenses"/"Income" headers.
- Apply button with count ("Apply (N)" / "Apply (All expenses)" / "Apply (All income)").
- Apply button disabled when 0 categories selected (grayed out).
- Internal state synced on modal open; search reset on open.
- Uses React Native `<Modal>` wrapper for proper overlay presentation.

Spec: spec/features/021-category-filter-modal/.

## 022-total-account
Status: completed.

Special "Total" account that aggregates data from all existing accounts:
- Real DB account with `is_total = 1` flag, seeded as id=2.
- HomeScreen: Total is selectable in the account selector. Shows combined transactions from all accounts.
- AccountsScreen: Total appears as the first card in the account list.
- ModifyAccountScreen: Total has read-only name, editable icon/color/note, no delete.
- Balance: dynamically computed as sum of all non-total accounts.
- TransactionsScreen / AllTransactionsScreen: Total is selectable in the account selector. When selected, shows all transactions across accounts.
- AddTransactionScreen / ModifyTransactionScreen: Total is hidden from the account selector.
- Name: not editable (fixed concept), multilingual via `account_total` i18n key.
- `transactionRepo.totalByPeriod()`: supports `null` accountId for "all accounts" mode.

Spec: spec/features/022-total-account/.

## 023-photo-attachment
Status: completed.

Photo attachment for transactions (camera + gallery) on iOS and Android:
- PhotoSection component with camera and gallery options (expo-image-picker).
- Photo file persistence via expo-file-system (cache → documentDirectory).
- Photo display in TransactionDetailsScreen with full-screen viewer.
- Photo preloading and replacement in ModifyTransactionScreen.
- File cleanup on transaction delete, photo replace, and photo remove.
- Hidden on web (native camera + file system; not checkable on web).
- "Show photo" checkbox hidden in Settings on web.
- Photo column added directly to 001_initial.ts (no migration — app not in production).
- Fix (2026-10-15): file cleanup (delete / replace / remove) is **native-only** — on web there are no files to delete (see 024).

Spec: spec/features/023-photo-attachment/.

## 024-photo-on-web
Status: completed.

Photo attachment extended to web, closing the last platform gap from 023:
- Web picks via `expo-image-picker` file picker; image read as a base64 data URI (`FileReader`) and stored in the existing `transactions.photo` JSON array.
- Data URIs survive full page reloads (column persisted by the sql.js/IndexedDB engine); `<Image source={{uri: dataUri}}>` renders in react-native-web.
- Removed the three 023 `isNative` gates: PhotoSection in Add/Modify, the details photo row, and the Settings "Show photo" checkbox (now available on all platforms).
- Camera stays native-only: PhotoSection hides "Take photo" on web; web offers gallery only.
- `deletePhotoFile` no-ops on `data:` URIs (web photos live in the DB row, not the file system).
- Tests: photoUtils data-URI parse/no-op; PhotoSection camera-option visibility per platform.
- Fix (2026-10-15): `deletePhotoFile` now no-ops on **all** web URIs (not just `data:`), so deleting a transaction / account / category whose photos are native `file://` URIs (e.g. imported from a native backup) no longer calls `expo-file-system` on web — which warned "not supported on web" and threw `this.validatePath is not a function`.

Spec: spec/features/024-photo-on-web/.

## 025-data-backup
Status: completed.

Data export / import (backup) on iOS, Android, and web:
- Export the whole database (users, accounts, categories, transactions incl. photos, tags, tag links, config) as a versioned JSON snapshot; import restores it.
- One shared code path through the unified `DatabaseHandle` (`src/database/backup.ts` + `backupService.ts`); import is transactional (FK-safe delete/insert order, rollback on any violation).
- Import reuses the row Zod schemas for validation and is gated by an explicit confirmation modal (replaces all current data).
- Web: `Blob` + `<a download>` for export, programmatic `<input type="file">` + `FileReader` for import. Native: file written to `documentDirectory` and shared via `expo-sharing`; import via `expo-document-picker`.
- Post-import reload: `resetAll()` (AppContext) + `updateConfig(configRepository.get())`.
- UI: "Export data" / "Import data" rows in DataScreen above the delete rows (SettingsRow, theme + text-size aware, multilingual en/es/ca).
- Tests: snapshot build/parse/apply round-trips on a real sql.js DB, empty-DB export, invalid/FK/version rejection with rollback, facade round-trip and newer-version guard.
- Fix (2026-09-18): native export now reports the real share-sheet outcome via a local `finly-share` module (`saved`/`dismissed`) — success alert only when the share completed, none on dismiss, error alert on failure; `ShareResult` constants added; DataScreen tests cover export success/dismissed/error and import cancel/success.
- Fix (2026-09-18, follow-up): Android share targets return no reliable result (a completed Gmail share reported `RESULT_CANCELED`), so on Android the module reports `saved` whenever the share sheet ran and the success alert always appears after Export; iOS keeps truthful detection (dismissal still shows no alert); web unchanged. `FinlyApp/.gitignore` ignores `modules/**/android/build/`.
- Fix (2026-09-18, hybrid): Android Export now writes the backup to the **public Downloads folder** (`finly-share.saveToDownloadsAsync`, `MediaStore.Downloads`, Android 10+; older Android falls back to the share flow). The "Backup saved" alert is shown only after the write succeeds and offers optional **Share** / **Done** — sharing is fire-and-forget and its outcome is never reported, so no modal can be false. New i18n keys (9 languages); `isAndroid`/`isAndroidPlatform` in `src/utils/platform.ts`; DataScreen Android-flow tests + platform tests added.
- Fix (2026-10-13): on web the export/import/delete feedback was invisible (react-native-web's `Alert` is a no-op while DataScreen called `Alert.alert` directly). Added a web-aware `alertInfo` (sharing the `window.alert` fallback with `alertError`) and routed the DataScreen messages through it; the Android-only download/share sheet keeps its raw `Alert`.
- Fix (2026-10-14): the typed-DELETE confirmation modal stayed centred while the keyboard covered its confirm/cancel footer. `ModalShell` now measures the keyboard (`useKeyboardInset`) and lifts the card above it (and caps its height), so the buttons stay reachable.
- Fix (2026-10-14): the lifted modal dropped back down as soon as the keyboard hid (tapping Confirm blurs the input), which moved the button mid-tap and forced a second tap. The lift is now held while the modal is open (`useKeyboardLift`) and resets on close, so one tap confirms.
- Fix (2026-10-14): the typed-DELETE confirm still needed two taps — `DataScreen`'s outer `ScrollView` (an ancestor of the modal) captured the first tap to dismiss the keyboard (RN's default `keyboardShouldPersistTaps`). It now sets `keyboardShouldPersistTaps="handled"`, so the Confirm button receives the first tap.

Spec: spec/features/025-data-backup/.

## 026-account-initial-balance
Status: completed.

Optional starting balance for accounts on Create and Modify account screens:
- New "Initial balance" field between the icon/color section and the Note field, reusing the `AmountInput` component (currency symbol, decimal-separator aware, localized parsing, no calculator).
- `AmountInput` gained optional `label` and `accessibilityLabel` props; `AccountForm` gained `showInitialBalance`/`initialBalanceLabel`/`initialBalanceRaw`/`onInitialBalanceChange`.
- Empty field stores `0`; non-empty invalid values disable Create/Save with the existing amount error.
- Modify preloads the current value; the Total aggregate account never shows the field.
- No schema/migration/DB changes: `initial_balance` already existed and was already included in `getBalances()` and Total (AppContext), so account/Total balances update automatically.
- i18n keys `create_account_initial_balance`, `modify_account_initial_balance`, `a11y_initial_balance` (en/es/ca).

Spec: spec/features/026-account-initial-balance/.

## 027-comments-management
Status: completed.

Bulk comment management for transactions:
- New "Comments" Drawer screen (after Tags) listing every distinct comment grouped by its trimmed value with "Used in N transactions" counts, sorted case-insensitively, with a header search toggle (client-side substring filter) and empty state.
- New ModifyComment screen (route param `{ comment }`): preloaded multiline input with 0/4096 counter, Save disabled when empty/unchanged, Delete with a confirmation modal showing the exact usage count; both actions bulk-update all matching transactions (matched by `TRIM(description)`) and return to the list, which reloads on focus.
- Normalization: comments are trimmed on save (`description: comment.trim() || null`), whitespace-only comments stored as none; `getDistinctComments()`/`updateComment`/`deleteComment`/`countByDescription` operate on trimmed groups, so editing `food` → `Food` merges the two variants into one row (covered by a contract regression test).
- Autocomplete: `searchComments()` returns distinct trimmed suggestions ranked prefix-first (NOCASE) capped at `MAX_SUGGESTIONS`; `CommentInput` only triggers from `MIN_COMMENT_SUGGESTION_LENGTH = 2` trimmed characters.
- i18n keys `nav_comments` + `comments_*` (en/es/ca).
- Tests: 6 new contract tests + 7 `CommentInput` component tests; `npm run test:all` green (typecheck + lint + 247 tests, 29 files).
- Update (2026-10-14): each row also shows "Last used <date>" (`getDistinctComments()` now returns `lastUsed = MAX(date)`), the usage line moved to the shared `used_in_transactions`, and the list gained a `SortToggle` strip (name / last used / usage, session-only) via the shared `SortRow`.
- Fix (2026-10-14): emptying the list (Select all → Delete from an overflowing list) left the old scroll extent; the list is now unmounted when empty and a plain `View` + `EmptyState` is rendered (see the "Empty lists" convention in `6-screens.md`).
- Fix (2026-10-14): the ModifyComment screen uses the keyboard-aware `FormScrollView` so the Save button stays above the keyboard (shared `useKeyboardReveal`).

Spec: spec/features/027-comments-management/.

## 028-recurring-transactions
Status: completed.

Recurring expenses/income created once and materialized automatically:
- New `recurring_rules` table (+ `recurring_rule_tags`) storing type, account, category, amount, comment, tags, frequency (daily/weekly/monthly/yearly + "every N"), anchors, start/end date and `next_due`; two nullable columns added to `transactions` (`recurring_rule_id`, `recurrence_date`) with a partial unique occurrence index.
- Reconciliation on app start, on foreground and via a midnight timer while open: every due occurrence since the last run is created, dated on its scheduled day (missed months/years are back-filled); idempotent via the unique index, transactional, bounded per rule. A closed app catches up on next open (no OS background task in v1).
- The recurring create/edit form gains a "Repeat" section (always shown, no toggle); the add-transaction form no longer offers it and always saves a single plain transaction. A Drawer "Recurring" screen lists rules (frequency summary, next due, pause/resume, FAB); transaction details show a Recurring chip + "Stop repeating".
- Recurring rules have a **compulsory, unique name** (trimmed, case-insensitive; the rule's title, editable). The Recurring list shows each rule's name, creation date, generated-transaction count and next due (or Ended).
- The frequency summary is localized and phrased per frequency: weekly includes the weekday, yearly reads naturally ("Every year on October 6" / "Cada año el 6 de octubre"), and the end date appends "until <date>".
- The rule's date field is a **Start date** that accepts **any** date (past, present or future): in rule mode the form's day picker passes `maxDate = null` (outside rule mode it stays today/past). This replaces the old "Skip the first occurrence" option.
- Editing the **Start date** of a rule that has never generated an occurrence (`next_due === start_date`) re-anchors it from the new start, so moving it to today makes it due and generates from there (past occurrences stay skipped/recoverable); a started rule's earlier start keeps the past occurrences untouched and shows a hint.
- A monthly/yearly rule can anchor on the **last day of the month** (the 31st, clamped to each month's end), starting on the last day of the start month; the summary reads "on the last day" (yearly: "on the last day of <month>").
- Editing reconciles first then updates in place; scope "Future only" or "Future + past" (bulk update of account/category/amount/comment/tags/type on generated transactions — dates never change). The "past" scope is only offered when a past-affecting field actually changed (a timing-only edit leaves past transactions untouched).
- Deleting a rule keeps every transaction it generated (FK `ON DELETE SET NULL`).
- A rule with no occurrence left within its end date shows an off, **disabled** (dimmed) **Ended** toggle that cannot be resumed; the state is derived from the schedule (not persisted), so extending the end date into the future revives the rule and re-enables the toggle. Ended rules are skipped by reconciliation and the resume path refuses to reactivate them.
- A window a **Future only** edit skips is recorded on the rule (`recurring_rules.skipped_from`, added to migration 004); while it is within the end date the edit screen re-enables **Future + past** to back-fill it (cursor re-anchored, no duplicates, record cleared). "Future only" now asks for confirmation before skipping. Pause/resume skips stay permanent.
- The Repeat section always shows a **Summary** info block (summary line, first/next transaction date, and how many transactions will be created on save). In the edit form the "Apply changes to" scope sits inside the recurring card above the block, and the block reflects the scope (next transaction + count, skipped occurrences, or "Back-fills N missed occurrences"); the footer keeps only Delete.
- The Recurring management screen gained **Select + Search** header actions (like the other list screens): search by name/category/comment/frequency, and multi-select **bulk delete** of rules (their generated transactions are kept). The transaction search (All transactions, Transactions) also matches the recurring rule name.
- The Recurring list can be **filtered by status** (All / Active / Paused / Ended) via a `RecurringStatusChip` in the sort row: multi-select, session-only, with "All" mutually exclusive with the statuses (selecting every status collapses back to All); the chip label shows "All", the single status or the joined statuses ("Active + Ended"). Status is derived (ended wins over the active flag).
- The Recurring list can also be **filtered by type** (All / Expenses / Income `TabBar` at the top) and **by account** (`AccountTrigger` + account modal above the sort row, with the Total account meaning every account), like the transactions screens; both default to every rule and compose with the status filter, the search and the sort.
- Additive migration `004_recurring` and `SCHEMA_VERSION 3 → 4`; existing v2.1.0 data untouched. Backup format v1 extended with optional collections so old backups still import.
- Fix (2026-10-14): the edit form's back-fill Summary counted every occurrence the schedule implies in the window, including ones already generated (e.g. today's, created by a previous "Future only" save), so "Adds 3 missed transactions" could create only 2. The screen now loads the rule's existing occurrence dates (`recurringRepo.listOccurrenceDates`) and the preview subtracts them, matching what the save actually creates.
- Update (2026-10-14): the transaction-details **Recurring** row is now pressable (with a `create-outline` affordance) and opens the rule's edit screen directly, instead of only via Edit → the edit screen's notice button.
- Update (2026-10-14): the modify form now **refreshes when a rule edit rewrites its row** while it is open (detected via `updated_at`): an untouched form silently adopts the new values, while a form with unsaved input keeps the draft and shows a "This transaction was updated by its recurring rule…" line with a **Use the rule's values** button that adopts the rule's values.
- Refactor (2026-10-14): that refresh logic moved out of `ModifyTransactionScreen` into `hooks/useExternalRowRefresh.ts` (a generic "row rewritten underneath an open form" hook: `formKey` remount / `updated` warning / `adopt`), unit-tested with `renderHook`; the shared tag-id comparison became `utils/arrays.ts#areIdListsEqual` (reused by `useTransactionForm` and `useRecurringEditScope`); a non-recurring row now always adopts (it has no notice to show).
- Fix (2026-10-14): emptying the Recurring list (Select all → Delete from an overflowing list) left the old scroll extent; the list is now unmounted when empty and a plain `View` + `EmptyState` is rendered (see the "Empty lists" convention in `6-screens.md`).
- Spec: spec/features/028-recurring-transactions/.

## 033-bulk-delete-tags-comments
Status: completed.

Multi-select bulk delete on the Tags and Comments screens:
- Header "Select"/"Done" toggle on both screens enters selection mode (rows show checkboxes; tapping toggles selection instead of navigating; header search keeps filtering during selection).
- Shared `SelectionActionBar` bottom bar with "Cancel" and `Delete (N)` (disabled when nothing selected).
- Single `ConfirmationModal` per batch: `Delete N tags?` / `Delete N comments?` with Cancel / Delete.
- `tagRepo.deleteMany(ids)` deletes tags in one query (junction rows cascade) + `transactionRepo.deleteComments(values)` clears `description` on every matching transaction; screens reload after delete (`refreshTags()` / `getDistinctComments()`).
- i18n keys `tags_select*`/`tags_bulk_delete*` + `comments_select*`/`comments_bulk_delete*` (en/es/ca).
- Tests: 2 new contract tests (tags `deleteMany`, comments `deleteComments`) on both native + sql.js backends.
- Fix (2026-10-14): deleting a whole overflowing list in one batch (Select all → Delete) left the previous scroll extent, so the empty screen stayed scrollable; both screens now unmount the list when empty (see the "Empty lists" convention in `6-screens.md`).
- Refactor (2026-10-14): the empty/list decision was extracted to `components/ListOrEmpty.tsx` and adopted by all six list screens (Tags, Comments, Recurring, Accounts, the transactions list and Categories); shared `testID`s moved to `constants/testIds.ts` (`TEST_IDS`).

Spec: spec/features/018-tag-management/ and spec/features/027-comments-management/.

## 038-users-login (deferred to post-2.0)
Status: not started.

Multi-user support / login. Explicitly deferred after the 2.0 release. No code.

## 2.0 QA audit (Task 1)
Status: completed.

Full spec audit of every implemented feature against its acceptance criteria, in the browser (Playwright, viewport 375px) plus code review, before the 2.0 release. All 003-settings-screen criteria verified and flipped `[x]`. 010-app-logo partially verified (see findings). Audit findings so far:

- **003-settings-screen** (all 41 criteria pass, `[x]`). Spec-drift notes recorded at audit time, all resolved in Task 2c: (1) Data modals' primary button on the first modal read "Confirm" instead of "Delete all"/"Reset" — button labels fixed; (2) the spec mentioned toast/snackbar confirmations but the app uses `Alert.alert` and has no toast system — spec reworded to "alert dialog"; (3) an NFR mentioned web `localStorage` but the implementation uses IndexedDB (sql.js) — spec reworded.
- **010-app-logo** findings:
  - Web splash: the spec was outdated. The "Finly" text was removed by design and the hold time changed from 3000ms to 2000ms; after the splash rework (Task 2b) the splash is duration-driven with no artificial minimum and no progress bar. Spec §3b and criterion #85 updated to match; #85 flipped `[x]`.
  - `favicon.png` is 1024×1024 (spec 48×48) and `splash-icon.png` is 1024×1024 (spec 1284×2778); both still work (Expo resizes the favicon at export; `contain` on the splash) — spec §1 table updated to the real dimensions (Task 2c).
  - `android-icon-foreground.png` (1.36 MB) and `android-icon-monochrome.png` (1.26 MB) exceeded the 1 MB NFR — re-encoded with `sharp` (palette quantization, compressionLevel 9) in Task 2c: 397 KiB and 53 KiB, dimensions/transparency preserved (originals are 100% opaque, alpha channel carries no info).
  - Native-only criteria (#79–#81, #83, #84) not checkable on web; config references verified.
  - Verified `[x]`: favicon in tab (#82/#88), all files referenced in app.json (#86), drawer header logo + "Finly" (#87).
- Browser-verification notes: dev server does not inject the favicon `<link>` (production export does); `dist/` export generated the favicon.ico from `web.favicon`.

- [x] **Released:** Finly 2.0.0 published as a GitHub Release (tag `v2.0.0`) with the EAS-signed preview APK attached — https://github.com/Alfonfdez/Finly/releases/tag/v2.0.0.

## 2.0 release-readiness (Task 3)
Status: completed.

Release configuration for 2.0.0, applied and verified 2026-09-09:

- **Version** 2.0.0 in both `app.json` and `package.json`.
- **Theme** `userInterfaceStyle: "automatic"` (was `"dark"`), matching the in-app theme setting (Dark / Light / Automatic). Required adding `expo-system-ui ~57.0.3` (native side) — prebuild no longer warns after the install.
- **Android package** `com.finly.app` (was `com.anonymous.FinlyApp`). `ios.bundleIdentifier` set to `com.finly.app` for future iOS builds.
- **EAS production profile** added to `eas.json`: `"distribution": "store"` + `android.buildType: "app-bundle"` (AAB for store submission). `preview` (internal APK) and `development` (dev-client) profiles unchanged.
- **Native re-validation** after the package change: `expo prebuild` regenerated `android/`, debug APK rebuilt (`com.finly.app`, versionName 2.0.0), all 14 Maestro `appId` entries updated, and all 10 flows re-run on the emulator — **10/10 PASS**.
- **README.md** rewritten product-first (2.0 feature highlights, 7 languages, tech stack) and the old `000–009` screenshots + `app-flow.gif` replaced by the 17 `v2-*` screenshots. Development/run/test/fork instructions moved to the end. `images/excalidraw/Finly_v2.png` removed from the README (folder kept as design artifact).
- Gate: `npm run test:all` green on the 2.0.0 tree.

## 2.0 nav header fix (Task 2)
Status: completed.

Header-left button follows navigation state:
- Shared `StackHeaderLeft` in `AppNavigator.tsx` renders `DrawerMenuButton` (hamburger) for every drawer-accessed screen (Home, Accounts, Categories, AllTransactions, Tags, Comments). AllTransactions keeps the hamburger like the other drawer screens; the earlier "back arrow from `canGoBack()`" variant was reverted.
- Drawer navigation for the hamburger-group items (Home, Accounts, Categories, Tags, Comments) resets the Main stack to root (`navigation.reset`), so opening them from the drawer always yields the hamburger (008/011/018) and the stack no longer accumulates hidden history. AllTransactions (015) keeps the hamburger header; Settings (003 §1) keeps the push behavior and shows the native back button.
- Verified on web at 375px and natively on SDK 57 (Maestro flows 004/015 assert the "Open menu" hamburger on AllTransactions).
- Flipped `[x]`: 011 #82 (Accounts hamburger + title), 018 #102 (Tags hamburger + title), 015 #115/#116 (AllTransactions access + hamburger header). 008 #77 re-verified (no regression).

## 2.0 splash rework (Task 2b)
Status: completed.

Web splash is now duration-driven instead of timer-driven. The `SplashScreen` in `App.tsx` shows only while the database initializes and exits as soon as `initDatabase` resolves:
- Removed `MIN_SPLASH_MS`, the `splashTimerDone` state/timer, and the fake progress bar (track + fill animated on a timer). A fake progress bar is an anti-pattern — it implies real progress that doesn't exist.
- Kept the logo entrance (800ms fade + spring 0.8 → 1.0) and the 400ms exit fade/scale (1.0 → 1.1).
- Docs updated to match the intended behavior (the spec was outdated): 010 §3b now specifies logo-only splash, no artificial minimum, no progress bar, no text (the "Finly" text was removed by design earlier); criterion #85 flipped `[x]` after browser verification.
- Browser-verified (Playwright, 375px): splash shows the 80×80 rounded logo with entrance animation, no progress bar and no text, and exits promptly to Home once loaded; 0 console errors. test:all green (typecheck + lint + tests).

## 2.0 polish fixes (Task 2c)
Status: completed.

Resolves the remaining Task-1 findings:

**003-settings-screen drift:**
- Data modals now label their primary buttons per spec: the first "Delete all data" modal shows "Delete all" and the first "Reset to factory state" modal shows "Reset" (new i18n keys `settings_delete_all_data_confirm`, `settings_factory_reset_confirm` in en/es/ca; `DataScreen.tsx` updated). The delete-transactions modal ("Delete"), the second confirmation modals ("Confirm", disabled until "DELETE" is typed) and the import modal ("Confirm") already matched the spec and are unchanged.
- Spec reworded to match the implementation: §6.1/§6.2 "A toast/snackbar confirms" → "An alert dialog confirms" (the app uses `Alert.alert`; no toast system exists). NFR persistence wording updated from `localStorage` to IndexedDB via sql.js (web backend moved to sql.js/IndexedDB in infra 003).

**010-app-logo assets:**
- Both adaptive icons re-encoded with `sharp` (added as devDependency; `scripts/optimize-icons.mjs`, palette quantization + compressionLevel 9): `android-icon-foreground.png` 1333.5 → 396.7 KiB, `android-icon-monochrome.png` 1228.3 → 52.9 KiB — both under the 1 MB NFR, 1024×1024 preserved. Pixel-diff vs the originals: foreground avg 0.76/255, monochrome 2.11/255 (quantization noise only). The originals are 100% opaque (their alpha channel carried no transparency), so dropping it is a non-issue.
- Spec §1 table updated to the real dimensions: `favicon.png` 1024×1024 (Expo downsizes to 16/32/48 at export), `splash-icon.png` 1024×1024 (centered via `contain`).
- Browser-verified (Playwright, 375px): Data modals show "Delete all"/"Reset" on the first steps and "Confirm" on the second; delete-transactions and factory-reset flows still work; app renders with the re-encoded icons; 0 console errors. test:all green (typecheck + lint + 282 tests, 34 files).

## 2.0 comments counter
Status: completed.

Comments screen counter above the list:
- A text caption shows the number of visible comments (e.g. "2 comments") above the FlatList, matching the Tags/Categories counter pattern (034-limit-indicators). Only visible when there is at least 1 comment and not in selection mode.
- When a search filters the list, the counter updates to reflect the filtered count (e.g. "3 comments" when 3 matches).
- i18n key `comments_counter(n)` (en/es/ca): pluralized "X comment(s)".
- Browser-verified (Playwright, 375px): counter shows "2 comments" with 2 distinct comments; search "lun" updates to "1 comment" with only "lunch" visible; 0 console errors. 027 criterion flipped [x].

## 2.0 all-transactions bulk delete
Status: completed.

Multi-select bulk delete on the AllTransactions screen:
- Header "Select"/"Done" toggle enters selection mode (transaction rows show checkboxes; tapping toggles selection instead of navigating to details; header search keeps filtering during selection). When 0 transactions, both Select and Search are hidden.
- Selection persists across all filter changes (type tab, account, categories, period, tags, search).
- FAB hidden in selection mode; `SelectionActionBar` bottom bar with "Cancel" and "Delete (N)" (disabled when nothing selected).
- Single `ConfirmationModal`: `Delete N transactions?` with Cancel / Delete. On confirm: `transactionRepo.deleteMany(ids)` cleans up photos, removes junction rows, and deletes transactions in a single database transaction; list reloads immediately.
- `TransactionRow` extended with optional `selectMode`/`selected` props (checkbox via `ListItemRow` `leading`).
- i18n keys `transactions_select*`/`transactions_bulk_delete*` (en/es/ca).
- Browser-verified (Playwright, 375px): Select mode → checkboxes on 2 transactions → "Delete (2)" → confirmation "Delete 2 transactions?" → Confirm → both deleted, "No transactions" empty state, header hides Select/Search, balance 0,00 €; 0 console errors. 015 criteria flipped [x].

## 2.1 transactions screen search and select
Status: completed.

Header search + multi-select bulk delete on the TransactionsScreen (014), matching the AllTransactions implementation:
- Top-right `SelectSearchHeader` (selection toggle + search icon) registered via `navigation.setOptions` in a `useLayoutEffect`; both buttons hidden when the screen has 0 transactions.
- Search: `ScreenSearchBar` toggle below the category section; client-side case-insensitive multi-term (AND) over comment/description, category display name, tag names and account name via `useTransactionFilters({ searchTerm, categoriesById })`; composes with the account selector + tag filter (route category/period already applied at load); "No results found" empty state.
- Select: `useSelectAndSearch` + `useBulkDelete`; row checkboxes toggle selection instead of navigating; `SelectionActionBar` (Cancel / `Delete (N)`) swaps the FAB; single `ConfirmationModal`; `transactionRepository.deleteMany` cleans photos + junction rows, list reloads via `setData` and AppContext `refresh`.
- FAB restored on this screen (spec §5) and navigates to AddTransaction with the route `type`.
- Period indicator: the category header now has a Row 3 sub-line showing the active period (label + date/range) built from the `period`/`startDate`/`endDate` route params — `Day · September 2, 2026`, `Week · <start> – <end>`, `Month · September 2026`, `Year · 2026`, `Custom · <start> – <end>` — using existing `period_*` i18n keys + `formatDateLong`/`getMonthName` (localized). Makes it clear when an out-of-period transaction won't appear.
- Browser-verified (Playwright, 375px): period line renders correctly for Day ("Day · September 2, 2026"), Month ("Month · September 2026") and Custom range ("Period · January 1, 2026 – September 2, 2026") on the Transactions header, localized per language; 0 console errors. test:all green (typecheck + lint + 334 tests, 40 files). 014 criteria flipped [x].

## 2.0 navigation jank fix
Status: completed.

Fixes the header-left button mismatch and navigation jank when switching between drawer screens:
- **Fix A (header-left):** replaced `navigation.reset()` with nested `CommonActions.reset()` dispatched via Drawer's own navigation, setting the Stack state directly. Root drawer screens (Home, Accounts, Categories, Tags, Comments) reset the Stack to `[{name: screen}]` only — no Home in the route array — so `canGoBack()` returns false and the hamburger shows. Non-root screens (AllTransactions, Settings) keep `navigation.navigate()` push behavior with a back arrow. Added `animationTypeForReplace: 'push'` to Stack screenOptions.
- **Fix B (useFocusLoad):** `useFocusEffect` no longer sets `loading=true` on every focus; only the initial load shows the spinner. Subsequent focuses refresh data silently without flashing the skeleton.
- **Fix C (useBalanceVisibility):** removed `useFocusEffect` that reset `isRevealed=false` on every focus; eye-toggle state now persists across navigation.
- Browser-verified (Playwright, 375px): Home→Categories (hamburger ✓), Categories→Back (no back, hamburger only ✓), Categories→AllTransactions (back arrow ✓), AllTransactions→Back→Categories (correct ✓), Categories→Home (correct ✓), Home→Settings (native back ✓), Categories→ModifyCategory (back arrow ✓), 0 console errors.



## 034-limit-indicators
Status: completed.

Usage counters against the limits on the Categories and Tags pages:
- Tags screen: a caption above the list shows how many tags exist out of the 50-tag maximum (`MAX_TAGS`), e.g. "12 of 50 tags" (`tags_counter`), hidden during selection mode.
- Categories screen: a caption below the Expense/Income tabs shows how many categories the active type has out of the 30-per-type maximum (`MAX_CATEGORIES_PER_TYPE`), e.g. "21 of 30 categories" (`categories_counter`), updating when switching tabs.
- i18n keys `tags_counter` and `categories_counter` (en/es/ca).

Spec: spec/features/018-tag-management/ and spec/features/008-categories-screen/.

## 036-donut-total-fit
Status: completed.

Keep the total amount centered in the donut chart always fully inside the hole:
- The center text is now constrained to the donut's inner diameter (`HOLE_SIZE = (radius − strokeWidth / 2) × 2`) instead of floating unconstrained over the SVG, so wide amounts no longer spill out of the donut.
- New pure util `fitFontSize(text, baseSize, maxWidth, { factor = 0.6, safety = 0.95, minSize = 10 })` in `src/utils/formatters.ts`: returns the largest font size whose estimated glyph width fits the box; short strings keep the base size, long ones shrink proportionally, never below the minimum, never truncated.
- Donut proportions widened for more room: radius 60 → 66, strokeWidth 15 → 13 (hole 105 → 119px; outer ring 145px still inside the 160px viewBox).
- Deterministic JS calculation (works identically on iOS/Android/web); RN `adjustsFontSizeToFit` was rejected because react-native-web does not implement it.
- Tests: 5 new `fitFontSize` unit tests; `npm run test:all` green.

Spec: spec/features/001-home-screen/.

## 037-categories-bulk-delete
Status: completed.

Multi-select bulk delete on the Categories screen:
- Header "Select"/"Done" toggle (shown only when the active type has categories) enters selection mode: tiles show checkmarks and tapping toggles selection instead of navigating to Modify category; the "Create" tile, the limit message and the counter are hidden; selection resets when switching Expense/Income tabs; header search keeps filtering during selection.
- Shared `SelectionActionBar` bottom bar with "Cancel" and `Delete (N)` (disabled when nothing selected).
- Deleting keeps at least one category per type: selecting every category of the active type blocks with "You cannot delete all the categories of a type. Keep at least one." (`categories_bulk_delete_min_one`).
- If no selected category has transactions, a single `ConfirmationModal` confirms the deletion; if any does, the modal states how many of the selected categories have transactions (`categories_bulk_delete_confirm_message_tx(n, total)`) and offers "Move transactions first" or "Permanent delete" (`deleteMany`, removes transactions + photos).
- "Move transactions first" opens a per-category resolution modal (`BulkCategoryTransferModal`): each selected category with transactions lists its count and opens a nested `CategoryTransferModal` with a destructive "Delete transactions" option (`categories_bulk_move_delete_option`); "Move & delete" is disabled until every listed category has a decision, and `categoryRepo.bulkDeleteWithTargets(items)` runs the moves/deletes in one transaction (categories without transactions are always deleted).
- New repo methods `categoryRepo.deleteMany(ids)`, `categoryRepo.reassignManyAndDelete(ids, targetId)` and `categoryRepo.bulkDeleteWithTargets(items)` + `transactionRepo.countByCategoryIds(ids)` and `transactionRepo.countByCategoryIdsMap(ids)`; `ModifyCategoryScreen` refactored to reuse the extracted shared `CategoryTransferModal`.
- i18n keys `categories_select*`, `categories_bulk_delete*`, `categories_bulk_move*` (en/es/ca).
- Tests: 6 new contract tests (category `deleteMany`, `reassignManyAndDelete`, `bulkDeleteWithTargets` ×2, transaction `countByCategoryIds`, `countByCategoryIdsMap`); `npm run test:all` green (282 tests / 34 files).

Spec: spec/features/008-categories-screen/.

## 001-expo-sqlite-wal-cleanup (infrastructure)
Status: completed.

Self-healing recovery for the expo-sqlite WAL sidecar bug:
- `initDatabase()` detects stale state (version present but `tags` table missing in `sqlite_master`).
- On detection, deletes the database file (`.db`, `-wal`, `-shm`), reopens, and reruns all migrations (001-004).
- Silent recovery during splash screen; healthy databases are never affected.
- Web platform is unaffected (it never used expo-sqlite WAL files).

Spec: spec/infrastructure/001-expo-sqlite-wal-cleanup/.

## 002-database-schemas (infrastructure)
Status: completed.

Zod schema layer — single source of truth for stored row shapes + runtime validation:
- `src/database/schemas.ts` defines one Zod schema per table (users, accounts, categories, transactions, tags, transaction_tags) plus `configSchema`, with enums built from the existing constant sets.
- `src/database/types.ts` derives all row types via `z.infer` (same exported names; no import-site changes).
- Native repos validate full-row reads; web `getStore` validates entity reads; both config backends fall back to `DEFAULT_CONFIG` on invalid values.
- `dbDrift` asserts Zod schema keys exactly match migration columns.
- Drizzle remains deferred (its `expo-sqlite` driver expects a native connection; driving the custom `DatabaseHandle` engines — including sql.js on web — would need a custom adapter).

Spec: spec/infrastructure/002-database-schemas/.

## 003-web-sqlite-engine (infrastructure)
Status: completed.

Unified web data layer on real SQLite (sql.js):
- `src/database/sqliteWeb.ts` provides `SqlJsDatabase`, a `DatabaseHandle` implementation over sql.js (WASM) with IndexedDB persistence (one write per committed transaction; never while a transaction is open).
- Web now runs the exact same migrations and repositories as native through a platform-resolved `openEngine` (`engine.ts` native / `engine.web.ts` web); `src/database/webStorage.ts` and the localStorage web repos are deleted.
- `App.tsx` and `DataScreen` init/reset via `database.ts` on all platforms.
- Phase B contract suite exercises the single repo set over the single engine; `sqliteWebEngine.test.ts` covers engine semantics (persistence round-trip, transaction batching, rollback).
- Drizzle's `expo-sqlite` driver still cannot drive the web's custom `DatabaseHandle`, so Drizzle remains deferred.

Spec: spec/infrastructure/003-web-sqlite-engine/.

## 004-drizzle-orm (infrastructure)
Status: completed.

Drizzle ORM data layer over the shared `DatabaseHandle`:
- `src/database/drizzle/schema.ts` declares the seven tables mirroring `001_initial`; `src/database/drizzle/proxy.ts` adapts `drizzle-orm/sqlite-proxy` onto `DatabaseHandle` (positional rows, `run` → `lastInsertRowId`/`changes`, `get` → `{ rows: null }` when absent); `src/database/drizzle/engine.ts` provides the lazy `getDrizzle()` singleton and `withTransaction(task)` (Drizzle's own `db.transaction()` is unused to keep web's persist-on-commit batching).
- All six repositories are rewritten with the Drizzle query builder (behavior-preserving); writes use `.run()` (never `.returning()`, which would skip web persistence); collations/functions stay as parameterized `sql` fragments.
- `buildUpdateQuery`/`buildNameExistsQuery` helpers and their tests removed; `UNTAGGED_ID`/`isTotalAccount` kept.
- Same migration runner (`PRAGMA user_version`), Zod validation and backup tooling remain; no `drizzle-kit`; only `drizzle-orm@^0.45.2` added.
- Phase B contract suite passes unchanged plus new `drizzleProxy.test.ts` and `drizzleDrift.test.ts` (34 files / 271 tests).

Spec: spec/infrastructure/004-drizzle-orm/.

## 035-hide-actions-on-empty-lists
Status: completed.

Hide the Select + Search header actions when there is nothing to manage:
- Tags screen: the header Select button and search icon are hidden when the tag list is empty; they appear as soon as the first tag exists.
- Comments screen: same for the comment list (comments derived from transaction descriptions).
- Empty search results still keep the buttons — the actions only hide when the underlying list has zero items, not when a filter matches nothing.
- Accounts and Categories screens left unchanged (Total account is always present; categories are seeded).

Spec: spec/features/018-tag-management/ and spec/features/027-comments-management/.

## Tier-5 codebase cleanup audit (Option D, Feature 1)
Status: completed.

First pass of the Tier-5 cleanup audit (duplicated code, dead exports, unused i18n keys) covering only low-risk, behavior-preserving changes:
- 10 dead exports removed (each kept local to its module): `parseRow`, `BackupSnapshot`, `ProxyMethod`, `DrizzleRunResult`, `DrizzleDb`, `TransactionFilters`, `CategoryTagBreakdown`, `CategoryUsageCount`, `TypeTab`, `UseTransactionListScreenOptions`.
- New `repoHelpers.ts` with a single `existsByName()` shared by the account/category/tag repositories (was triplicated); a shared `patchUpdate` was deliberately skipped (per-entity field lists differ).
- New `formatAmount(amount, config)` in `utils/formatters.ts`, replacing the 9 `formatCurrency(x, config.currency, config.decimalSeparator)` call sites.
- Private `countByGroup(column, ids)` in `transactionRepo.reads.ts` collapsing the three count-by-group queries.
- `LIMIT_TEXT_STYLE` and `COUNTER_STYLE` hoisted into `componentStyles.ts` where the styles were exactly identical (TagsScreen `limitText` and CategoriesScreen `counter` kept local - they genuinely differ).
- New `useResetOnOpen(visible, reset)` hook applied to the 5 modals with the open-time reset pattern.
- Skipped + documented (would break behavior preservation): routing the three active-flag async loads through `useFocusLoad` (HomeScreen refetches on filter-dep changes + conditional early-return; ModifyCommentScreen runs on mount/prop-change + `showErrorAlert`; CommentsScreen needs a reload-after-delete that `useFocusLoad` doesn't expose).
- Audit results: i18n fully clean (all 510 `en.ts` keys used, es/ca/fr/de/pt/it parity exact, no missing-key usages); second audit pass scoped out (Transactions vs AllTransactions ~200 lines, modal footer ×5, Tags vs Comments, etc.).

Spec: see `docs/changelog.md` (2026-09-04, "Tier-5 codebase cleanup audit").

## Galego and Euskera languages
Status: completed.

Full UI support for Galician (`gl`) and Basque (`eu`), expanding the app from 7 to 9 languages:
- `src/i18n/gl.ts` and `src/i18n/eu.ts` added with full key parity (enforced by the `Language` type derived from `en.ts`); `lang_gl`/`lang_eu` labels added to all language files, the i18n registry, the `LANGUAGES` map, and the Zod config enum.
- Both options appear in the Regional language dropdown directly under Catalan; they have no Unicode flag emoji, so they render as custom-drawn SVGs (`GalicianFlag` white + blue diagonal; `BasqueFlag` ikurriña red/green/white) on every platform like the existing Catalan `SenyeraIcon`, resolved via `isGalician`/`isBasque`.
Spec: spec/features/003-settings-screen/.

## Settings UI polish
Status: completed.

Settings appearance and flag polish, applied 2026-09-18:
- **Option buttons** (`SelectorInline`, shared by Appearance and the Regional/Personalization selectors): now flexible (fill the row width), centered, bordered (primary border + faint tint when selected, neutral otherwise, radius 10), equal height everywhere via a fixed icon box and label line height; selected checkmark removed (selection reads via border + tint).
- **Language row label**: the `settings_language` i18n value is Title case in all 9 languages (Language/Idioma/Hizkuntza/Langue/Sprache/Lingua…), so the picker row and modal title render in normal case (section header stays uppercased by style).
- **Basque ikurriña SVG**: corrected to the official design — red field, green diagonal saltire, white cross on top (band = 8.6% of flag width); row aspect ratio kept at 0.75 for picker consistency.

Spec: spec/features/003-settings-screen/.

## 2.1 release-readiness
Status: completed.

Release preparation for 2.1.0, applied and verified 2026-09-18:
- Version 2.1.0 in app.json, package.json and package-lock.json; android.versionCode 2 (was unset, i.e. 1) and ios.buildNumber 2.1.0. The Drawer footer (Constants.expoConfig?.version) picks it up automatically.
- .easignore fix: the unanchored `android/` + `ios/` patterns matched at any depth (gitignore semantics) and silently dropped `modules/finly-share/{android,ios}` from EAS archives -> anchored to `/FinlyApp/android` and `/FinlyApp/ios` so the local native module is included in EAS builds.
- EAS preview APK (build df11f8fa-4651-4903-a3da-295f07c9b420) verified: com.finly.app versionCode 2 / versionName 2.1.0, `FinlyShareModule` + `saveToDownloadsAsync` in classes2.dex, `finlyshare.fileprovider` in manifest; installs in-place over the v2.0.0 release APK (device-tested).
- Version references updated in the 9 READMEs, tech-stack and screens constitution docs, plus a 2.1.0 changelog entry.
- Gate: `npm run test:all` green (92 files / 579 tests).

Superseded: the 2.1.0 GitHub Release was not published; its changes ship in the 2.2.0 release (no separate `v2.1.0` tag).

## Select all in bulk-selection screens
Status: completed.

A "Select all" / "Deselect all" toggle added to the shared `SelectionActionBar`, available on every screen with multi-select bulk delete (All transactions, Transactions, Recurring, Tags, Comments, Categories, Accounts), applied 2026-10-10:
- `useSelectAndSearch` gains `allSelected(ids)` and `toggleSelectAll(ids)`; a shared `SelectAllRow` sits above each list (only in selection mode) showing the toggle + visible count (`items_count`) and flipping its label between `select_all` and `deselect_all` (9 languages). The bottom `SelectionActionBar` stays Cancel/Delete.
- It selects every **currently visible** item — respecting the header search and each screen's filters — so a whole period, type or filtered set can be cleared in one tap. On Accounts the Total account is excluded.
- Spec: spec/features/014, 015, 018, 027, 008, 011, 028.

## Form validation and bottom-action standard (Create + Edit)
Status: completed.

One rule set for the validation feedback and bottom action area of every form, applied 2026-10-15:
- **Bottom hint = why Save is disabled.** It is shown whenever the button is disabled, uses the same wording in Create and Edit (shared i18n keys) and is the only place the message appears — no duplicated text next to the field. The recurring form lists every unmet condition at once.
- **Red border = a value the user themselves invalidated.** The border is held back until the field has been **changed or blurred**, so a freshly-opened form never greets the user in red (`LabeledTextField` owns the gating). `AmountInput` gains an `error` prop: an amount of **0** is flagged (red border, digits unchanged) while an account's initial balance of **0** stays valid; its red text remains reserved for a non-numeric value.
- **Bottom action order** everywhere: muted hint explaining a disabled Delete → `Delete` → red hint → `Save`, the hint living in a new shared `FormHintSlot` (2 reserved lines, scaling with the text size) so **the two buttons never move**. The slot is reserved only where a Delete exists; Save-only forms keep the hint directly above Save. Informative notes (comment merge note) stay below Save.
- **Every form's Delete reads the generic `delete`** (was "Delete tag" / "Delete comment"). Key hygiene: `create_tag_error_empty` added and shared by Create/Edit, `create_account_error_empty|_duplicate` shared by Create/Edit, `modify_account_error_empty|_duplicate`, `modify_tag_delete`, `comments_delete`, `modify_account_delete` and `modify_cat_delete` removed.
- Comment field aligned to the top like the other multiline fields.
- Gate: `npm run test:all` green (133 files / 1046 tests); verified on the Android release APK.

Spec: spec/constitution/6-screens.md (Form validation & bottom action area), spec/features/009, 012, 017, 018, 027, 028.

## Character counters: one look, limits from constants
Status: completed.

Every limited field and list header now shares one counter, applied 2026-10-15:
- **Shared `components/form/CharCounter`** replaces the five duplicated counter implementations (`LabeledTextField`, `CommentInput`, the inline tag modal, the category name, and the tags/categories/comments list headers). It renders `value/maxLength` (or a localized string passed as a child) muted and right-aligned at `COUNTER_FONT_SIZE` (12, scaled by the text-size setting).
- **At the limit the whole counter turns red and bold** (`value >= maxLength`) - the only moment the field stops accepting input - and the same rule flags the list headers (`100 of 100 tags`, `30 of 30 categories`). The caller's `style` is layout-only, so the at-limit state can never be overridden.
- **Limits always come from `constants/types.ts`**, never a literal at the call site.
- **New counter for the recurring rule name**, whose limit drops from 60 to **30** (`REPEAT_NAME_MAX_LENGTH`, matching account/category names) since the name is rendered on a single line everywhere (transaction row ~41 chars, details ~25). A name already longer than the limit (legacy/imported) is kept intact - `maxLength={Math.max(LIMIT, value.length)}` - and flagged by the counter.
- Gate: `npm run test:all` green (134 files / 1057 tests); verified on the Android release APK.

Spec: spec/constitution/6-screens.md (Character Counter), spec/features/028.

## Fixed form footer: reserved hint bands everywhere
Status: completed.

The bottom block of every form is now the shared `components/form/FormActions` (muted band -> Delete -> red band -> Save), applied 2026-10-15:
- **Both bands are always reserved** (2 lines, 8/8 margins, scaling with the text size), so nothing moves when a message appears or disappears. Previously the reservation existed only where a Delete was passed, so Add/Modify transaction, Create recurring, Create account, Create category and Create tag still shifted their Save button; the account's Delete also moved between the last-account and 2+-accounts states.
- **The muted band is the standard separator above the destructive button**, which is why every delete form reserves it (blank when there is no explanation) - so Edit recurring, Edit tag, Edit comment and Modify category gained the same, larger distance from the field area above, and Create category gained the same separation between the colour picker and its button.
- `FormHintSlot` lost its `reserve` prop (always reserved) and gained `tone: 'error' | 'muted'`; `TransactionForm`'s `footer` node was replaced by explicit `deleteLabel`/`onDeletePress`/`deleteDisabled`/`deleteHint` props.
- Gate: `npm run test:all` green (134 files / 1062 tests); verified on the Android release APK (uiautomator bounds: the Delete->Save distance is identical with and without a hint).

Spec: spec/constitution/6-screens.md (Form validation & bottom action area), spec/features/012.

## String unions as named constants
Status: completed.

The two vocabularies this feature introduced are now named constants instead of raw literals, applied 2026-10-15:
- `HINT_TONES` / `HintTone` colocated in `components/form/FormHintSlot.tsx` (the `error`/`muted` band tones) - it followed the `PICKING_PHASE` precedent for a union owned by one component.
- `RECURRING_NAME_ERRORS` / `RecurringNameError` in `constants/types.ts` next to `REPEAT_NAME_MAX_LENGTH` (the `required`/`taken` rule-name errors produced by `useRecurringDraft` and consumed by the form hint), so the literals no longer appear in `useRecurringDraft`, `RepeatSection` or `TransactionForm`.
- The convention is documented in `2-tech-stack.md` (Code conventions) and `AGENTS.md` (CODE STYLE): no raw string unions, no TS `enum`; limits and tokens are constants too.
- Gate: `npm run test:all` green (134 files / 1062 tests).

Spec: spec/constitution/2-tech-stack.md (Code conventions).

## Edit screens: Save only when something changed
Status: completed.

Every edit screen keeps Save disabled until the draft actually differs from what it loaded, applied 2026-10-15:
- The comparison is by **value**, not "was ever touched": retyping the same amount, re-picking the original category/day/account or adding-then-removing the same tag counts as "no change" again. The transaction/rule form reuses `useTransactionForm`'s existing `isDirty` (now part of `canSubmit`, gated by an explicit `editing` prop); the account, category and tag screens use the new `hooks/useIsDirty.ts` (baseline captured once, shallow value compare).
- The rule editor counts a change of the "Apply changes to" scope away from its default as a change, so a skipped/recoverable window is still recoverable via "Future + past" without editing a field. Saving an unchanged rule is intentionally impossible: due occurrences are materialized automatically on app start, on returning to the foreground and across midnight (`AppContext`).
- "Nothing changed" keeps the hint band **empty** (the grey button is the signal).
- Secondary fixes in the same change: `ModifyAccountScreen` guards its preload with `userEditedRef` on all five inputs (a re-focus refetch can no longer wipe the user's input) and `ModifyCategoryScreen`'s guard now covers the icon/colour pickers too.
- Gate: `npm run test:all` green (135 files / 1071 tests); verified on the Android release APK.

Spec: spec/constitution/6-screens.md (Form validation & bottom action area), spec/features/009, 012, 017, 018, 028.

## Transaction edit: baseline follows the stored row
Status: completed.

The modify-transaction form now measures its draft against **what is stored right now** instead of the row it saw when it opened, applied 2026-10-16:
- `useTransactionForm` derives its dirty baseline from the row props (tags included) rather than freezing it in a ref at mount, so a "Future + past" rule edit that bulk-updates this row **re-baselines** the comparison: picking the category the rule just wrote leaves nothing to save and Save stays disabled, while keeping a different value enables it. The informative notice and "Use the rule's values" are unchanged.
- The row's tags now arrive with the row: `ModifyTransactionScreen`'s focus loader returns `{ transaction, tagIds }` (as the rule screen already did) and passes `initialTagIds`, which removed the form's async `getTagsByTransactionId` effect and the two refs — and with them the old "tags arrive after mount" window.
- Gate: `npm run test:all` green (135 files / 1071 tests); regression test covers the rewrite-then-pick-the-stored-value scenario; verified on the Android release APK.

Spec: spec/constitution/6-screens.md (Form validation & bottom action area), spec/features/017.

## Select-all row: standard gap below the separator
Status: completed.

The Categories screen's grid no longer touches the select-all row's separator, applied 2026-10-16:
- The row (`components/SelectAllRow`) ends with a 1px bottom line and the next element is the list. Accounts/Tags/Comments pad their list `16` (card rows), Recurring/Transactions rely on their rows' own `paddingVertical`, and Categories had **no** top gap at all, so the first tile row was flush against the line.
- New `LIST_TOP_GAP` token in `constants/layout.ts` (next to `LIST_BOTTOM_FAB_PADDING`), applied to the Categories grid's scroll container **in select mode only** (in normal mode the counter sits above the grid, so its existing spacing is untouched). The value is defined once, so a future list picks it up instead of re-inventing it.
- The grid's `ScrollView` gained the `categories-grid` testID and the screen test now enters select mode (header rendered via the nav mock, like the Accounts test) and asserts `paddingTop === 16` there / `undefined` in normal mode.
- Gate: `npm run test:all` green (135 files / 1072 tests); verified on the Android release APK.

Spec: spec/constitution/6-screens.md.

## Hint composition extracted to `utils/formHints`
Status: completed.

The form hints' formatting and the transaction checklist moved out of the components, applied 2026-10-17:
- `joinHints(parts, { finalPeriod })` in `utils/formHints.ts` drops the empty parts and joins the rest with `. `, adding the final period only when asked (the transaction/rule checklist wants one, the tag reasons don't).
- `getTransactionFormHintText(values, keys)` is the checklist as a pure function (order: category, amount, account, repeat end date, rule name taken/required; the name only in rule mode) — labels are injected, so it's unit-testable without React or i18n.
- `TransactionForm`'s 12-line `useMemo` is now one call (and it no longer imports the recurring-name constants); `CreateTagScreen` composes its hint from `getNameHintText` + `joinHints`. The rendered strings are unchanged (the existing component tests still assert them).
- Gate: `npm run test:all` green (135 files / 1082 tests).

Spec: no behaviour change (refactor only).

## Select-all row keeps the header visible
Status: completed.

The Select-all row is inserted under every list screen's header block without hiding it, applied 2026-10-16:
- **Accounts** was the outlier: entering select mode hid the prominent **Total balance** section and the row took its place. It now stays visible (the row sits under it, after the search bar when that is open), matching Tags/Comments (which keep their sort strip), Recurring (account + status/sort controls) and the transaction lists (tag filter), where nothing above the row is hidden.
- The three one-line counters (Categories/Tags/Comments) still hide in select mode on purpose: the row already shows the item count, so it replaces them in the same slot.
- The Accounts select-mode test now asserts the Total stays visible while selecting.
- Gate: `npm run test:all` green (135 files / 1072 tests); verified on the Android release APK.

Spec: spec/constitution/6-screens.md.

## Constants audit: no enums, named values for the remaining literals
Status: completed.

A sweep for magic strings/numbers plus a review of the constants-vs-enum choice, applied 2026-10-17:
- **Const objects + `keyof typeof` remain the standard**; a TS `enum` would be a regression here (Expo/Babel cannot inline `const enum`, a runtime enum stops the values being literal types for SQLite/Zod/i18n and costs bytes). No migration to enums.
- The real gaps were **type-only unions whose members were still written raw**: `FORM_MODES` now backs `FormMode` (used by `TransactionForm`) and `BACKUP_VALIDATION_CODES` backs `BackupValidationCode` (parser, import service and settings screen, re-exported by the database barrel).
- Stray literals tokenised: `datePart()` replaces five `.slice(0, 10)` date extractions; `DISABLED_CONTROL_OPACITY = 0.5` replaces five inline disabled-control opacities (the calendar's 0.3 stays module-scoped as a different affordance); `PICK_FALLBACK_DELAY_MS` replaces the web backup picker's 400 ms fallback.
- The Drizzle schema now carries `$type<TransactionType>()` / `$type<RecurrenceFrequency>()` on the union columns — a compile-time annotation only, so the emitted DDL, the migrations and the data are untouched (2.1.0 backups remain compatible).
- Deliberately left literal: SQL DDL inside the immutable migrations, the national flag colours in `RegionalScreen`, decimal-separator characters, screen route names (typed by the param list) and component-owned design values (project token policy; a wholesale design-token sweep is out of scope).
- Gate: `npm run test:all` green (135 files / 1087 tests).

Spec: no behaviour change (refactor only).

## Fast period arrows on Home and All transactions
Status: completed.

Day/Week/Month/Year can be browsed without opening the period picker, applied 2026-10-17:
- The period text is flanked by `‹` and — while not on the current period — `›`, plus a double-chevron `»` jump-to-current that appears only from two or more periods back (on the penultimate one a single `›` already reaches the current one). Equal fixed-width side slots keep the date centred and stop it shifting as the arrows appear/disappear; the icons are the calendar's own chevrons at the same size. The custom **Period** tab keeps just the picker.
- New `utils/periodNavigation.ts`: `shiftPeriod` (day/week steps; month/year shift with the day clamped to the target month so 31 Jan → 28/29 Feb), `isSamePeriod`, `canGoForward`, `canJumpToCurrent` — pure and unit-tested. Weeks use the same Monday-based boundary as the existing weekly range.
- The arrows call the existing `onDateChange` (and `onDateChange(new Date())` for the jump), so both screens and their data refresh with no screen changes. New a11y keys `a11y_previous_period` / `a11y_next_period` / `a11y_go_to_current_period` in all 9 languages.
- The i18n helper now tolerates a UTF-8 BOM in `--values-file` (common in Windows-authored JSON), with a test.
- Gate: `npm run test:all` green (137 files / 1105 tests); verified on the Android release APK (current day, previous day, two days back, jump, Week/Month/Year, custom tab with no arrows, and All transactions).

Spec: spec/features/001-home-screen/, 015-all-transactions-screen/.

## Custom period range: full month names, centred
Status: completed.

The custom range text now reads clearly and wraps gracefully in every language, applied 2026-10-17:
- The range uses **full month names** - "from 1 January to 17 October 2026" instead of the abbreviated "from 1 Jan to 17 Oct 2026" - in both the Home period box and the "Select period" modal.
- A new pure `formatDateRange(start, end, { from, to }, months)` in `utils/formatters` composes it once, so `CalendarPicker`'s box and `PeriodPicker`'s range line (plain range and `All (...)` variant) cannot drift; the "start picked, waiting for the end" hint keeps its single-month text.
- Both texts are now **centred** (`textAlign: 'center'`), so when a verbose language wraps the range to two lines the block reads as one centred paragraph instead of a left-aligned rag.
- The Week range deliberately keeps its short month names: it is a compact pair, not a sentence.
- Gate: `npm run test:all` green (137 files / 1109 tests); verified in all 9 languages on the Android release APK (each language asserted the exact full-month range and was screenshotted).

Spec: spec/features/001-home-screen/.

## 2.2.0 audit: category deletion safety, recurring polish and doc truth-up
Status: completed.

A full pre-release audit of the 2.2.0 code base, applied 2026-10-17. Only the items below changed; the rest of the findings are recorded in the audit report shared with the developer.

**Fixed (data safety and correctness):**
- **Deleting a category can no longer lose data silently.** The last category of a type cannot be deleted (the button is disabled with an explanation, mirroring accounts); the confirmation names exactly what is lost - its transactions, its recurring rules, or both; and the move option now **reassigns the rules to the target category** along with the transactions (they used to be dropped by the FK cascade). The bulk flow gets the same treatment: rules-only categories appear in the resolution list, each row shows transactions + rules, and moving reassigns both.
- **A paused rule no longer promises a back-fill it cannot create.** `planEdit` takes the rule's `active` flag: for a paused rule the cursor and the recoverable-skip record stay untouched, nothing is counted as created, and the Summary says the rule must be resumed. "Future + past" still rewrites the transactions it already generated.
- **A resume that actually skips drops the recoverable-skip record** (a back-fill from it would also fill the pause window, which stays permanent); a resume before the next due date keeps it.
- **A category whose only edit is its icon or colour keeps its canonical name** (the previous guard persisted the localized string, breaking re-localization on a language change); the save now compares the field with the localized default, like the account screen.
- **A category created under the other type stays selected** on return to the transaction form (the type switch used to clear it).
- The default custom period ends at **end of today** instead of "now", so transactions recorded later today are included.

**Fixed (polish and robustness):**
- Balance visibility keeps the setting as the **default** and the eye icon as a temporary toggle in both directions (`hideBalances !== isRevealed`); the temporary state is dropped when the setting changes or the screen regains focus (see the follow-up entry below - this bullet originally replaced the XOR by mistake).
- The category filter can be cleared again (an empty selection applies as "all categories"; the button no longer reads "Apply (0)").
- The account modal highlights the currently selected account instead of the one the form opened with.
- The All-transactions type tab is local to the screen (no longer clobbered by the Home type switcher) and the tag selection re-syncs when the screen is re-entered with new params.
- A tags-only "Future + past" rewrite bumps `updated_at`, so an open modify form notices it.
- Pause/resume failures surface the standard error alert instead of an unhandled rejection.
- Account deletion states that its recurring rules are deleted too.

The **"Last day" checkbox** is now an ambiguity resolver, offered only on the month-end dates where "the Nth" and "the last day" differ (monthly Feb 28 non-leap / Feb 29 leap / 30 Apr-Jun-Sep-Nov; yearly 28 February of a non-leap year) and cleared when the start date stops qualifying — picking a month-end is otherwise how the pattern is expressed, since a last-day rule moves its first occurrence to the month's end anyway. The form Summary states the resolved day for every month (`31 in Jan, Mar, ... - 30 in Apr, Jun, Sep, Nov - 28 in Feb (29 in leap years)`), so a rule that lands on different days is never a surprise. The full decision table lives in spec 028 §4.

Gate: `npm run test:all` green (137 files / 1139 tests).

Spec: spec/features/001-home-screen/, 008-categories-screen/, 009-modify-delete-category-screen/, 012-modify-delete-account-screen/, 015-all-transactions-screen/, 028-recurring-transactions/.

## Recurring edit: Save follows the whole rule draft
Status: completed.

The edit form gate only compared the transaction fields, so changing the rule name, frequency, interval, end date or the "Last day" checkbox left Save disabled, applied 2026-10-18:
- `useTransactionForm` now also compares the recurring draft with the loaded rule (`ruleDraftChanged`): name (trimmed, as it is stored), frequency, interval, end date (date-only) and the last-day anchor. `isDirty` is the union of both, still gated on `editing` plus the documented scope-only exception.
- The last-day term compares against the *effective* initial intent, so a rule anchored on the 31st - whose checkbox is hidden and whose flag is cleared on load - is not reported as changed.
- Tests: a hook-level rule gate suite (every field enables Save and reverting disables it, surrounding whitespace in the name is ignored, a hidden last-day rule is untouched, a scope-only save is allowed) plus screen tests for the name, frequency, interval and last-day changes.
- Gate: `npm run test:all` green (137 files / 1150 tests).

Spec: spec/features/028-recurring-transactions/ (the behaviour was already specified; the implementation now matches it).

## Android: a reinstall no longer restores app data
Status: completed.

A phone reinstall came back with accounts, a recurring rule and transactions that had been deleted with the in-app Factory Reset, applied 2026-10-19:
- **Cause:** the app used Android's default `android:allowBackup="true"` with no backup rules, so the OS cloud backup had copied the private SQLite database (`files/SQLite/Finly.db`) and Android **restored it on install**. The restored snapshot predated the reset, which is why deleted data reappeared. Ruled out independently: the APK bundles no `.db`, the seed creates only the default user, `My Wallet`/`Total` and the 31 categories, and the tag/names in question exist nowhere in the app.
- **Fix:** `expo.android.allowBackup: false` in `app.json`; prebuild emits `android:allowBackup="false"` and the packaged manifest was checked after `assembleRelease`. Cloud backup and restore (and `adb backup`) are off, so a reinstall always starts from the seed; data moves only through the in-app JSON export/import (025). Device-to-device transfer on API 31+ is out of scope (it applies when migrating to a new phone).
- Gate: `npm run test:all` green (137 files / 1150 tests).

Spec: spec/constitution/7-platform-differences.md, spec/features/025-data-backup/.

## Balance visibility: setting is the default, the eye is temporary
Status: completed.

The eye icon had stopped working when "Hide account balances" was off, fixed 2026-10-19:
- The 2.2.0 audit had replaced the documented `hideBalances !== isRevealed` with `hide && !revealed`, which made the eye a no-op with the setting off (spec 003 ?5.6 expects it to toggle both ways: "Privacy off, tap to temporarily hide"). The XOR is restored, so the setting is the default and a tap flips it in either direction - matching the account picker, which never lost the behaviour.
- The temporary state is dropped when the setting changes (the new setting applies its own default) and when the screen regains focus (`useFocusEffect`, the same pattern as `useFocusLoad`), so leaving Home/Accounts and coming back shows the balances the setting asks for.
- Tests: `useBalanceVisibility` now covers both directions, the focus reset and the setting-change reset.
- Gate: `npm run test:all` green (137 files / 1151 tests).

Spec: spec/features/003-settings-screen/ (behaviour unchanged; the implementation matches it again).

## Formatting is enforced by ESLint (@stylistic), step 1: adopt the rules
Status: completed.

The style rules that used to live only in the docs are now machine-enforced, applied 2026-10-19. This is the first of **two** steps; the second one is the formatting pass described at the end of this entry:
- `@stylistic/eslint-plugin` (5.10.0) added; `FinlyApp/eslint.config.js` became `eslint.config.mjs` because the plugin is ESM-only (the expo config is imported as `eslint-config-expo/flat/default.js`, since that package has no `exports` map and a bare directory import is rejected in ESM).
- Rules that reported **nothing** on the current code are errors now, so they gate immediately: `indent` (2 spaces, `case` one level - the rule that would have caught the recent mis-indents), `jsx-quotes`, `jsx-indent-props`, `object-curly-spacing`, `array-bracket-spacing`, `template-curly-spacing`, `space-in-parens`, `space-before-function-paren` (house style: anonymous/async arrow always, named never), `arrow-spacing`, `keyword-spacing`, `space-before-blocks`, `space-infix-ops`, `key-spacing`, `padded-blocks`, `no-trailing-spaces`.
- Rules with existing violations are **warnings** until the formatting pass: `comma-dangle` (182), `eol-last` (29), `quotes` (12), `unicode-bom` (2), `no-multiple-empty-lines` (3), `semi` (1), `brace-style` (1), `no-multi-spaces` (1). Each carries a `// PR 2: promote to error` marker in the config.
- **`expo lint` only lints `src`/`app`/`components` when called without arguments**, so `tests/` had never been linted (which is why the test-file indentation slips passed CI). The scripts now pass `.` (`npm run lint`, plus the new `npm run lint:fix`), covering 385 files: `src`, `tests`, `scripts` and the root configs. Node globals are declared for `scripts/**`, and the test-only "probe component" pattern (assigning a module-level variable during render) has `react-hooks/globals` off under `tests/**`.
- `.editorconfig` at the repo root mirrors the style for editors (no `end_of_line`, deliberately: the committed blobs are LF while Windows checkouts are CRLF).
- Docs: `AGENTS.md` LINT section and CODE STYLE bullet, and the `npm run lint:fix` row in the commands table of the 9 READMEs.
- **Follow-up (next PR):** run `npm run lint:fix` (about 100 files, whitespace/trailing commas only) and promote the eight warning rules to `error` in the same commit.
- Gate: `npm run test:all` green (137 files / 1151 tests) with `npm run lint` at 0 errors; a deliberately mis-indented line fails the gate (verified, then reverted).

Spec: no behaviour change (tooling only).

## Formatting is enforced by ESLint (@stylistic), step 2: apply the fixes
Status: completed.

The follow-up of the adoption entry, applied 2026-10-19:
- `npm run lint:fix` normalised the codebase (111 files: 51 under `src`, 57 under `tests`, `App.tsx`, the eslint config and the local `finly-share` module) - trailing commas in multiline literals, final newlines, single quotes (two i18n values), two stray BOMs, double blank lines, plus the fixers of the enabled import/type rules (import order and merging, `Array<T>` to `T[]`). Whitespace, punctuation, quotes, import order and type aliases only: no behaviour change.
- The eight rules that shipped as warnings (`comma-dangle`, `eol-last`, `quotes`, `unicode-bom`, `no-multiple-empty-lines`, `semi`, `brace-style`, `no-multi-spaces`) are errors now, so the formatting block is fully strict and `npm run lint:fix` is the only way to apply style.
- `npm run lint` is at 0 errors and the 229 formatting warnings are gone. The remaining warnings are pre-existing and non-formatting: `boundaries/no-unknown-files` (151 - files outside the declared element patterns: tests, scripts, root configs), `@typescript-eslint/no-unused-vars` (13) and `react-hooks/exhaustive-deps` (3). They need code or config decisions, not a formatter, and are tracked separately.
- Gate: `npm run test:all` green (137 files / 1151 tests).

Spec: no behaviour change (formatting only).

## Privacy: hide balances and totals on every screen that shows an aggregate
Status: completed.

The "hide balances" setting now covers every aggregate the app displays, applied 2026-10-19:
- The toggle was renamed to **"Hide balances and totals"** (key `settings_hide_balances`, values only) and the eye labels to "Show amounts"/"Hide amounts" (`a11y_show_balances`/`a11y_hide_balances`), in all 9 languages: the setting no longer hides balances alone.
- The gaps are closed: the Home donut/bar chart total and every category row total are masked by the setting (the existing header eye covers them), and the All transactions period total and the Transactions category total are masked and gained their own eye icon, reusing `useBalanceVisibility` (so the focus reset applies).
- Deliberately unchanged: individual amounts stay visible - transaction rows, transaction details and recurring-rule amounts - because the setting covers balances and totals, not the records the user is browsing.
- Found and fixed on the way: `CategoryList`'s memoised row renderer was missing the new `hidden` dependency, so the rows would not repaint when the eye toggled.
- Tests: a new `DonutChart` component test, mask + toggle cases for `BarChart` and `CategoryList`, and screen cases for Home, All transactions and Transactions; the Personalization screen test follows the new label.
- The mask is always gray (`textSecondary`), never the green/red of the value it hides: the color would leak the sign of the total. Home's chart and category-row totals were still drawn in `text`, and the two new list headers colored the mask by the sign; all four now use the same gray as the header and Accounts. Category rows keep the name and the percentage visible.
- Gate: `npm run test:all` green (138 files / 1160 tests); verified in the browser at 375px (all 9 languages not applicable: text is unchanged except the renamed label, which the parity test covers).

Spec: spec/features/003-settings-screen/ (5.6), 001-home-screen, 014-transactions-screen-from-home, 015-all-transactions-screen.

## Recurring materialization: serialized runs and catch-up hardening
Status: completed.

Hardening pass on the reconciliation pipeline, applied 2026-10-19:
- Reconciliation runs are serialized behind a module-level queue, so the app-start/foreground/midnight triggers and the reconciliations a rule edit fires can no longer interleave their cursors; each run is now one DB transaction (matching spec 028).
- Each rule reads its already-generated occurrence dates once per run instead of querying per occurrence (one query per rule; the unique occurrence index stays as the last line of defence).
- `nextDueOnOrAfter` fast-forwards daily/weekly schedules in O(1) and jumps to the nearest period for monthly/yearly ones, so a decades-old rule can no longer silently exhaust the 10,000-probe guard and return a past date; ended schedules still stop at their first occurrence past the end date.
- The pause/resume switch is busy-guarded (disabled while the write is in flight; a ref also rejects a same-tick second tap).
- The service validates the rule invariants (blank name, non-positive/non-integer interval, end date not after the start) before writing; the name-length limit stays in the form so legacy rules remain editable.
- Repo hygiene: `updateWithTags` uses an explicit column allowlist, the dead `getTagsByRuleIds` is removed, and `RepeatSection` reuses the shared edit-cursor helper.
- Tests: validation cases, the fast-forward behaviour (including the ended-schedule stop), two concurrent reconciliation runs, the column allowlist and the toggle guard.
- Gate: `npm run test:all` green (139 files / 1180 tests).

Spec: spec/features/028-recurring-transactions/.

## Audit coverage: the remaining test gaps closed
Status: completed.

Tests added after the 2.2.0 audit, applied 2026-10-19:
- `CreateRecurringScreen` gained its missing suite (rule mode and labels, default account resolution, the custom-period single-day anchor, the existing-name preload and its failure tolerance, and the submit mapping to the service + Home type switch).
- Category delete messaging covers every path: transactions only, transactions + rules, no data (no move option) and the failed linked-data check.
- Both category transfer modals: target/delete selection, Confirm gating (nothing selected / not every item resolved) and cancel.
- `CalendarModal` (titles per period, day pick, confirm/cancel, custom range, reset on reopen) and `OptionPickerModal` (selection, search, no-results, short non-searchable lists).
- `useTransactionFilters` composes every filter at once (type + category + account + tag + search + period).
- Reconciliation: overlapping runs are serialized (two concurrent runs, no duplicates) plus the fast-forward and DST date-only matrix.
- Pure units: `utils/arrays`, `database/validate`, `utils/backupIO` (native + web) and `storage/indexedDb` (via `fake-indexeddb`, a new devDependency); the i18n function keys render in all 9 languages.
- `docs/harnesses.md` records the Node suite's limit (sql.js behind an `expo-sqlite` mock; the real driver is covered on device by the APK + Maestro) and that the drawer navigation is exercised by `flow-smoke`.
- Gate: `npm run test:all` green (150 files / 1249 tests).

Spec: docs/harnesses.md.

## Docs: drawer screenshot under a v3 name + roadmap cleanups
Status: completed.

Screenshot naming and release-notes cleanup, applied 2026-10-19:
- The refreshed drawer capture (Recurring entry, v2.2.0 footer) is published as `images/screenshots/v3-02-hamburger.png` and the 9 READMEs point at it. The shipped `v2-02-hamburger.png` is left untouched, so GitHub keeps the existing v2 set intact and only the new name renders as a new image.
- The rest of the screenshot set (every screen, including Recurring) is deferred to a pre-release task: a mock-data build will recapture everything as `v<N>-NN-...` (current version + 1) and update the 9 READMEs once the UI is final, because more UI changes may still land before 2.2.0.
- The 2.1.0 GitHub release line now reads as superseded by 2.2.0 (no separate `v2.1.0` tag), and the stray Status/Spec fragment after the form-hints entry was collapsed.
- Gate: docs/assets only; `npm run test:all` re-run green after the phase work.

Spec: none (documentation/assets).

## SQLite transactions: one queue, plus a self-healing seed
Status: completed.

Fixed after a 2.2.0 release-candidate device test (2026-10-19):
- **Root cause:** the app has a single SQLite connection, but explicit transactions were not serialized. The reconciliation run holds one transaction for a whole catch-up (up to 500 occurrences per rule), so an imported backlog could overlap "Delete all data", "Reset to factory state", an import or a config save; the loser failed with `cannot start a transaction within a transaction` and its `ROLLBACK` could undo the winner ("cannot rollback - no transaction is active"). The reset itself committed, but the collateral config save surfaced a generic error alert.
- **Fix:** `runExclusiveDb` (`src/database/transactionQueue.ts`) serializes every explicit transaction; both engines return the handle wrapped by it, so reconciliation, rule edits, config saves, delete-all, factory reset, import and migrations all share one queue and can never nest.
- **Self-heal:** `initDatabase` now repairs empty seeded tables (`users`/`accounts`/`categories`/`config`) left by a wipe interrupted in an older build, using the idempotent `INSERT OR IGNORE` seeds - existing rows are never modified and a deleted account is not resurrected.
- **Data screen feedback:** the destructive dialogs now show a spinner, disable Cancel and ignore a second confirm while the wipe/import runs (the reset can wait for a running catch-up).
- **Tests:** transaction-queue unit suite (ordering, rejection isolation, no overlap), concurrency tests (reset/clear/config save/import during a catch-up) and a self-heal suite (each empty table, half-applied wipe, idempotence).
- Gate: `npm run test:all` green (153 files / 1264 tests); device re-test of the import + reset flow after the rebuild.

Spec: spec/features/028-recurring-transactions/, spec/features/025-data-backup/.

## Transaction details: Created shows the record timestamp
Status: completed.

Display fix found while testing 2.2.0 on device, applied 2026-10-19:
- The footer's "Created" line was built from `transaction.date` (the transaction's own date, stored at `00:00:00` for a backdated pick) instead of `created_at`, so a transaction created today for 15 July read "Created 00:00 - 15 jul 2026". It now uses the record's `created_at`, matching the "Updated" line; the Date row above still shows the transaction date.
- The label stays "Created" (consistent with the recurring rule, tag and sort labels that also read `created_at`).
- No data changed: inserts never set `created_at` (the column default applies), so no migration was needed; spec 016 ?7 (which had codified the wrong field) was corrected.
- Tests: distinct `date`/`created_at`/`updated_at` fixture values in the details suite (both footer lines + the Date row) and a database test proving a backdated insert stores `created_at` as today.
- Gate: `npm run test:all` green.

Spec: spec/features/016-transaction-details-screen/.

## Transaction details: top-aligned rows and wrapping tag chips
Status: completed.

Layout fix found while testing 2.2.0 on device, applied 2026-10-19:
- All data rows now top-align the symbol/label with the first line of the value (single-line rows are visually unchanged). A 4096-character comment or a tall block of tag chips used to leave "Comment"/"Tags" vertically centred.
- With many tags the chip container demanded its full single-line width, so the basis-0 label collapsed to zero and disappeared (the chips were also clipped by the card). The container now takes the value column (`flex: 2`): chips wrap and right-align inside it, the label keeps its third, every tag is shown and the screen scrolls.
- `TagChip` is capped to its container and shrinks, so an over-long tag name ellipsizes instead of overflowing.
- Tests: a `DataRow` suite (top alignment) and a details case with 12 long tags plus a long comment (labels present, all chips rendered, value column `flex: 2`).
- Gate: `npm run test:all` green; verified in the browser at 375px.

Spec: spec/features/016-transaction-details-screen/.

## Recurring catch-up: raise the run limit and refuse impossible backfills
Status: completed.

Edge-case fix found while testing 2.2.0 on device, applied 2026-10-19:
- The per-rule catch-up limit is 5,000 occurrences (daily ~13.7 years, weekly ~96 years) and the same limit guards creation/editing. A rule whose due backlog exceeds it cannot be saved: the Summary and the bottom hint explain it, Save is disabled, and the service throws `tooManyOccurrences` without writing anything. The advice adapts to the draft - "Move the start date later or add an end date" when none is set, "Move the start date later or set an earlier end date" when one already exists.
- Every accepted rule now catches up completely on save: a daily rule started in 2014 generates all 4,668 occurrences in one run, so its next due date is always in the future instead of a past cursor stuck at 500 rows. Rules already behind finish catching up on the next launch.
- The Recurring row keeps showing the generated count ("N transactions"), never the pending backlog.
- Tests: preview truncation and exact counts, the warning line in the Summary (create and Future + past), the form hint/disabled Save, the service rejection, and a 4,481-occurrence single-run backfill.
- Gate: `npm run test:all` green (155 files / 1277 tests); blocked case verified in the browser.

Spec: spec/features/028-recurring-transactions/.

## Import: reject incomplete backups
Status: completed.

Edge case found after the self-heal test, applied 2026-10-19:
- A parsed backup that is valid JSON/schema but incomplete (no user, no account, or no expense + income category) is now rejected **before any write**. A genuine export always contains them; importing an empty file left the app unable to create categories (the missing `users` row failed the FK) until the next-launch self-heal.
- `assertImportableBackup` (pure, in `backup.ts`) runs inside `importBackup` after the newer-version check and before `applyBackup`, so the current data is untouched and the user sees a dedicated "Incomplete backup" alert (title + message, 9 languages) instead of the corrupt-file "Invalid backup".
- Tests: the pure check (valid + empty users/accounts/missing category type), an import facade test asserting the data dump is unchanged, and the Data screen branch.
- Gate: `npm run test:all` green; verified in the browser (empty backup rejected, real backup imports).

Spec: spec/features/025-data-backup/.

## Accounts and Categories: sortable lists
Status: completed.

Added while polishing the list screens, applied 2026-10-19:
- **Accounts** gained a `SortToggle` (`SortRow`) below the search controls: **Name** (default, ascending) or **Balance** (descending on the first press). The direction flips from the active field or the arrow. The **Total account stays pinned first** (it is an aggregate, not a real account) and sorting applies to the searched subset; ties break by display name, then id.
- **Categories** gained the same toggle: **Name** (default, ascending) or **Usage** (lifetime transactions, descending). Each tile shows its lifetime count as a small gray badge over the icon (hidden at 0, appended to the accessibility label); **Others/Other stay pinned last**. Type tabs, search and multi-select work on the sorted subset.
- New `ACCOUNT_SORT_BY`/`CATEGORY_SORT_BY` constants, pure `utils/accountSort`/`utils/categorySort` helpers, `SortToggle` field builders and four i18n keys in the 9 languages.
- Both sorts are session-only for now, consistent with the other lists; remembering them is a separate follow-up.
- Tests: the sort helpers (pinned rows, natural directions, ties, no mutation), the Accounts order and direction flip, the Categories usage order + counts + pinned fallback, and the CategoryGrid count badge.
- Gate: `npm run test:all` green; verified in the browser at 375px.

Spec: spec/features/011-accounts-screen/, spec/features/008-categories-screen/.

## Persisted list sort preferences
Status: completed.

Added while closing the sort work, applied 2026-10-19:
- Every sortable list stores its field and direction in the `config` table and restores them on the next visit and after a restart: Tags, Comments, Recurring, Transactions, All transactions, Accounts and Categories (**14 keys**, snake_case in `DB_KEY_MAP`).
- **Transactions** and **All transactions** keep **independent** preferences (`transactions*` vs `allTransactions*`); filters and search stay session-only.
- Defaults mirror the previous in-memory behaviour: Tags `created/asc`, Comments `name/asc`, Recurring `nextDue/asc`, both transaction lists `date/desc`, Accounts `name/asc`, Categories `name/asc`.
- No migration: `parseConfig` merges `DEFAULT_CONFIG` and fresh databases are seeded from it. Values are validated by Zod enums (an invalid value falls back to the defaults, like the rest of the config).
- Screens **derive** the sort from `useConfig()` (no local sort state) and persist through `updateConfig`, so the choice survives the drawer remounts; a `sortPreference` helper centralizes the flip/switch rules and `TRANSACTION_SORT_SCOPES` selects the transaction pair. The test config stub now merges partials and re-renders like the real provider.
- The preferences travel in JSON backups (config rows) and return to defaults after a Factory reset.
- Tests: the sort helpers, Zod/sanitize cases, a config get/save round-trip on both engines, screen restore + persist assertions and the transaction hook scope tests.
- Gate: `npm run test:all` green; verified in the browser at 375px (each list keeps its sort after navigating away and a full reload).

Spec: spec/features/008-categories-screen/, 011-accounts-screen/, 014-transactions-screen-from-home/, 015-all-transactions-screen/, 018-tag-management/, 027-comments-management/, 028-recurring-transactions/.

## Two-row transaction controls
Status: completed.

Added while polishing the transaction lists, applied 2026-10-20:
- **Transactions** and **All transactions** split their controls into two rows: the recurring-view chip (plus the category pill on All transactions) on the first row, and the Date/Amount `SortToggle` on a second row inside the shared `SortRow`.
- The split keeps every control visible at a glance on a 375px screen; the first row still scrolls horizontally for long category selections or large text sizes, and the sort row keeps the standard 10px padding used by the other list screens.
- No behaviour change: the recurring view, category filter, sort and their persisted preferences work exactly as before.
- Specs 014/015 updated (020 location note included); changelog entry added.

Spec: spec/features/014-transactions-screen-from-home/, spec/features/015-all-transactions-screen/.

## Controls group spacing (16px)
Status: completed.

Added after the two-row controls, applied 2026-10-20:
- Standardized the separation between the account/balance header and the filter rows on **Transactions**, **All transactions** and **Recurring** at **16px**: the controls stack keeps its 8px gap and a shared `CONTROLS_GROUP_TOP_GAP` margin adds the other 8px.
- **Recurring** split its status filter and sort into two rows (status pill, then the sort row), matching the transaction screens; the account selector sits 16px above the status pill.
- Intra-group spacing stays 8px and the sort row keeps the shared `SortRow` padding, so the filter and sort rows stay visually grouped. No behaviour change.
- Specs 014/015/028 and the changelog updated.

Spec: spec/features/014-transactions-screen-from-home/, spec/features/015-all-transactions-screen/, spec/features/028-recurring-transactions/.

## Multi-line text in rows
Status: completed.

Added while auditing ellipsized text, applied 2026-10-20:
- `ListItemRow` gained `titleLines` / `subtitleLines` (default 1), so callers decide the cap without touching the shared layout.
- **Accounts**: the note shows up to **3 lines** (matching the 3-line note input), then ellipsizes.
- **Comments**: the comment text shows up to **2 lines**. **Transactions**: the description shows up to **2 lines**. **Recurring**: the rule name shows up to **2 lines**. The category header on Transactions shows up to **2 lines**.
- **Transaction details**: the recurring rule name wraps fully (no line cap), like the description.
- **Recurring status chip**: label width raised from 120 to 160, so "Active + Paused + Ended" is not clipped.
- Left as-is on purpose: category tiles (a square 22% tile cannot fit a second line without clipping), pills/chips (account trigger, category button, tag chips), modal/picker rows, chart totals, buttons and metadata lines.
- Tests: `ListItemRow` line props, plus Accounts, Comments, TransactionGroup, RecurringRow and details assertions.
- Specs 011/014/016/027/028 and the changelog updated.

Spec: spec/features/011-accounts-screen/, 014-transactions-screen-from-home/, 016-transaction-details-screen/, 027-comments-management/, 028-recurring-transactions/.

## Drawer and header labels
Status: completed.

Added while fixing truncated translations, applied 2026-10-21:
- **Drawer:** labels render on up to **two lines** (a custom label node, since the library clamps string labels to one), so long menu entries such as Spanish "Todas las transacciones" are fully visible at 375px and with Large text size; short labels stay on one line.
- **Headers:** every title keeps the same size (`fs(17)`, scaled only by the Settings text size); long titles wrap to **two lines** inside a bounded width, so German "Wiederkehrende Regel bearbeiten" (31 chars), French "Modifier la règle récurrente" or Spanish "Detalles de la transacción" are fully visible without a compact font. The tail ellipsizes only beyond two lines.
- Browser-checked in French/Spanish/German at 375px and 320px (including Large text); Android clipping to be confirmed with the APK.
- `spec/constitution/6-screens.md` (Drawer Navigator + Header Title Alignment), changelog updated.

## Category pill labels
Status: completed.

Added while fixing the truncated filter pill, applied 2026-10-21:
- **All transactions** category filter now uses shorter type-aware labels in all 9 languages: **All categories** (All tab), **All expenses** (Expenses), **All income** (Income). The longest is French "Toutes les dépenses" (19 chars), down from 33 ("Toutes les catégories de dépenses").
- The pill text cap went from 120 to 160, so the label is shown in full (no ellipsis) in every language; the filters row scrolls horizontally only for a large text size or a 320px screen, never clipping the text itself.
- Verified in the browser with the longest languages (fr/es/ca/gl/pt) on the three tabs; spec 015 and the changelog updated.

Spec: spec/features/015-all-transactions-screen/.

## Recurring card error tint
Status: completed.

Added while improving the over-limit feedback, applied 2026-10-21:
- The recurring form card turns **red** (border + background, `recurringCardErrorColors` next to the primary `recurringCardColors`) while the draft would create more than **5,000** transactions, and returns to the primary tint as soon as the draft is valid.
- It uses the same `tooManyOccurrences` flag that blocks Save, so it works in **create and edit** (including the scope-aware Future + past back-fill) and always matches the bottom hint. The paused state creates nothing and therefore stays in the primary tint.
- Tests cover the primary/red card styles and an edit that would exceed the limit; spec 028, `6-screens` and the changelog updated.

Spec: spec/features/028-recurring-transactions/.

## 2.2.0 data-safety hardening
Status: completed.

Added in the pre-release audit, applied 2026-10-21:
- **Config:** `sanitizeConfig` validates every field on its own; one corrupt value (a legacy/manual DB) no longer resets the theme, language or sort preferences.
- **Accounts:** deleting the pseudo-total account (individually or in bulk) is guarded before the linked rows, so its transactions are never deleted.
- **Backups:** the snapshot requires the app user (`USER_ID = 1`), reads all 9 tables inside one transaction, and refuses imported recurring rules with an out-of-range interval, a non-date-only field or `start > end`; `applyBackup` re-checks completeness and the service awaits `initDatabase()` before export/import.
- **Web persistence:** IndexedDB open/read failures fail closed (no empty-DB overwrite); a failed write is retried once and then surfaced with a one-time localized alert; a failed `BEGIN` no longer leaks the transaction counter (which used to disable persistence for the session).
- **Recurring:** create/edit are atomic (rule + tag links + catch-up occurrences + past patch in one transaction); the service validates the built schedule start (last-day rules), mirrors the form cap with the existing occurrence dates, and rejects `interval > 99`.
- **Tests/config:** per-field config, total-account deletes, strict imports, atomic recurring failure injection, IndexedDB failures, BEGIN leak, deterministic concurrency; the suite timeouts were raised (the 5s default flaked under parallel load) and the sqlite harness marks its schema as migrated. `npm run test:all` green x3.
- **Release metadata:** `versionCode` stays **3** (the 2.2.0 bump landed in `e2dcbda`; the 2.1.0 artifact is versionCode 2). The image-picker plugin now declares camera/photos strings and blocks `RECORD_AUDIO` (prebuild-verified).

Specs: 025, 028, 7-platform-differences.

## Category filter presets
Status: completed.

Added while refining the All transactions filter, applied 2026-10-21:
- The category filter modal now shows **preset chips** instead of the single "All" chip: **All categories / All expenses / All income** on the All tab, and only the matching preset on the Expenses/Income tabs. Tapping a preset selects its exact set; tapping the active one clears the selection.
- The Apply label is computed from the **selection**: empty keeps the type-aware no-filter label, an exact full set reads **Apply (All categories / All expenses / All income)**, and any other selection reads **Apply (N)**.
- The screen pill names the applied selection the same way, so selecting every expense (or income) category on the All tab shows **All expenses / All income** instead of a raw count.
- A shared `utils/categoryFilterSelection.ts` (`classifyCategorySelection`) drives the modal and the pill; `filter_apply_all` now reads "Apply (All categories)" in the 9 languages.
- Tests: classifier unit tests, modal presets/manual-set/apply labels, screen pill; spec 021, spec 015, changelog.

Spec: spec/features/021-category-filter-modal/, spec/features/015-all-transactions-screen/.

## 2.2.0 accessibility and cleanup pass
Status: completed.

Added before the 2.2.0 release, applied 2026-10-21:
- **Accessibility:** list rows and category tiles expose `button` roles and their selected state; sort fields/tabs/filter chips expose roles and `selected`; the sort arrow announces the direction action (ascending/descending) instead of repeating the field; the FAB, eye/select toggles, day picker, calculator, tag add/close, settings pickers, detail photo thumbnails and the Home chart toggle have roles/labels; `ToggleRow` is a single switch focus stop; DayPicker today/selected suffixes and the stepper +/- are localized (7 new keys in the 9 languages).
- **Lists:** no empty-state flash while loading (a centered spinner instead), `removeClippedSubviews` removed from the transaction list (iOS blank rows), the date sort compares the fixed timestamp strings instead of parsing dates, and localized sort/search results refresh immediately on a language change.
- **Errors:** the recurring rule-name load and the comments load are logged and surfaced; the App database failure shows a localized message plus the raw details. All developer logs use the shared `ERROR_PREFIXES` vocabulary through `logError(prefix, error, ...extra)` (screens, contexts, hooks, `ErrorBoundary`, web persistence, photo cleanup), so no call site hardcodes a prefix.
- **Lint:** `npm run lint` now enforces **0 warnings** (`--max-warnings 0`). `boundaries/no-unknown-files` is off for tests/scripts/modules/root files (they are not app layers), the unused vars/imports and App effect dependencies are fixed, and dead code (`FormError`, two i18n keys) was removed. The drawer inactive icons use the secondary color.
- **Tests:** role/state assertions (rows, tiles, sort, tabs, toggle), the loading state, and a language-change reorder test; `npm run test:all` green twice (161 files / 1341 tests).

## v3 release screenshots
Status: completed.

Added before the 2.2.0 release, applied 2026-10-22:
- The full 20-screen set was recaptured as `v3-*` (the refreshed hamburger is `v3.1-02-hamburger.png`, so GitHub renders it as a new file instead of a modified one) from a committed mock backup (`FinlyApp/scripts/screenshots/fixture.json`): 4 accounts, all 31 categories, 16 October 2026 transactions, 5 tags, 3 recurring rules and the English/dark/EUR configuration. The two empty-state screens are captured from a fresh context before importing it.
- A reusable one-command workflow (`npm run screenshots`) drives the real web app with Playwright Core and installed Chrome: it starts/stops Expo on 8081, freezes the clock at 2026-10-21, imports the fixture through Settings -> Data -> Import, navigates the manifest, and writes 375x812 PNGs. Options: `--set`, `--only`, `--no-server`, `--url`, `--out`.
- The 9 READMEs now point at the `v3-*` set, with new Category filter, Comments and Recurring screenshots and translated captions; the old `v2-*` files stay for history.
- Guards: `tests/tooling/screenshots.test.ts` validates the fixture with `parseBackup` (references/IDs) and asserts the 9 READMEs reference the same existing images; `docs/screenshots.md` documents fixture rules, naming/versioning and how to add a screen.
- `npm run test:all` green (162 files / 1343 tests); Playwright Core is a dev dependency and the dev server is always cleaned up.

## v3.2 expanded screenshot set
Status: completed.

Follow-up after the first v3 screenshot PR, applied 2026-10-22:
- Expanded the set to **30 screens** in drawer order: Home, hamburger, Add transaction/date picker, All transactions (empty/list/filter/details/modify), Recurring (list/new/edit), Accounts (list/create/modify), Categories (list/create/modify), Tags (list/create/modify), Comments (list/edit) and Settings with its four subpages last.
- Added the missing Modify transaction, New/Edit recurring rule, Create/Modify account, Create/Modify category, Create/Modify tag and Edit comment screenshots; create forms use filled examples and recurring forms capture the schedule section.
- Every image now uses `v3.2-<index>-<slug>`; the old `v3-*` and `v3.1-*` assets were removed and all 9 READMEs now follow the manifest order exactly.
- `tests/tooling/screenshots.test.ts` imports `SCREENS`/`SET` and asserts the 9 READMEs reference the exact ordered file list, so the README can no longer drift from the capture order.
- `npm run test:all` green (162 files / 1343 tests).

## 2.2.0 audit hardening
Status: completed (iOS simulator build passed; runtime not tested).

Release-hardening pass from the final app audit, applied 2026-10-22:
- Home headline now uses the active account balance from `accountsWithBalance`, restoring `initial_balance` to the displayed total (spec 026).
- Photo edits are deferred: removing a photo only changes form state, files are deleted after a successful save/delete, and the details screen relies on the transaction repository's post-commit cleanup.
- Backup imports cancel the web picker fallback timer, wait for `FileReader`, surface read errors, enforce `USER_ID` scoping/a real non-total account/category-type consistency, and normalize legacy date-only transaction dates to full timestamps for 2.1.0 compatibility.
- Web IndexedDB absence/open failures fail closed, and writes resolve only after the IndexedDB transaction commits.
- Added `FinlyShare.podspec`, the `preview-simulator` EAS profile and the missing `MissingCurrentViewControllerException`; the free EAS iOS simulator build **427cb65f** finished successfully, verifying Swift compilation and module linking. Runtime/share-sheet behavior still needs a Mac or device. Native photo backups remain URI-only by design for 2.2.0 (documented in 025).
- `npm run test:all` green (162 files / 1347 tests). iOS runtime/share testing remains unverified without a Mac or physical device.

## 2.2.0 state and race hardening
Status: completed.

Batch B1 from the final audit, applied 2026-10-22:
- AppContext now loads recurring materialization + reference data once (gated by ConfigContext loading), applies Home defaults without reloading, initialises the period from config, guards stale async results and only replaces an invalid/deleted active account.
- ConfigContext merges updates from the latest config, serializes repository saves, rolls back only the fields of the failed update and returns a Promise; DataScreen applies the new config before resetAll.
- OptionPicker now tracks option values (not labels) and useResetOnOpen is edge-triggered; duplicate-name checks, comment suggestions, selection mode, bulk deletion and useFocusLoad have race/re-entry guards.
- `npm run test:all` green (162 files / 1353 tests).

## 2.2.0 UI and period correctness
Status: completed.

Batch B2a from the final audit, applied 2026-10-22:
- Week period math, labels, navigation and the week picker now share `firstDayOfWeek`; Sunday-first weeks use Sunday-Saturday consistently.
- Amount sorting renders a flat list without date headers; each row shows its date.
- The bulk-category transfer flow uses one modal with two inline steps instead of nesting a second RN Modal (iOS-safe).
- Home list clears the FAB; ColorGrid wraps on narrow screens; TagSection clears hidden search; MonthGrid only highlights the matching year; disabled destructive buttons use inactive colors; ModifyAccount/TransactionDetails show a loading spinner.
- The shared account pill can show longer localized names (e.g. Catalan "La meva cartera") without premature ellipsis.
- `npm run test:all` green (162 files / 1355 tests), plus browser checks for the Catalan account pill, Sunday-first week label and flat amount-sorted list.

## 2.2.0 amount-sort row order
Status: completed.

Follow-up after device review, applied 2026-10-22:
- Added a `meta` slot to ListItemRow between the title and subtitle.
- Amount-sorted transaction rows now show the date (calendar icon + semibold text) before the comment, followed by tags and the recurring name: Type -> Date -> Comment -> Tags -> Recurring.
- Tests cover the meta order and the date-before-comment layout; `npm run test:all` green (162 files / 1358 tests).

## 2.2.0 contextual date icons
Status: completed.

Applied 2026-10-22:
- Added a shared DateIcon: calendar for scheduled/current dates, time for historical metadata.
- Calendar icons now mark Date-sort section headers and the tappable period button; time icons mark Tags "Created on", Comments "Last used" and Recurring "Created on"; Recurring "Next due" keeps a calendar icon.
- Transaction details now show a time icon beside "Created" and a refresh icon beside "Updated"; the day/end-date inputs keep their existing calendar icon.
- Date label top spacing moved from the text to the row, so clock and calendar icons align with their labels.
- Tests assert the icons in the date header, period button, tags, comments, recurring rows and details footer; `npm run test:all` green (162 files / 1359 tests).

## 2.2.0 custom period range wording
Status: completed.

Applied 2026-10-22:
- Custom period ranges always render on two lines: start on top, end below, with the full-width button and no empty arrow slots.
- Replaced the generic "from ... to ..." wording with localised start/end phrases and standard connectors in all 9 languages, keeping the app's capitalised month names.
- The start year is shown only when the range crosses a year boundary; the calendar modal header uses the same range wording.
- Added all-language range tests and verified Home/All transactions at 375px; `npm run test:all` green (163 files / 1371 tests).

## 2.2.0 compact calendar strings
Status: completed.

Applied 2026-10-23:
- Day period uses the short month in the compact box (e.g. `22 Oct 2026`); the calendar modal keeps the full date.
- Week period stays one line with short months; the week modal subtitle now uses full month names and the year, while week rows keep short months.
- Period button horizontal padding reduced to 12px so short day/week strings remain safe on narrow screens and large text.
- Renamed the custom "All" shortcut to "This year" and removed the redundant top title line; it selects 1 January to today.
- Added formatter and calendar tests; browser-verified day, week, modal subtitle and this-year states at 375px; `npm run test:all` green (163 files / 1373 tests).

## 2.2.0 period range presets
Status: completed.

Applied 2026-10-23:
- Replaced the custom period square with the standard CheckboxRow checkbox and check mark.
- Added quick ranges in a centred, equal-column grid: This year / 12 months, then 30 days / 90 days; the checked preset is derived from the current range, so editing the calendar unchecks it and selecting a matching range checks it automatically.
- Applying a preset keeps the calendar visible with that range selected; pressing the active preset re-applies it.
- 30/90 days include today (29/89 days back); 12 months shifts the calendar by 12 months.
- Week modal subtitles now show both years when a week crosses a year boundary, e.g. 29 December 2025 - 4 January 2026.
- Calendar modals now size to their content up to a 94% height cap with a fixed header, scrollable body and fixed Cancel/OK footer; Month and Year use a 3x4 grid.
- The custom period picker always shows the start/end indicator and resets to start-date selection after an end date is chosen.
- The start/end instruction uses the muted left-aligned hint style instead of a button-like surface.
- Calendar headers now reserve two left-aligned information lines; Week shows both full start/end dates with years, and Period keeps its Desde/hasta range there.
- Period presets and the indicator now sit below the calendar, while Month and Year reserve an empty Month-row spacer for vertical alignment.
- Added year-page and week-row accessibility labels, consolidated week formatting around the shared week-lines helper, mapped the preset checkboxes and named the Month-row spacer.
- The Period header hides the end line while choosing an end date, avoiding a duplicate date; removed the unused DateTimePicker dependency and config plugin.
- The 94% cap keeps the Period hint visible on short screens; added preset, cross-year/week-line and modal header tests; browser-verified all pickers at 320/375px; `npm run test:all` green (165 files / 1386 tests).

## 2.2.0 multiline inline counters
Status: completed.

Applied 2026-10-25:
- Multiline fields now place the counter inside the input at the bottom-right: transaction Comment, Modify comment and Account note.
- Single-line name fields keep the counter below the input; their five spacing variants were normalized to the shared `formStyles.counter`.
- Added a reusable `LabeledTextField` `inlineCounter` variant and shared inline tokens in `formStyles`; CommentInput uses the same tokens.
- Updated the account/comment specs, `6-screens.md`, harness baseline and tests; browser-verified the account note and Modify comment at 375px; `npm run test:all` green (165 files / 1389 tests).

## 2.2.0 post-audit data/state batch
Status: completed.

Applied 2026-10-25:
- Config saves now recover the persisted values after a failed queued write, so an older failure cannot silently drop a newer preference.
- Factory reset, delete-all-data and import collect old native photos first and delete them only after the write commits; import keeps URIs still referenced by the new snapshot.
- Web holds an exclusive `finly-db` lock; a second tab is blocked with a Try again action instead of overwriting the first tab's IndexedDB snapshot.
- Refreshing accounts replaces the active account object, and refreshing/deleting tags prunes invisible Home and local tag filters.
- Recurring delete now reports failures and ignores a second confirm while the first is running.
- Startup reference-data failure shows a retry screen instead of an infinite Home spinner.
- WeekPicker, MonthGrid and YearGrid follow the date prop so reopening after a fast-arrow date change shows the correct page.
- Updated specs, platform notes, harness baseline and changelog; browser-verified the two-tab guard at 375px; `npm run test:all` green (168 files / 1410 tests).

## 2.2.0 calendar edge cases
Status: completed.

Applied 2026-10-25:
- Custom-range OK is disabled while the picker is waiting for the end date; tapping the same day twice creates a one-day range.
- Compact week labels add both years only when the week crosses a year boundary.
- Added shared `useToday` hook: refreshes at midnight and when the app/tab becomes active, used by the calendar pickers and DaySelector.
- Added 90-day/12-month preset, minDate forwarding and cross-year week tests; browser-verified the custom-range OK state at 375px; `npm run test:all` green (169 files / 1415 tests).

## 2.2.0 form accessibility
Status: completed.

Applied 2026-10-25:
- Account picker now exposes a button role and `Account: <name>` label; its chevron is decorative.
- `LabeledTextField` uses the visible label as the accessible name, covering the Account Note field.
- Photo add/remove and source options have button roles; the add tile is labelled "Add photo".
- Comment suggestions are real pressable/focusable buttons, preserving the blur guard.
- Section titles expose a heading role; decorative icons and the amount currency symbol are hidden.
- Added selected/disabled states, disabled-stepper opacity and larger hit areas for small icon actions.
- Updated form accessibility docs and tests; browser-verified the account/photo/heading labels at 375px; `npm run test:all` green (170 files / 1418 tests).

## 2.2.0 comment suggestions polish
Status: completed.

Applied 2026-10-25:
- Moved the suggestions panel inside the Comment section, below its header and above the input, so it no longer touches the Tags area.
- Added a bulb icon, localized **Suggestions** heading and **Tap to reuse** hint, plus 44px rows.
- Updated Add/Modify comment specs and accessibility docs; browser-verified the panel at 375px; `npm run test:all` green (170 files / 1418 tests).

## 2.2.0 input robustness
Status: completed.

Applied 2026-10-26:
- `LabeledTextField` now keeps legacy values above the configured limit editable (`maxLength = max(limit, value.length)`); the raw Comment and Modify Category inputs do the same.
- Inline counter padding is derived from the scaled counter height (app text size and OS font scale), so Comment/Note counters do not overlap at Large text.
- Added over-limit and large-text tests for LabeledTextField, CommentInput, ModifyCategory, CreateAccount Note and Modify Comment; test:all green (170 files / 1425 tests).

## 2.2.0 backup safety
Status: completed.

Applied 2026-10-26:
- Backup import now validates `next_due >= start_date`, recurrence anchor ranges, `active` flags, account/category/rule/tag references and generated-transaction recurrence dates before writing.
- Transactions and rules that reference the Total account are rejected.
- Native photo cleanup only deletes files under the app documents/photo root; arbitrary `file://` URIs from imported backups are ignored.
- Added backup and photo allowlist tests; test:all green (170 files / 1427 tests).

## 2.2.0 serialized direct writes
Status: completed.

Applied 2026-10-26:
- Reproduced the direct-write/catch-up rollback at the SQL engine level: a tag write issued while a transaction awaited was rolled back with it.
- Added `runExclusiveWrite`/`serializeWrites` and routed standalone account, category, tag, recurring and comment writes through the same queue as explicit transactions.
- Transaction internals keep their non-queued repository calls, avoiding nested queue deadlocks.
- Added a concurrency regression test; test:all green (170 files / 1428 tests).

## 2.2.0 modal keyboard lift
Status: completed.

Applied 2026-10-26:
- Fixed hidden modals accumulating keyboard height: `useKeyboardLift` now only grows while the modal is visible and resets while hidden.
- This prevents the Month/Week/Year picker from opening clipped at the top after a form keyboard was used.
- Added a regression test and verified the Month modal centered on the Android release APK; test:all green (170 files / 1429 tests).
