# Changelog — Finly

[2026-07-10] + | FinlyApp/ completo
- Initialized Expo project with TypeScript (blank-typescript).
- Installed dependencies: React Navigation (Stack + Drawer), AsyncStorage, react-native-svg, DateTimePicker, gestures, reanimated, vector-icons.
- Created src/ folder structure (screens, components, context, data, storage, utils, constants, navigation).

[2026-07-10] + | src/constants/colors.ts
- Defined dark color palette: background, surface, text, textSecondary, primary, accent, green, red, border.

[2026-07-10] + | src/data/mockData.ts
- Created mock data: 3 accounts, 8 categories, 10 example transactions with TypeScript interfaces (Account, Category, Transaction).

[2026-07-10] + | src/context/AppContext.tsx
- Implemented AppContext with Provider. Global state: activeAccount, activeType, activePeriod, selectedDate, customDate.
- Derived calculations: filteredTransactions, activeCategories, accountsWithBalance, totalIncome, totalExpenses.
- Functions: selectAccount, switchType, switchPeriod, setSelectedDate, setCustomDate.

[2026-07-10] + | src/navigation/AppNavigator.tsx
- Configured DrawerNavigator with side menu (Home, Accounts, Categories, mock Settings).
- Configured nested StackNavigator with HomeScreen, AddTransactionScreen, TransactionsScreen.
- Dark styling on headers and drawer.

[2026-07-10] + | src/screens/HomeScreen.tsx
- Mocked up main screen: header with menu, account selector, total, transactions button.
- Charts section (donut/bar toggle), type and period tabs, calendar, category list, FAB "+".

[2026-07-10] + | src/screens/AddTransactionScreen.tsx
- Placeholder "Add Expense/Income" screen with title and coming soon message.

[2026-07-10] + | src/screens/TransactionsScreen.tsx
- Transaction list screen with FlatList, filter by category from navigation params.
- Shows description, category, date, amount with color based on type (income/expense).

[2026-07-10] + | src/components/AccountModal.tsx
- Account selection modal: FlatList with icon, name, balance. Semi-transparent overlay.

[2026-07-10] + | src/components/BarChart.tsx
- Horizontal stacked bar chart with colored segments per category + legend.

[2026-07-10] + | src/components/DonutChart.tsx
- SVG ring chart with react-native-svg: circular segments with strokeDasharray. Centered total.

[2026-07-10] + | src/components/CategoryList.tsx
- Category breakdown list: icon, name, progress bar, total, percentage. Navigation on press.

[2026-07-10] + | src/components/CalendarPicker.tsx
- Text-based date selector that displays the active period and opens CalendarModal on press.

[2026-07-10] + | src/components/CalendarModal.tsx
- Container modal for all date selectors, with OK/Cancel buttons.

[2026-07-10] + | src/components/TypeTabs.tsx
- Expense/Income tabs with dark styling and active highlight.

[2026-07-10] + | src/components/PeriodTabs.tsx
- Day/Week/Month/Year/Period tabs with dark styling and active highlight.

[2026-07-10] + | src/components/calendars/ (6 files)
- DayPicker: monthly grid calendar with day selection, no future dates.
- WeekPicker: week selector with year and month navigation.
- MonthGrid: 12-month grid for month selection.
- MonthNav: previous/next month navigation.
- YearGrid: 12-year grid for year selection.
- PeriodPicker: date range selector with "All" option.

[2026-07-10] + | src/storage/storage.ts
- Generic CRUD functions for AsyncStorage: getData, saveData, insertItem, deleteItem, updateItem.

[2026-07-10] + | src/utils/formatters.ts
- Utilities: formatCurrency, formatPercentage, formatDate, getMonthName, week start/end, isFutureDate, etc.

[2026-07-10] + | FinlyApp/eas.json
- Created EAS Build configuration for development builds in the cloud (Android).

[2026-07-10] ~ | FinlyApp/package.json
- Downgraded Expo SDK from 57 → 55 → 54 due to incompatibility with the phone's Expo Go.
- Adjusted dependencies to SDK 54: expo ~54.0.0, react 19.1.0, react-native 0.81.5, and remaining packages to compatible versions.
- Removed node_modules and package-lock.json at each change.

[2026-07-10] + | FinlyApp/package.json
- Added expo-dev-client ~6.0.21 and eas.json for cloud builds (not used in the end).

[2026-07-10] ~ | FinlyApp/node_modules
- Installed react-native-worklets@0.5.1 to fix TurboModule "installTurboModule" error on SDK 54.

[2026-07-10] ~ | README.md
- Updated README to reflect the actual project state: directory name (FinlyApp), current persistence (AsyncStorage), existing components (CalendarModal, calendars/), and removed references to unimplemented features (SQLite, budgets, savings plans).

[2026-07-10] ~ | src/components/calendars/DayPicker.tsx, MonthGrid.tsx, YearGrid.tsx
- Restructured calendar selectors to fix vertical centering on Android: separated size layer (TouchableOpacity with aspectRatio) from visual layer (internal View with flex:1 + centering + background/border).

[2026-07-10] ~ | src/components/calendars/DayPicker.tsx
- Split diaInner into two layers: diaBg (absoluteFill + borderRadius + overflow hidden for visual clipping) and diaCenter (flex:1 + centering, no overflow) — fixes number 10 disappearing on Android due to text clipping.

[2026-07-10] ~ | src/components/calendars/DayPicker.tsx
- Improved range display in PeriodPicker: diaRango changed from borderRadius:0 to borderRadius:4 for more uniform shapes.
- Added !esSeleccionado to esInicio/esFin conditions to prevent diaRangoBorde from covering the selection color of the start/end day.

[2026-07-11] + | src/constants/types.ts
- Created centralized shared types file: Period, TransactionType, ChartData, CategoryWithTotal, RootStackParamList, HomeScreenProps, TransactionsScreenProps.
- Single Source of Truth for all types reused in the project.

[2026-07-11] ~ | src/constants/types.ts
- Added navigation types: RootStackParamList, HomeScreenProps, TransactionsScreenProps using NativeStackScreenProps from React Navigation v7.

[2026-07-11] ~ | src/components/calendars/types.ts
- Removed local Period definition. Now re-exports from src/constants/types.ts.

[2026-07-11] ~ | src/components/PeriodTabs.tsx
- Removed local Period definition. Imports from src/constants/types.ts.

[2026-07-11] ~ | src/components/TypeTabs.tsx
- Removed inline 'gasto' | 'ingreso' type definition. Imports TransactionType from src/constants/types.ts.

[2026-07-11] ~ | src/components/BarChart.tsx
- Removed local Dato interface. Imports ChartData from src/constants/types.ts.

[2026-07-11] ~ | src/components/DonutChart.tsx
- Removed local Dato interface. Imports ChartData from src/constants/types.ts.

[2026-07-11] ~ | src/components/CategoryList.tsx
- Removed local CategoriaItem interface. Imports CategoryWithTotal from src/constants/types.ts.

[2026-07-11] ~ | src/context/AppContext.tsx
- Imports Period, TransactionType and CategoryWithTotal from src/constants/types.ts (removed duplicate local definitions).
- Extracted filter() function to centralize transaction filtering logic by accountId, type and date range.
- Replaced 5 duplicate useMemo filtering blocks with calls to filter().

[2026-07-11] ~ | src/navigation/AppNavigator.tsx
- Removed `any` type from props in CustomDrawerContent. Now uses DrawerContentComponentProps from @react-navigation/drawer.
- Imported RootStackParamList for navigation type consistency.

[2026-07-11] ~ | src/screens/HomeScreen.tsx
- Removed `any` type from useNavigation. Now uses NativeStackNavigationProp<RootStackParamList, 'Home'>.
- Removed `any` type from parameters in handleCategoriaPress and handlePeriodChange.
- Replaced navigation.openDrawer() with navigation.dispatch(DrawerActions.openDrawer()) (recommended pattern to access Drawer from a nested Stack).

[2026-07-11] ~ | src/screens/TransactionsScreen.tsx
- Removed `as { categoriaId?: number } | undefined` cast. Now uses RouteProp<RootStackParamList, 'Transactions'> with safe typing.

[2026-07-11] ~ | src/context/AppContext.tsx
- Wrapped Provider value object in useMemo to prevent unnecessary re-renders in context consumers.

