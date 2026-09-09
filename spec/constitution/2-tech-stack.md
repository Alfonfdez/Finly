# Tech Stack

## Languages and tools
- **React Native** (Expo managed workflow, SDK 57) — main framework for iOS and Android.
- **TypeScript** — static typing for the codebase.
- **React Navigation** (native-stack + drawer) — screen navigation.
- **SQLite** (expo-sqlite) — local persistence on native. Versioned migrations (`PRAGMA user_version`, SCHEMA_VERSION 3): initial schema (`001_initial`), seed (`002_seed`), and config defaults (`003_config`), each applied once inside a transaction.
- **@expo/vector-icons** (Ionicons) — icon library used throughout the app.
- **react-native-svg** — custom donut chart and bar chart.
- **reanimated-color-picker** — dynamic color picker (CreateCategoryScreen).
- **@react-native-community/datetimepicker** — native date picker.
- **React Context** — global app state (AppContext + ConfigContext).
- **react-native-reanimated** — animations and worklets.
- **react-native-gesture-handler** — gesture support (required by navigation and drawer).
- **react-native-screens** — native screen optimization.
- **react-native-safe-area-context** — safe area management.

## File structure (React Native with Expo project)

```
FinlyApp/
+-- app.json                          <- Expo config (name, version 2.0.0, package com.finly.app)
+-- App.tsx                           <- main entry: DB init + splash + providers
+-- tsconfig.json
+-- package.json
|
+-- src/
|   +-- navigation/
|   |   +-- AppNavigator.tsx          <- Stack + Drawer navigator
|   |
|   +-- screens/
|   |   +-- HomeScreen.tsx            <- home screen (dashboard)
|   |   +-- AllTransactionsScreen.tsx <- all transactions (015)
|   |   +-- TransactionsScreen.tsx    <- transactions by category (014)
|   |   +-- TransactionDetailsScreen.tsx <- transaction details (016)
|   |   +-- AddTransactionScreen.tsx  <- add expense/income
|   |   +-- ModifyTransactionScreen.tsx <- modify transaction (017)
|   |   +-- CommentsScreen.tsx        <- comments list (024)
|   |   +-- ModifyCommentScreen.tsx   <- edit/delete comment
|   |   +-- AccountsScreen.tsx        <- account list
|   |   +-- CreateAccountScreen.tsx   <- create account
|   |   +-- ModifyAccountScreen.tsx   <- edit account
|   |   +-- CategoriesScreen.tsx      <- category list
|   |   +-- AddCategoryScreen.tsx     <- category section of the transaction form
|   |   +-- CreateCategoryScreen.tsx  <- create category
|   |   +-- ModifyCategoryScreen.tsx  <- edit category
|   |   +-- TagsScreen.tsx            <- tags list
|   |   +-- CreateTagScreen.tsx       <- create tag
|   |   +-- ModifyTagScreen.tsx       <- edit tag
|   |   +-- settings/                 <- settings sub-screens
|   |       +-- SettingsScreen.tsx    <- settings root
|   |       +-- AppearanceScreen.tsx  <- theme, text size, icon shapes
|   |       +-- RegionalScreen.tsx    <- language, currency, calendar
|   |       +-- PersonalizationScreen.tsx <- home + add-transaction defaults, hide balances
|   |       +-- DataScreen.tsx        <- backup / restore / delete all
|   |
|   +-- components/
|   |   +-- AccountModal.tsx          <- account selection modal
|   |   +-- AccountTrigger.tsx        <- account selection trigger
|   |   +-- AmountInput.tsx           <- amount field with currency
|   |   +-- BarChart.tsx              <- horizontal stacked bar chart
|   |   +-- CalculatorModal.tsx       <- calculator popup
|   |   +-- CalendarModal.tsx         <- calendar container modal
|   |   +-- CalendarPicker.tsx        <- text-based date selector
|   |   +-- CategoryGrid.tsx          <- 4xN category grid
|   |   +-- CategoryList.tsx          <- category breakdown list
|   |   +-- ColorGrid.tsx             <- color grid for categories
|   |   +-- ColorPickerModal.tsx      <- color picker modal
|   |   +-- CommentInput.tsx          <- comment input with counter
|   |   +-- DaySelector.tsx           <- day selector (Today / Yesterday / Dynamic)
|   |   +-- DonutChart.tsx            <- SVG donut chart
|   |   +-- Fab.tsx                   <- floating action button
|   |   +-- IconGrid.tsx              <- icon grid for categories
|   |   +-- PeriodTabs.tsx            <- Day / Week / Month / Year / Period tabs
|   |   +-- PhotoSection.tsx          <- photo section (camera / gallery)
|   |   +-- SearchBar.tsx             <- reusable search bar
|   |   +-- SortToggle.tsx            <- date / amount sort toggle
|   |   +-- TabBar.tsx                <- expense / income segmented control
|   |   +-- TagChip.tsx               <- tag chip
|   |   +-- TagSection.tsx            <- tags section
|   |   +-- TransactionForm.tsx       <- shared expense/income form (047)
|   |   +-- TransactionGroup.tsx      <- transactions grouped by date
|   |   +-- form/                     <- form building blocks (048)
|   |   |   +-- DeleteButton.tsx      <- destructive action row
|   |   |   +-- FormError.tsx         <- inline validation error
|   |   |   +-- FormScrollView.tsx    <- scrollable form wrapper
|   |   |   +-- LabeledTextField.tsx  <- label + TextInput + counter
|   |   |   +-- PrimaryButton.tsx     <- primary CTA
|   |   |   +-- SectionTitle.tsx      <- form section heading
|   |   +-- calendars/                <- date pickers
|   |   |   +-- DayPicker.tsx         <- monthly day grid
|   |   |   +-- MonthGrid.tsx         <- 12-month grid
|   |   |   +-- MonthNav.tsx          <- previous/next month navigation
|   |   |   +-- PeriodPicker.tsx      <- date range selector
|   |   |   +-- WeekPicker.tsx        <- week selector
|   |   |   +-- YearGrid.tsx          <- 12-year grid
|   |   |   +-- YearNav.tsx           <- year navigation
|   |   +-- settings/                 <- settings rows and toggles
|   |       +-- SettingsRow.tsx       <- labelled row
|   |       +-- SettingsSelectRow.tsx <- selector row
|   |       +-- ToggleRow.tsx         <- switch row
|   |
|   +-- context/
|   |   +-- AppContext.tsx            <- business state (accounts, categories, transactions)
|   |   +-- ConfigContext.tsx         <- user preferences (theme, currency, language)
|   |
|   +-- database/
|   |   +-- database.ts               <- shared init: applies migrations (PRAGMA user_version, SCHEMA_VERSION 3)
|   |   +-- engine.ts                 <- native engine: opens the expo-sqlite database
|   |   +-- engine.web.ts             <- web engine: sql.js (WASM) + IndexedDB persistence
|   |   +-- sqliteWeb.ts              <- sql.js engine with autocommit + export/import
|   |   +-- storage/indexedDb.ts      <- IndexedDB persistence for the exported SQLite bytes
|   |   +-- types.ts                  <- TypeScript entity interfaces
|   |   +-- index.ts                  <- exports repositories for all platforms (single DatabaseHandle)
|   |   +-- schemas.ts                <- Drizzle table definitions
|   |   +-- seedData.ts               <- seed entities (accounts, categories, tags)
|   |   +-- configDefaults.ts         <- default config values
|   |   +-- backup.ts + backupService.ts <- backup / restore logic
|   |   +-- drizzle/
|   |   |   +-- schema.ts             <- Drizzle schema over DatabaseHandle
|   |   |   +-- proxy.ts              <- sqlite-proxy adapter
|   |   |   +-- engine.ts             <- Drizzle engine
|   |   +-- migrations/
|   |   |   +-- 001_initial.ts        <- CREATE TABLE (users, accounts, categories, transactions, tags, transaction_tags, config) + indexes
|   |   |   +-- 002_seed.ts           <- default user, 1 account, 31 categories
|   |   |   +-- 003_config.ts         <- config default values (table created in 001)
|   |   +-- repositories/
|   |       +-- accountRepo.ts        <- account CRUD + balance calculation + deleteAll()
|   |       +-- categoryRepo.ts       <- category CRUD + deleteAll()
|   |       +-- tagRepo.ts            <- tag CRUD + deleteAll()
|   |       +-- configRepo.ts         <- config persistence
|   |       +-- transactionRepo.ts (+ .reads.ts / .writes.ts) <- transaction CRUD + aggregations + deleteAll()
|   |
|   +-- i18n/
|   |   +-- index.ts                 <- language selector + getCategoryName helper
|   |   +-- en.ts                    <- English translations
|   |   +-- es.ts                    <- Spanish translations
|   |   +-- ca.ts                    <- Catalan translations
|   |   +-- fr.ts                    <- French translations
|   |   +-- de.ts                    <- German translations
|   |   +-- pt.ts                    <- Portuguese translations
|   |   +-- it.ts                    <- Italian translations
|   |
|   +-- hooks/
|   |   +-- useFontSize.ts           <- text scaling hook
|   |   +-- useTransactionFilters.ts <- transaction filtering, sorting, and grouping
|   |   +-- useFocusLoad.ts          <- load-on-focus data hook
|   |   +-- useTransactionListScreen.tsx <- shared list-screen logic
|   |   +-- useTransactionForm.ts    <- shared transaction form logic
|   |   +-- usePhotos.ts             <- camera / gallery photo handling
|   |   +-- useNameDuplicateCheck.ts <- debounced duplicate-name guard
|   |   +-- useBalanceVisibility.ts  <- balance show/hide
|   |   +-- useBulkDelete.ts         <- bulk delete state
|   |   +-- usePeriodNavigation.ts   <- period navigation (Week / Month / Year)
|   |
|   +-- constants/
|   |   +-- themes.ts                <- dark + light palettes (ColorPalette)
|   |   +-- colors.ts                <- legacy palette (dark only)
|   |   +-- types.ts                 <- shared types (Period, TransactionType, RootStackParamList)
|   |   +-- accountIcons.ts          <- available account icons list
|   |   +-- languages.ts             <- language map + type (7 languages)
|   |   +-- currencies.ts            <- currency list + symbols
|   |   +-- calendar.ts              <- calendar / period helpers
|   |   +-- layout.ts                <- layout constants
|   |
|   +-- utils/
|       +-- formatters.ts            <- format currency, dates, etc.
|       +-- calculator.ts            <- calculator logic
|       +-- platform.ts              <- centralized platform checks
|       +-- language.ts              <- language re-exports + isCatalan()
|       +-- amountInput.ts           <- amount input parsing / formatting
|       +-- search.ts                <- generic search helpers
|       +-- photoUtils.ts            <- photo helpers (web)
|       +-- backupIO.ts (+ .web.ts)  <- platform backup import/export
|
+-- assets/
    +-- (icons, fonts, etc.)
```

## Design
See **`4-design-system.md`** for colors, typography, icons, and layout conventions.

## Code conventions
- English content, English code.
- Naming: camelCase for variables and functions, PascalCase for components and types.
- Mobile-first: all components designed for touch screens.
- Clean code with single-responsibility components.
- i18n: all user-facing strings go through the translation system (i18n/).
- Persistence: one SQLite engine on all platforms — expo-sqlite on native, sql.js (WASM) + IndexedDB on web — selected per platform by `engine.ts` / `engine.web.ts`.
