# Tech Stack

## Languages and tools
- **React Native** (Expo managed workflow, SDK 54) — main framework for iOS and Android.
- **TypeScript** — static typing for the codebase.
- **React Navigation** (native-stack + drawer) — screen navigation.
- **SQLite** (expo-sqlite) — local persistence on native. Single initial schema migration (`001_initial`) with seed (`002_seed`) and config defaults (`003_config`); no versioned migrations.
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
+-- app.json
+-- App.tsx                         <- main entry
+-- tsconfig.json
+-- package.json
|
+-- src/
|   +-- navigation/
|   |   +-- AppNavigator.tsx        <- Stack + Drawer navigator
|   |
|   +-- screens/
|   |   +-- HomeScreen.tsx          <- home screen (dashboard)
|   |   +-- AddTransactionScreen.tsx <- add expense/income
|   |   +-- AddCategoryScreen.tsx   <- select category
|   |   +-- CreateCategoryScreen.tsx <- create category
|   |   +-- ModifyCategoryScreen.tsx <- edit category
|   |   +-- CategoriesScreen.tsx    <- category list
|   |   +-- TransactionsScreen.tsx  <- transactions by category (014)
|   |   +-- AllTransactionsScreen.tsx <- all transactions (015)
|   |   +-- TransactionDetailsScreen.tsx <- transaction details (016)
|   |   +-- ModifyTransactionScreen.tsx <- modify transaction (017)
|   |   +-- AccountsScreen.tsx      <- account list
|   |   +-- CreateAccountScreen.tsx <- create account
|   |   +-- ModifyAccountScreen.tsx <- edit account
|   |   +-- SettingsScreen.tsx      <- app settings
|   |
|   +-- components/
|   |   +-- AccountModal.tsx        <- account selection modal
|   |   +-- AccountSelector.tsx     <- account selection trigger
|   |   +-- BarChart.tsx            <- horizontal stacked bar chart
|   |   +-- CalculatorModal.tsx     <- calculator popup
|   |   +-- CalendarModal.tsx       <- calendar container modal
|   |   +-- CalendarPicker.tsx      <- text-based date selector
|   |   +-- CategoryGrid.tsx        <- 4xN category grid
|   |   +-- CategoryList.tsx        <- category breakdown list
|   |   +-- ColorGrid.tsx           <- color grid for categories
|   |   +-- ColorPickerModal.tsx    <- color picker modal
|   |   +-- CommentInput.tsx        <- comment input with counter
|   |   +-- DaySelector.tsx         <- day selector (Today/Yesterday/Dynamic)
|   |   +-- DonutChart.tsx          <- SVG donut chart
|   |   +-- IconGrid.tsx            <- icon grid for categories
|   |   +-- PeriodTabs.tsx          <- Day/Week/Month/Year/Period tabs
|   |   +-- PhotoSection.tsx        <- photo section (camera/gallery)
|   |   +-- SearchBar.tsx           <- reusable search bar
|   |   +-- SortToggle.tsx          <- date/amount sort toggle
|   |   +-- TagSection.tsx          <- tags section
|   |   +-- TransactionGroup.tsx    <- transactions grouped by date
|   |   +-- TypeTabs.tsx            <- Expense/Income tabs
|   |   +-- calendars/              <- date pickers
|   |       +-- DayPicker.tsx       <- monthly day grid
|   |       +-- MonthGrid.tsx       <- 12-month grid
|   |       +-- MonthNav.tsx        <- previous/next month navigation
|   |       +-- PeriodPicker.tsx    <- date range selector
|   |       +-- WeekPicker.tsx      <- week selector
|   |       +-- YearGrid.tsx        <- 12-year grid
|   |       +-- YearNav.tsx         <- year navigation
|   |       +-- types.ts            <- shared calendar types
|   |       +-- CalendarModal.tsx   <- calendar container modal
|   |       +-- CalendarPicker.tsx  <- text-based date selector
|   |
|   +-- context/
|   |   +-- AppContext.tsx           <- business state (accounts, categories, transactions)
|   |   +-- ConfigContext.tsx        <- user preferences (theme, currency, language)
|   |
|   +-- database/
|   |   +-- database.ts             <- shared SQLite init: applies schema + seed + config migrations (PRAGMA user_version)
|   |   +-- engine.ts               <- native engine: opens the expo-sqlite database
|   |   +-- engine.web.ts           <- web engine: sql.js (WASM) + IndexedDB persistence
|   |   +-- sqliteWeb.ts            <- SqlJsDatabase: sql.js engine with autocommit + export/import
|   |   +-- storage/indexedDb.ts    <- IndexedDB persistence for the exported SQLite bytes
|   |   +-- types.ts                <- TypeScript entity interfaces
|   |   +-- index.ts                <- exports repositories for all platforms (single DatabaseHandle)
|   |   +-- migrations/
|   |   |   +-- 001_initial.ts      <- CREATE TABLE (users, accounts, categories, transactions, tags, transaction_tags, config) + indexes
|   |   |   +-- 002_seed.ts         <- default user, 1 account, 31 categories
|   |   |   +-- 003_config.ts       <- config default values (table created in 001)
|   |   +-- repositories/
|   |       +-- accountRepo.ts      <- account CRUD + balance calculation + deleteAll()
|   |       +-- categoryRepo.ts     <- category CRUD + deleteAll()
|   |       +-- transactionRepo.ts  <- transaction CRUD + aggregations + deleteAllTransactions()
|   |       +-- configRepo.ts       <- config persistence
|   |       +-- tagRepo.ts          <- tag CRUD + deleteAll()
|   |
|   +-- i18n/
|   |   +-- index.ts                <- language selector + getCategoryName helper
|   |   +-- en.ts                   <- English translations
|   |   +-- es.ts                   <- Spanish translations
|   |   +-- ca.ts                   <- Catalan translations
|   |
|   +-- hooks/
|   |   +-- useFontSize.ts          <- text scaling hook
|   |   +-- useTransactionFilters.ts <- transaction filtering, sorting, and grouping
|   |
|   +-- constants/
|   |   +-- themes.ts               <- dark + light palettes (ColorPalette)
|   |   +-- colors.ts               <- legacy palette (dark only)
|   |   +-- types.ts                <- shared types (Period, TransactionType, RootStackParamList)
|   |   +-- platformStyles.ts       <- platform-specific styles
|   |   +-- accountIcons.ts         <- available account icons list
|   |
|   +-- utils/
|       +-- formatters.ts           <- format currency, dates, etc.
|       +-- calculator.ts           <- calculator logic
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