[2026-07-11] ~ | src/data/mockData.ts
- Replaced hardcoded colors (#22D3EE, #A78BFA, #34D399, #F87171) with color tokens (colors.primary, colors.accent, colors.green, colors.red) where they match the project palette.

[2026-07-11] ~ | src/components/calendars/PeriodPicker.tsx
- Removed hardcoded year 2026. Now uses ANIO_MINIMO constant calculated dynamically with new Date().getFullYear().

[2026-07-11] ~ | src/components/calendars/MonthGrid.tsx
- Fixed bug: year navigation arrows were calling onSelect() propagating an unintended date selection.
- Added local year state with useState so year navigation is internal to the component.
- Added changeYear function with useCallback to encapsulate increment/decrement logic with clamping to current year.

[2026-07-11] - | src/utils/formatters.ts
- Removed formatPercentage function (dead code: never imported by any component).

[2026-07-11] ~ | src/utils/formatters.ts
- Simplified formatWeek function: removed redundant if/else branch where both branches returned the same string.

[2026-07-11] + | src/components/calendars/YearNav.tsx
- Created shared year navigation component with prev/next arrows and clamping to current year.
- Extracted from duplicate logic in WeekPicker and MonthGrid.

[2026-07-11] ~ | src/components/calendars/WeekPicker.tsx
- Replaced manual year navigation with shared YearNav component.
- Removed unused styles (añoNav, añoTexto).

[2026-07-11] ~ | src/components/calendars/MonthGrid.tsx
- Replaced manual year navigation with shared YearNav component.
- Removed unused styles (header, titulo).

[2026-07-11] ~ | src/data/mockData.ts
- Removed hardcoded balances (450.00, 2340.50, 5000.00) from cuentasMock. Now all are 0 since the real balance is computed dynamically in AppContext (accountsWithBalance).

[2026-07-11] + | src/constants/platformStyles.ts
- Created shared platform styles file. Contains scrollbarFlatList with centralized web scrollbar styles.

[2026-07-11] ~ | src/screens/TransactionsScreen.tsx
- Replaced inline Platform.select scrollbar with shared import scrollbarFlatList.

[2026-07-11] ~ | src/components/CategoryList.tsx
- Replaced inline Platform.select scrollbar with shared import scrollbarFlatList.

[2026-07-11] ~ | src/screens/HomeScreen.tsx
- Extracted handleCuentaSelect handler with useCallback for the AccountModal onSelect callback, preventing function recreation on each render.

[2026-07-11] ~ | src/screens/TransactionsScreen.tsx
- Fix: Fixed in-place mutation bug in .sort() using [...list].sort() to avoid mutating the state array.

[2026-07-11] ~ | src/context/AppContext.tsx
- Memoized dates object with useMemo to prevent unnecessary recomputations of filteredTransactions, totalIncome and totalExpenses on each render.

[2026-07-11] ~ | src/constants/types.ts
- Removed circular import of Categoria from mockData.ts. CategoriaConTotal now defines its fields inline using TransactionType, avoiding circular dependency.

[2026-07-11] ~ | src/data/mockData.ts
- Imported and used TransactionType (SSOT) in Categoria and Transaccion interfaces, removing duplicate inline 'gasto' | 'ingreso' strings.

[2026-07-11] ~ | src/components/CalendarModal.tsx
- Removed dead code: identical branch in textoSubtitulo('semana') that returned the same value with and without the condition.

[2026-07-11] ~ | src/components/calendars/WeekPicker.tsx
- Removed dead code: identical branch in formatoSemanaCorto() that returned the same value with and without the condition.

[2026-07-11] ~ | src/screens/HomeScreen.tsx
- Removed duplicate local state inicioRango/finRango that replicated customDate from context. Now CalendarPicker receives fechaPersonalizada.inicio and fechaPersonalizada.fin directly.

[2026-07-11] - | src/navigation/AppNavigator.tsx
- Removed unused imports: useNavigation and NavigationProp.

[2026-07-11] ~ | src/components/AccountModal.tsx
- Removed `as any` cast on Ionicons name. Now uses ComponentProps<typeof Ionicons>['name'] for safe typing.

[2026-07-11] ~ | src/components/CategoryList.tsx
- Removed `as any` cast on Ionicons name. Now uses ComponentProps<typeof Ionicons>['name'] for safe typing.

[2026-07-11] ~ | src/components/calendars/WeekPicker.tsx
- Extracted formatoSemanaCorto and mismaSemana outside the component body to prevent recreation on each render. mismaSemana now receives firstDay as an explicit parameter.

[2026-07-11] ~ | src/context/AppContext.tsx
- Optimized accountsWithBalance from O(accounts × transactions) with filter+reduce to O(transactions) with a single reduce that accumulates balances by accountId.

[2026-07-12] + | src/database/database.ts
- Implemented SQLite initialization with openDatabaseSync, versioned migrations using PRAGMA user_version, and initDatabase() function for app startup.

[2026-07-12] + | src/database/types.ts
- Defined TypeScript interfaces: Usuario, Cuenta, Categoria, Transaccion aligned with the SQLite schema.

[2026-07-12] + | src/database/migrations/001_initial.ts
- Created initial migration with CREATE TABLE for users, accounts, categories, transactions and indexes (idx_cuentas_usuario, idx_categorias_tipo, idx_transacciones_cuenta, idx_transacciones_categoria, idx_transacciones_tipo).

[2026-07-12] + | src/database/migrations/002_seed.ts
- Implemented test data loading: default user, 3 accounts, 8 categories and 10 transactions from current mockData.

[2026-07-12] + | src/database/repositories/usuarioRepo.ts
- Implemented users CRUD: insert, getById, update.

[2026-07-12] + | src/database/repositories/cuentaRepo.ts
- Implemented accounts CRUD: list, insert, update, delete, getCurrentBalance.

[2026-07-12] + | src/database/repositories/categoriaRepo.ts
- Implemented categories CRUD: list (with type filter), insert, update, delete.

[2026-07-12] + | src/database/repositories/transaccionRepo.ts
- Implemented transactions CRUD: list with filters (account, category, type, date range), insert, update, delete. Aggregations: totalByPeriod, breakdownByCategories.

[2026-07-12] ~ | App.tsx
- Added SQLite initialization before rendering AppProvider with loading state.

[2026-07-12] ~ | src/context/AppContext.tsx
- Replaced mockData with SQLite repositories. Data loading with useEffect and loading state. Adapted to snake_case fields (cuenta_id, categoria_id).

[2026-07-12] ~ | src/screens/HomeScreen.tsx
- Added loading state with ActivityIndicator when loading is true or activeAccount is null.

[2026-07-12] ~ | src/screens/TransactionsScreen.tsx
- Adapted to snake_case fields: categoria_id instead of categoriaId.

[2026-07-12] ~ | src/components/AccountModal.tsx
- Added AccountWithBalance interface that extends Account with balance field for the modal.

[2026-07-12] - | src/storage/storage.ts
- Removed AsyncStorage persistence file (replaced by SQLite).

[2026-07-12] - | src/storage/
- Removed entire storage/ folder.

[2026-07-12] ~ | FinlyApp/package.json
- Removed @react-native-async-storage/async-storage dependency.
- Added expo-sqlite dependency.

[2026-07-12] ~ | README.md
- Updated stack table: AsyncStorage → SQLite (expo-sqlite).
- Updated project structure: storage/ → database/ with migrations/ and repositories/ subfolders.

[2026-07-12] ~ | docs/programming-concepts.md
- Replaced AsyncStorage section with SQLite (expo-sqlite) with new definition and example.

[2026-07-12] ~ | src/screens/HomeScreen.tsx
- Fix: Moved loading check after all hooks (useState, useCallback) to respect Rules of Hooks.

[2026-07-12] ~ | src/context/AppContext.tsx
- Fix: accountsWithBalance now calculates real balance of each account using getCurrentBalance() instead of using saldo_inicial (always 0).

[2026-07-12] ~ | FinlyApp/app.json
- Added developmentClient.silentLaunch to reduce the "Checking for updates" banner in Expo Go.

[2026-07-12] ~ | README.md
- Added "USB Development" section with instructions for cable connection (adb reverse).
- Added "Tunnel Development" section with instructions for ngrok connection.
- Removed reference to data/mockData.ts from the project structure.

[2026-07-12] + | src/database/webStorage.ts
- Implemented data storage with localStorage for web compatibility. Same interfaces as SQLite: seedWebData with test data, webUsuarioRepo, webCuentaRepo, webCategoriaRepo, webTransaccionRepo.

[2026-07-12] + | src/database/index.ts
- Created repository index with Platform.OS switching: SQLite on native, localStorage on web.

[2026-07-12] ~ | App.tsx
- Added Platform.OS to initialize webStorage on web and SQLite database on native.

[2026-07-12] ~ | src/context/AppContext.tsx
- Imports repositories from src/database/index.ts instead of direct repository files.

[2026-07-12] ~ | docs/programming-concepts.md
- Expanded SQLite section with details on why it doesn't work on web.
- Added localStorage section with definition and example.
- Added "Platform switching" section explaining the Platform.OS pattern for alternating between SQLite and localStorage.

[2026-07-12] ~ | src/components/DaySelector.tsx
- Simplified DaySelector: removed Period mode logic (periodoActivo, fechaPersonalizada props). Now always uses diaSeleccionado for all selection logic.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Added day initialization based on Period mode: if periodoActivo is 'periodo' and the range is 1 day, inherits fechaPersonalizada.inicio; otherwise inherits fechaSeleccionada.

[2026-07-12] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md
- Updated "Day selection" section with detailed logic: state table by main tab, date formats, initialization and interactive behavior.

[2026-07-12] ~ | spec/features/004-pagina-anadir-transaccion/3-tasks.md
- Marked tasks T1-T21, T24-T26 as completed. Pending T22-T23 (persistence) and T27 (verification).

[2026-07-12] + | spec/features/005-pagina-anadir-categoria/
- Created complete spec for the add category page: 1-spec.md (functional requirements), 2-plan.md (architecture and components), 3-tasks.md (14 tasks in 5 phases).
- Includes: search bar with character containment filtering, 4×N category grid, category selection and back navigation, "Create" button (TODO).

[2026-07-12] + | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys for AddCategoryScreen: add_cat_title, add_cat_search, add_cat_no_results, add_cat_create.

[2026-07-12] ~ | src/constants/types.ts
- Added AddCategory to RootStackParamList and AddCategoryScreenProps.

[2026-07-12] ~ | src/navigation/AppNavigator.tsx
- Added AddCategoryScreen to HomeStack with multilingual title.

[2026-07-12] + | src/components/SearchBar.tsx
- Created reusable search bar component with input, "x" button and text change callback.

[2026-07-12] ~ | src/screens/AddCategoryScreen.tsx
- Created add category screen with header, SearchBar, 4×N category grid filtered by type (expense/income), character containment filtering logic (case-insensitive), empty state with search-not-found icon, and "Create" button in the last grid position (TODO).
- Added search button in the header (headerRight) using useLayoutEffect.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Added useRoute to receive categoriaId from AddCategoryScreen.
- Connected onAddMore from CategoryGrid to navigate to AddCategoryScreen passing the active type.

[2026-07-12] ~ | src/constants/types.ts
- Added tipo parameter to AddCategory in RootStackParamList.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Added currency symbol (config.divisa) to the right of the amount input.

[2026-07-12] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md
- Updated "Amount field" section to include the currency symbol to the right of the input.

[2026-07-12] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys for 15 new categories: cat_travel, cat_videogame, cat_game, cat_restaurant, cat_education, cat_family, cat_shopping, cat_clothing, cat_exercise, cat_others, cat_entertainment, cat_gifts, cat_gift, cat_other, cat_interests.

[2026-07-12] ~ | src/data/mockData.ts
- Added 15 new categories (12 expenses + 3 income) with unique icons and colors.

[2026-07-12] ~ | src/i18n/index.ts
- Updated CATEGORIA_I18N_KEYS mapping with the 23 category IDs.

[2026-07-12] ~ | src/database/migrations/002_seed.ts
- Added 15 new categories to SQLite seed data.

[2026-07-12] ~ | src/database/webStorage.ts
- Added 15 new categories to localStorage (web) seed data.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Limited category grid to 7 items + "More" button (matches spec: 4×2 = 8 positions).

[2026-07-12] + | src/database/migrations/004_nuevas_categorias.ts
- Created migration 004 to add 15 new categories (12 expenses + 3 income) with INSERT OR IGNORE.

[2026-07-12] ~ | src/database/database.ts
- Updated DATABASE_VERSION to 4 and added seed004 call.

[2026-07-12] ~ | src/database/webStorage.ts
- Added migrateWebCategories function to add the 15 new categories to existing web users.

[2026-07-12] ~ | src/data/mockData.ts, src/database/migrations/002_seed.ts, src/database/migrations/004_nuevas_categorias.ts, src/database/webStorage.ts
- Changed "Ocio" icon from game-controller-outline to musical-notes-outline.
- Changed "Videojuego" icon from gamepad-outline to game-controller-outline.
- Changed "Intereses" icon from percent-outline to wallet-outline.

[2026-07-13] ~ | src/components/ (all .tsx files)
- Renamed TypeScript identifiers from Spanish to English across all components:
  - AccountModal: CuentaConSaldo → AccountWithBalance, saldo → balance, cuentas → accounts, styles
  - BarChart/DonutChart: datos → data, divisa → currency, separador → separator, dato → item
  - CategoryList/CategoryGrid: categorias → categories, categoria → category, styles
  - TypeTabs: activo → active, styles.texto → styles.text
  - PeriodTabs: activo → active, periodos → periods
  - CalendarModal: periodo → period, fecha → date, onSelectFecha → onSelectDate, onSelectRango → onSelectRange, inicioRango → rangeStart, finRango → rangeEnd, fechaTemp → tempDate, textoSubtitulo → subtitleText
  - CalendarPicker: periodo → period, fecha → date, onFechaChange → onDateChange, onRangoChange → onRangeChange
  - DaySelector: hoy → today, ayer → yesterday, anteayer → dayBeforeYesterday, diaSeleccionado → selectedDate, esHoy → isToday, etc.
  - TagSection: Etiqueta → Tag, etiquetas → tags, onCrear → onCreate, busqueda → search, styles
  - CommentInput: comentario → comment
  - PhotoSection: fotoUri → photoUri
  - SearchBar: coloresActivos → activeColors, colores (fondoAlto, borde, texto, textoSuave) → (surface, border, text, textSecondary)
  - calendars/DayPicker: rangoInicio → rangeStart, rangoFin → rangeEnd, enRango → inRange, esBordeInicio → isStartEdge, esBordeFin → isEndEdge, dia → day, esHoy → isToday, hoy → today, año → year, mes → month, styles
  - calendars/MonthGrid: año → year, activo → isActive, hoy → today
  - calendars/MonthNav: año → year, mes → month, esUltimo → isLast, hoy → today
  - calendars/YearNav: año → year, maxAño → maxYear, puedeAvanzar → canAdvance
  - calendars/YearGrid: activo → isActive, añoInicio → startYear, hoy → today
  - calendars/WeekPicker: formatoSemanaCorto → formatShortWeek, año → year, semanas → weeks, seleccionada → isSelected, hoy → today, styles
  - calendars/PeriodPicker: onTempRangoChange → onTempRangeChange, seleccionando → selecting, inicioTemp/finTemp → tempStart/tempEnd, hoy → today

[2026-07-13] ~ | Multiple files
- Fixed TypeScript errors in 8 files:
  - AccountModal: imports Account instead of Cuenta, uses balance/name/icon (SQL column names)
  - AddCategoryScreen: uses getCategoryName instead of obtenerNombreCategoria
  - HomeScreen: uses formatCurrency instead of formatearMoneda, uses config.firstDayOfWeek
  - TransactionsScreen: uses formatCurrency and formatDate instead of formatearMoneda/formatearFecha
  - SettingsScreen: uses config.firstDayOfWeek and updateConfig({ firstDayOfWeek })
  - AddTransactionScreen: fixes props (selectedDate, period, date, onSelectDate, photoUri, selectedTags, onCreate) and Tag interface (name/nombre)
  - CategoryGrid: Category interface uses nombre/icono (SQL column names) to align with database/types

[2026-07-13] ~ | spec/constitution/1-mission.md
- Fixed "archivo o base de datos local" → "local database (SQLite)".
- Moved "savings plan" to future scope section (not implemented).
- Added principles: multilingual support, dark/light theme, accessibility with text scaling.

[2026-07-13] ~ | spec/constitution/2-tech-stack.md
- Replaced AsyncStorage with SQLite (expo-sqlite) + localStorage for web.
- Updated complete file structure: screens, components, database, i18n, hooks, constants, context.
- Updated visual design section: themes.ts with dark+light palettes and English tokens.
- Added conventions: i18n, persistence with platform switching.

[2026-07-13] + | spec/features/007-calculadora/
- Created complete spec for the calculator: 1-spec.md (functional requirements), 2-plan.md (architecture and components), 3-tasks.md (13 tasks in 4 phases + verification).
- Includes: modal with numeric keypad, basic operations, Accept/Cancel buttons, integration with AddTransactionScreen.
- Reusable component for other screens.

[2026-07-13] ~ | spec/constitution/3-roadmap.md
- Added 007-calculadora feature with pending status.

[2026-07-13] ~ | README.md
- Added spec/007-calculadora to the project structure.
- Added "Built-in basic calculator (coming soon)" to the features list.
- Updated SDD features list: 001-007.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Moved comment suggestions panel above the comment input.
- Removed KeyboardAvoidingView and onFocus. Implemented Keyboard.addListener('keyboardDidShow') with scrollToEnd after 300ms.
- Added scrollViewRef for programmatic scroll control.
- Added keyboardShouldPersistTaps="handled" to ScrollView.
- Added 200px spacer at the end of content to allow scrolling to the comment input.

[2026-07-13] ~ | src/components/CommentInput.tsx
- Reverted onFocus prop (no longer used, scroll is managed by parent with Keyboard listener).

[2026-07-13] ~ | FinlyApp/app.json
- Removed softwareKeyboardLayoutMode "resize" (caused conflicts, not required).

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/1-spec.md
- Simplified section 4 (Symbols): 4-column grid with ~40 icons in vertical scroll, removed "..." button and icon catalog reference.
- Simplified section 5 (Color): "+" opens a modal with ~20 colors in a 4×5 grid instead of navigating to a separate screen.

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/2-plan.md
- Added ColorPickerModal.tsx component to the plan.
- Updated wireframe with dynamic icon grid and color modal.
- Updated icon table: 40 icons instead of 15 + "...".
- Added expanded color table (20 colors) for the modal.
- Replaced catalog/selector i18n keys with modal keys.

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/3-tasks.md
- Updated T7: IconGrid with 40 icons, vertical scroll, no "...".
- Updated T8: ColorGrid with "+" that opens modal.
- Added T8b: ColorPickerModal with 20 colors in 4×5 grid.
- Updated T9: reference to ColorPickerModal.

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/1-spec.md, 2-plan.md, 3-tasks.md
- Simplified duplicate validation: globally unique name (regardless of expense/income type).
- Removed validation re-execution when changing type.
- Updated existsByName function: removed type parameter, SQL without AND type=? filter.

[2026-07-13] + | src/i18n/en.ts, es.ts, ca.ts
- Added 17 i18n keys for CreateCategoryScreen: create_cat_title, create_cat_name, create_cat_name_placeholder, create_cat_type, create_cat_expense, create_cat_income, create_cat_symbols, create_cat_color, create_cat_add, create_cat_error_name_empty, create_cat_error_name_duplicate, create_cat_hint_icon, create_cat_hint_color, create_cat_hint_icon_color, create_cat_color_picker_title, create_cat_color_picker_cancel.

[2026-07-13] ~ | src/constants/types.ts
- Added CreateCategory to RootStackParamList and CreateCategoryScreenProps.

[2026-07-13] ~ | src/navigation/AppNavigator.tsx
- Imported and registered CreateCategoryScreen in HomeStack with multilingual title.

[2026-07-13] ~ | src/screens/AddCategoryScreen.tsx
- Connected "Create" button to navigate to CreateCategoryScreen passing the active type.

[2026-07-13] + | src/database/repositories/categoryRepo.ts
- Added existsByName(name: string): Promise<boolean> function for global duplicate validation.

[2026-07-13] + | src/database/webStorage.ts
- Added existsByName(name: string): Promise<boolean> to webCategoryRepo for duplicate validation in localStorage.

[2026-07-13] + | src/components/IconGrid.tsx
- Created icon grid component: 40 Ionicons in 4-column grid, vertical scroll, selection with primary color border.

[2026-07-13] + | src/components/ColorGrid.tsx
- Created color grid component: 7 predefined colors in circular row + "+" button that opens modal.

[2026-07-13] + | src/components/ColorPickerModal.tsx
- Created expanded colors modal: 20 colors in 4×5 grid, selection with checkmark, auto-closes on selection.

[2026-07-13] + | src/screens/CreateCategoryScreen.tsx
- Created create category screen: name input (max 30 chars, duplicate validation with 300ms debounce), expense/income radio type, icon grid, color grid, "Add" button disabled based on validation, dynamic help text.

[2026-07-13] ~ | src/context/AppContext.tsx
- Added refreshCategories() to AppContextType and Provider to reload categories after creating a new one.

[2026-07-13] ~ | src/components/IconGrid.tsx
- Fixed grid from 3 to 4 columns on web: replaced pixel-based calculation with Dimensions.get('window').width by width:'22%' + aspectRatio:1 (same pattern as AddCategoryScreen). Removed unnecessary imports (ScrollView, Dimensions, useFontSize).

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Fixed "+" button for categories: always visible. With >7 categories navigates to AddCategoryScreen, with ≤7 navigates directly to CreateCategoryScreen.

[2026-07-13] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md
- Updated section 5 (Category selection): "+" button always visible with conditional behavior based on number of categories. Updated acceptance criteria.

[2026-07-13] ~ | src/components/CategoryGrid.tsx
- Added `addMoreLabel` prop to customize "+" button text (default: "Más").

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- "+" button shows "Crear" when ≤7 categories (navigates to CreateCategoryScreen) and "Más" when >7 (navigates to AddCategoryScreen).

[2026-07-13] ~ | src/components/IconGrid.tsx
- Fixed invalid icon: coffee-outline → cafe-outline (Ionicons 7 uses "cafe").
- Fixed icon centering in cells: added padding:6 and reduced gap from 10 to 8.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Reduced spacing between sections: marginTop from 16 to 12, marginBottom from 8 to 6 on sectionTitle.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Inlined icon grid directly in the screen (same styles as AddCategoryScreen which works on mobile). Removed IconGrid dependency for rendering. CATEGORY_ICONS import is retained for the icon list.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Restructured layout to match AddCategoryScreen: SafeAreaView > View (flex:1) > ScrollView (flex:1) instead of padding in contentContainerStyle. This fixes percentage calculations in grid items on mobile.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Fixed icon centering in grid: replaced aspectRatio:1 + width:'22%' with dynamic calculation using Dimensions.get('window').width. Cells now use calculated fixed width and height, eliminating the aspectRatio bug on mobile.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Fixed responsive grid on web: replaced Dimensions.get('window').width (static) with onLayout on the grid container. cellSize is calculated dynamically from the real grid width, works on mobile and web resize.

[2026-07-13] ~ | FinlyApp/package.json
- Added reanimated-color-picker dependency for dynamic color selection.

[2026-07-13] ~ | src/components/ColorPickerModal.tsx
- Replaced static 20-color modal with full reanimated-color-picker: Panel1 (saturation/brightness), HueSlider, OpacitySlider, Preview with hex format.
- Added OK/Cancel buttons to confirm selection.
- Temporary color synchronization with useEffect when opening modal.

[2026-07-13] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added create_cat_color_picker_ok key for color picker confirmation button.

[2026-07-13] ~ | src/components/ColorPickerModal.tsx
- Fix: Removed onPress={onClose} from overlay (was closing modal when clicking outside the picker on web).
- Fix: Changed onChange to onChangeJS and removed 'worklet' directory (was causing crash on mobile).

[2026-07-13] ~ | src/components/ColorGrid.tsx
- Reduced quick colors from 7 to 6.
- Added circle7 for the picker's custom color (only visible if selectedColor is not in QUICK_COLORS).
- "+" button always in position8.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Selected icon now displays the chosen color (background + icon tint + border) for real-time preview.

[2026-07-13] ~ | src/components/ColorGrid.tsx, src/screens/CreateCategoryScreen.tsx
- Added customColor prop to persist the picker's custom color.
- Custom color circle always visible once chosen (doesn't disappear when selecting another quick color).

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/1-spec.md, 2-plan.md, 3-tasks.md
- Updated Color section: 6 quick colors + custom circle + "+" button.
- Updated ColorPickerModal: reanimated-color-picker with Panel1 + HueSlider + OpacitySlider + Preview + OK/Cancel.
- Added i18n key create_cat_color_picker_ok in the keys table.

[2026-07-13] ~ | README.md, spec/constitution/2-tech-stack.md
- Added reanimated-color-picker to the stack table in README.md and constitution/2-tech-stack.md.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Fix: When returning from CreateCategoryScreen with a new category, auto-scroll to the beginning to see the selected category.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx, src/components/CommentInput.tsx
- Fix: Removed keyboardDidShow listener that was causing auto-scroll when opening the screen on mobile.
- Added onFocus to CommentInput to scrollToEnd only when the user taps the comment input.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Improved amount input UX: now shows "0" as placeholder, clears on focus and shows formatted amount only when there is a value.

[2026-07-13] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md, spec/constitution/3-roadmap.md
- Updated "Amount field" section with "0" placeholder UX and clear on focus.
- Updated roadmap: dynamic color selector instead of static grid.

[2026-07-13] + | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys for CalculatorModal: calc_title, calc_accept, calc_cancel, calc_error.

[2026-07-13] + | src/utils/calculator.ts
- Created evaluate() function with manual parser that respects operator precedence (+, -, *, /), handles decimals and validates expressions.

[2026-07-13] + | src/components/CalculatorModal.tsx
- Created calculator modal: 5×4 keypad with buttons 0-9, `.`, operators, `=`, `C`, `⌫`. Display with expression and result. Accept/Cancel buttons. Dark/light theme with useConfig.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Integrated CalculatorModal: calculator-outline button opens modal, onAccept updates amountRaw with the result.

[2026-07-13] ~ | src/components/CalculatorModal.tsx
- Fix: Replaced SafeAreaView from react-native with react-native-safe-area-context (removes deprecation warning).
- Fix: Web now shows the calculator as a centered popup (overlay + modal with maxWidth 360) instead of fullscreen. Buttons with fixed size (70×50) on web.

[2026-07-13] ~ | src/components/CalculatorModal.tsx
- Fix: Fixed button layout on web: removed aspectRatio on web, added padding to web modal, justify-content center in rows. Empty cells also with fixed size on web.

[2026-07-13] ~ | src/components/CalculatorModal.tsx
- Refactor: Separated styles completely into mobileStyles and webStyles to avoid flex conflicts. Web uses fixed 72×52 buttons, fixed 360px modal.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Fix: Calculator result is now validated with parseAmountInput before pasting into the amount field (max 9 integer digits, 2 decimals).

[2026-07-13] ~ | src/utils/calculator.ts
- Fix: Added MAX_VALUE limit (999,999,999.99). Values exceeding the maximum show an error instead of producing scientific notation.

[2026-07-14] + | spec/features/008-pagina-categorias/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created complete spec for the categories page: 1-spec.md (functional requirements), 2-plan.md (architecture and components), 3-tasks.md (9 tasks in 3 phases).
- Includes: Expense/Income tabs, 4×N category grid, "Create" button navigating to CreateCategoryScreen, category press navigating to ModifyCategoryScreen.

[2026-07-14] + | spec/features/009-pagina-modificar-eliminar-categoria/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created complete spec for the modify category page: 1-spec.md (functional requirements), 2-plan.md (architecture and components), 3-tasks.md (16 tasks in 5 phases).
- Includes: current icon + editable name with duplicate validation (excluding current), informative type, icon and color grids with preselection, "Delete" button with double modal (confirmation + destination category selection for transaction reassignment), "Save" button.

[2026-07-14] ~ | spec/constitution/3-roadmap.md
- Updated roadmap: 007-calculadora marked as completed. Added 008-pagina-categorias and 009-pagina-modificar-eliminar-categoria with pending status.

[2026-07-14] ~ | src/constants/types.ts, src/navigation/AppNavigator.tsx, src/screens/CategoriesScreen.tsx (+)
- Implemented 008-pagina-categorias feature:
  - Added `Categories` and `ModifyCategory` to RootStackParamList in types.ts.
  - Created CategoriesScreen.tsx with header (hamburger + title), TypeTabs, 4×N grid, "Create" button.
  - Added CategoriesScreen to HomeStack in AppNavigator.tsx.
  - Moved "Categories" DrawerItem out of "Coming soon" and connected to real navigation.
  - DrawerItem navigates to CategoriesScreen; grid navigates to CreateCategoryScreen (existing) or ModifyCategoryScreen (coming soon).

[2026-07-14] ~ | src/navigation/AppNavigator.tsx
- Fix: Home DrawerItem now navigates to 'Main' with { screen: 'Home' } to reset the stack when pressing "Home" from nested screens (e.g., Categories).

[2026-07-14] + | src/screens/ModifyCategoryScreen.tsx
- Implemented 009-pagina-modificar-eliminar-categoria feature:
  - Full screen with current icon + editable name, duplicate validation excluding current category, informative type, icon grid, color grid and "Save" button.
  - Deletion flow with double modal: delete confirmation + destination category selection (radio + icon + name).
  - Transaction reassignment via transactionRepository.reassignCategory.

[2026-07-14] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added 10 i18n keys for ModifyCategoryScreen: modify_cat_title, modify_cat_type, modify_cat_delete, modify_cat_save, modify_cat_delete_confirm_title, modify_cat_delete_confirm_message, modify_cat_delete_confirm_cancel, modify_cat_delete_confirm_delete, modify_cat_select_title, modify_cat_select_cancel, modify_cat_select_confirm.

[2026-07-14] ~ | src/database/repositories/categoryRepo.ts, src/database/webStorage.ts
- Modified existsByName to accept optional excludeId parameter that excludes the current category from duplicate checks.

[2026-07-14] ~ | src/database/repositories/transactionRepo.ts, src/database/webStorage.ts
- Added reassignCategory(oldCategoryId, newCategoryId) function to reassign transactions from one category to another.

[2026-07-14] ~ | src/navigation/AppNavigator.tsx
- Added ModifyCategoryScreen to HomeStack with multilingual title.

[2026-07-14] ~ | src/screens/ModifyCategoryScreen.tsx
- Added visual empty name validation: displays red error message "Enter a category name" below the input when name is empty, in addition to disabling the Save button.

[2026-07-14] + | spec/features/010-app-logo/
- Created complete spec for the custom Finly logo with 6 PNG assets.

[2026-07-14] ~ | FinlyApp/assets/ (6 files)
- Replaced generic Expo icons with the custom Finly logo.

[2026-07-14] ~ | FinlyApp/app.json
- Added splash section with image, resizeMode: contain and backgroundColor: #0F172A.

[2026-07-14] ~ | docs/programming-concepts.md
- Added sections: App icon, Android adaptive icon, Splash screen, Favicon.

[2026-07-14] ~ | src/navigation/AppNavigator.tsx
- Added logo (icon.png) in the Drawer header next to "Finly" text: Image 36×36 with borderRadius 10, flexDirection row, gap 12.

[2026-07-14] - | FinlyApp/dist/
- Removed web cache (dist/) to force favicon regeneration with the new logo.

[2026-07-14] ~ | src/context/ConfigContext.tsx
- Added dynamic web scrollbar: syncs scrollbar colors (thumb + track) with the active theme (dark/light) via CSS injected into the head.

[2026-07-14] ~ | App.tsx
- Added SplashScreen component with logo (80×80), "Finly" text (primary color) and ActivityIndicator.
- Replaced simple loading state with full splash. Works on web and native.
- Added minimum splash time of 2 seconds (MIN_SPLASH_MS = 2000) so it's visible even if the DB loads quickly.
- Improved splash animation: logo fade-in + scale-up with spring, text fade-in with delay, subtle continuous pulse on the logo, and fade-out + scale-up on exit.
- Increased MIN_SPLASH_MS to 3000ms. Logo fade-in 800ms with more bounce. Text fade-in 600ms with 500ms delay.
- Replaced circular pulse with linear progress bar that fills left to right (120px, 2px height, cyan on gray track).

[2026-07-14] ~ | src/context/ConfigContext.tsx, src/database/repositories/configRepo.ts, src/database/webStorage.ts
- Added categoryIconShape field ('square' | 'circle', default 'square') to Config type and both repositories (SQLite + web).

[2026-07-14] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys: settings_category_icon_shape, shape_square, shape_circle.

[2026-07-14] ~ | src/screens/SettingsScreen.tsx
- Added "Category appearance" section with Square/Circle selector.

[2026-07-14] ~ | src/components/CategoryGrid.tsx, src/components/CategoryList.tsx, src/components/IconGrid.tsx
- Updated to read config.categoryIconShape and apply dynamic borderRadius (12 square / 999 circle).

[2026-07-14] ~ | src/screens/CategoriesScreen.tsx, src/screens/AddCategoryScreen.tsx, src/screens/CreateCategoryScreen.tsx, src/screens/ModifyCategoryScreen.tsx
- Updated category grids and previews to use the configured shape (square/circle).

[2026-07-14] ~ | spec/features/011-pagina-cuentas/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Added floating "+" button (FAB) in the bottom-right corner that navigates to CreateAccountScreen (013).
- Added optional second row for note (description) below the name in each account. Main row always has 3 columns (icon, name, balance); second row only visible if account has a note, text in secondary color and smaller size.
- Updated navigation flow, wireframe and acceptance criteria.

[2026-07-14] ~ | spec/features/012-modificar-cuenta/ → spec/features/012-pagina-modificar-eliminar-cuenta/
- Renamed folder to be consistent with naming convention (012-pagina-modificar-eliminar-cuenta).

[2026-07-14] + | spec/features/013-pagina-crear-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created complete spec for the create account page: 1-spec.md (functional requirements), 2-plan.md (architecture and components), 3-tasks.md (10 tasks in 4 phases).
- Includes: name with validation (empty + duplicate), icon grid (~20 financial icons) with dynamic color, color grid (6 predefined + picker), optional note (200 chars), "Create" button with validation.

[2026-07-14] ~ | spec/constitution/3-roadmap.md
- Renamed 012-modificar-cuenta → 012-pagina-modificar-eliminar-cuenta. Added 013-pagina-crear-cuenta with pending status.

[2026-07-14] ~ | spec/features/012-pagina-modificar-eliminar-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Standardized with 013-pagina-crear-cuenta:
  - Added complete table of ~20 icons (previously only referenced).
  - Added icon background color behavior when changing selected color.
  - Explicit Color section with table of 6 colors + "+" and modal details (previously only referenced "same structure as 006 and 009").
  - Added `modify_account_error_empty` i18n key in plan.
  - Updated T8 to indicate icon list is shared with 013.
  - Updated T9 to mention icon background color change.

[2026-07-14] ~ | spec/features/012-pagina-modificar-eliminar-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Added name duplicate validation (excluding current account, 300ms debounce).
- Changed Color section: 8-column grid (6 predefined + conditional custom circle + "+"). Custom circle only shown if current color doesn't match any of the 6 predefined.
- "Save" button disabled if name is empty or duplicate, with dynamic help text.
- Added i18n keys `modify_account_error_empty` and `modify_account_error_duplicate`.
- Reuses `existsByName(name, excludeId)` function from `accountRepo` (created in 013).

[2026-07-14] ~ | spec/features/009-pagina-modificar-eliminar-categoria/1-spec.md
- Fixed "same structure as 006" reference → explicit 8-column explanation.
- Added: if current color matches one of the 6 predefined, that circle is marked as selected.
- Added: when selecting an icon, the icon background color changes to the selected color (consistency with 012).

[2026-07-14] ~ | spec/features/013-pagina-crear-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated `existsByName` function to accept optional `excludeId` parameter (used in 012 to exclude the current account).

[2026-07-14] + | spec/features/011-pagina-cuentas/ (implementation)
- Implemented AccountsScreen.tsx (011): header with hamburger menu, "Total" section with total balance (green/red), FlatList of accounts with icon + name + note + balance, FAB "+" navigating to CreateAccountScreen, empty state.
- Added i18n keys `accounts_total` and `accounts_empty` in en.ts, es.ts, ca.ts.
- Added `Accounts` to `RootStackParamList` + `AccountsScreenProps` in types.ts.
- Added `CreateAccount` and `ModifyAccount` to `RootStackParamList` as placeholder routes for forward navigation.
- Added `description?: string` field to `Account` interface in database/types.ts (compatible with migration 006 from 012).
- Updated AppNavigator.tsx: AccountsScreen added to HomeStack, "Accounts" DrawerItem connected to navigate to AccountsScreen.
- All texts are multilingual (es/en/ca).
- TypeScript and ESLint pass clean.

[2026-07-14] + | docs/programming-concepts.md
- Added "Development tools" section with ESLint concept (static analysis, execution, relation to TypeScript).

[2026-07-14] ~ | FinlyApp/src/screens/AccountsScreen.tsx
- Total balance centered in the Total section.

[2026-07-14] ~ | FinlyApp/src/navigation/AppNavigator.tsx
- Moved "Accounts" DrawerItem alongside the rest of implemented items (before the separator).
- Removed "FUTURE FEATURES" section and its separator.
- Changed "Accounts" label color from `textSecondary` to `text` (consistency with the rest).

[2026-07-14] + | spec/features/012-pagina-modificar-eliminar-cuenta/ (implementation)
- Implemented ModifyAccountScreen.tsx (012): editable name (0/30, empty + duplicate validation with 300ms debounce), 4-column icon grid (~20 financial icons, preselected), 8-column color grid via ColorGrid (6 predefined + conditional custom + "+"), ColorPickerModal, multiline note (0/200), Save button.
- Added i18n keys: `modify_account_title`, `modify_account_name`, `modify_account_note`, `modify_account_save`, `modify_account_error_empty`, `modify_account_error_duplicate`, `create_account_symbols`, `create_account_color` (en/es/ca).
- Created migration 006 (`006_account_description.ts`): `ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT ''`.
- Updated `database.ts`: `DATABASE_VERSION` from 5 to 6, import + execution of `migrate006`.
- Added `description` field to `accountRepo.update()` and `accountRepo.create()` (native).
- Added `existsByName(name, excludeId?)` function to `accountRepo` (native) and `webAccountRepo` (web).
- Created `constants/accountIcons.ts` with 19 unique financial icons (shared with 013).
- Registered `ModifyAccountScreen` in `AppNavigator.tsx` (HomeStack).

[2026-07-14] + | spec/features/013-pagina-crear-cuenta/ (implementation)
- Implemented CreateAccountScreen.tsx (013): editable name (0/30, placeholder, empty + duplicate validation with 300ms debounce), 4-column icon grid (ACCOUNT_ICONS shared), 8-column color grid via ColorGrid + ColorPickerModal, multiline note (0/200), Create button.
- Added i18n keys: `create_account_title`, `create_account_name`, `create_account_note`, `create_account_button`, `create_account_error_empty`, `create_account_error_duplicate`, `create_account_error_icon`, `create_account_error_color`, `create_account_error_icon_color` (en/es/ca).
- Registered `CreateAccountScreen` in `AppNavigator.tsx` (HomeStack).
- Create button disabled if name, icon or color is missing (or duplicate name). Dynamic help text by priority.
- Updated spec013: icons corrected to match `constants/accountIcons.ts` (6 replacements: bank→home, savings→shield, account-balance→layers, credit-card→scan, money→swap-horizontal, cash-dup→storefront).

[2026-07-14] ~ | AppContext.tsx, CreateAccountScreen.tsx, ModifyAccountScreen.tsx, 011 spec
- Added `refreshAccounts()` method to `AppContext` (re-fetch accounts from repository). Exposed in `AppContextType` interface and provider value.
- CreateAccountScreen and ModifyAccountScreen call `await refreshAccounts()` after creating/modifying an account so the HomeScreen list (AccountModal) updates immediately.
- Updated "Persistence" section in `spec/features/011-pagina-cuentas/1-spec.md` with note about mandatory refresh after mutations.

[2026-07-14] ~ | formatters.ts, 011 spec
- Fixed `formatCurrency()` in `src/utils/formatters.ts`: added `Math.round(abs * 100) / 100` before extracting integer and decimal parts to prevent floating point errors producing 3 decimals (e.g., "999,100" instead of "999,10").
- Added non-functional requirement in `011 spec`: "Monetary format: all amounts displayed with max 2 decimals".
- Added acceptance criterion in `011 spec`: total balance with max 2 decimals.

[2026-07-14] + | spec/features/012-pagina-modificar-eliminar-cuenta/ (spec delete account)
- Added "6. Delete Button" section in `1-spec.md`: cascading delete with a single confirmation modal (interpolated account name, warning message, Cancel/Delete).
- Updated objective in `1-spec.md` to mention deletion with cascading delete.
- Added non-functional requirement about cascading delete in `1-spec.md`.
- Added 3 acceptance criteria for the deletion flow in `1-spec.md`.
- Added 5 i18n keys (`modify_account_delete*`) in `2-plan.md`.
- Added `transactionRepo.deleteByAccountId` to repo changes list in `2-plan.md`.
- Updated navigation diagram in `2-plan.md` with deletion route.
- Added tasks T8 (repo deleteByAccountId), T12 (delete button + modal) in `3-tasks.md`. Total: 14 tasks.

[2026-07-14] + | ModifyAccountScreen.tsx, transactionRepo.ts, webStorage.ts, i18n/
- Implemented "Delete" button in ModifyAccountScreen (012): red button with trash icon before Save button, confirmation modal with interpolated account name, transaction deletion message, Cancel/Delete.
- Added `deleteByAccountId(id)` to `transactionRepo.ts` (SQL: `DELETE FROM transactions WHERE account_id = ?`) and `webStorage.ts` (filter out transactions).
- Added 5 i18n keys in en.ts, es.ts, ca.ts: `modify_account_delete`, `modify_account_delete_confirm_title`, `modify_account_delete_confirm_message`, `modify_account_delete_confirm_cancel`, `modify_account_delete_confirm_delete`.

[2026-07-14] ~ | spec/features/009 and 012 (rename folders)
- Renamed folder `009-pagina-modificar-categoria` → `009-pagina-modificar-eliminar-categoria`.
- Renamed folder `012-pagina-modificar-cuenta` → `012-pagina-modificar-eliminar-cuenta`.
- Updated titles in `1-spec.md`, `2-plan.md`, `3-tasks.md` of both features (added "/eliminar").
- Updated references in `spec/constitution/3-roadmap.md` (4 occurrences).
- Updated references in `docs/registro-cambios.md` (11 historical occurrences).

[2026-07-14] ~ | spec/features/004 (rename folder)
- Renamed folder `004-pagina-transaccion` → `004-pagina-anadir-transaccion`.
- Updated references in `spec/constitution/3-roadmap.md` (2 occurrences) and `docs/registro-cambios.md` (5 historical occurrences).

[2026-07-14] + | spec/features/014-pagina-transacciones-por-pagina-inicial/ (new spec)
- Created spec `014-pagina-transacciones-por-pagina-inicial` for the filtered transaction list screen.
- `1-spec.md`: account selector with modal, sorting by date/amount with ASC/DESC toggle, list grouped by day, FAB "+", 16 acceptance criteria.
- `2-plan.md`: plan with AccountSelector, SortToggle, TransactionGroup components. Rewrite of existing TransactionsScreen.
- `3-tasks.md`: 11 tasks in 4 phases.
- Added entry in `spec/constitution/3-roadmap.md`.

[2026-07-14] + | spec/features/014-pagina-transacciones-por-pagina-inicial/ (implementation)
- Implemented TransactionsScreen.tsx (014): complete rewrite with AccountSelector, SortToggle, SectionList grouped by day, FAB "+".
- Created AccountSelector.tsx component: trigger row with active account name + modal with account list (radio buttons + name + balance), Cancel/Select.
- Created SortToggle.tsx component: 2-option toggle (By date / By amount) with direction button (↓/↑) for ASC/DESC.
- Created TransactionGroup.tsx component: section with date header and transaction list (category icon, name, description, colored amount).
- Added i18n keys: `select_account`, `cancel`, `confirm`, `sort_date`, `sort_amount` in en/es/ca.
- Updated types.ts: Transactions params now include `period`, `startDate`, `endDate` in addition to `categoryId` and `type`.
- Updated HomeScreen: `handleCategoryPress` calculates active period date range and passes ISO parameters to Transactions.

[2026-07-14] ~ | spec/features/014-pagina-transacciones → 014-pagina-transacciones-por-pagina-inicial (rename)
- Renamed folder `014-pagina-transacciones` → `014-pagina-transacciones-por-pagina-inicial`.
- Updated titles in `1-spec.md`, `2-plan.md`, `3-tasks.md` (added "(desde página inicial)").
- Updated references in `spec/constitution/3-roadmap.md` and `docs/registro-cambios.md`.

[2026-07-14] + | spec/features/015-pagina-transacciones-por-menu-hamburguesa/ (new spec)
- Created spec `015-pagina-transacciones-por-menu-hamburguesa` for the transaction list screen accessible from the hamburger menu.
- `1-spec.md`: no category or period filters, shows all transactions, account selector, sorting, FAB "+", 17 acceptance criteria.
- `2-plan.md`: reuses TransactionsScreen from 014 (no code changes).
- `3-tasks.md`: 7 verification tasks (no new implementation).
- Added entry in `spec/constitution/3-roadmap.md`.

[2026-07-14] ~ | src/screens/TransactionsScreen.tsx (bug fix)
- Fixed bug: `transactions` from `useApp()` was filtered by `activeAccount`, so changing account in the selector didn't show other accounts' transactions.
- TransactionsScreen now loads all transactions directly from `transactionRepository.list()` (no `account_id` filter) and filters locally by `selectedAccountId`.

[2026-07-15] + | src/hooks/useTransactionFilters.ts (new hook)
- Created `useTransactionFilters` hook to encapsulate shared filtering, sorting and grouping logic for transactions.
- Parameters: `categoryId`, `startDate`, `endDate`, `selectedAccountId`, `sortBy`, `sortDirection`.
- Result: `allTransactions`, `filtered`, `sections`.

[2026-07-15] ~ | src/screens/TransactionsScreen.tsx (014 — new header)
- Header rewrite: removed duplication with Stack navigator header (`headerShown: false`).
- New header: back arrow + category icon + category name (row 1) + formatted total + period + selected account (row 2).
- Uses `useTransactionFilters` hook instead of inline logic.

[2026-07-15] + | src/screens/AllTransactionsScreen.tsx (015 — new screen)
- Created `AllTransactionsScreen` for hamburger menu access.
- Simple header: back arrow + "Transactions".
- Reuses `AccountSelector`, `SortToggle`, `TransactionGroup` and `useTransactionFilters`.
- Loads all transactions without category or period filters.

[2026-07-15] ~ | src/constants/types.ts
- Added `AllTransactions: undefined` to `RootStackParamList`.
- Added `AllTransactionsScreenProps` type.

[2026-07-15] ~ | src/navigation/AppNavigator.tsx
- Imported and registered `AllTransactionsScreen` in HomeStack with `headerShown: false`.
- Updated "Transactions" DrawerItem to navigate to `'Main', { screen: 'AllTransactions' }`.

[2026-07-15] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added `period_custom` key (Custom / Personalizado / Personalitzat).

[2026-07-15] ~ | spec/features/014-pagina-transacciones-por-pagina-inicial/1-spec.md
- Updated section 1 (Access and navigation): custom header with category icon + name + total + period + account.
- Updated acceptance criteria to reflect the new header.

[2026-07-15] ~ | spec/features/015-pagina-transacciones-por-menu-hamburguesa/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated spec to reference `AllTransactionsScreen` instead of reusing `TransactionsScreen`.
- Added shared components and shared hook in non-functional requirements.
- Updated plan with files to create/modify.
- Updated tasks (T1-T5 as completed, T6-T10 pending).

[2026-07-15] ~ | src/utils/formatters.ts, src/context/AppContext.tsx, src/screens/HomeScreen.tsx
- Extracted `formatDateForDB` function from AppContext to `src/utils/formatters.ts` (shared utility).
- Removed local `formatDateForDB` definition from AppContext, now imported from formatters.
- Fixed bug: `HomeScreen.handleCategoryPress` used `toISOString()` to pass dates to Transactions, but the DB stores dates as `YYYY-MM-DD HH:MM:SS`. The format difference (T vs space, UTC timezone) caused SQLite string comparison to fail, resulting in 0 transactions shown for the "Day" period.

[2026-07-15] + | docs/programming-concepts.md
- Added "Date Formats and SQLite String Comparison" concept documenting the date format bug and its solution.

[2026-07-15] ~ | src/screens/HomeScreen.tsx
- Fixed bug: `handleCategoryPress` used `new Date()` (always current date) instead of the user's `selectedDate`. When navigating to Transactions with a past date, the screen queried the current date instead of the selected one, resulting in an empty list.

[2026-07-15] ~ | src/screens/TransactionsScreen.tsx
- Category total in header: dynamic color (green if ≥ 0, red if < 0) and "+" prefix for positive values.
- Fixed total sign: expenses are subtracted (`-t.amount`) to align with HomeScreen pattern.

[2026-07-15] ~ | src/components/SortToggle.tsx
- Added `flexShrink: 1` to SortToggle container to prevent overflow when both options ("By date" + "By amount") don't fit in the available space.

[2026-07-15] ~ | src/screens/TransactionsScreen.tsx, src/screens/AllTransactionsScreen.tsx
- Added `flexWrap: 'wrap'` and `gap: 8` to the controls container so SortToggle wraps to the next line when it doesn't fit alongside AccountSelector.

[2026-07-15] ~ | src/screens/TransactionsScreen.tsx, src/screens/AllTransactionsScreen.tsx
- Changed controls layout from row (`flexDirection: row`) to column: AccountSelector and SortToggle now go in separate rows with `gap: 8`, preventing sort labels from overflowing horizontally.

[2026-07-15] ~ | src/screens/AllTransactionsScreen.tsx
- Reverted to using AccountSelector + SortToggle in the same row (same pattern as TransactionsScreen).
- Added period total below AccountSelector (green/`+` if ≥ 0, red/`-` if < 0).

[2026-07-15] ~ | spec/features/014-pagina-transacciones-por-pagina-inicial/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated spec to reflect final implementation: Stack navigator header (not custom), category section with icon + name + colored total, centered FAB.

[2026-07-15] ~ | spec/features/015-pagina-transacciones-por-menu-hamburguesa/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated spec to reflect final implementation: total balance below AccountSelector, centered FAB, Stack navigator header.

[2026-07-15] ~ | src/screens/HomeScreen.tsx, spec/features/015-pagina-transacciones-por-menu-hamburguesa/
- Statistics icon in HomeScreen now navigates to AllTransactions instead of Transactions.
- Updated spec 015 to document both access points (drawer + HomeScreen icon).

[2026-07-15] ~ | src/screens/TransactionsScreen.tsx, src/screens/AllTransactionsScreen.tsx, src/navigation/AppNavigator.tsx, src/i18n/en.ts, es.ts, ca.ts
- AllTransactionsScreen title changed from "Transacciones" to "Todas las transacciones" (multilingual: es: "Todas las transacciones", en: "All transactions", ca: "Totes les transaccions").
- Added i18n key `nav_all_transactions` in en.ts, es.ts, ca.ts.
- AllTransactions header icon changed from `stats-chart-outline` to `list-outline`.
- Restructured layout of both transaction screens: added `View.container(flex:1)` between SafeAreaView and all content (same pattern as HomeScreen, AccountsScreen, CategoriesScreen).
- Removed `keyboardSpacer` (200px always visible on Android that consumed flex space from SectionList).
- SectionList is now a direct child of the container View (no unnecessary wrapper View).
- Removed `Platform` import from both screens.

[2026-07-15] ~ | spec/features/014-pagina-transacciones-por-pagina-inicial/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Added `SafeAreaView > View.container(flex:1) > [categoryInfo, controls, SectionList, FAB(absolute)]` layout structure in non-functional requirements, plan and tasks.

[2026-07-15] ~ | spec/features/015-pagina-transacciones-por-menu-hamburguesa/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated title from "Transacciones" to "Todas las transacciones" in spec, plan and tasks.
- Added `SafeAreaView > View.container(flex:1) > [controls, SectionList, FAB(absolute)]` layout structure in non-functional requirements and plan.
- Updated header icon from `stats-chart-outline` to `list-outline`.

[2026-07-15] ~ | spec/constitution/3-roadmap.md
- Updated status of 011, 012, 013, 014 and 015 from "pending" to "completed".
- Updated descriptions of 014 and 015 to reflect final implementation (container layout, "All transactions" title, independent AllTransactionsScreen).

[2026-07-15] ~ | src/screens/HomeScreen.tsx
- Added account icon (24×24 circular with background color) in the HomeScreen header.
- Removed `textTransform: 'uppercase'` and `letterSpacing: 1` from the account name.
- Added "+" prefix to total balance when positive (consistency with other screens).
- Account name font size changed from fs(12) to fs(14) (consistency with AccountSelector).

[2026-07-15] + | docs/programming-concepts.md
- Added "Typography and font sizes" section: `fs()` scaling system, size table by element, font weights, style conventions by UI type (names, totals, headers, buttons).

[2026-07-15] ~ | src/screens/AccountsScreen.tsx
- Fix: added "+" prefix to each account balance and total when value is positive (consistency with HomeScreen, TransactionsScreen and AllTransactionsScreen).

[2026-07-15] ~ | spec/constitution/2-tech-stack.md
- Expanded "Visual Design" section with complete "Typography" subsection: `fs()` scaling system, size table by element (12 levels), font weights, monetary format conventions and account name conventions.

[2026-07-15] ~ | spec/constitution/2-tech-stack.md
- Complete file tree update: added 7 screens, 7 components, 1 hook, 1 utility, 1 constant and 1 missing migration.
- Fixed dependency: added `@expo/vector-icons` (Ionicons) and corrected "no external UI library".
- Added navigation and animation dependencies: `@react-navigation/*`, `react-native-reanimated`, `react-native-gesture-handler`, `react-native-screens`, `react-native-safe-area-context`.
- Documented `DATABASE_VERSION = 6` in `database.ts` description.

[2026-07-15] ~ | README.md
- Added `@expo/vector-icons` (Ionicons) to the stack table.
- Updated file tree: +6 screens, +3 components, +1 hook, +1 constant, +1 migration, +8 specs.
- Expanded features list: account management, category listing/editing, reusable account selector, transaction sorting, all transactions screen.

[2026-07-15] ~ | src/screens/AccountsScreen.tsx, TransactionsScreen.tsx, AllTransactionsScreen.tsx
- AccountsScreen: centered FAB (`alignSelf: 'center'` instead of `right: 24`).
- TransactionsScreen and AllTransactionsScreen: "+" icon color changed from `#FFFFFF` to `c.background` (consistency with AccountsScreen and HomeScreen, adaptable to dark/light theme).

[2026-07-15] ~ | src/screens/AllTransactionsScreen.tsx
- Added `headerLeft` with hamburger icon (`menu-outline`) using `DrawerActions.openDrawer()` (consistency with AccountsScreen and CategoriesScreen).

[2026-07-15] ~ | src/navigation/AppNavigator.tsx
- AllTransactions header icon changed from `list-outline` to `stats-chart-outline` (consistency with TransactionsScreen).

[2026-07-15] ~ | src/screens/HomeScreen.tsx, AccountsScreen.tsx, TransactionsScreen.tsx, AllTransactionsScreen.tsx
- Unified FAB "+" across all 4 screens: centered (`alignSelf: 'center'`), `bottom: 56`, `Ionicons "add"` icon with `c.background` color, consistent shadow.
- HomeScreen: changed from `<Text>+</Text>` to `<Ionicons>`, centered, removed `Platform.select` and `fabText`.
- TransactionsScreen and AllTransactionsScreen: removed `View.container` wrapper, FAB is direct child of SafeAreaView.

[2026-07-15] ~ | spec/features/011-pagina-cuentas/1-spec.md
- Updated FAB: from "bottom-right corner" to "centered", added position details (`bottom: 56`) and icon color (`c.background`).

[2026-07-15] ~ | spec/features/001-pagina-inicial/1-spec.md
- Expanded FAB description: centered position, `bottom: 56`, `Ionicons "add"` icon, `c.background` color.

[2026-07-15] ~ | spec/features/014-pagina-transacciones-por-pagina-inicial/ and 015-pagina-transacciones-por-menu-hamburguesa/
- Updated layout structure: removed `View.container(flex:1)`, FAB is direct child of SafeAreaView.

[2026-07-15] + | Feature: Account appearance (square/circle)
- Added `accountIconShape: 'square' | 'circle'` to Config interface and defaults in ConfigContext, configRepo, webStorage.
- Added "Account appearance" section in SettingsScreen with inline selector (Square/Circle).
- Added i18n keys `settings_account_icon_shape` in es/en/ca.
- Updated 7 components to use `config.accountIconShape`: AccountsScreen, HomeScreen, AccountSelector (trigger + modal), AccountModal, CreateAccountScreen, ModifyAccountScreen.
- Updated spec 003: added section 2.7, acceptance criterion, tasks T25-T27.

[2026-07-15] + | spec/features/017-pagina-modificar-transaccion/
- Created complete spec for the modify transaction page: 1-spec.md (functional requirements), 2-plan.md (architecture and components), 3-tasks.md (17 tasks in 6 phases).
- Includes: preloading current transaction data, category grid with current category in first position, reuse of all AddTransaction components, "Save" button calling update().

[2026-07-15] + | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys: modify_title, modify_save, modify_error_title, modify_error_message.

[2026-07-15] ~ | src/screens/ModifyTransactionScreen.tsx
- Replaced TODO placeholder with full implementation: modification form preloaded with transaction data.
- Same components as AddTransactionScreen (TypeTabs, CalculatorModal, AccountModal, CategoryGrid, DaySelector, TagSection, CommentInput, PhotoSection).
- Current category shown in first position of the grid.
- "Save" button with validation (category + amount > 0 + day + account).
- On save: transactionRepository.update() + refresh() + goBack().

[2026-07-15] ~ | src/screens/AddTransactionScreen.tsx
- Exported consumePendingCategory() function for use by ModifyTransactionScreen.

[2026-07-15] ~ | src/navigation/AppNavigator.tsx
- ModifyTransactionScreen title changed from details_edit to modify_title.

[2026-07-16] ~ | FinlyApp/app.json
- Removed `developmentClient: { silentLaunch: true }` configuration that forced EAS to use `expo run:android` (full native build from scratch) instead of the standard managed workflow. This configuration was causing C++ compilation errors with `react-native-worklets` during the Gradle build.

[2026-07-16] ~ | FinlyApp/package.json
- Removed `expo-dev-client` (not needed for preview builds, was modifying native configuration).
- Removed `react-native-worklets` (was causing C++ compilation errors in Gradle).
- Added `hermes-compiler@0.15.1` (required by build.gradle generated by expo prebuild; not included in react-native@0.81.5).
- Added `expo-font@~14.0.12` to deduplicate expo-font (prevents conflict with expo-font@57 from @expo/vector-icons).
- Fixed `@types/react` from `~19.2.2` to `~19.1.10` (version expected by SDK 54).
- Fixed `typescript` from `~6.0.3` to `~5.9.2` (version expected by SDK 54).
- Regenerated `package-lock.json` with npm 10.x for EAS Build compatibility.

[2026-07-16] ~ | src/database/migrations/002_seed.ts
- Changed `INSERT` to `INSERT OR IGNORE` in all seed statements (users, accounts, categories, transactions) to prevent UNIQUE constraint errors when reinstalling the APK without clearing the database.

[2026-07-16] ~ | src/database/migrations/005_english_schema.ts
- Added `IF NOT EXISTS` to all `CREATE TABLE` statements to prevent "table already exists" on fresh installs (tables are already created in migration 001).
- Added guard that checks if the `usuarios` (Spanish) table exists before running the data migration. On fresh installs, old tables don't exist and the data migration is correctly skipped.

[2026-07-16] ~ | App.tsx
- Added visible error text on the database error screen (`dbError`) to facilitate debugging on APK.

[2026-07-16] ~ | README.md
- Added "Generate Android APK" section with complete instructions: requirements (EAS CLI, expo.dev account), `eas build --platform android --profile preview` command, APK installation on phone, and notes on preview/production APK differences and independent database.

[2026-07-16] ~ | src/i18n/index.ts, src/screens/ModifyCategoryScreen.tsx
- Fix: category name in ModifyCategoryScreen now uses the translated i18n name for default categories instead of the raw English DB name. Added `getDefaultEnglishName()` and `getDisplayCategoryName()` helpers to i18n/index.ts. `getDisplayCategoryName()` checks if the stored name matches the default English name: if so, it returns the i18n translation; otherwise (user has customized the name), it returns the stored name.

[2026-07-16] ~ | 10 files: src/context/AppContext.tsx, src/components/CategoryGrid.tsx, src/components/TransactionGroup.tsx, src/screens/AddCategoryScreen.tsx, src/screens/CategoriesScreen.tsx, src/screens/TransactionDetailsScreen.tsx, src/screens/TransactionsScreen.tsx, src/screens/ModifyCategoryScreen.tsx
- Replaced all `getCategoryName(cat.id) || cat.name` fallback pattern with `getDisplayCategoryName(cat)` across the entire codebase. Fixes the bug where custom-renamed default categories still showed the translated i18n name in category grids, transaction lists, and detail screens.

[2026-07-16] ~ | 7 files: src/components/AccountSelector.tsx, src/components/AccountModal.tsx, src/components/CategoryGrid.tsx, src/components/TagSection.tsx, src/screens/AccountsScreen.tsx, src/context/AppContext.tsx, src/database/webStorage.ts
- Translated remaining Spanish variable names to English: `saldo` → `balance`, `nombre` → `categoryName`/`name`, `ahora` → `now`, `actual` → `current`.

[2026-07-16] ~ | src/database/migrations/001_initial.ts
- Added `description TEXT DEFAULT ''` column to accounts table (absorbed from deleted migration 006).

[2026-07-16] - | src/database/migrations/005_english_schema.ts
- Deleted. Contained redundant table creation (duplicated 001) and Spanish-to-English data migration logic no longer needed.

[2026-07-16] - | src/database/migrations/006_account_description.ts
- Deleted. Description column merged into 001_initial.ts.

[2026-07-16] ~ | src/database/database.ts
- Removed imports and calls for migrations 005 and 006. Removed startup icon fixups. Set `DATABASE_VERSION = 4`.

[2026-07-16] ~ | src/database/webStorage.ts
- Removed `migrateWebStorage()` (Spanish localStorage key migration) and `migrateWebCategories()` (icon fixups). Simplified `initWebStorage()` to only seed data on first load.

[2026-07-16] ~ | src/database/migrations/002_seed.ts
- Cleaned seed data for production: 1 user ("User"), 1 account ("My Wallet", €0), 31 universal categories (10 income + 19 expense). Removed all 10 mock transactions and 2 test accounts (Bank, Savings).

[2026-07-16] ~ | src/database/webStorage.ts
- Cleaned seed data to match 002_seed.ts: 1 account ("My Wallet"), 31 categories, 0 transactions. Removed mock transactions and duplicate accounts.

[2026-07-16] - | src/database/migrations/004_new_categories.ts
- Deleted. Categories now consolidated in 002_seed.ts.

[2026-07-16] - | src/data/mockData.ts
- Deleted. Legacy mock data file (mockAccounts, mockCategories, mockTransactions) never imported anywhere.

[2026-07-16] ~ | src/database/migrations/003_config.ts, src/database/repositories/configRepo.ts, src/database/webStorage.ts
- Changed default language from 'es' (Spanish) to 'en' (English) in config defaults.

[2026-07-16] ~ | src/database/migrations/002_seed.ts, src/database/webStorage.ts
- Fix: renumbered category IDs to match CATEGORY_I18N_KEYS in i18n/index.ts. Old IDs caused getDefaultEnglishName() to return wrong names when saving categories (e.g., Food saved as "Housing").

[2026-07-16] ~ | src/i18n/index.ts
- Fix: removed 5 stale CATEGORY_I18N_KEYS entries (Videogame, Game, Restaurant, Gifts, Interests) and renumbered remaining to match seed data.

[2026-07-16] ~ | src/i18n/en.ts, src/i18n/es.ts, src/i18n/ca.ts
- Removed stale category translations: cat_videogame, cat_game, cat_restaurant, cat_gifts, cat_interests.

[2026-07-17] ~ | src/context/ConfigContext.tsx
- Fix: changed default language from 'es' to 'en' to match configRepo, 003_config and webStorage defaults.

[2026-07-17] ~ | src/database/repositories/categoryRepo.ts, src/database/webStorage.ts
- Fix: made existsByName case-insensitive (LOWER(name) = LOWER(?)) to match accountRepo behavior. Prevents duplicate category names with different casing (e.g., "Food" vs "food").

[2026-07-17] ~ | src/components/TransactionGroup.tsx
- Fix: formatDateHeader now omits the year for current-year dates ("17 july") and includes it for previous years ("17 july 2024"). Removed unused lang parameter.

[2026-07-17] ~ | src/screens/ModifyAccountScreen.tsx
- Removed redundant deleteByAccountId call before account delete. Native cascades via ON DELETE CASCADE, web handles it inside webAccountRepo.delete(). Removed unused transactionRepository import.

[2026-07-17] ~ | AGENTS.md
- Added rule: agent always suggests a branch name for each implementation.

[2026-07-17] + | spec/features/018-tag-management/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created complete spec for tag management: database schema (tags + transaction_tags tables), tag repository CRUD, Tags screen (Drawer), CreateTag screen, ModifyTag/delete screen with confirmation.
- 14 tasks in 4 phases.

[2026-07-17] + | spec/features/019-tag-transactions/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created complete spec for persistent tag selection in Add/ModifyTransaction: replace hardcoded TagSection with DB tags, inline creation, createWithTags/updateWithTags/getTagsByTransactionId repository methods.
- 7 tasks in 2 phases.

[2026-07-17] + | spec/features/020-tag-home-filter/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created complete spec for HomeScreen tag filter: horizontal tag filter bar, per-category expandable tag breakdown (3 visible + "View all (N)"), tag filtering on chart and category totals, breakdownByCategoryAndTag queries.
- 9 tasks in 3 phases.

[2026-07-17] ~ | spec/constitution/3-roadmap.md
- Added 018-tag-management, 019-tag-transactions, 020-tag-home-filter with pending status.

[2026-07-18] ~ | spec/features/020-tag-home-filter/1-spec.md
- Rewrote tag filter bar: single-select → multi-select with OR logic.
- Added "Untagged" chip (exclusive with regular tags, always second after "All").
- "All" chip resets all selections (empty activeTagIds = no filter).
- Added `tagIds?: number[]` navigation parameter for tag filter inheritance to TransactionsScreen.
- Updated filtering logic: OR for regular tags, NOT EXISTS for untagged.
- Updated database queries: breakdownByCategoryAndTag includes Untagged row (tag_id = -1, UNION ALL).
- Added getTagsByTransactionIds batch query for TransactionGroup tag rendering.
- Updated AppContext: activeTagIds: number[], toggleTagId(), clearTagFilter().
- Updated acceptance criteria for multi-select, Untagged, and tag inheritance.

[2026-07-18] ~ | spec/features/020-tag-home-filter/2-plan.md
- Updated TagFilterBar component: multi-select props (activeTagIds, onToggle, onClear).
- Updated AppContext plan: activeTagIds state, toggleTagId with exclusive Untagged logic, OR filtering in filteredTransactions memo.
- Added SQL example for Untagged handling (NOT EXISTS subquery + UNION ALL).
- Updated data flow diagram with tag inheritance to TransactionsScreen.
- Added home_tag_untagged i18n key (en: "Untagged", es: "Sin etiqueta", ca: "Sense etiqueta").
- Updated estimate: 10 tasks in 3 phases (was 9 tasks).

[2026-07-18] ~ | spec/features/020-tag-home-filter/3-tasks.md
- Added T3: getTagsByTransactionIds batch query for TransactionGroup.
- Added T4: web localStorage support for all 3 new methods.
- Added T9: update constants/types.ts with tagIds nav param.
- Updated T5: AppContext with activeTagIds, toggleTagId, clearTagFilter, tagsByTransaction.
- Updated T6: TagFilterBar with multi-select, Untagged exclusive chip.
- Updated T7: CategoryList with Untagged in tag breakdown.
- Updated T8: HomeScreen passes tagIds in navigation params.
- Total: 11 tasks (was 9).

[2026-07-18] ~ | spec/features/019-tag-transactions/1-spec.md
- Added section 6: Transaction list with tags — TransactionGroup shows tag chips (fs(11), compact, no icon) below description per transaction row.
- Added section 7: Tag filter in navigation — TransactionsScreen accepts optional tagIds param, filters by OR logic with untagged support.
- Added getTagsByTransactionIds batch query to repository methods.
- Added acceptance criteria for transaction row tags, tag filter inheritance, and untagged support.

[2026-07-18] ~ | spec/features/019-tag-transactions/2-plan.md
- Added TransactionGroup modifications: tagsByTransaction prop, chip rendering below description.
- Added TransactionsScreen tag filtering: read tagIds from route, filter with OR logic, batch tag loading.
- Added AllTransactionsScreen batch tag loading.
- Added getTagsByTransactionIds method signature and TransactionsScreen filtering code example.
- Updated dependencies: added TransactionsScreen, AllTransactionsScreen, TransactionGroup.
- Updated estimate: 9 tasks in 3 phases (was 6 tasks).

[2026-07-18] ~ | spec/features/019-tag-transactions/3-tasks.md
- Added T3: add tagIds to constants/types.ts.
- Added T8: update TransactionGroup with tagsByTransaction prop and chip rendering.
- Added T9: update TransactionsScreen with tagIds filtering and batch tag loading.
- Added T10: update AllTransactionsScreen with batch tag loading.
- Added T11: expanded verification to include transaction row tags and tag filter inheritance.
- Total: 11 tasks (was 7).

[2026-07-18] ~ | src/constants/types.ts
- Added `tagIds?: number[]` to Transactions in RootStackParamList for tag filter inheritance from HomeScreen.

[2026-07-18] + | src/screens/TagsScreen.tsx
- Created Tags list screen with FlatList, hamburger menu, FAB, and empty state.
- Navigates to ModifyTag on row tap; useFocusEffect refreshes list.

[2026-07-18] + | src/screens/CreateTagScreen.tsx
- Created CreateTag screen with name input (max 20 chars), debounced duplicate validation, and Create button.

[2026-07-18] + | src/screens/ModifyTagScreen.tsx
- Created ModifyTag screen with name editing, duplicate validation, Delete button with confirmation modal, and Save.

[2026-07-18] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added tag i18n keys (13 total): nav_tags, tags_empty, create_tag_title, create_tag_name_placeholder, create_tag_button, create_tag_error_duplicate, modify_tag_title, modify_tag_delete, modify_tag_save, modify_tag_delete_confirm_title (function), modify_tag_delete_confirm_message, modify_tag_delete_confirm_cancel, modify_tag_delete_confirm_delete.

[2026-07-18] ~ | src/screens/CreateTagScreen.tsx, ModifyTagScreen.tsx
- Removed View wrapper around TextInput; applied borderWidth, borderRadius, padding directly on the input element to fix web focus outline not respecting rounded corners.

[2026-07-18] ~ | src/context/AppContext.tsx
- Added try/catch/finally to loadData() so loading spinner resolves even if a query fails; logs error to console.

[2026-07-18] ~ | src/database/database.ts
- Added table existence check after migrations to detect stale DB state (version set but table missing); re-runs migration 004 if tags table not found.

[2026-07-18] ~ | package.json
- Pinned react-native-worklets@0.5.1 to match Expo SDK 54 native code and fix TurboModule installTurboModule crash.

[2026-07-18] + | spec/infrastructure/001-expo-sqlite-wal-cleanup/
- Created spec documenting the expo-sqlite WAL sidecar file bug (expo/expo#43441), symptoms, and self-healing solution.

[2026-07-18] ~ | src/database/database.ts
- Added isDatabaseConsistent() and deleteDatabaseFile() helpers for WAL sidecar self-healing.
- Replaced ad-hoc tags table re-run with full database deletion + recursive reinit when stale state is detected.
- Fixes stale mock data persisting after Expo Go data clear / reinstall due to orphaned WAL/SHM files.
- Added db.closeAsync() before deleteDatabaseAsync to fix "database currently open" rejection.

[2026-07-18] + | src/database/repositories/transactionRepo.ts
- Added createWithTags(), updateWithTags(), getTagsByTransactionId(), getTagsByTransactionIds() methods for tag-transaction linking.

[2026-07-18] + | src/database/webStorage.ts
- Added createWithTags(), updateWithTags(), getTagsByTransactionId(), getTagsByTransactionIds() methods to webTransactionRepo for web platform parity.
- Fixed bracket mismatch in searchComments() (was `])]`, corrected to `)])`).

[2026-07-18] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added 2 i18n keys: add_tag_error_duplicate ("Tag already exists") and add_tag_error_empty ("Tag name cannot be empty").

[2026-07-18] ~ | src/components/TagSection.tsx
- Changed tags prop type from local `Tag` interface to database `Tag` type.
- Changed `onCreate` prop from `(name: string) => void` to `(name: string) => Promise<boolean>` to support async duplicate validation.
- Added duplicate validation via `onCreate` return value with Alert on failure.
- Added empty-name validation with Alert.

[2026-07-18] ~ | src/screens/AddTransactionScreen.tsx
- Replaced local hardcoded tags array with tags from AppContext (database-backed).
- Removed local `Tag` interface and `availableTags` state.
- `handleCreateTag` now uses `tagRepository.create()` and `refreshTags()`.
- `handleSubmit` now calls `transactionRepository.createWithTags()` and clears `selectedTags` after success.

[2026-07-18] ~ | src/screens/ModifyTransactionScreen.tsx
- Replaced local hardcoded tags array with tags from AppContext (database-backed).
- Removed local `Tag` interface and `availableTags` state.
- Added `useEffect` to load existing transaction tags via `getTagsByTransactionId()` on mount.
- `handleCreateTag` now uses `tagRepository.create()` and `refreshTags()`.
- `handleSubmit` now calls `transactionRepository.updateWithTags()` with selected tags.

[2026-07-18] ~ | src/components/TransactionGroup.tsx
- Added optional `tagsByTransaction` prop (`Map<number, { tag_id: number; name: string }[]>`).
- Renders tag chips below description using `fs(11)` font size and primary-colored semi-transparent background.

[2026-07-18] ~ | src/screens/TransactionsScreen.tsx
- Added tag filtering via `route.params.tagIds` (OR logic: keep transactions matching at least one selected tag).
- Added `tagsByTransaction` state and `useEffect` to batch-load tags for visible transactions.
- Passes `tagsByTransaction` to `TransactionGroup`.

[2026-07-18] ~ | src/screens/AllTransactionsScreen.tsx
- Added `tagsByTransaction` state and `useEffect` to batch-load tags for visible transactions.
- Passes `tagsByTransaction` to `TransactionGroup`.

[2026-07-18] ~ | src/screens/TransactionDetailsScreen.tsx
- Added `tagNames` state and `useFocusEffect` to reload tags every time the screen gains focus (via `getTagsByTransactionId()` + `getTagsByTransactionIds()`).
- Added Tags `DataRow` after Comment: renders tag chips (`primary` + 20% background, `primary` text, fs(13)) or `—` placeholder if no tags.

[2026-07-18] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added 2 i18n keys: `details_tags` ("Tags"/"Etiquetas"/"Etiquetes") and `details_no_tags` ("—"/"—"/"—").

[2026-07-18] ~ | spec/features/019-tag-transactions/1-spec.md
- Added §6b: TransactionDetailsScreen tag display (layout, chip style, placeholder behavior).
- Added 4 acceptance criteria for details screen tags.

[2026-07-18] ~ | spec/features/019-tag-transactions/2-plan.md
- Added TransactionDetailsScreen to modified files list and data flow diagram.

[2026-07-18] ~ | spec/features/019-tag-transactions/3-tasks.md
- Added T11 (TransactionDetailsScreen tag display), renumbered verification to T12.

[2026-07-18] ~ | src/components/TagSection.tsx
- Replaced `Alert.alert()` with inline red error message below the input in the create modal.
- Added real-time duplicate check with debounce (300ms) as user types.
- Added `error` state; cleared on typing and on modal close.
- Added red border on input when error is present (matching CreateTagScreen pattern).
- Updated error text to `fontSize: fs(13)` and `fontWeight: '500'` (consistent with CreateTagScreen).
- Added `borderWidth: 1` to modal input for border visibility.
- Submit button disabled when input is empty or has error (surface color + textSecondary text).
- Removed unused `Alert` import.

[2026-07-18] ~ | src/database/repositories/tagRepo.ts, src/database/webStorage.ts
- Changed tag sort order from alphabetical (`ORDER BY name` / `localeCompare`) to creation order (`ORDER BY id` / `id - b.id`) so newest tags appear at the end (right side, before "+ Add tag").

[2026-07-18] ~ | spec/features/020-tag-home-filter/1-spec.md
- Renamed feature from "Tag filter on HomeScreen" to "Tag filter on HomeScreen and TransactionsScreen".
- Moved TagFilterBar placement from below PeriodTabs to below chart (between chart and CategoryList).
- Added TransactionsScreen scope: TagFilterBar initialized from inherited nav params, independent toggle/clear, real-time local filtering.
- Added 3 new acceptance criteria for TransactionsScreen filter bar behavior.

[2026-07-18] ~ | spec/features/020-tag-home-filter/2-plan.md
- Updated data flow diagram with TransactionsScreen local tag filtering.
- Added TransactionsScreen.tsx to modified files list.
- Updated estimate: 12 tasks in 4 phases (was 10 tasks in 3 phases).

[2026-07-18] ~ | spec/features/020-tag-home-filter/3-tasks.md
- Added Phase 4 (T11): TransactionsScreen with localTagIds state, TagFilterBar rendering, local toggle/clear, useMemo-based filtering.
- Updated verification to T12: added TransactionsScreen filter bar testing.

[2026-07-18] + | src/components/TagFilterBar.tsx
- Created horizontal multi-select tag chip filter bar component.
- "All" chip (always first, calls onClear), "Untagged" chip (exclusive with regular tags), remaining tags sorted by name.
- Selected = primary background + background text; unselected = surface background + text text.
- Hidden when no tags exist. Optional `style` prop for per-screen customization.

[2026-07-18] + | src/database/repositories/transactionRepo.ts
- Added `breakdownByCategoryAndTag()` with UNION ALL for Untagged row (tag_id = -1).
- Added `tagIds: number[]` filter to `list()` with OR logic + NOT EXISTS for untagged.

[2026-07-18] + | src/database/webStorage.ts
- Added `breakdownByCategoryAndTag()` with JS filtering for web.
- Added `tagIds` filter to `list()` for web.

[2026-07-18] ~ | src/context/AppContext.tsx
- Added `activeTagIds: number[]` state, `toggleTagId(id)` with exclusive Untagged logic, `clearTagFilter()`.
- Added `tagsByTransaction: Map<number, number[]>` built on both `loadTransactions` and `refresh()`.
- Updated `filteredTransactions` memo to filter by activeTagIds (OR logic).
- Fix: `refresh()` now rebuilds `tagsByTransaction` map (was stale after adding transactions).

[2026-07-18] ~ | src/screens/HomeScreen.tsx
- Rendered TagFilterBar below chart, above CategoryList.
- Tag breakdowns loaded per-category with breakdownByCategoryAndTag.
- Passes activeTagIds as tagIds nav param to TransactionsScreen.

[2026-07-18] ~ | src/components/CategoryList.tsx
- Added expandable tag breakdown section below each category row (3 visible + expand/collapse).

[2026-07-18] ~ | src/screens/TransactionsScreen.tsx
- Added TagFilterBar below controls with localTagIds state (initialized from nav params).
- Local toggle/clear handlers independent from AppContext — HomeScreen filter is not affected.
- Moved tag filtering from useFocusEffect to filtered useMemo for real-time reactivity.
- categoryTotal now uses filtered (account + tag filtered) instead of allTransactions.
- Fix: tag filtering compared object `{ tag_id, name }` with number via `.includes(id)` — changed to `.some(t => t.tag_id === id)`.
- Fix: "All" chip calls `onClear()` directly instead of `onToggle(-2)`.

[2026-07-18] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys: home_tag_all, home_tag_untagged, home_tag_view_all, home_tag_show_less.

[2026-07-19] ~ | spec/features/020-tag-home-filter/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Added AllTransactionsScreen scope: tag filter bar with local state, dynamic balance, no nav params.
- Renamed feature from "Tag filter on HomeScreen and TransactionsScreen" to "Tag filter on HomeScreen, TransactionsScreen, and AllTransactionsScreen".
- Added section 5 (AllTransactionsScreen filter bar) in 1-spec.md with 7 functional requirements.
- Added 4 acceptance criteria for AllTransactionsScreen in 1-spec.md.
- Added AllTransactionsScreen.tsx to modified files in 2-plan.md.
- Added AllTransactionsScreen data flow and layout diagram in 2-plan.md.
- Added Phase 5 (T13-T14) in 3-tasks.md for AllTransactionsScreen implementation.
- Updated verification task T12 to cover AllTransactionsScreen.
- Updated estimate: 14 tasks in 5 phases (was 12 tasks in 4 phases).

[2026-07-19] ~ | spec/constitution/3-roadmap.md
- Updated 020-tag-home-filter description to mention TransactionsScreen and AllTransactionsScreen.

[2026-07-19] ~ | src/components/TagFilterBar.tsx
- Added outlined style for "All" and "Untagged" chips when unselected (transparent background, 1px border, textSecondary color) to visually distinguish them from regular tag chips.
- When selected, "All" and "Untagged" use a desaturated primary shade (80% opacity) to remain visually distinct from regular tag chips (100% primary).

[2026-07-19] ~ | spec/features/020-tag-home-filter/1-spec.md
- Added note about outlined chip style for "All" and "Untagged" in section 1 (tag filter bar visual).

[2026-07-19] ~ | src/screens/HomeScreen.tsx
- Restricted account selector modal to open only when tapping the account row (icon + name + chevron-down), not the entire center area. Total and summary rows are now non-interactive.

[2026-07-19] ~ | src/navigation/AppNavigator.tsx
- Reordered drawer menu: Home, Transactions, Accounts, Categories, Tags, separator, Settings. Settings moved to bottom (rarely accessed), daily-use items grouped at top. Added visual separator before Settings.
- Renamed drawer label from "Transactions" to "All transactions" (uses existing `nav_all_transactions` i18n key) to match the screen it navigates to.

[2026-07-19] ~ | src/components/AccountModal.tsx, src/components/AccountSelector.tsx (deleted)
- Unified account selection: rewrote AccountModal from bottom-sheet-with-immediate-selection to centered-modal-with-radio-buttons-and-confirm/cancel. Props now include `selectedId` and `onSelect(id)`.
- Deleted AccountSelector.tsx (its functionality absorbed into AccountModal + inline trigger rows in screens).

[2026-07-19] ~ | src/screens/AllTransactionsScreen.tsx, src/screens/TransactionsScreen.tsx
- Replaced AccountSelector with AccountModal + inline trigger row (icon + name + chevron-down). Account selection now uses radio + confirm/cancel for consistency.

[2026-07-19] ~ | src/screens/HomeScreen.tsx, src/screens/AddTransactionScreen.tsx, src/screens/ModifyTransactionScreen.tsx
- Added `selectedId` prop to AccountModal. Updated `onSelect` handlers to accept `id: number` instead of full account object.

[2026-07-19] ~ | src/screens/AddTransactionScreen.tsx
- Fix: reset `selectedTags` only on first screen focus (fresh mount) via `isFirstFocus` ref in `useFocusEffect`, preventing stale tag selections from persisting when the screen is reused. Previously reset on every focus, which wiped tags when returning from CreateCategory.

[2026-07-19] ~ | src/database/webStorage.ts
- Fix: clean up orphaned `transaction_tags` entries when deleting transactions (`delete`, `deleteByAccountId`) and when deleting accounts. Orphaned entries caused ghost tags to appear on new transactions when IDs were reused after deletion.
- Fix: `initWebStorage` now purges orphaned `transaction_tags` on startup (from pre-fix data).

[2026-07-19] ~ | src/database/webStorage.ts, src/database/repositories/transactionRepo.ts, src/screens/HomeScreen.tsx
- Added optional `tagIds` parameter to `breakdownByCategoryAndTag` in both web and native implementations. When a tag filter is active, only transactions matching the selected tags are included in the breakdown — totals and pills now reflect only the filtered set.

[2026-07-19] ~ | src/components/TagFilterBar.tsx
- Fix: removed alphabetical sort (`localeCompare`) so tag chips display in creation order (by ID), matching the order in AddTransaction's TagSection.

[2026-07-19] ~ | src/screens/TransactionsScreen.tsx
- Removed "+" FAB button. Transactions can only be added from HomeScreen to avoid confusion when the new transaction doesn't match the current category/period filter.

[2026-07-19] ~ | src/screens/CategoriesScreen.tsx
- Replaced inline "Create" grid item with a floating "+" FAB button, matching the pattern used in Accounts and Tags screens.

[2026-07-19] ~ | src/i18n/index.ts, src/screens/CreateCategoryScreen.tsx, src/screens/ModifyCategoryScreen.tsx
- Added `getAllDefaultCategoryNames()` to i18n module returning all default category names across all languages (en, es, ca). Category name validation now blocks names matching any default category in any language, not just the database.

[2026-07-19] ~ | src/screens/CategoriesScreen.tsx
- "Others" (id 15) and "Other" (id 18) categories now always appear at the end of the grid, regardless of alphabetical sort.

[2026-07-19] ~ | src/screens/HomeScreen.tsx
- Fix: "Untagged" pill no longer appears in category tag breakdowns when there are zero tags in the system.

[2026-07-19] ~ | src/screens/AddTransactionScreen.tsx, src/screens/ModifyTransactionScreen.tsx
- Fix: amount input focus border now renders on the rounded container (borderRadius: 12) instead of showing a square Android default focus outline.

[2026-07-19] ~ | src/navigation/AppNavigator.tsx
- All stack navigator header titles now centered (`headerTitleAlign: 'center'` in global `screenOptions`).

[2026-07-19] ~ | src/database/types.ts, src/database/database.ts, src/database/migrations/005_updated_at.ts, src/database/repositories/transactionRepo.ts, src/database/webStorage.ts, src/screens/TransactionDetailsScreen.tsx, src/i18n/en.ts, src/i18n/es.ts, src/i18n/ca.ts
- Feat: added `updated_at` field to Transaction (DB v5, nullable, set on every update). Details screen now shows "Created: HH:mm - DD MMM yyyy" and, when modified, a second line "Updated: HH:mm - DD MMM yyyy" underneath.

[2026-07-19] ~ | src/screens/AddCategoryScreen.tsx
- Replaced inline "Create" grid item with floating "+" FAB (matching CategoriesScreen pattern). Added "Others"/"Other" sorting to end of grid (IDs 15/18).

[2026-07-19] ~ | src/constants/types.ts, src/screens/CategoriesScreen.tsx, src/screens/AddCategoryScreen.tsx
- Extracted hardcoded category IDs 15/18 into `OTHERS_CATEGORY_ID` and `OTHER_CATEGORY_ID` constants. Added `sortCategoriesWithOthersLast()` utility used by both category grid screens.

[2026-07-19] ~ | src/components/CategoryGrid.tsx
- "More"/"Create" button in compact category grid now uses a dashed outline style (transparent background + dashed border) to visually distinguish it from regular category items.

[2026-07-19] ~ | src/database/database.ts, src/database/migrations/001_initial.ts, 002_seed.ts, 003_config.ts, deleted 004_tags.ts, 005_updated_at.ts, spec/constitution/2-tech-stack.md
- Simplified DB initialization: merged tags + transaction_tags tables and transactions.updated_at column into the initial schema (001_initial.ts). Removed versioned migrations 004 (tags) and 005 (updated_at) and the WAL self-healing/recovery flow from database.ts.
- initDatabase() now runs only the unified initial schema + seed + config defaults (no DATABASE_VERSION / PRAGMA user_version / deleteDatabaseAsync). The developer resets the DB manually (clear LocalStorage / Clear Data), so no automatic migration path is needed.
- Updated constitution 2-tech-stack.md: SQLite now described as a single initial schema migration (no DATABASE_VERSION).

[2026-07-19] ~ | src/database/migrations/001_initial.ts, 002_seed.ts, 003_config.ts, src/database/database.ts
- Renamed migration/seed functions to reflect their purpose: migrate001 -> createSchema, seed002 -> seedData, migrate003 -> seedConfig.
- 003_config.ts now seeds the full config set including category_icon_shape and account_icon_shape (previously missing, relied on runtime fallback to defaults).
- initDatabase() reads as createSchema -> seedData -> seedConfig.

[2026-07-19] ~ | spec/features/002-db-design/ (1-spec.md, 2-plan.md, 3-tasks.md), spec/constitution/3-roadmap.md
- Updated 002-db-design spec to reflect the implemented schema: English table/column names, added tags + transaction_tags junction tables, transactions.updated_at, accounts.description, and the 8-key config table.
- Documented the single-pass initialization (createSchema -> seedData -> seedConfig) with no versioned migrations in development; web localStorage fallback; and the full repository method list.
- Updated constitution roadmap 002 entry (7 tables, no versioned migrations, web fallback).

[2026-07-19] ~ | src/navigation/AppNavigator.tsx, src/screens/CategoriesScreen.tsx
- Changed the Categories icon from pricetag-outline to grid-outline in the drawer menu, the Categories header title, and the category list empty state. Tags keeps pricetag-outline.

[2026-07-19] ~ | src/navigation/AppNavigator.tsx
- Changed the Create category screen header title icon from pricetag-outline to grid-outline to match the Categories icon.

[2026-07-19] ~ | src/navigation/AppNavigator.tsx
- Changed the Add category and Modify category screen header title icons from pricetag-outline to grid-outline to match the Categories icon. Only Tags retains pricetag-outline.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx
- Category deletion no longer shows the reassign-target modal when the category has no transactions: confirming deletion now deletes directly. The reassign modal only appears when there are linked transactions.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx
- Fix: after deleting (or reassigning) a category, transactions are now reloaded via refresh() so the HomeScreen donut chart and category breakdown reflect the reassigned transactions instead of stale category_ids.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx, src/i18n/en.ts, es.ts, ca.ts
- Category delete confirmation now shows a different message when the category has no transactions (modify_cat_delete_confirm_message_empty: 'This category will be permanently deleted.') instead of the misleading 'moved to a category of your choice' text.

[2026-07-19] ~ | spec/features/009-modify-delete-category-screen/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated 009 spec: category deletion now offers a choice. Scenario A (has transactions): message 'Before deleting the category, its transactions will be moved to another category' + 'Move transactions first' and 'Permanent delete' buttons. Scenario B (no transactions): message 'This category will be permanently deleted.' + only 'Permanent delete' (no 'Move' button).
- Added i18n keys modify_cat_delete_confirm_message_empty, modify_cat_delete_confirm_move; renamed modify_cat_delete_confirm_delete to 'Permanent delete'.

[2026-07-19] + | src/screens/ModifyCategoryScreen.tsx, src/i18n/en.ts, es.ts, ca.ts
- Category deletion now offers a choice in the confirmation modal: 'Move transactions first' (opens target category picker, then reassigns) and 'Permanent delete' (deletes the category and its transactions directly). The 'Move transactions first' button is only shown when the category has linked transactions; otherwise only 'Permanent delete' appears. Updated i18n keys: modify_cat_delete_confirm_message, modify_cat_delete_confirm_delete ('Permanent delete'), and added modify_cat_delete_confirm_move.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx
- Fixed the category delete confirmation modal layout: Cancel is now a full-width button on its own row, with 'Move transactions first' and 'Permanent delete' in a clean two-button row below. This avoids the cramped 3-button row where longer labels wrapped awkwardly and broke text alignment.

[2026-07-19] ~ | src/i18n/en.ts, es.ts, ca.ts, spec/features/009-modify-delete-category-screen/1-spec.md
- Clarified the category delete confirmation message for the 'has transactions' scenario: it now states transactions are deleted by default unless the user chooses to move them (avoids implying a move always happens). Updated 009 spec to match.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx, spec/constitution/5-validations.md
- 'Move transactions first' button in the category delete modal now uses the primary color (c.primary bg, c.background text) as a distinct safe-alternative action, instead of the neutral surface style.
- Updated constitution 5-validations.md Confirmation Modals section to document the three modal button styles (Cancel neutral, Primary action, Destructive/Confirm red) and the column layout for more than two buttons.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx
- Added textAlign: 'center' to modalButtonText so long button labels (e.g. Spanish 'Mover transacciones primero' / 'Eliminar permanentemente') wrap centered within the button instead of left-aligned.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx
- Fixed the Cancel button not being visible in the category delete confirmation modal (with transactions): the Cancel button no longer inherits the row flex:1 style when placed in the column layout; a modalButtonFull (width 100%) style keeps it full-width and its text centered/visible.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx
- Fixed the Cancel button collapsing (no height, no text) in the category delete modal on native: modalButtonFull now overrides flex to 0, and modalButton gained minHeight: 44 + justifyContent: 'center' so buttons always have a visible tappable size regardless of flex layout.

[2026-07-19] ~ | src/screens/ModifyCategoryScreen.tsx, spec/features/009-modify-delete-category-screen/1-spec.md
- Edge case: when deleting a category that has transactions but is the only category of its type (no other same-type category to move to), the modal now shows the 'no transactions' message and only 'Permanent delete' (no 'Move transactions first'), avoiding a dead-end picker with no targets.
- Updated 009 spec: added Scenario A2 (only category of its type) and clarified the modal-button conditions in acceptance criteria.
[2026-07-19] + | src/i18n/{en,es,ca}.ts, src/i18n/index.ts, src/screens/{AccountsScreen,HomeScreen,AddTransactionScreen,ModifyTransactionScreen,AllTransactionsScreen,TransactionsScreen,TransactionDetailsScreen,ModifyAccountScreen}.tsx, src/components/AccountModal.tsx, spec/features/{011-accounts-screen,002-db-design}/1-spec.md
- Made the default account (id 1, 'My Wallet') multilingual, mirroring the default-category approach: stored in English and translated at display time via getDisplayAccountName(account) (en 'My Wallet', es 'Mi Cartera', ca 'La meva cartera').
- Added ACCOUNT_I18N_KEYS map and getDisplayAccountName / getDefaultEnglishAccountName helpers to src/i18n/index.ts.
- Wrapped all account name displays with getDisplayAccountName so the default account name follows the active language; renaming the default account stores a custom literal (no longer multilingual, restorable by renaming back to 'My Wallet').

[2026-07-19] ~ | src/i18n/index.ts, src/screens/CreateAccountScreen.tsx, src/screens/ModifyAccountScreen.tsx, spec/features/{013-create-account-screen,012-modify-delete-account-screen}/1-spec.md
- Reserved the default account name across all languages/casing: added getAllDefaultAccountNames() to src/i18n/index.ts (en 'My Wallet', es 'Mi Cartera', ca 'La meva cartera', lowercased).
- CreateAccountScreen and ModifyAccountScreen now block naming/renaming an account to any default-name variant (case-insensitive, any language) reusing the existing duplicate error. The default account (id 1) may keep/restore its own name.

[2026-07-19] ~ | src/screens/ModifyAccountScreen.tsx, spec/features/012-modify-delete-account-screen/1-spec.md
- Reserved default account name is now blocked in ModifyAccountScreen even when editing the default account (id 1) itself, matching ModifyCategoryScreen behavior. Typing 'my wallet' / 'mi cartera' (any case/language) shows the duplicate error and disables Save; removed the previous id 1 exception.

[2026-07-19] ~ | lint cleanup (pre-existing warnings/error)
- Fixed 1 error + 24 warnings so 'npx expo lint' reports 0 problems: removed unused vars (Ionicons, result, mc, config, dates, Keyboard, setFotoUri, getShortMonthName, err), merged duplicate database imports in AppContext, removed Unicode BOM in SettingsScreen, added displayName to CommentInput, wrapped 'today'/minDate in useMemo and corrected hook dependency arrays in calendar components.
- Verified: eslint exit 0, tsc --noEmit exit 0.

[2026-07-20] + | spec/features/015-all-transactions-screen/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Updated spec for AllTransactionsScreen with 3 new filter dimensions: type tabs (All/Expenses/Income), multi-select category filter (021), period selector (Day/Week/Month/Year/Period). 13 tasks in 4 phases.

[2026-07-20] + | spec/features/021-category-filter-modal/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created spec for CategoryFilterModal: full-screen modal with SearchBar, "All" chip, 4×N multi-select category grid, type-aware sections (Expenses/Income headers when type='all'), Apply button with count. 7 tasks in 2 phases.

[2026-07-20] ~ | spec/constitution/3-roadmap.md
- Added 021-category-filter-modal with spec-ready status. Updated 015-all-transactions-screen status to "updated (spec ready, pending implementation)".

[2026-07-20] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added 8 i18n keys: tab_all, filter_categories, filter_all_categories, filter_apply (function), filter_apply_all, filter_no_results, filter_expenses, filter_income.

[2026-07-20] + | src/components/AllTypeTabs.tsx
- Created 3-tab type selector (All / Expenses / Income) for AllTransactionsScreen, extending TypeTabs visual pattern.

[2026-07-20] + | src/components/CategoryFilterModal.tsx
- Full-screen modal with SearchBar, "All" chip, 4×N multi-select category grid with checkmarks, type-aware sections (Expenses/Income headers when type='all'), Apply button with count. Uses React Native Modal wrapper. "All" chip toggles only visible type categories. Apply button disabled when 0 selected. Syncs selection on open, resets search.

[2026-07-20] ~ | src/database/repositories/transactionRepo.ts, src/database/webStorage.ts
- Added `category_ids?: number[]` to TransactionFilters interface. Added SQL `IN` clause and localStorage filter for multi-category filtering.

[2026-07-20] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added 6 type-aware i18n keys: filter_all_expense_categories, filter_all_income_categories, filter_apply_all_expense, filter_apply_all_income.

[2026-07-20] ~ | src/screens/AllTransactionsScreen.tsx
- Rewrote screen with new filter layout: AllTypeTabs, category filter button + modal, PeriodTabs + CalendarPicker, TagFilterBar, sort toggle. Type-aware button labels ("All categories" / "All expense categories" / "All income categories"). Category selection resets on type tab change. Period/date/customDate state shared with HomeScreen via AppContext. Default custom range: Jan 1 → today.

[2026-07-20] ~ | src/screens/AllTransactionsScreen.tsx
- Fixed category filter button icon from pricetag-outline (tags) to grid-outline (categories) to match the rest of the app.

[2026-07-20] ~ | src/screens/AllTransactionsScreen.tsx
- Removed FAB ("+") button from AllTransactionsScreen.

[2026-07-20] ~ | src/screens/HomeScreen.tsx
- Total balance font weight changed from '800' to '700'. Income/expense summary row: amounts fs(12)→fs(14), labels fs(11)→fs(12), amounts now bold ('700').

[2026-07-20] ~ | src/screens/AddTransactionScreen.tsx
- Applied sortCategoriesWithOthersLast to the 4×2 category grid so "Other"/"Others" appears as the penultimate item before the "More"/"Create" button.

[2026-07-20] ~ | App.tsx
- Splash screen duration reduced from 3s to 2s. Removed "Finly" text — now shows only the icon and loading line.

[2026-07-20] ~ | spec/constitution/4-design-system.md
- Updated font size and weight tables: removed '800' weight, merged HomeScreen total into '700'; updated fs(11)/fs(12)/fs(14) usage notes.

[2026-07-20] + | docs/assets.md
- Created standalone assets reference: table of all 6 PNG assets with purpose, dimensions, safe zones, app.json mapping, format requirements, and web splash notes.

[2026-07-20] ~ | FinlyApp/assets/ (6 files)
- Replaced all app icon assets with updated versions: icon.png, android-icon-foreground.png, android-icon-background.png, android-icon-monochrome.png, favicon.png, splash-icon.png.

[2026-07-20] + | src/navigation/AppNavigator.tsx, package.json
- Added app version footer to drawer menu: reads version from expo-constants (Constants.expoConfig?.version), displayed right-aligned at the bottom. Installed expo-constants as direct dependency.

[2026-07-20] + | spec/constitution/6-screens.md
- Added "Drawer Navigator" section: structure diagram, menu items table (icons, labels, targets), and version footer spec.

[2026-07-21] ~ | spec/features/004-add-transaction-screen/1-spec.md
- Updated category grid sorting logic: replaced alphabetical sort with usage-frequency sort (90-day window).
- Categories with 0 transactions appear after used ones, sorted alphabetically among themselves.
- Removed special "Other"/"Others" last-position logic — they now follow the same usage-based ranking.
- Added 2 new acceptance criteria for usage-based sorting and zero-usage behavior.

[2026-07-21] + | src/database/repositories/transactionRepo.ts, src/database/webStorage.ts, src/screens/AddTransactionScreen.tsx
- Implemented usage-based category sorting in AddTransactionScreen grid (feature 004).
- Added `getCategoryUsageCounts(userId, type, startDate)` to transactionRepo (native SQL LEFT JOIN + COUNT) and webStorage (JS filter + count).
- Returns categories sorted by transaction count descending (90-day window), then alphabetically for ties.
- AddTransactionScreen: replaced `sortCategoriesWithOthersLast` alphabetical sort with usage-frequency sort via `useFocusEffect` + `useMemo`.
- "Other"/"Others" now follow the same usage-based ranking (no special position).

[2026-07-21] ~ | src/database/migrations/002_seed.ts, src/database/webStorage.ts, src/i18n/en.ts, src/i18n/es.ts, src/i18n/ca.ts, src/i18n/index.ts
- Category expansion: renamed Food→Groceries (id:3, basket-outline, #F87171) and Exercise→Workout (id:14, barbell-outline, #22D3EE).
- Added 13 new categories (8 expense: Restaurants, Rent, Games, Gifts, Subscriptions, Pets, Insurance, Utilities; 5 income: Interest, Sales, Refund, Bonus, Allowance) with unique icons and colors.
- Updated CATEGORY_I18N_KEYS map with IDs 19–31 and renamed refs for IDs 3, 14.
- Translations added in en/es/ca for all 15 new/renamed keys.

[2026-07-21] + | spec/features/022-total-account/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created spec for the "Total" special account: real DB account with `is_total` flag, aggregates all accounts, read-only name, editable icon/color/note, no delete. 11 tasks in 3 phases.

[2026-07-21] ~ | spec/features/002-db-design/1-spec.md, spec/features/011-accounts-screen/1-spec.md, spec/features/012-modify-delete-account-screen/1-spec.md, spec/constitution/3-roadmap.md
- Updated 002-db-design: added `is_total INTEGER NOT NULL DEFAULT 0` to accounts schema, updated seed description.
- Updated 011-accounts-screen: Total account appears first in the list, added acceptance criteria.
- Updated 012-modify-delete-account-screen: added Total account behavior (read-only name, hidden delete), added acceptance criterion.
- Added 022-total-account to roadmap with pending status.

[2026-07-21] ~ | src/database/types.ts
- Added `is_total?: number` to `Account` interface.

[2026-07-21] ~ | src/database/migrations/001_initial.ts
- Added `is_total INTEGER NOT NULL DEFAULT 0` column to accounts CREATE TABLE.

[2026-07-21] ~ | src/database/migrations/002_seed.ts
- Inserted Total account (id=2, icon=layers-outline, color=#475569, is_total=1). Updated My Wallet insert with is_total column.

[2026-07-21] ~ | src/database/webStorage.ts
- Added Total account to seed data. Updated list() sort to put Total first (is_total DESC, name). Added delete guard for Total. Updated totalByPeriod() and breakdownByCategories() to accept null accountId for "all accounts" mode.

[2026-07-21] ~ | src/database/repositories/accountRepo.ts
- Updated list() ORDER BY is_total DESC, name. Added is_total guard to delete().

[2026-07-21] ~ | src/database/repositories/transactionRepo.ts
- Updated totalByPeriod() and breakdownByCategories() to accept accountId: number | null, querying all accounts when null.

[2026-07-21] ~ | src/i18n/en.ts, es.ts, ca.ts
- Added account_total: 'Total' translation key in all three languages.

[2026-07-21] ~ | src/i18n/index.ts
- Added mapping 2: 'account_total' to ACCOUNT_I18N_KEYS.

[2026-07-21] ~ | src/context/AppContext.tsx
- Updated loadTransactions, refresh, and loadAllTotals to handle is_total (passes null accountId for Total). Updated balance calculation: Total balance = sum of all non-total accounts.

[2026-07-21] ~ | src/screens/AddTransactionScreen.tsx
- Filtered Total account from selectableAccounts passed to AccountModal.

[2026-07-21] ~ | src/screens/ModifyTransactionScreen.tsx
- Filtered Total account from selectableAccounts passed to AccountModal.

[2026-07-21] ~ | src/screens/ModifyAccountScreen.tsx
- Total mode: name input hidden, delete button hidden, save only updates icon/color/note.

[2026-07-21] ~ | src/screens/TransactionsScreen.tsx
- When Total account is selected, skip account_id filter to show all transactions. Default to first non-Total account. Filter Total from AccountModal.

[2026-07-21] ~ | src/screens/AllTransactionsScreen.tsx
- When Total account is selected, skip account_id filter to show all transactions. Default to first non-Total account. Filter Total from AccountModal.

[2026-07-21] ~ | src/screens/AddTransactionScreen.tsx
- Fallback: if activeAccount is Total, pre-select first non-Total account instead.

[2026-07-21] ~ | src/constants/types.ts
- Added DATE_MIN and DATE_MAX constants to replace magic date strings.

[2026-07-21] ~ | spec/features/022-total-account/1-spec.md
- Added section 5 (TransactionsScreen behavior), updated section 6 (fallback behavior), added acceptance criteria for TransactionsScreen and AddTransactionScreen fallback.

[2026-07-21] ~ | spec/features/014-transactions-screen-from-home/1-spec.md
- Added acceptance criteria for Total account: skip filter, exclude from selector.

[2026-07-21] ~ | spec/features/004-add-transaction-screen/1-spec.md
- Added fallback behavior and Total exclusion notes in account selection section.

[2026-07-21] ~ | spec/features/015-all-transactions-screen/1-spec.md
- Added Total account behavior: skip filter, exclude from selector, fallback. Added 3 acceptance criteria.

[2026-07-21] ~ | spec/features/022-total-account/1-spec.md
- Updated section 5: Total IS selectable in TransactionsScreen (not filtered out). Updated section 6: Total IS shown in TransactionsScreen/AllTransactionsScreen selectors. Updated acceptance criteria.

[2026-07-21] ~ | spec/features/014-transactions-screen-from-home/1-spec.md
- Updated section 2: Total IS included in account selector with skip-filter behavior. Updated acceptance criteria.

[2026-07-21] ~ | spec/features/015-all-transactions-screen/1-spec.md
- Updated section 3: Total IS included in account selector. Updated acceptance criteria.

[2026-07-21] ~ | src/screens/TransactionsScreen.tsx, src/screens/AllTransactionsScreen.tsx
- Initialize selectedAccountId from activeAccount directly (preserves Total selection from HomeScreen).

[2026-07-21] ~ | spec/features/022-total-account/1-spec.md, spec/features/014-transactions-screen-from-home/1-spec.md, spec/features/015-all-transactions-screen/1-spec.md
- Updated default account initialization docs: preserves activeAccount from HomeScreen including Total.

[2026-07-21] ~ | src/screens/TransactionDetailsScreen.tsx
- Fetch transaction directly from database instead of AppContext to avoid stale/filtered state when navigating from AllTransactionsScreen or TransactionsScreen.

[2026-07-21] ~ | spec/features/016-transaction-details-screen/1-spec.md
- Added note: transaction is fetched directly from database (not AppContext) to work from any screen.

[2026-07-21] ~ | spec/constitution/3-roadmap.md
- Updated 022 entry: Total IS selectable in TransactionsScreen/AllTransactionsScreen, hidden from AddTransaction/ModifyTransaction.

[2026-07-21] ~ | spec/features/022-total-account/1-spec.md
- Added section 10: Default account descriptions (multilingual). My Wallet and Total have stored English descriptions in seed data, displayed via i18n translations using getDisplayAccountDescription(). Users can edit freely.

[2026-07-21] ~ | spec/features/012-modify-delete-account-screen/1-spec.md
- Updated section 5 (Note): added "Default Descriptions" subsection documenting the getDisplayAccountDescription() pattern for My Wallet (id=1) and Total (id=2).

[2026-07-21] + | src/i18n/en.ts, es.ts, ca.ts
- Added i18n keys: account_my_wallet_description ('Your default account for everyday transactions') and account_total_description ('Combined balance and transactions from all your accounts') in en/es/ca.

[2026-07-21] ~ | src/database/migrations/002_seed.ts, src/database/webStorage.ts
- Set default English descriptions for My Wallet and Total accounts in seed data.

[2026-07-21] + | src/i18n/index.ts
- Added ACCOUNT_DESCRIPTION_I18N_KEYS map (id 1→account_my_wallet_description, id 2→account_total_description).
- Added getDisplayAccountDescription(), getDefaultEnglishAccountDescription(), getAccountDescription() helpers (same pattern as account names).

[2026-07-21] ~ | src/screens/ModifyAccountScreen.tsx
- Description input now shows translated default via getDisplayAccountDescription(). Save preserves English default (same pattern as name: if user hasn't changed the translated default, saves the English string so translation continues to work).

[2026-07-21] ~ | src/screens/AccountsScreen.tsx
- Account list shows translated description via getDisplayAccountDescription() instead of raw DB value.

[2026-07-22] ~ | spec/features/003-settings-screen/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Complete rewrite of Settings spec. Restructured from flat 7-section layout to 4 subsections (Appearance, Regional, Personalization, Data) with navigation to detail screens.
- Added Personalization: Home screen defaults (default account with Total, default period), Add transaction defaults (default account without Total, optional fields checkboxes), Privacy (hide account balances with eye icon toggle).
- Added Data: Delete all transactions (single confirmation modal), Delete all data (double confirmation modal with text input).
- Added 7 new config fields: homeDefaultAccountId, homeDefaultPeriod, addDefaultAccountId, addShowLabels, addShowComments, addShowPhoto, hideBalances.
- Added eye icon behavior: symmetric reveal/hide that resets on navigation (temporary override of privacy setting).
- Added ~30 new i18n keys for subsection titles, option labels, and confirmation messages.
- 36 tasks in 10 phases.

[2026-07-22] ~ | spec/constitution/3-roadmap.md
- Updated 003-settings-screen status to "updated (spec ready, pending implementation)". Updated description with new subsection structure.

[2026-07-22] + | Settings screen restructure (Phase 1-10 partial)
- Implemented Phase 1: Added 7 new config fields to ConfigContext.tsx, configRepo.ts, webStorage.ts, 003_config.ts.
- Implemented Phase 2: Created src/screens/settings/ folder with 5 screens (SettingsScreen, AppearanceScreen, RegionalScreen, PersonalizationScreen, DataScreen).
- Implemented Phase 3-4: AppearanceScreen (theme, text size, icon shapes) and RegionalScreen (language, currency, decimal separator, first day of week).
- Implemented Phase 5-7: PersonalizationScreen (home defaults, add transaction defaults, privacy toggle).
- Implemented Phase 10: DataScreen (delete all transactions, delete all data with double confirmation).
- Added 4 new screen types to RootStackParamList and corresponding ScreenProps.
- Updated AppNavigator.tsx with 4 new settings screens.
- Added ~30 i18n keys in en/es/ca for subsection titles, option labels, and confirmation messages.
- Lint check: 0 errors, 0 warnings.

[2026-07-22] + | Settings screen restructure (Phase 8-9 completion)
- Created src/components/EyeToggle.tsx: reusable eye icon button for privacy toggle.
- Added generic i18n keys (cancel, delete) in en/es/ca.
- Implemented Phase 8: Privacy eye icon in HomeScreen, AccountsScreen, and AccountModal.
  - Each screen manages its own isRevealed state via useState + useFocusEffect reset.
  - Balances masked with bullet characters when hidden; eye icon toggles temporary reveal.
  - HomeScreen: EyeToggle next to total balance.
  - AccountsScreen: EyeToggle in total section header + masked account balances.
  - AccountModal: EyeToggle in modal header + masked account balances in list.
- Implemented Phase 9: Personalization defaults applied.
  - AppContext: homeDefaultAccountId and homeDefaultPeriod applied on initial load.
  - AddTransactionScreen: addDefaultAccountId used for initial account selection; optional fields (Labels, Comments, Photo) conditionally hidden based on config.
  - ModifyTransactionScreen: same optional fields logic as AddTransactionScreen.
- Lint check: 0 errors, 0 warnings.

[2026-07-22] ~ | DataScreen: fix web crash + modal error handling
- Rewrote DataScreen to use platform-aware repos (transactionRepository, accountRepository, categoryRepository, tagRepository) instead of raw getDatabase() calls, fixing the expo-sqlite WASM bundle error on web.
- Added deleteAllTransactions() to native transactionRepo and webTransactionRepo.
- Added deleteAll() to native accountRepo, categoryRepo, tagRepo and their web counterparts.
- Added try/catch around both delete handlers so modals always close even on failure.
- On web "delete all data", clears localStorage and re-seeds via initWebStorage().
- On native "delete all data", re-seeds via seedData() + seedConfig().
- Lint check: 0 errors, 0 warnings.

[2026-07-22] ~ | PersonalizationScreen: translated seed account names
- Replaced a.name with getDisplayAccountName(a) in both homeAccounts and addAccounts selectors.
- Seed accounts ("My Wallet" → "Mi Cartera", "Total" → "Total") now display in the current language.
- Custom user-created accounts remain unchanged.
- Lint check: 0 errors, 0 warnings.

[2026-07-22] + | AppContext.resetAll() + DataScreen refresh after deletion
- Added resetAll() to AppContext: re-fetches accounts/categories/tags, re-applies home defaults from config, resets selectedDate/customDate/activeTagIds/tagsByTransaction.
- DataScreen: both handleDeleteTransactions and handleDeleteAll now call resetAll() after DB operations, so all screens reflect changes immediately.
- Updated spec (1-spec.md): privacy hidden styling, implementation note, data deletion steps, acceptance criteria.
- Lint check: 0 errors, 0 warnings.
- Replaced a.name with getDisplayAccountName(a) in both homeAccounts and addAccounts selectors.
- Seed accounts ("My Wallet" → "Mi Cartera", "Total" → "Total") now display in the current language.
- Custom user-created accounts remain unchanged.
- Lint check: 0 errors, 0 warnings.

[2026-07-22] ~ | Account deletion fallback for default config
- ModifyAccountScreen: after deleting an account, checks if it was the homeDefaultAccountId or addDefaultAccountId.
  - homeDefaultAccountId: resets to null (Total).
  - addDefaultAccountId: falls back to first remaining non-total account, or null.
- DataScreen: clears config table before re-seeding on "Delete all data" to ensure defaults are reset.
- Lint check: 0 errors, 0 warnings.

[2026-07-22] ~ | AccountsScreen: fix Total balance calculation
- Total balance now sums only non-total accounts (filters out is_total === 1), preventing the Total account's own 0 balance from diluting the sum.
- Lint check: 0 errors, 0 warnings.

[2026-07-22] ~ | Fix: multilingual duplicate name guard for categories and accounts
- Replaced getAllDefaultCategoryNames() / getAllDefaultAccountNames() (which collected ALL names in ALL 3 languages and blocked them unconditionally) with ID-based lookups that check the current language and verify DB existence.
- Added getDefaultCategoryIdByName(name) and getDefaultAccountIdByName(name) to src/i18n/index.ts: returns the default entity ID if the name matches a default in the current language, null otherwise.
- CreateCategoryScreen and ModifyCategoryScreen: replaced isDefaultName check with language-aware guard — maps entered name → default ID → English name → DB existence check. Allows reusing deleted default names, blocks only if the corresponding default still exists.
- CreateAccountScreen and ModifyAccountScreen: same fix applied.
- Removed getAllDefaultCategoryNames() and getAllDefaultAccountNames() from src/i18n/index.ts (no longer needed).
- Lint check: 0 errors, 0 warnings.

[2026-07-23] ~ | src/database/repositories/transactionRepo.ts, src/database/webStorage.ts, src/screens/AddTransactionScreen.tsx
- Changed category usage sort from global to per-account: getCategoryUsageCounts now accepts accountId parameter and filters transactions by that account. AddTransactionScreen passes the selected accountId and refreshes usage counts when account changes. Categories now sort by relevance to the selected account.

[2026-07-23] ~ | spec/features/004-add-transaction-screen/1-spec.md
- Updated category grid sorting documentation: usage frequency is now scoped to the selected account, not global. Updated acceptance criteria.
