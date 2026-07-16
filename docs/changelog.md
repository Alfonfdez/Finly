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
