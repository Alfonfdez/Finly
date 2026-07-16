# Tech Stack

## Languages and tools
- **React Native** (Expo managed workflow, SDK 54) — main framework for iOS and Android.
- **TypeScript** — static typing for the codebase.
- **React Navigation** (native-stack + drawer) — screen navigation.
- **SQLite** (expo-sqlite) — local persistence on native. `DATABASE_VERSION = 6`.
- **localStorage** — local persistence on web (same interfaces as SQLite).
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
|   |   +-- database.ts             <- SQLite initialization + migrations (DATABASE_VERSION = 6)
|   |   +-- types.ts                <- TypeScript entity interfaces
|   |   +-- index.ts                <- platform switching (SQLite vs localStorage)
|   |   +-- webStorage.ts           <- localStorage fallback for web
|   |   +-- migrations/
|   |   |   +-- 001_initial.ts      <- CREATE TABLE + indexes
|   |   |   +-- 002_seed.ts         <- initial test data
|   |   |   +-- 003_config.ts       <- config table + default values
|   |   |   +-- 004_new_categories.ts <- additional categories
|   |   |   +-- 005_english_schema.ts <- migration to English column names
|   |   |   +-- 006_account_description.ts <- description field in accounts
|   |   +-- repositories/
|   |       +-- userRepo.ts         <- user CRUD
|   |       +-- accountRepo.ts      <- account CRUD + balance calculation
|   |       +-- categoryRepo.ts     <- category CRUD
|   |       +-- transactionRepo.ts  <- transaction CRUD + aggregations
|   |       +-- configRepo.ts       <- config persistence
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
|   +-- data/
|   |   +-- mockData.ts             <- mock data (legacy, not used at runtime)
|   |
|   +-- utils/
|       +-- formatters.ts           <- format currency, dates, etc.
|       +-- calculator.ts           <- calculator logic
|
+-- assets/
    +-- (icons, fonts, etc.)
```

## Visual design
- Dark and light palettes defined in `constants/themes.ts` with the `ColorPalette` interface.
- Tokens: `background`, `surface`, `text`, `textSecondary`, `primary`, `accent`, `green`, `red`, `border`.
- Theme selectable from Settings (Dark / Light / System) with real-time switching.
- No external UI library; styles using React Native's `StyleSheet.create()`.
- Icons: `@expo/vector-icons` (Ionicons) — `Ionicons` used throughout the app.
- Typography: native system font (SF Pro on iOS, Roboto on Android) with configurable scaling.

## Typography

### Scaling system
- `useFontSize()` hook returns `fs(size)` that scales based on user preference.
- Factors: Small = x0.85, Medium = x1.0, Large = x1.15.
- All font sizes in the app must use `fs()` — never hardcoded values.
- The function rounds to the nearest integer to avoid sub-pixels.

### Font sizes by element

| fs(N) | Usage | Examples |
|-------|-------|----------|
| `fs(11)` | Auxiliary text, chart labels | CategoryGrid names, BarChart labels |
| `fs(12)` | Badges, metadata, secondary labels, breakdown | AccountSelector balance, TransactionGroup date |
| `fs(13)` | Period tabs, sort labels, tag chips | PeriodTabs, SortToggle, TagSection |
| `fs(14)` | **Standard** — body text, names, buttons | AccountSelector trigger, CategoryList, modals |
| `fs(15)` | List item names, search input | AccountScreen names, SearchBar, TypeTabs |
| `fs(16)` | Screen titles, modal titles | Modal titles, TransactionsScreen header |
| `fs(17)` | Stack navigator header titles | All `headerTitle` in AppNavigator.tsx |
| `fs(18)` | Modal totals, chart center text | DonutChart total, CalculatorModal display |
| `fs(20)` | Calculator display (result) | CalculatorModal result |
| `fs(22)` | Screen totals (balance, category total) | AccountsScreen total, TransactionsScreen categoryTotal |
| `fs(24)` | Large screen titles | AddTransactionScreen title |
| `fs(28)` | HomeScreen main total | HomeScreen total balance |

### Font weights

| fontWeight | Usage | Examples |
|------------|-------|----------|
| `'500'` | Normal body text, item names | AccountSelector modal names, CategoryList |
| `'600'` | **Most used** — names, buttons, trigger text, headers | AccountSelector trigger, SortToggle, TypeTabs, headerTitle |
| `'700'` | Monetary totals, modal titles, active labels | Modal titles, categoryTotal, DayPicker selected |
| `'800'` | HomeScreen main total (only usage) | HomeScreen totalText |

### Currency format conventions
- All totals and balances show a `+` (positive) or `-` (negative) prefix.
- Color: green (`c.green`) for positive, red (`c.red`) for negative.
- Format: `formatCurrency()` with max 2 decimals.
- Exception: individual transaction amounts use type (`income` -> `+`, `expense` -> `-`) instead of the value sign.

### Account name conventions
- **HomeScreen header:** `fs(14)`, `'600'`, color `textSecondary`, circular icon 24x24 + chevron-down.
- **AccountSelector trigger:** `fs(14)`, `'600'`, color `text`, circular icon 28x28 + chevron-down.
- **AccountScreen list:** `fs(15)`, `'600'`, color `text`, circular icon 44x44.

## Code conventions
- English content, English code.
- Naming: camelCase for variables and functions, PascalCase for components and types.
- Mobile-first: all components designed for touch screens.
- Clean code with single-responsibility components.
- i18n: all user-facing strings go through the translation system (i18n/).
- Persistence: switching via Platform.OS — SQLite on native, localStorage on web.
