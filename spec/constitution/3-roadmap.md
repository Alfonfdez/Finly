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

c) Chart section:
  - Donut chart (SVG) with expenses/income by category.
  - Can switch to horizontal bar chart by tapping on it.

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
- Personalization: Home screen defaults (account, period), Add transaction defaults (account, optional fields), Privacy (hide account balances with eye icon).
- Data: Delete all transactions, Delete all data (settings kept), Reset to factory state (all double-confirmation flows).

Persistent config in SQLite on both platforms. 7 new config fields.

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

Spec: spec/features/013-create-account-screen/.

## 014-transactions-screen-from-home
Status: completed.

Filtered transaction list screen by category, account, and period, accessible from the home screen (HomeScreen) by tapping a category in the breakdown:
- Stack navigator header with "Transactions" title (multilingual).
- Category section: icon + name + total with color (green/red) and prefix (+/-).
- Account selector with selection modal (radio + icon + name + balance).
- Sorting by date or amount with ASC/DESC toggle.
- List grouped by day with date header.
- Centered "+" FAB to navigate to add transaction.
- Passes categoryId, type, period, startDate, endDate as navigation parameters.
- Layout: SafeAreaView > View.container(flex:1) > [categoryInfo, controls, SectionList, FAB].

Spec: spec/features/014-transactions-screen-from-home/.

## 015-all-transactions-screen
Status: completed.

Independent `AllTransactionsScreen` accessible from the hamburger menu (drawer) or the stats icon on HomeScreen, with advanced filtering:
- **Type tabs** (All | Expenses | Income) — default "All", filters by transaction type.
- **Category filter** — multi-select category modal (021) with search, "All" chip, type-aware sections.
- **Period selector** — PeriodTabs + CalendarPicker, shared with HomeScreen via AppContext. Default "Year" (current year). Custom range: Jan 1 → today.
- Account selector with period total balance (green/red), updated by all active filters.
- Sorting by date or amount with ASC/DESC toggle.
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
- Data card with 5 rows: Amount (with type color), Account (icon + name), Category (icon + name), Date (multilingual long format), Comment (or "No comment").
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
- Maximum of 50 tags (Create button disabled + inline message when reached; "+" FAB on Tags screen and "+ Add tag" chip in the transaction form hidden at the cap).
- Modify/delete tag screen with name edit and delete confirmation.

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

Spec: spec/features/027-comments-management/.

## 033-bulk-delete-tags-comments
Status: completed.

Multi-select bulk delete on the Tags and Comments screens:
- Header "Select"/"Done" toggle on both screens enters selection mode (rows show checkboxes; tapping toggles selection instead of navigating; header search keeps filtering during selection).
- Shared `SelectionActionBar` bottom bar with "Cancel" and `Delete (N)` (disabled when nothing selected).
- Single `ConfirmationModal` per batch: `Delete N tags?` / `Delete N comments?` with Cancel / Delete.
- `tagRepo.deleteMany(ids)` deletes tags in one query (junction rows cascade) + `transactionRepo.deleteComments(values)` clears `description` on every matching transaction; screens reload after delete (`refreshTags()` / `getDistinctComments()`).
- i18n keys `tags_select*`/`tags_bulk_delete*` + `comments_select*`/`comments_bulk_delete*` (en/es/ca).
- Tests: 2 new contract tests (tags `deleteMany`, comments `deleteComments`) on both native + sql.js backends.

Spec: spec/features/018-tag-management/ and spec/features/027-comments-management/.

## 034-limit-indicators
Status: completed.

Usage counters against the limits on the Categories and Tags pages:
- Tags screen: a caption above the list shows how many tags exist out of the 50-tag maximum (`MAX_TAGS`), e.g. "12 of 50 tags" (`tags_counter`), hidden during selection mode.
- Categories screen: a caption below the Expense/Income tabs shows how many categories the active type has out of the 30-per-type maximum (`MAX_CATEGORIES_PER_TYPE`), e.g. "21 of 30 categories" (`categories_counter`), updating when switching tabs.
- i18n keys `tags_counter` and `categories_counter` (en/es/ca).

Spec: spec/features/018-tag-management/ and spec/features/008-categories-screen/.

## 001-expo-sqlite-wal-cleanup (infrastructure)
Status: completed.

Self-healing recovery for the expo-sqlite WAL sidecar bug:
- `initDatabase()` detects stale state (version present but `tags` table missing in `sqlite_master`).
- On detection, deletes the database file (`.db`, `-wal`, `-shm`), reopens, and reruns all migrations (001-005).
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
- All five repositories are rewritten with the Drizzle query builder (behavior-preserving); writes use `.run()` (never `.returning()`, which would skip web persistence); collations/functions stay as parameterized `sql` fragments.
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
