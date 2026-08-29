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

[2026-07-23] + | spec/features/023-photo-attachment/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Created spec for photo attachment feature: camera + gallery on iOS/Android, hidden on web.
- 1-spec.md: 10 functional requirements (platform scope, camera, gallery, thumbnail, persistence, display, cleanup, settings), 18 acceptance criteria.
- 2-plan.md: architecture with expo-image-picker + expo-file-system, data flow diagrams, platform guards, file cleanup utility.
- 3-tasks.md: 13 tasks in 5 phases + verification (database, library install, handlers, UI, i18n/specs).

[2026-07-23] ~ | spec/features/004-add-transaction-screen/1-spec.md
- Updated section 9 (Photo): replaced TODO with reference to 023 spec. Updated acceptance criterion.

[2026-07-23] ~ | spec/features/016-transaction-details-screen/1-spec.md
- Added section 5 (Photo): photo row with thumbnail, full-screen viewer, platform guard. Added 2 acceptance criteria.

[2026-07-23] ~ | spec/features/017-modify-transaction-screen/1-spec.md
- Updated section 9 (Photo): replaced TODO with reference to 023 spec, added preload/replace/remove behavior.

[2026-07-23] ~ | spec/constitution/3-roadmap.md
- Added 023-photo-attachment with pending status.

[2026-07-23] ~ | spec/features/002-db-design/1-spec.md
- Added `photo TEXT` column to transactions table schema (nullable, stores file URI for receipt images).
- Updated functional requirement #4 and added acceptance criterion for photo storage.

[2026-07-23] + | spec/constitution/7-platform-differences.md
- Created platform differences doc: storage layer (SQLite vs localStorage), feature availability matrix, platform guard conventions, photo feature decision, and guidelines for adding new platform-dependent features.

[2026-07-23] + | Feature 023 — Photo Attachment (code implementation)
- Added `photo TEXT` column to transactions table (001_initial.ts) and Transaction type.
- Updated transactionRepo create/update to include photo field.
- Installed expo-image-picker (SDK 54 compatible).
- AddTransactionScreen: implemented camera + gallery handlers with expo-file-system (new API: File, Paths.document), photo state setter, web guard, pass photo to createWithTags.
- ModifyTransactionScreen: same handlers, initializes from transaction.photo, deletes old photo on replace, web guard, pass photo to updateWithTags.
- PhotoSection: added onRemovePhoto prop, Image thumbnail when photoUri set, "×" remove button overlay.
- TransactionDetailsScreen: photo DataRow with thumbnail, full-screen image viewer Modal, deletePhoto in handleDelete.
- PersonalizationScreen: wrapped photo Checkbox with Platform.OS !== 'web' guard.
- i18n: added details_photo, photo_viewer_close, photo_remove in en/es/ca.

[2026-07-23] ~ | spec/constitution/3-roadmap.md
- Marked 023-photo-attachment as completed.

[2026-07-23] ~ | src/screens/AddTransactionScreen.tsx
- Fix: added photo cleanup before setting new URI in handleTakePhoto and handlePickFromGallery (deletes old photo file when replacing).

[2026-07-23] ~ | src/screens/AddTransactionScreen.tsx, src/screens/ModifyTransactionScreen.tsx, src/screens/TransactionDetailsScreen.tsx
- Added error logging (console.warn) to deletePhoto function in all three screens (was silent catch).

[2026-07-23] ~ | src/screens/TransactionDetailsScreen.tsx
- Fix: added useFocusEffect to reload transaction data when screen gains focus, so photo changes from ModifyTransactionScreen appear immediately.

[2026-07-23] + | Multi-photo support (up to 3 photos per transaction)
- PhotoSection: rewrote to support multiple photos (up to 3) with horizontal row layout, individual delete buttons, and "add" button when < 3 photos.
- PhotoSection: added delete confirmation modal (Cancel/Delete) before removing a photo.
- AddTransactionScreen: changed photo state from single URI to string array, stores as JSON string in DB.
- ModifyTransactionScreen: changed photo state from single URI to string array, parses existing photo on mount (backwards compatible with old single URI).
- TransactionDetailsScreen: displays multiple photos in a horizontal row, supports tapping to view in full-screen viewer, deletes all photos on transaction delete.
- i18n: added photo_delete_title and photo_delete_message keys in en/es/ca.
- Backwards compatible: existing single-photo transactions are parsed correctly.

[2026-07-23] ~ | src/database/repositories/transactionRepo.ts
- Fix: deleteAllTransactions() now cleans up photo files from documentDirectory before deleting DB records.
- Fix: deleteByAccountId() now cleans up photo files from documentDirectory before deleting DB records.

[2026-07-23] ~ | src/utils/platform.ts
- Added centralized platform checks (isWeb, isNative, isIOS, isAndroid).
- Updated all files to use centralized platform utils instead of Platform.OS checks.

[2026-07-23] ~ | src/utils/language.ts
- Added centralized language type and checks (Language, isSpanish, isEnglish, isCatalan).
- Updated i18n, formatters, ConfigContext, SettingsScreen, RegionalScreen to use centralized language utils.

[2026-07-23] ~ | src/constants/colors.ts
- Added white color constant (#FFFFFF).
- Updated 15 files to use colors.white instead of hardcoded '#FFFFFF'.
- Fixed 4 remaining Platform.OS checks to use isAndroid from utils/platform.ts.

[2026-07-24] ~ | src/constants/colors.ts
- Added disabled (#475569) and flagColors (senyeraYellow, senyeraRed, spainRed, spainYellow) to centralized color palette.

[2026-07-24] ~ | src/components/IconGrid.tsx, ColorGrid.tsx, screens/ (CreateAccountScreen, CreateCategoryScreen, ModifyAccountScreen, ModifyCategoryScreen, TransactionDetailsScreen, DataScreen)
- Replaced all remaining hardcoded '#F87171' → colors.red, '#94A3B8' → colors.textSecondary, '#475569' → colors.disabled across 15 files.

[2026-07-24] ~ | src/screens/SettingsScreen.tsx, src/screens/settings/RegionalScreen.tsx
- Replaced hardcoded flag colors ('#FCDD09', '#DA2919', '#AA151B', '#F1BF00') → flagColors.* in SenyeraIcon and SpainFlagWeb components.

[2026-07-24] ~ | src/components/ColorGrid.tsx, IconGrid.tsx, PhotoSection.tsx, screens/ (ModifyCategoryScreen, TransactionDetailsScreen)
- Replaced all hardcoded color strings in Ionicons (color="#FFFFFF", color="#F87171", color="#fff") → colors.white / colors.red. Zero remaining hardcoded Ionicon colors.

[2026-07-24] + | src/components/calendars/NavArrows.tsx
- Created shared navigation arrows component with prev/next chevron buttons, onPrev/onNext/nextDisabled/color props. Used by YearNav, MonthNav, and YearGrid.

[2026-07-24] + | src/components/calendars/calendarStyles.ts
- Created shared calendar styles: grid, gridItem, gridItemInner, gridItemText, and FUTURE_OPACITY constant. Used by MonthGrid and YearGrid.

[2026-07-24] ~ | src/components/calendars/YearNav.tsx
- Refactored to use NavArrows component instead of inline Ionicons chevrons.

[2026-07-24] ~ | src/components/calendars/MonthNav.tsx
- Refactored to use NavArrows component instead of inline Ionicons chevrons.

[2026-07-24] ~ | src/components/calendars/YearGrid.tsx
- Refactored to use NavArrows for navigation and calendarStyles for grid/item styles. Removed duplicated inline styles.

[2026-07-24] ~ | src/components/calendars/MonthGrid.tsx
- Refactored to use calendarStyles for grid/item styles. Removed duplicated local styles.

[2026-07-24] ~ | src/components/calendars/DayPicker.tsx
- Added useMemo for today, replaced hardcoded futureDay opacity with FUTURE_OPACITY constant.

[2026-07-24] ~ | src/components/calendars/WeekPicker.tsx
- Replaced hardcoded futureWeek opacity with FUTURE_OPACITY constant.

[2026-07-24] ~ | src/components/calendars/PeriodPicker.tsx
- Fixed Spanish variable names: ANIO_MINIMO → MIN_YEAR, nuevoEstado → nextAllTime, i/f → start/end.

[2026-07-24] + | docs/git-commands.md
- Created git commands reference: opencode rules (read-only, no commit/push/pull), commit message generation workflow (git status + git diff --stat), and branch cleanup command.

[2026-07-24] ~ | PROMPT.md
- Rewrote project description: React Native/Expo personal finance app with SQLite (mobile) and localStorage (web), SDD workflow.
- Added step to read spec/constitution/ and spec/features/ separately.
- Added step to read docs/ (changelog, git workflows, programming concepts, assets).
- Added rule: any code update must be documented in docs/changelog.md.
- Added step 9: commit message workflow via docs/git-commands.md.

[2026-07-24] ~ | docs/programming-concepts.md
- Replaced all Spanish variable names in code examples with English (~30 examples across all sections).
- Updated outdated references: ANIO_MINIMO → MIN_YEAR, PRAGMA user_version description to reflect single-schema approach, fontWeight '800' merged into '700'.
- Updated Drawer description to list implemented screens instead of "placeholders".

[2026-07-24] ~ | docs/git-commands.md
- Fixed branch cleanup regex: added `\s*` to handle the space in `* develop` output from `git branch`, preventing a false error when running the delete command.

[2026-07-24] ~ | Component refactor: quality, deduplication, and shared patterns
- **1.1** DonutChart.tsx: renamed Spanish variables (radio→radius, circunferencia→circumference, grosor→strokeWidth, longitud→arcLength, segmento→segment).
- **1.2** IconGrid, CalculatorModal, ColorPickerModal, NavArrows: replaced hardcoded colors (#334155, '#fff', '#22D3EE', 0.3) with theme tokens (colors.border, colors.white, colors.primary, FUTURE_OPACITY).
- **1.3** CategoryGrid, CategoryFilterModal, IconGrid, SortToggle: replaced `as any` casts with `ComponentProps<typeof Ionicons>['name']`.
- **1.4** CalculatorModal: OP_keys→OP_KEYS, activeColors→c alias.
- **1.5** TagFilterBar: removed dead scrollRef/useRef; CategoryGrid: removed unused index param; PeriodPicker: removed dead allTimeText style.
- **1.6** CalendarModal: replaced direct `Platform` import with `isWeb` from utils/platform.ts.
- **1.7** TagSection, CalendarModal: standardized overlay alpha to 0.6.
- **2** Created `src/components/componentStyles.ts` with shared constants (OVERLAY_BG, MODAL_MAX_WIDTH, MODAL_BORDER_RADIUS, MODAL_PADDING, BUTTON_BORDER_RADIUS) and reusable styles (overlay, modal, buttons, button, buttonText).
- **3A** Created generic `TabBar<T>` component. Updated HomeScreen, CategoriesScreen, AddTransactionScreen, ModifyTransactionScreen, AllTransactionsScreen to use TabBar. Deleted TypeTabs.tsx and AllTypeTabs.tsx.
- **3B** Created `ConfirmationModal` component (reusable Cancel/Confirm with destructive variant).
- **4** Extracted `formatWeekRange`, `formatWeekRangeShort`, `formatPeriodText` to formatters.ts. Updated CalendarModal and CalendarPicker to use them.
- **5** CategoryGrid: replaced local Category interface with database Category type. AccountModal: replaced `onSelect(tempId!)` non-null assertion with null guard.

[2026-07-24] ~ | src/components/calendars/DayPicker.tsx
- Fix: calendar grid now always renders 6 rows (42 cells) regardless of month. Empty cells pad rows 5–6 for months with fewer days (e.g. February with 28 days). Prevents modal height jumping when navigating between months with different row counts (5 vs 6). Affects Day period modal and Period custom range modal.

[2026-07-28] ~ | src/context/AppContext.tsx
- Replaced `case 'custom'` with `default:` in calculateStartEnd switch — the `case 'custom'` branch was unreachable because fetchTransactionsAndTags handles `period === 'custom'` before calling calculateStartEnd.

[2026-07-28] ~ | src/context/ConfigContext.tsx
- Fixed stale closure in updateConfig: added configRef (useRef) so the callback always reads the latest config state, preventing stale values on rapid successive calls.

[2026-07-28] ~ | src/constants/flagColors.ts (+)
- Created flagColors.ts extracted from colors.ts (senyeraYellow, senyeraRed, spainRed, spainYellow). Updated SettingsScreen and RegionalScreen imports.

[2026-07-28] ~ | 13 consumer files
- Removed `import { colors } from '../constants/colors'` from AccountModal, CalculatorModal, ColorGrid, ColorPickerModal, IconGrid, PhotoSection, CreateAccountScreen, CreateCategoryScreen, ModifyAccountScreen, ModifyCategoryScreen, ModifyTagScreen, TransactionDetailsScreen, DataScreen.
- Replaced colors.red→c.red, colors.white→'#FFFFFF', colors.disabled→c.textSecondary, colors.textSecondary→c.textSecondary, colors.primary→'#22D3EE' (static), colors.border→c.border, QUICK_COLORS tokens→inline hex.
- Deleted src/constants/colors.ts (no remaining imports).

[2026-07-28] - | src/constants/platformStyles.ts
- Removed platformStyles.ts (scrollbarFlatList was redundant with global scrollbar CSS injected by ConfigContext). Cleaned up 3 consumers: AllTransactionsScreen, TransactionsScreen, CategoryList.

[2026-07-28] ~ | src/utils/categoryUtils.ts (+), src/constants/types.ts (-)
- Moved sortCategoriesWithOthersLast from constants/types.ts to new utils/categoryUtils.ts. Removed unused `import { Category }` from types.ts. Updated 4 importers: CategoryFilterModal, AddCategoryScreen, CategoriesScreen.

[2026-07-28] ~ | 4 components (CategoryGrid, CategoryFilterModal, IconGrid, SortToggle)
- Fixed ComponentProps import source: changed from `@expo/vector-icons` to `react`/`react-native` (the package only re-exports it; correct source is 'react').

[2026-07-28] ~ | 6 components (AccountModal, CalculatorModal, CalendarModal, ColorPickerModal, PhotoSection, TagSection)
- Replaced hardcoded `'rgba(0,0,0,0.6)'` with shared `OVERLAY_BG` constant from componentStyles.ts.

[2026-07-28] ~ | PhotoSection.tsx
- Removed dead `onPress={() => {}}` wrapper around image thumbnail (placeholder for unimplemented full-screen viewer).

[2026-07-28] ~ | CategoryFilterModal.tsx
- Fixed circuitous import path: `'../components/SearchBar'` → `'./SearchBar'`.

[2026-07-28] ~ | calendars/DayPicker.tsx
- Fixed inconsistent `t()` pattern: now destructures into `labels` variable like the rest of the codebase.

[2026-07-28] ~ | calendars/MonthNav.tsx
- Fixed `today` not memoized: replaced `const today = new Date()` with `useMemo(() => new Date(), [])` for consistency with sibling calendar components.

[2026-07-28] ~ | calendars/MonthGrid.tsx
- Extracted `months` array to module-level constant `MONTHS` instead of recreating it on every render.

[2026-07-28] ~ | calendars/WeekPicker.tsx
- Refactored `formatShortWeek` to use shared `getShortMonthName` utility instead of manual `slice(0,3).toLowerCase()`. Removed unused `getMonthName` import.

[2026-07-28] ~ | calendars/YearGrid.tsx
- Wrapped `years` array in `useMemo` to avoid recomputation on every render.

[2026-07-28] ~ | calendars/PeriodPicker.tsx
- Removed unnecessary `useMemo` wrapping `minDate` — now a module-level `MIN_DATE` constant (evaluated once at module load). Updated `handleAllTime` dependency array.

[2026-07-31] - | src/hooks/useTransactionFilters.ts
- Removed dead code (never imported anywhere). Screens implement filtering/sorting/grouping inline and import SortBy/SortDirection from SortToggle.tsx directly.

[2026-07-31] - | src/i18n/en.ts, es.ts, ca.ts
- Removed 20 unused i18n keys from each language: settings_delete_all_transactions_done, settings_delete_all_data_done, period_custom, cal_month_of, cal_range_from_to, cal_period_from, account_close, add_amount_placeholder, add_tag_urgent, add_tag_recurring, add_tag_personal, add_tag_error_empty, transactions_title, transactions_select_account, nav_add, nav_coming_soon, a11y_select_account, photo_viewer_close, type_expense, type_income.

[2026-07-31] ~ | src/i18n/index.ts
- Replaced 8 near-identical category/account name resolvers with a generic createDefaultResolver factory over the three i18n-key maps (CATEGORY_I18N_KEYS, ACCOUNT_I18N_KEYS, ACCOUNT_DESCRIPTION_I18N_KEYS). Public API unchanged.
- getDefaultXIdByName now uses a language-keyed lookup cache rebuilt on setLanguage instead of iterating Object.entries per call (preserves current-language name matching).

[2026-07-31] ~ | src/navigation/AppNavigator.tsx
- Extracted shared HeaderTitle component; replaced 20 duplicated inline headerTitle blocks.
- Extracted DrawerNavItem helper; unified drawer item styling (added missing fontSize fs(14) on Home item, removed dead activeTintColor).
- Removed dead drawerSection and empty drawerItemLabel styles; drawerTitle fontWeight 800→700.

[2026-07-31] - | src/screens/SettingsScreen.tsx
- Removed dead legacy settings screen (not imported anywhere; the active settings screens live in src/screens/settings/).

[2026-07-31] - | src/constants/types.ts
- Removed orphaned SettingsScreenProps type (its only consumer was the deleted src/screens/SettingsScreen.tsx).

[2026-07-31] ~ | CategoryGrid.tsx, IconGrid.tsx, SortToggle.tsx
- Fixed ComponentProps import source: moved from 'react-native' to 'react' (react-native does not export ComponentProps; 'react' does — consistent with the other 9 files). Resolves 3 pre-existing tsc errors.

[2026-07-31] ~ | calendars/PeriodPicker.tsx
- Restored missing allTimeText style ({ fontWeight: '600' }) referenced by the "All" checkbox label. Resolves 1 pre-existing tsc error.

[2026-07-31] ~ | context/AppContext.tsx
- Fixed tsc error in the transactions useEffect: captured narrowed `const account = activeAccount` after the null guard (function declaration hoisting was losing the narrowing inside the async loadTransactions closure). Resolves 1 pre-existing tsc error.

[2026-07-31] ~ | context/AppContext.tsx, components/CategoryList.tsx, components/BarChart.tsx, components/DonutChart.tsx, constants/types.ts
- Fixed Home showing stale category names after switching language: activeCategories no longer bakes getDisplayCategoryName() into the memoized name (its deps did not include language, so default categories kept the previous language). CategoryList and BarChart now resolve the display name via getDisplayCategoryName() at render time, matching every other consumer.
- BarChart and DonutChart retyped from ChartData[] to CategoryWithTotal[] and keyed by item.id (stable, unique) instead of item.name.
- Removed now-unused ChartData interface from constants/types.ts.

[2026-07-31] ~ | utils/formatters.ts, utils/calculator.ts, components/componentStyles.ts, components/AccountModal.tsx, screens/AccountsScreen.tsx, screens/HomeScreen.tsx, components/CalendarPicker.tsx
- Removed dead formatWeek and the unused componentStyles StyleSheet object (only the scalar constants remain).
- Merged formatWeekRange/formatWeekRangeShort into formatWeekRange(date, shortMonths, includeYear?) using weekStart/weekEnd; collapsed the duplicated ca/es branch in formatDateLong.
- Added getPeriodRange(period, date), formatSignedCurrency, and HIDDEN_BALANCE const; replaced inline signed-currency and '•••••' strings in AccountsScreen, HomeScreen, AccountModal; reused formatSignedCurrency in AccountsScreen totals.
- Hoisted calculator precedence function to module scope; CalendarPicker now uses formatWeekRange.

[2026-07-31] ~ | components/SelectorInline.tsx, screens/settings/settingsStyles.ts, screens/settings/AppearanceScreen.tsx, screens/settings/RegionalScreen.tsx, screens/settings/PersonalizationScreen.tsx, screens/settings/SettingsScreen.tsx, screens/settings/DataScreen.tsx, components/ConfirmationModal.tsx
- Extracted duplicated inline selector into shared components/SelectorInline.tsx with typed Option<T> (optional icon); Appearance, Regional and Personalization screens now use it (Personalization's SelectorRadio removed).
- Added shared screens/settings/settingsStyles.ts (container/content/section/card/label) used by the four settings subscreens.
- SettingsScreen: typed Subsection icon as Ionicons name and screen as the four paramless settings routes, removing both as any casts.
- DataScreen: replaced the three hand-rolled delete modals with ConfirmationModal, extended with a children slot for the DELETE text input; removed dead modal styles.

[2026-07-31] ~ | components/IconGrid.tsx, constants/accountIcons.ts, components/Fab.tsx, hooks/useUniqueNameCheck.ts, screens/CreateAccountScreen.tsx, screens/ModifyAccountScreen.tsx, screens/CreateCategoryScreen.tsx, screens/ModifyCategoryScreen.tsx, screens/CreateTagScreen.tsx, screens/ModifyTagScreen.tsx, screens/CategoriesScreen.tsx, screens/AddCategoryScreen.tsx, screens/TagsScreen.tsx, screens/AccountsScreen.tsx, screens/HomeScreen.tsx, components/CategoryGrid.tsx, utils/categoryUtils.ts, database/repositories/accountRepo.ts, database/webStorage.ts
- Generalised IconGrid into the shared icon picker (icons prop, selectedColor tinting, explicit shape); typed CATEGORY_ICONS and ACCOUNT_ICONS as IconName, removing the 4 duplicated grids and their as any Ionicons casts in the create/modify account and category screens.
- New components/Fab.tsx replacing the byte-identical floating action button in Home, Accounts, Categories, AddCategory and Tags screens.
- New hooks/useUniqueNameCheck.ts centralising the debounced duplicate-name check with timer cleanup on unmount (tag screens previously leaked pending timers); now used by all six create/modify entity screens (tag inputs also got maxLength).
- Categories and AddCategory screens now render through CategoryGrid (new hideTitle prop) instead of hand-rolled tiles.
- sortCategoriesWithOthersLast now compares getDisplayCategoryName, fixing the ordering of default categories in ca/es.
- Added accountRepo.getById (native + web); ModifyAccountScreen no longer loads the whole account list to find one account.
- ModifyAccount and ModifyTag delete dialogs now use ConfirmationModal (ModifyTag was missing onRequestClose).

[2026-07-31] ~ | context/AppContext.tsx, screens/HomeScreen.tsx, screens/AllTransactionsScreen.tsx, utils/formatters.ts
- Replaced the 4 duplicated period-range computations (calculateStartEnd in AppContext, the two byte-identical IIFEs in HomeScreen, computePeriodDates in AllTransactionsScreen) with the shared getPeriodRange(period, date) from utils/formatters.ts.

[2026-07-31] + | hooks/useTransactionFilters.ts, utils/transactionTags.ts
- Created useTransactionFilters hook encapsulating transaction filtering (account, type, category, period, tags), sorting, date grouping and tagsByTransaction batch loading; used by both transaction listing screens.
- Created utils/transactionTags.ts with the buildTagsByTransactionMap helper and TagsByTransaction type.

[2026-07-31] ~ | screens/TransactionsScreen.tsx, screens/AllTransactionsScreen.tsx
- Refactored both screens to consume useTransactionFilters; removed duplicated account/tag/sort/grouping logic and tags-loading effects from each screen.

[2026-07-31] + | utils/amountInput.ts, components/AmountInput.tsx
- Created shared amount parsing/format utils (parseAmountInput, parseAmountDisplay, parseAmountValue, MAX_AMOUNT_INTEGER_DIGITS) and AmountInput component; AddTransaction and ModifyTransaction screens now use them, removing their duplicated parseAmountInput/formatAmountDisplay, focus/invalid state and amount-row styles.

[2026-07-31] + | components/AccountTrigger.tsx
- Created shared account selector trigger used by TransactionsScreen and AllTransactionsScreen, replacing the duplicated account-row blocks (accountsWithBalance.find + IIFE icon) and their accountTrigger styles.

[2026-07-31] ~ | components/CommentInput.tsx, screens/AddTransactionScreen.tsx, screens/ModifyTransactionScreen.tsx
- CommentInput now owns the debounced comment-suggestion search (300 ms, transactionRepository.searchComments, skipNextSearch on suggestion select) and renders the suggestions panel; both form screens removed their local suggestion state, effects, handleSelectSuggestion and inline panel.

[2026-07-31] + | hooks/usePhotos.ts, utils/photoUtils.ts
- Created usePhotos hook (take/pick/remove photo with copy to app document dir) and photoUtils (parsePhotos for the DB photo field, deletePhotoFile); AddTransaction, ModifyTransaction and TransactionDetails screens now share them, removing the triplicated deletePhoto/take/pick logic and JSON.parse(photo) re-implementations.

[2026-07-31] ~ | screens/AddTransactionScreen.tsx, screens/ModifyTransactionScreen.tsx
- Submit handlers now reuse formatDateForDB(day) instead of the inlined y/m/d/h/min/s string building.

[2026-07-31] ~ | screens/TransactionDetailsScreen.tsx
- Replaced the hand-rolled delete modal with the shared ConfirmationModal; removed the redundant mount useEffect (data is already reloaded by the useFocusEffect).

[2026-08-01] ~ | Phase 5 Tier 1 cross-cutting cleanup
- T1 dead code removal: deleted unused exports (LANGUAGES/isSpanish/isEnglish, getCategoryName, settings_text key, 19 *ScreenProps types), removed dead total prop from CategoryList and unused navigation prop from the 4 settings subscreens.

[2026-08-01] ~ | components/, screens/
- T2 typed icons: replaced all 'as any' / ComponentProps<Ionicons>['name'] casts with IconName across 17 screens and components.

[2026-08-01] + | constants/types.ts, database/helpers.ts
- T3 shared constants/helpers: added USER_ID, MAX_VISIBLE_CATEGORIES, DEBOUNCE_MS, MAX_PHOTOS in constants/types.ts and isTotalAccount + UNTAGGED_ID in database/helpers.ts; replaced all hardcoded user_id:1 literals, is_total checks, and local GRID_ROWS/DEBOUNCE_MS/MAX_PHOTOS declarations across screens and hooks.

[2026-08-01] ~ | screens/, database/, context/
- T4 bug fixes: AllTransactionsScreen custom-range end normalized to 23:59:59.999; getById added to native/web transaction repos and used by TransactionDetailsScreen; HomeScreen loadTagBreakdowns now Promise.all with cancellation flag and try/catch; checkNameDuplicate wrapped in try/finally in CreateTag/ModifyTag screens; prefill-clobber guards (userEditedRef) added to ModifyTag/ModifyCategory screens.

[2026-08-01] + | components/EmptyState.tsx, components/DrawerMenuButton.tsx, components/IconBadge.tsx
- T5 component consolidation: created EmptyState, DrawerMenuButton and IconBadge (with iconRadius helper); applied EmptyState to 10 sites, DrawerMenuButton to 5 sites, IconBadge to 16 sites; applied shared MODAL_*/BUTTON_BORDER_RADIUS constants from componentStyles.ts to 7 modals; extended ConfirmationModal with moveLabel/onMove and converted PhotoSection and ModifyCategoryScreen delete modals; memoized TransactionRow in TransactionGroup and added useCallback to CategoryList handlers.

[2026-08-01] ~ | components/calendars/, components/charts/, components/
- T6 prop drilling removal: DayPicker/WeekPicker/PeriodPicker/CalendarModal/CalendarPicker now read config.firstDayOfWeek internally (firstDay prop removed from all call sites); DonutChart/BarChart/CategoryList read config.currency/separator/textSize internally.

[2026-08-01] ~ | utils/formatters.ts, components/calendars/
- T7 calendar date-math centralization: exported weekEnd (sets 23:59:59.999) and dayOffset from formatters.ts; formatWeekRange accepts firstDay; exported MIN_DATE and shared container style from calendarStyles.ts; DayPicker/WeekPicker/MonthGrid/YearGrid/PeriodPicker/CalendarModal now share these, removing duplicated month/date constructions.

[2026-08-01] ~ | utils/calculator.ts, database/webStorage.ts, screens/, context/AppContext.tsx, i18n/index.ts
- T8 type-safety pass: removed all non-null assertions (pop()!, description!, selectedIcon!/selectedColor!, categoryId!/numericAmount!, activeAccount!, nameLookup!) via narrowed locals/guards; repo-wide 'as any' sweep clean.

[2026-08-01] ~ | screens/settings/RegionalScreen.tsx
- Renamed Spanish-named constants to English: PRIMER_DIA -> FIRST_DAY_OPTIONS, DIVAS -> CURRENCIES.

[2026-08-01] ~ | constants/types.ts, components/, screens/
- Replaced magic shape/chart strings with typed constants in constants/types.ts: BADGE_SHAPES + BadgeShape (circle/rounded), CONFIG_ICON_SHAPES + ConfigIconShape (square/circle), CHART_TYPES + ChartType (donut/bar); applied across IconBadge, IconGrid, config defaults (ConfigContext/configRepo/webStorage), AppearanceScreen and all IconBadge shape ternaries in 10 components/screens.

[2026-08-01] ~ | constants/types.ts, utils/language.ts, context/ConfigContext.tsx, database/repositories/configRepo.ts, database/webStorage.ts, screens/, components/
- Tier A domain constants: added TRANSACTION_TYPES + TransactionType, TYPE_FILTERS + TransactionTypeFilter, PERIODS + Period, THEMES + Theme, TEXT_SIZES + TextSize, SORT_BY + SortBy, SORT_DIRECTIONS + SortDirection and CALC_KEYS to constants/types.ts, plus LANGUAGES + Language in utils/language.ts; applied across ConfigContext, config defaults (configRepo/webStorage), CalculatorModal, SortToggle, useTransactionFilters, PeriodTabs, CalendarModal/CalendarPicker, formatters, HomeScreen, AppContext, AddTransaction/AllTransactions/Categories/CategoryFilterModal/CreateCategory/ModifyCategory/ModifyTransaction/TransactionDetails/Transactions screens and TransactionGroup; AppearanceScreen theme options renamed THEMES -> THEME_OPTIONS and RegionalScreen language options renamed LANGUAGES -> LANGUAGE_OPTIONS to avoid TDZ collisions.
[2026-08-01] ~ | utils/color.ts, constants/themes.ts, components/componentStyles.ts, components/IconBadge.tsx, components/, screens/
- Tier B color/alpha helpers: new utils/color.ts with withAlpha(color, percent); WHITE/BLACK exported from constants/themes.ts and PILL_RADIUS from componentStyles.ts; IconBadge backgroundAlpha prop is now a percent number; replaced all '+<hex>' alpha suffixes (CategoryGrid, CategoryFilterModal, IconGrid, ConfigContext scrollbars), backgroundAlpha string literals, 'round ? 999 : N' ternaries and '#FFFFFF'/'#000' color literals across 11 components/screens.
[2026-08-01] ~ | constants/types.ts, screens/, components/, database/webStorage.ts, utils/amountInput.ts
- Tier C limit constants: added MAX_CATEGORY_NAME_LENGTH/MAX_ACCOUNT_NAME_LENGTH (30), MAX_TAG_NAME_LENGTH (20), MAX_NOTE_LENGTH (200), MAX_COMMENT_LENGTH (4096), MAX_VISIBLE_TAGS (3), MAX_SUGGESTIONS (5) and DECIMAL_PLACES (2) to constants/types.ts; replaced local MAX_NAME_LENGTH/MAX_NOTE_LENGTH consts and literal 20/4096/3/5/2 across CreateAccount/ModifyAccount/CreateCategory/ModifyCategory/CreateTag/ModifyTag screens, TagSection, CommentInput, CategoryList, webStorage searchComments and amountInput decimals.
[2026-08-01] ~ | utils/formatters.ts, screens/HomeScreen.tsx, screens/AllTransactionsScreen.tsx
- Tier D date-time utils: added startOfDay/endOfDay to utils/formatters.ts; refactored weekStart/weekEnd/getPeriodRange/isFutureDate to use them and replaced the setHours(0,0,0,0)/setHours(23,59,59,999) duplicates in HomeScreen and AllTransactionsScreen custom-range handlers.
[2026-08-01] + | constants/currencies.ts, utils/formatters.ts, context/ConfigContext.tsx, database/repositories/configRepo.ts, database/webStorage.ts, database/seedData.ts, screens/settings/RegionalScreen.tsx
- Tier E currency symbols: created constants/currencies.ts with DEFAULT_CURRENCY ('€') and CURRENCY_OPTIONS ({ value, labelKey } for euro/dollar/pound/yen); replaced all '€' defaults across formatters, ConfigContext, configRepo, webStorage and seedData; RegionalScreen CURRENCIES now derive from CURRENCY_OPTIONS keeping the labels.currency_* mapping.
[2026-08-01] ~ | constants/types.ts, context/ConfigContext.tsx, database/repositories/configRepo.ts, database/webStorage.ts, utils/formatters.ts, utils/amountInput.ts, components/calendars/, screens/settings/RegionalScreen.tsx
- Tier F config domain constants: added FIRST_DAYS + FirstDay (monday/sunday) and DECIMAL_SEPARATORS + DecimalSeparator (comma/dot) to constants/types.ts; applied to Config.firstDayOfWeek/decimalSeparator types and all defaults, formatters params/defaults (weekStart/weekEnd/dayOffset/formatWeekRange/formatCurrency/formatSignedCurrency), amountInput formatAmountDisplay, WeekPicker sameWeek, DayPicker header compare and RegionalScreen separator/first-day options + FirstDay cast.
[2026-08-01] ~ | context/AppContext.tsx, screens/HomeScreen.tsx, database/repositories/transactionRepo.ts, database/webStorage.ts, hooks/useTransactionFilters.ts, screens/ModifyTransactionScreen.tsx, components/TagSection.tsx
- W1 correctness pass: added cancellation flags to the transactions/totals/balances fetch effects and a transactionsVersion counter so all-time totals and balances no longer re-fire on every transactions change; extracted defaultCustomDate() helper; breakdownByCategoryAndTag now accepts accountId: number | null in both backends and HomeScreen passes null for the Total account (fixes empty breakdown on Total); useTransactionFilters resyncs selectedAccountId when the active account changes; ModifyTransactionScreen falls back to the first non-Total account instead of hardcoded 1 and cancels stale tag loads; webConfigRepo.get() guards corrupted JSON and save() no longer relies on 	his; TagSection clears its debounce timer on unmount; searchComments uses MAX_SUGGESTIONS instead of literal 5.
[2026-08-01] ~ | constants/types.ts, database/helpers.ts, database/configDefaults.ts, database/webStorage.ts, database/repositories/ (configRepo, transactionRepo, userRepo, accountRepo, categoryRepo, tagRepo), context/ConfigContext.tsx, context/AppContext.tsx, i18n/index.ts, utils/ (formatters, platform, badgeShape), components/ (SortToggle, AccountTrigger, AccountModal, CategoryList, CategoryGrid, CalendarModal, TagFilterBar), screens/ (HomeScreen, AccountsScreen, ModifyCategoryScreen, TransactionDetailsScreen, AllTransactionsScreen, ModifyTransactionScreen)
- W2 consistency pass: added UNTAGGED_LABEL constant replacing the 3 raw 'Untagged' strings in the tag-breakdown queries; deleteTransactionPhotos now reuses parsePhotos/deletePhotoFile from photoUtils and drops the any-typed params; buildUpdateQuery takes Partial<Record<string, string|number|null>> instead of Record<string, any>; removed unused exports isIOS, getShortMonthName and the SortToggle SortBy/SortDirection re-export; introduced StringKeyOf<T> so i18n resolver maps and CalendarModal title keys drop their as-string casts while keeping type safety; created configDefaults.ts with DEFAULT_CONFIG and toConfigRows shared by ConfigContext, configRepo and webStorage (removing 3 duplicated defaults objects and the save-time reverse-map); added dbTimestamp() and unified created_at timestamps across all native repos and webStorage (now YYYY-MM-DD HH:MM:SS everywhere); added resolvePeriodRange() used by AppContext, HomeScreen (x2) and AllTransactionsScreen; added badgeShapeFor() replacing 6 duplicate config-shape-to-badge ternaries across 8 components/screens.
[2026-08-01] ~ | components/TransactionGroup.tsx, screens/TransactionsScreen.tsx, screens/AllTransactionsScreen.tsx, hooks/useFontSize.ts, context/ConfigContext.tsx, database/repositories/accountRepo.ts, database/webStorage.ts, context/AppContext.tsx, screens/AccountsScreen.tsx
- W3 performance pass: TransactionGroup wrapped in memo and onTransactionPress hoisted to useCallback in TransactionsScreen and AllTransactionsScreen (stable refs for SectionList renderSectionHeader); useFontSize returns a memoized callback keyed on config.textSize; ConfigContext updateConfig wrapped in useCallback and the provider value memoized (no longer rebuilt each render); replaced the per-account getCurrentBalance N+1 with a single batched getBalances() (one grouped SQL query in accountRepo, one localStorage pass in webStorage) used by AppContext.calculateBalances and AccountsScreen.loadData.
[2026-08-01] ~ | database/database.ts, database/photoCleanup.ts (new), database/repositories/ (transactionRepo, accountRepo, categoryRepo), screens/ (AddTransactionScreen, AccountsScreen, ModifyAccountScreen), database/webStorage.ts
- W6 correctness pass: initDatabase now runs PRAGMA foreign_keys = ON so native ON DELETE CASCADE actually fires; extracted shared deleteTransactionPhotos helper (database/photoCleanup.ts) and accountRepo.delete/categoryRepo.delete now delete associated transaction photos and transactions explicitly instead of relying on cascades; guarded the last 3 unguarded async loads (AddTransactionScreen usage counts, AccountsScreen loadData, ModifyAccountScreen getById); webStorage.breakdownByCategoryAndTag now matches native OR semantics for combined untagged+regular tag filters (was returning [] while native returned both buckets).
[2026-08-01] ~ | database/ (helpers, configDefaults, webStorage, migrations/003_config, repositories/ (tagRepo, configRepo, accountRepo, categoryRepo))
- W7 DB-layer consolidation: removed duplicate getByTransactionIds from tagRepo and webTagRepo (transactionRepository.getTagsByTransactionIds is the single API); 003_config.ts now seeds from toConfigRows(DEFAULT_CONFIG) instead of a hardcoded 15-row array; parseConfig iterates the exported DB_KEY_MAP with a coercion table (booleans, int-or-null ids, firstDayOfWeek) replacing the hand-mapped 15 fields; shared buildNameExistsQuery (native) and nameExists (web) collapse the 6 near-identical existsByName implementations.
[2026-08-02] + | hooks/ (useFocusLoad.ts, useDebouncedCallback.ts), components/ (ModalShell.tsx, CategoryTile.tsx, ListItemRow.tsx, form/ (8 files), settings/ (SettingsSection.tsx, SettingsRow.tsx, CheckboxRow.tsx, ToggleRow.tsx, settingsStyles.ts)), hooks/useColorSelection.ts, navigation/AppNavigator.tsx, components/SelectorInline.tsx
- W8a hook extraction: new useFocusLoad (async data + loading on focus with cancellation) and useDebouncedCallback; useUniqueNameCheck is now a thin wrapper; applied to CommentInput, TagSection, TransactionsScreen, AllTransactionsScreen and TransactionDetailsScreen.
- W8b ModalShell extraction: new ModalShell.tsx (visible/onClose/maxWidth/padding/overlayPadding/maxHeight/backgroundColor/shadow; web boxShadow vs native elevation) replaces the 8 duplicated RN Modal + overlay implementations in AccountModal, ColorPickerModal, ConfirmationModal, CalendarModal, CalculatorModal, PhotoSection, TagSection and ModifyCategoryScreen.
- W8c list-row/tile extraction: new CategoryTile.tsx (icon/color/shape/label/selected/checkmark/dashed with withAlpha selected state) and ListItemRow.tsx (title/icon/badge/leading/middle/right/divider/onPress with custom hitSlop type); applied to CategoryGrid, CategoryFilterModal, AccountModal, ModifyCategoryScreen select list, AccountsScreen, TransactionGroup and CategoryList.
- W8d form extraction: new shared form primitives (SectionTitle, LabeledTextField, PrimaryButton, FormError, DeleteButton, KeyboardSpacer, FormScrollView, formStyles) and useColorSelection hook (auto-detects custom color outside QUICK_COLORS); Create/Modify Account, Create/Modify Category and Create/Modify Tag forms rebuilt on them, removing duplicated input/counter/button/keyboard styles and the per-screen QUICK_COLORS custom-color logic.
- W8e data maps + settings components: AppNavigator now declares SCREENS (Stack.Screen via .map with icon/label/drawerMenu flags) and DRAWER_ITEMS (.map with separator) data instead of 20 duplicated Stack.Screen and 6 DrawerNavItem blocks; the drawer menu headerLeft is set centrally in the navigator (removing the per-screen useFocusEffect/useLayoutEffect setOptions blocks and DrawerMenuButton imports in Accounts/Categories/AllTransactions/Tags screens); new settings components (SettingsSection, SettingsRow, CheckboxRow, ToggleRow) with settingsStyles moved to components/settings; SettingsScreen and DataScreen rows and PersonalizationScreen checkbox/toggle rows refactored onto them; SelectorInline now uses the useFontSize hook instead of inlining scaleFontSize.
[2026-08-02] ~ | constants/ (types.ts, calendar.ts, themes.ts), utils/ (calculator.ts, formatters.ts, color.ts usage), components/ (CalculatorModal.tsx, calendars/ (DayPicker.tsx, MonthGrid.tsx, MonthNav.tsx, YearGrid.tsx, WeekPicker.tsx), TagFilterBar.tsx, DaySelector.tsx, TransactionGroup.tsx, AmountInput.tsx, IconGrid.tsx, ColorGrid.tsx, CategoryTile.tsx, AccountModal.tsx, SelectorInline.tsx, TagFilterBar.tsx), screens/ (AccountsScreen.tsx, AddTransactionScreen.tsx, ModifyTransactionScreen.tsx, TransactionDetailsScreen.tsx, ModifyCategoryScreen.tsx, settings/DataScreen.tsx)
- W9 literal sweep (alpha/calendar/calculator): replaced ad-hoc hex-alpha strings ('20', '22', '30', '40', '60', 'CC') with withAlpha(color, n) and 8-hex-digit literals across components and screens; hardcoded calendar numbers (days in week, months in year, years per page, grid cells, day width) moved to constants/calendar.ts; calculator symbols ('+', '-', '*', '/', '.', backspace) centralized in CALC_KEYS; magic strings ('transparent', 'DELETE' confirmation) replaced by TRANSPARENT constant and DELETE_ALL_CONFIRMATION; misc single-use '15'/'25' sizing literals resolved.
[2026-08-02] ~ | AGENTS.md
- W10 docs fix: corrected the DATABASE section to the actual state (3 idempotent migrations in src/database/migrations/ with no version counter; all statements use CREATE TABLE/INDEX IF NOT EXISTS) replacing the stale "Current version: 5" claim.
[2026-08-02] ~ | database/ (database.ts, webStorage.ts, photoCleanup.ts, repositories/ (accountRepo.ts, categoryRepo.ts, transactionRepo.ts), migrations/ (002_seed.ts, 003_config.ts)), utils/formatters.ts, components/ (TransactionGroup.tsx, AccountTrigger.tsx), hooks/useTransactionFilters.ts, screens/ (AddTransactionScreen.tsx, ModifyTransactionScreen.tsx, TransactionDetailsScreen.tsx, ModifyCategoryScreen.tsx, settings/DataScreen.tsx), context/AppContext.tsx
- P1 correctness fixes: native seed data now only inserted when the users table is empty (mirrors web guard), fixing deleted seed accounts/categories resurrecting on relaunch; new parseDbDate helper parses DB date strings from components (no engine-dependent new Date on 'YYYY-MM-DD HH:mm:ss' or UTC-midnight date-only strings) applied to TransactionGroup headers, useTransactionFilters sort, TransactionDetailsScreen and ModifyTransactionScreen; multi-statement writes made atomic via withTransactionAsync (account/category delete, deleteAllTransactions, createWithTags, updateWithTags, new resetDatabase for the delete-all-data flow, new reassignAndDelete on category repo); refreshAccounts revalidates activeAccount after deletion; hardcoded `?? 1` account-id fallbacks replaced with first non-total account (undefined-safe), AccountTrigger accepts an optional account id.
[2026-08-02] ~ | hooks/useFocusLoad.ts, database/photoCleanup.ts, context/ConfigContext.tsx, screens/ (settings/DataScreen.tsx, HomeScreen.tsx), i18n/ (en.ts, es.ts, ca.ts)
- P2 error-handling: useFocusLoad now catches loader rejection (clears the stuck loading spinner, logs); deleteTransactionPhotos logs instead of swallowing; ConfigContext.updateConfig logs save failures; DataScreen export/delete-all flows alert on failure with new settings_delete_*_error_* i18n keys (en/es/ca); HomeScreen tag-breakdown catch logs.[2026-08-02] + | P3 parity + i18n (FinlyApp)
- webStorage.searchComments now sorts results alphabetically to match native ORDER BY description.
- transactionRepo.getCategoryUsageCounts now filters the join by t.type, matching web semantics.
- transactionRepo.breakdownByCategoryAndTag untagged row now uses COALESCE and HAVING to emit only when total > 0, matching web.
- CategoryList renders localized "Untagged" label (home_tag_untagged) via t() instead of hardcoded UNTAGGED_LABEL.[2026-08-02] ~ | FinlyApp (screens/ (TransactionsScreen.tsx, AllTransactionsScreen.tsx, HomeScreen.tsx, AccountsScreen.tsx), components/ (TransactionGroup.tsx, ListItemRow.tsx, CategoryTile.tsx, CategoryGrid.tsx), database/ (repositories/transactionRepo.ts, webStorage.ts))
- P4 performance: TransactionsScreen and AllTransactionsScreen switched from renderItem={null} + heavy section-header grouping to a proper virtualized SectionList (memoized renderItem/renderSectionHeader/keyExtractor, initialNumToRender 12, windowSize 7, removeClippedSubviews). TransactionGroup refactored into exported memoized TransactionRow and TransactionDateHeader (default grouped export removed as dead code).
- ListItemRow and CategoryTile wrapped in memo; CategoryGrid render fns memoized so tiles/rows skip redundant re-renders.
- HomeScreen N+1 eliminated: new breakdownByCategoriesAndTags (native single-grouped SQL over category_id IN (...); web single-pass) replaces one breakdownByCategoryAndTag query per visible category.[2026-08-02] ~ | FinlyApp (tsconfig.json, navigation/AppNavigator.tsx, utils/transactionTags.ts, components/componentStyles.ts, database/database.ts)
- P5 hygiene + versioning: enabled verbatimModuleSyntax in tsconfig (type-only imports converted across 52 files, all TS1484 resolved); ScreenDef component typed via imported ComponentType; removed non-null assertion in buildTagsByTransactionMap; removed dead MODAL_MAX_WIDTH/MODAL_PADDING constants; initDatabase now runs a PRAGMA user_version-based migration runner (SCHEMA_VERSION 3: schema, seed data, seed config) that skips already-applied steps and avoids re-seeding existing installs.[2026-08-02] ~ | screens/ModifyCategoryScreen.tsx
- Added marginTop 16 to the Delete button (styles.deleteButton) so it no longer sits flush against the Color section, matching the gap used by the Add button in CreateCategoryScreen.

[2026-08-03] - | FinlyApp (database/ (repositories/ (transactionRepo.ts, userRepo.ts), webStorage.ts, index.ts), components/settings/SettingsSection.tsx, components/IconBadge.tsx, constants/currencies.ts, utils/ (formatters.ts, amountInput.ts, transactionTags.ts), database/helpers.ts)
- Dead code removal: deleted transactionRepo/webStorage dead methods deleteByAccountId, reassignCategory, breakdownByCategories, breakdownByCategoryAndTag and the orphaned CategoryBreakdown interface; removed the entire unused user repository module (userRepo.ts, webUserRepo and the userRepository export in database/index.ts); deleted unreferenced components/settings/SettingsSection.tsx; dropped internal-only exports getPeriodRange/weekEnd (formatters), MAX_AMOUNT_INTEGER_DIGITS (amountInput), iconRadius (IconBadge), CurrencyOption (currencies), NameTable (helpers) and TransactionTagLink (transactionTags).

[2026-08-03] + | FinlyApp (components/TransactionForm.tsx, utils/pendingCategory.ts)
[2026-08-03] ~ | screens/ (AddTransactionScreen.tsx, ModifyTransactionScreen.tsx, AddCategoryScreen.tsx, CreateCategoryScreen.tsx)
- TransactionForm unification: new shared TransactionForm component replaces the ~93% duplicated Add/Modify transaction form (all state, usage-sorted category grid, pending-category/usage-count focus logic, tag preload via transactionId prop, submit flow, the 3 modals and styles); AddTransactionScreen and ModifyTransactionScreen are now thin wrappers providing initial values, submit label/error keys and the create/update repo call; pending-category singleton moved to utils/pendingCategory.ts so the form and AddCategoryScreen/CreateCategoryScreen no longer import from AddTransactionScreen; Modify now loads category usage counts on focus like Add, making both screens sort categories by usage consistently.

[2026-08-03] + | FinlyApp (hooks/useBalanceVisibility.ts, hooks/useNameDuplicateCheck.ts, utils/formHints.ts, components/IconColorSection.tsx, components/AccountForm.tsx)
[2026-08-03] ~ | screens/ (HomeScreen.tsx, AccountsScreen.tsx, CreateAccountScreen.tsx, ModifyAccountScreen.tsx, CreateCategoryScreen.tsx, ModifyCategoryScreen.tsx, CreateTagScreen.tsx, ModifyTagScreen.tsx)
- Phase 2b shared form logic: new useBalanceVisibility hook (isBalanceHidden + toggleReveal, resets on focus) applied to HomeScreen and AccountsScreen, removing the duplicated isRevealed/useFocusEffect trio; new useNameDuplicateCheck hook centralizes the 6 duplicated checkNameDuplicate + useUniqueNameCheck + nameError/checkingName blocks (default-English-name resolution and optional excludeId) now used by Create/Modify Account, Create/Modify Category and Create/Modify Tag; new formHints helpers getIconColorHintText/getNameHintText replace the per-screen getHintText functions; new IconColorSection bundles SectionTitle + IconGrid + ColorGrid + ColorPickerModal (internal picker visibility) applied to Create/Modify Account and Create/Modify Category; new shared AccountForm component (name field, IconColorSection, note field, hint, delete section, submit button, keyboard spacer) used by both CreateAccountScreen and ModifyAccountScreen, which became thin stateful wrappers.

[2026-08-03] ~ | FinlyApp (constants/types.ts, screens/ (HomeScreen.tsx, AccountsScreen.tsx, AddCategoryScreen.tsx, CreateCategoryScreen.tsx, ModifyCategoryScreen.tsx, TransactionsScreen.tsx, AllTransactionsScreen.tsx, CreateAccountScreen.tsx, ModifyAccountScreen.tsx, CreateTagScreen.tsx, ModifyTagScreen.tsx, TagsScreen.tsx, CategoriesScreen.tsx, TransactionDetailsScreen.tsx, settings/SettingsScreen.tsx), components/ (AccountForm.tsx, CategoryFilterModal.tsx), screens/settings/DataScreen.tsx)
- Phase 4 small fixes: new shared `NavigationProp<RouteName>` type in constants/types.ts replacing the 15 per-screen `NativeStackNavigationProp<RootStackParamList, 'X'>` declarations (screens import the shared type and pass their route name; React Navigation types unchanged); fix ModifyAccountScreen last-account check now counts only non-Total accounts so the last real account can't be deleted while the Total pseudo-account is present; DataScreen merged duplicate closeDeleteAll/closeDeleteAllWithText helpers; CategoryFilterModal empty-sections condition simplified to `sections.every(...)`; AccountForm removed the redundant MAX_NOTE_LENGTH onChangeText guard (maxLength already caps input); HomeScreen extracted the inline balance-row style to styles.balanceRow.

[2026-08-03] + | FinlyApp (vitest.config.mts, tests/ (utils/ (calculator.test.ts, formatters.test.ts, amountInput.test.ts, categoryUtils.test.ts, transactionTags.test.ts, color.test.ts), database/helpers.test.ts)), docs/harnesses.md
[2026-08-03] ~ | FinlyApp/package.json
- Phase A test harness: added Vitest + happy-dom dev dependencies, vitest.config.mts (happy-dom environment, tests/ include), and npm scripts test / test:watch / typecheck / test:all (typecheck + lint + test). Added 71 unit tests covering pure-logic modules free of React Native imports (calculator precedence/decimals/MAX_VALUE, formatters 2-decimal rounding and DB date conversion, amount input rules, category Others-last sorting, tag map grouping, withAlpha clamping, DB query builders), with regression seeds from previously fixed bugs. Added docs/harnesses.md describing the full verification harness stack (implemented + planned phases).

[2026-08-03] + | FinlyApp (tests/database/ (sqliteMock.ts, contractTypes.ts, contractSuite.ts, sqliteContract.test.ts, webContract.test.ts, dbDrift.test.ts), package.json), docs/harnesses.md
- Phase B dual-storage contract suite: added sql.js + @types/sql.js dev deps; built an expo-sqlite → sql.js mock (sqliteMock.ts, lastInsertRowid via SELECT last_insert_rowid()) so the real native repos run against real SQLite in Node; added a shared contract suite (contractSuite.ts + contractTypes.ts) executed against both the web localStorage repos (webContract.test.ts) and the native SQLite repos (sqliteContract.test.ts); added a DB drift test (dbDrift.test.ts) asserting PRAGMA table_info vs types.ts, seed counts, user_version 3, config rows == DB_KEY_MAP and init idempotence.
- The contract suite surfaced a name-sort drift: native ORDER BY name is binary while web uses localeCompare (case-insensitive).

[2026-08-03] ~ | src/database/repositories/ (accountRepo.ts, categoryRepo.ts, transactionRepo.ts), docs/harnesses.md
- Fixed the name-sort drift by standardizing native sorts to case-insensitive collation: accountRepo.list and categoryRepo.list → ORDER BY name COLLATE NOCASE, transactionRepo.searchComments → ORDER BY description COLLATE NOCASE, transactionRepo.getCategoryUsageCounts → ORDER BY count DESC, c.name COLLATE NOCASE ASC. A mixed-case ordering test in the contract suite guards this.
- docs/harnesses.md: marked Phase B implemented and documented the sql.js mock, the six test files and the drift findings/fix.

[2026-08-03] ~ | FinlyApp/App.tsx, FinlyApp/src/components/Fab.tsx
- Web console-warning fixes: splash animations now use USE_NATIVE_DRIVER (Platform.OS !== 'web') instead of useNativeDriver: true, removing the "useNativeDriver is not supported" warning on web; Fab.tsx split the drop shadow into fabShadowNative (elevation + shadow*) and fabShadowWeb (boxShadow) via isWeb, removing the "shadow* style props are deprecated" warning. Remaining dev-only noise (gesture-handler/screens pointerEvents prop deprecation, RN DevTools message-channel error) originates in third-party libraries and is not patched.

[2026-08-03] ~ | FinlyApp/src/components/Fab.tsx
- Final shadow* warning fix: react-native-web preprocesses every style registered via StyleSheet.create at module load and warns on shadow* keys even if never applied, so the previous split (conditional at render) still warned on web. Hoisted fabShadowNative and fabShadowWeb out of StyleSheet.create into module-level plain constants; RNW no longer preprocesses them, removing the warning while keeping the native (elevation + shadow*) and web (boxShadow) shadows.

[2026-08-03] ~ | opencode.jsonc, .agents/skills/verification-loop/SKILL.md, AGENTS.md, docs/harnesses.md
- Phase C E2E verification harness: enabled the Playwright MCP server in opencode.jsonc pinned to @playwright/mcp@0.0.78 running headless system Chrome (--browser chrome, -y to skip the interactive install prompt) and added a bash permission allowlist for the loop commands (npm run test:all, npx vitest *, npx expo start*, everything else ask); rewrote the verification-loop skill as the Expo loop (test:all green first, boot npx expo start --web on 8081, fresh context + cleared localStorage, 375px viewport for mobile criteria, native-only criteria reported "not checkable on web", 3-attempt cap, dev-server cleanup); AGENTS.md gained a VERIFICATION section and its DATABASE section was corrected (PRAGMA user_version-based runner SCHEMA_VERSION 3 replacing the "no version counter" claim, repository list user→tag); docs/harnesses.md marks Phase C implemented.
[2026-08-03] ~ | FinlyApp (screens/ModifyAccountScreen.tsx, components/AccountForm.tsx, screens/CategoriesScreen.tsx), spec (022-total-account, 008-categories-screen), docs/changelog.md
- Phase C pilot verification (verification-loop skill + Playwright MCP in headless Chrome, 375px viewport): walked all acceptance criteria of 022-total-account (15) and 008-categories-screen (12) in the real Expo web app. 25/27 passed on the first pass; 2 spec deviations found, fixed and re-verified (all 27 criteria PASS, test:all 138/138 green).
- Fix 022 c10: the Total account name field is now displayed disabled/read-only (grayed out, showing the i18n 'Total') instead of being hidden. AccountForm gained a nameDisabled prop (renders editable={!nameDisabled} with textSecondary input color); ModifyAccountScreen now passes showNameField + nameDisabled={isTotal} (was showNameField={!isTotal}), keeping name out of the update payload for Total.
- Fix 008 c7: the Create control is now the spec's dashed '+ Create' tile in the last grid position (CategoryGrid showAddMore with addMoreLabel={labels.add_cat_create}) instead of a floating Fab '+'; Fab import removed from CategoriesScreen.
- Verified 022 (all PASS): Total first in Home/Transactions/AllTransactions selectors, combined data + balance = sum of non-total accounts (-25,50 EUR), excluded from Add/Modify transaction selectors with first non-Total preselected fallback, account filtering in AllTransactions, first card in Accounts, tap navigates to ModifyAccountScreen (id=2), read-only name + hidden delete + save only icon/color/note (note persistence round-trip checked), TransactionDetails from any screen, i18n name/description (en/es/ca; Catalan description verified), language switch, theme switch (dark/light), text size (Large vs Medium).
- Verified 008 (all PASS): drawer item navigates, header hamburger + title, Expenses/Income tabs with Expenses default, 4-column grid (x-coordinate check) with 21 expense / 10 income categories, colored rounded icon tiles + name below, grid scrolls when overflowing (375x500 viewport), in-grid Create tile, Create -> CreateCategory with active type, category tap -> ModifyCategory with categoryId, Spanish tab/category texts on language switch, theme and text size respected.
- Deviations documented for future spec/implementer alignment: 022 spec FR8 says the Total name field must be shown disabled; 008 spec FR4/c7 require an in-grid '+ Create' tile. Both now match the code.

[2026-08-05] + | FinlyApp/.maestro/ (flow-smoke.yaml, flow-022-total-account.yaml, flow-008-categories.yaml, flow-023-photo-attachment.yaml, flow-debug.yaml, helpers/ (state-reset.yaml, open-drawer.yaml, dismiss-dev-menu.yaml)), .agents/skills/verification-loop/SKILL.md, docs/harnesses.md, docs/changelog.md
- Mobile verification harness (Maestro + Android emulator) for native-only and native-parity criteria:
  - Switched all flows from Expo Go (`host.exp.exponent`) to the dev-client debug build (`com.anonymous.FinlyApp`). The dev-client does not register the `exp://` scheme, so every flow now starts with a new `helpers/state-reset.yaml` (stopApp + launchApp with clearState) that resets the SQLite DB to the seeded state and launches the activity directly, then runs `helpers/dismiss-dev-menu.yaml`.
  - Added `flow-023-photo-attachment.yaml` covering PhotoSection visibility on Add Transaction, the source modal with Take photo / Add from gallery, and the Settings → Personalization "Photo" checkbox toggle hiding/showing the section. Camera capture and gallery picking open system UIs Maestro cannot drive reliably on an emulator, so those criteria are verified at the modal level and the full capture path is reported "not automatable on emulator".
  - Updated `.agents/skills/verification-loop/SKILL.md` with a Mobile mode section (boot emulator, install/launch dev-client APK, adb reverse tcp:8081, run maestro flows) and `docs/harnesses.md` with the Maestro harness under Phase C.
  - Verified on the emulator (finly_test, Pixel 7 API 35): flow-smoke, flow-022-total-account, flow-008-categories and flow-023-photo-attachment all PASS on the dev-client build (2026-08-05).

[2026-08-05] + | .github/workflows/ci.yml, FinlyApp/.nvmrc, docs/harnesses.md, docs/programming-concepts.md, docs/changelog.md
- CI pipeline (GitHub Actions) enforcing the "done" gate on every change: `.github/workflows/ci.yml` runs on PRs targeting develop/main and on pushes to those branches; steps checkout -> setup-node (Node 24, npm cache via FinlyApp/package-lock.json) -> npm ci -> npm run test:all, all in working-directory FinlyApp on an ubuntu-latest runner (suite is pure Node: Vitest + happy-dom + sql.js WASM, no native build). `concurrency` cancels superseded runs. Node pinned to 24 (matching dev machines) via the workflow and the new FinlyApp/.nvmrc. Branch protection ("require status checks to pass") is a manual GitHub settings step to enable after the CI check first runs. docs/harnesses.md marks the CI pipeline implemented (harness stack row + CI subsection). docs/programming-concepts.md gained a purpose note (learning document only, not a project tooling doc) and an educational # CI/CD section (CI, CD vs CI, pipeline, GitHub Actions vocabulary, status checks / branch protection).

[2026-08-06] + | FinlyApp/tests/component/ (12 test files: AmountInput, CategoryGrid, EmptyState, EyeToggle, Fab, IconBadge, PeriodTabs, RadioButton, SearchBar, SortToggle, TabBar, TransactionGroup), FinlyApp/tests/component/helpers/configStub.ts, FinlyApp/tests/mocks/expo-vector-icons.tsx
- Phase D component test harness: RNTL 14 + vitest-native unit tests for the 12 presentational components (79 tests): AmountInput (10), CategoryGrid (10), TransactionGroup (10: 8 row + 2 date header), SearchBar (7), SortToggle (7), RadioButton (7), TabBar (6), PeriodTabs (6), EyeToggle (5), Fab (5), EmptyState (4), IconBadge (2).
- ConfigContext is stubbed via tests/component/helpers/configStub.ts registered as a vitest setupFile: the live stub lives on globalThis.__finlyConfigStub__ (exporting a vi.hoisted stub fails with "Cannot export hoisted variable"), the vi.mock factory reads it at call time so tests see live state, and each suite calls resetStub() in beforeEach. i18n is NOT stubbed (real t() returns English labels).
- tests/mocks/expo-vector-icons.tsx mocks @expo/vector-icons as a plain Text with IconProps = TextProps & { name: string }, aliased in vitest.config.mts.

[2026-08-06] ~ | FinlyApp/vitest.config.mts, FinlyApp/package.json, FinlyApp/package-lock.json
- vitest.config.mts: added reactNative() plugin (vitest-native), the @expo/vector-icons alias to the icons mock, setupFiles for the configStub, and include now covers *.test.{ts,tsx}.
- package.json: added dev deps vitest-native@^0.9.0, @testing-library/react-native@^14.0.1, test-renderer@1.1, @react-native/babel-preset@^0.81.5 and @babel/core@^7.29.7 (babel presets kept for vitest-native's transform).
- Full suite now 22 files / 217 tests; npm run test:all (typecheck + lint + vitest) green.

[2026-08-06] ~ | FinlyApp/src (screens/AllTransactionsScreen.tsx, navigation/AppNavigator.tsx, i18n/en.ts, i18n/es.ts, i18n/ca.ts, components/CategoryFilterModal.tsx), spec/constitution/3-roadmap.md
- Verification of 015-all-transactions-screen and 021-category-filter-modal (verification-loop skill, Playwright in headless Chrome, 375px viewport). All 40 acceptance criteria PASS; 4 spec deviations found, fixed and re-verified, then both features promoted to completed in the roadmap:
- Fix 015 c2: AllTransactionsScreen header now shows a back arrow (navigates Home) when it can go back, hamburger only on the root screen (new AllTransactionsHeaderLeft in AppNavigator using navigation.canGoBack()).
- Fix 015 c10: the category-filter pill on the screen now shows the spec label "N categories" (new filter_categories_count(n) i18n key, singular/plural) instead of the modal's "Apply (N)" label. CategoryFilterModal still uses "Apply (N)".
- Fix 015 c21: added the shared Fab so AllTransactionsScreen has the floating "+" (Add expense or income) navigating to AddTransaction, matching Home/Accounts/Categories/Tags screens.
- Fix 021 c2: the modal header label changed from "Categories" to "Select categories" / "Seleccionar categorías" / "Seleccionar categories" (filter_categories value updated in en/es/ca).
- Also verified on this pass: dynamic back arrow vs hamburger for both entry paths (stats icon and drawer), combined filters (category + account + tags + period), type tabs, account selector with Total skip-filter, date/amount sort toggle, day-grouped list, empty state, FAB, theme (dark/light) and text-size (14px→16px) scaling, and full Spanish UI switch.

[2026-08-06] ~ | FinlyApp/.gitignore
- Added `*.log` to ignore the Expo web dev-server output file (expo-web.log) created during verification runs.


[2026-08-06] + | FinlyApp/.maestro/ (flow-015-all-transactions.yaml, flow-021-category-filter.yaml), FinlyApp/src/components/ (CategoryFilterModal.tsx, SearchBar.tsx), FinlyApp/src/screens/AddCategoryScreen.tsx, FinlyApp/src/i18n/ (en.ts, es.ts, ca.ts), FinlyApp/tests/component/SearchBar.test.tsx, .agents/skills/verification-loop/SKILL.md, docs/harnesses.md
- Native Maestro flows for 015-all-transactions-screen and 021-category-filter-modal, verified on the emulator (finly_test, dev-client build com.anonymous.FinlyApp): flow-015-all-transactions and flow-021-category-filter both PASS (2026-08-06). flow-015 covers drawer entry, back arrow + title, All/Expenses/Income tabs, the "N categories" pill, Day/Week/Month/Year/Period tabs, empty state, account modal with My Wallet/Total, FAB to AddTransaction (Android hardware back), and the stats-icon entry path. flow-021 covers the full-screen modal (Select categories header + Close X, All chip, category grid with seeded categories), multi-select with the Apply count, Close without applying, and the type='expense' variant (All expense categories, no income categories, All chip -> Apply (All expenses)).
- Fix 021 native Android: the first tap inside the modal's ScrollView was swallowed on a freshly-opened Modal (and the search field's autoFocus keyboard covered the Apply footer, pruning it from the accessibility tree). CategoryFilterModal's ScrollView now sets keyboardShouldPersistTaps="handled" and SearchBar's autoFocus became a prop (default false) -- the modal search no longer auto-focuses; AddCategoryScreen (search is opt-in there) passes autoFocus explicitly. SearchBar.test.tsx updated to assert the prop path.
- 021 c2 on native: the modal close X button now carries accessibilityLabel={labels.common_close} (new common_close key: Close / Cerrar / Tanca).
- .agents/skills/verification-loop/SKILL.md: available Maestro flows list now includes flow-015-all-transactions and flow-021-category-filter.

[2026-08-07] + | FinlyApp/.maestro/ (flow-004-add-transaction.yaml, flow-007-amount-calculator.yaml, flow-016-transaction-details.yaml, flow-017-modify-transaction.yaml), FinlyApp/src/components/ (AmountInput.tsx, CommentInput.tsx, TransactionForm.tsx), FinlyApp/src/i18n/ (en.ts, es.ts, ca.ts), FinlyApp/src/screens/ModifyTransactionScreen.tsx, .agents/skills/verification-loop/SKILL.md, docs/harnesses.md, docs/changelog.md
- Native Maestro flows for the transaction-core features, verified on the emulator (finly_test, dev-client build com.anonymous.FinlyApp): flow-004-add-transaction, flow-007-amount-calculator, flow-016-transaction-details and flow-017-modify-transaction all PASS (2026-08-07).
- flow-004 covers Home "+" -> Add transaction, Expenses/Income tabs, default account My Wallet, amount input (comma separator, 42,50), category grid (Groceries), 3-day selector, inline tag creation, comment with counter, submit -> Home, persisted row in All transactions with the tag chip. flow-007 covers the calculator (123+5=128 -> Accept pastes "128", C clears, Cancel unchanged). flow-016 covers row tap -> details, header (back arrow + title), Amount/Account/Category/Date/Comment rows, Tags chip, "Created:" footer, Edit -> Modify and back, Delete confirmation (No keeps / Yes deletes -> empty list). flow-017 covers Edit from details, amount preload and replacement (42,50 -> 99,99), category switch (Groceries -> Games), comment replacement, Save -> details, list reflects the change.
- App fixes required for native parity:
  - a11y labels a11y_amount / a11y_calculator / a11y_comment added to i18n (en/es/ca) and wired into AmountInput and CommentInput so Maestro can target the fields; initialAmount prop added to TransactionForm and passed by ModifyTransactionScreen so the modify screen preloads the current amount (017 c5).
  - Bug fix (019 auto-select): handleCreateTag created the tag and refreshed the list but never added it to selectedTags, so transactions created with an inline tag were saved WITHOUT the transaction_tags link (details screen showed the "no tags" dash). The created tag is now auto-selected, matching the 019 spec ("create -> refreshTags -> auto-select -> close modal").
- Maestro/Android notes: hideKeyboard is a BACK keyevent, so when no soft keyboard is shown it pops the screen or closes the native modal; flows now use waitForAnimationToEnd after inputText instead. The details screen's native-stack back button is exposed as "Navigate up" (not "Back"); flow-016 asserts that. The amount preload is the formatted numeric value (42,5), so flow-017 asserts "42,5".
- Regression after the fixes: flow-smoke, flow-008-categories, flow-015-all-transactions, flow-021-category-filter and flow-022-total-account all still PASS; npm run test:all (typecheck + lint + 217 tests) green.

[2026-08-07] ~ | FinlyApp/package.json, FinlyApp/package-lock.json, FinlyApp/eslint.config.js, FinlyApp/src/ (constants/types.ts, components/IconGrid.tsx, constants/accountIcons.ts, database/types.ts, context/ConfigContext.tsx, database/configDefaults.ts, database/webStorage.ts, database/repositories/configRepo.ts, constants/languages.ts, utils/language.ts, i18n/index.ts, constants/colors.ts, components/ColorGrid.tsx, hooks/useColorSelection.ts, screens/ModifyAccountScreen.tsx, screens/ModifyCategoryScreen.tsx), docs/harnesses.md, docs/changelog.md
- Module-boundary linting (Phase E): enforced the src/ layering with eslint-plugin-boundaries@^7.1.0 (dev dep) so inverted or cyclic imports are lint errors, guarded by the "done" gate and CI.
- eslint.config.js: added the boundaries plugin (flat config) with a boundaries/elements descriptor per src/ folder (constants, utils, i18n, database, context, hooks, components, screens, navigation; partialMatch false, patterns are the folder path) and a boundaries/dependencies policy set encoding the layer DAG — constants is a leaf (external only); utils -> constants/i18n (+ database type-only); i18n -> constants; database -> constants/utils; context -> + i18n/database; hooks -> + context; components -> + hooks; screens -> + components; navigation -> + screens — with default "disallow", an allow-to-external wildcard and a same-layer allow per element; boundaries/no-unknown-files enabled.
- Refactors breaking the 5 pre-existing cycles/inversions, all via re-exports so no test file changed:
  - IconName type moved from components/IconGrid.tsx to constants/types.ts (IconGrid re-exports it; constants/accountIcons.ts imports from constants, breaking constants -> components).
  - Config interface moved from context/ConfigContext.tsx to database/types.ts (ConfigContext imports + re-exports it; configDefaults.ts, webStorage.ts and repositories/configRepo.ts import it from database, breaking database -> context). ConfigContext also dropped its now-unused Theme-family type imports and the Language import.
  - Language type + LANGUAGES const moved from utils/language.ts to the new constants/languages.ts (utils/language.ts re-exports and keeps isCatalan; i18n/index.ts imports the type from constants, breaking the i18n <-> utils cycle).
  - QUICK_COLORS moved from components/ColorGrid.tsx to the new constants/colors.ts (ColorGrid, hooks/useColorSelection.ts and the ModifyAccount/ModifyCategory screens import from constants, breaking hooks -> components).
  - utils -> database kept only as a type-only import (categoryUtils.ts imports the Category type); the policy allows utils -> database solely for dependency kind "type", so no runtime/value dependency can sneak in.
- Windows note: folder element patterns must be the folder path WITHOUT a trailing wildcard (the plugin expands them to <pattern>/**/*, so "src/components/*" would not match files directly in src/components).
- Enforcement verified: a temporary constants -> components import in src was flagged as a boundaries/dependencies error, then removed.
- npm run test:all (typecheck + lint + 217 tests) green; eslint clean (0 errors, 0 warnings). docs/harnesses.md marks the module-boundary linting row implemented (Phase E) and moves eslint-plugin-boundaries off the deferred line (only Zod/Drizzle schemas remain deferred).

[2026-08-07] + | FinlyApp/package.json, FinlyApp/package-lock.json, FinlyApp/src/database/schemas.ts, FinlyApp/src/database/validate.ts, FinlyApp/src/database/types.ts, FinlyApp/src/database/configDefaults.ts, FinlyApp/src/database/repositories/accountRepo.ts, FinlyApp/src/database/repositories/categoryRepo.ts, FinlyApp/src/database/repositories/tagRepo.ts, FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/src/database/repositories/configRepo.ts, FinlyApp/src/database/webStorage.ts, FinlyApp/tests/database/schemas.test.ts, FinlyApp/tests/database/dbDrift.test.ts, spec/infrastructure/002-database-schemas/, spec/constitution/3-roadmap.md, docs/harnesses.md, docs/changelog.md
- Zod schema layer (Phase F, infra spec 002): installed zod@^4.4.3 as the single source of truth for stored row shapes, with runtime validation at the storage boundary of both backends (SQLite native + localStorage web).
- New src/database/schemas.ts: one Zod schema per table (users, accounts, categories, transactions, tags, transaction_tags) plus configSchema, with enums built from the existing constant sets (constants/types.ts, constants/languages.ts) so the schema cannot drift from the UI options.
- src/database/types.ts is now a facade: hand-written interfaces replaced by z.infer types exported under the same names (User, Account, Category, Transaction, Tag, TransactionTag, Config); no import-site changes were needed anywhere in the app.
- New src/database/validate.ts: parseRow / parseRows / parseRowOrNull, throwing a descriptive "Data validation failed for <table>" error on invalid rows.
- Read-path validation: native repos validate full-row reads (accountRepo.list/getById, categoryRepo.list, tagRepo.list, transactionRepo.list/getById); webStorage.getStore validates every entity read; aggregate/derived queries left unvalidated.
- Config: both configRepo.get and webConfigRepo.get run stored config through configSchema via sanitizeConfig (configDefaults.ts) and fall back to DEFAULT_CONFIG on any invalid value or malformed JSON (web).
- Tests: new tests/database/schemas.test.ts (valid rows, invalid type/amount/id/missing-field cases, config accept + corrupt-value fallback); dbDrift.test.ts gained an exact-match test between Zod schema keys and migration columns for all entity tables.
- Drizzle ORM remains deferred: its expo-sqlite driver cannot cover the localStorage web backend, so adopting it would fork the dual-storage parity Phase B enforces; it stays deferred until web storage moves to a real SQLite-in-browser engine.
- npm run test:all (typecheck + lint + 229 tests, 23 files) green; eslint clean.

[2026-08-08] ~ | FinlyApp/src/database/ (sqliteWeb.ts, database.ts, engine.ts, engine.web.ts, migrations/001_initial.ts, migrations/002_seed.ts, migrations/003_config.ts), FinlyApp/src/screens/settings/DataScreen.tsx, FinlyApp/tests/database/ (sqliteMock.ts, sqliteContract.test.ts, dbDrift.test.ts), docs/ (AGENTS.md, PROMPT.md, harnesses.md), .agents/skills/verification-loop/SKILL.md
- Web storage unification: the localStorage web backend (webStorage.ts) is removed; web now runs the exact same SQLite schema as native through a shared sql.js (WASM) engine (SqlJsDatabase in sqliteWeb.ts) persisted to IndexedDB (storage/indexedDb.ts). One DatabaseHandle interface, same migrations and repositories on both platforms � no more platform-forked repos.
- engine.web.ts opens the engine with the IndexedDB-stored DB bytes; database.ts runs the same createSchema -> seed -> user_version migrations on either handle; repositories are now platform-agnostic.
- DataScreen "delete all data" now always calls resetDatabase() (resets + re-seeds the engine) instead of clearing localStorage, so web and native reset identically.
- Tests: sqliteMock.ts now reuses the shared SqlJsDatabase engine instead of a separate copy of the expo-sqlite API; deleted tests/database/webContract.test.ts (the web runner duplicated the shared engine); new tests/database/sqliteWebEngine.test.ts covers engine results (lastInsertRowId/changes), persist-on-commit + reload restore, one persist per committed transaction, no uncommitted state persisted, and full schema boot with seed counts; dbDrift.test.ts dropped the localStorage parity case (now covered by the engine itself) and now types handles as DatabaseHandle.
- Docs updated: AGENTS.md, PROMPT.md and docs/harnesses.md describe the single sql.js/IndexedDB engine; the verification-loop skill clears IndexedDB instead of localStorage.
- npm run test:all (typecheck + lint + 202 tests, 23 files) green; eslint clean.

[2026-08-08] - | FinlyApp/src/database/webStorage.ts, FinlyApp/tests/database/webContract.test.ts
- Deleted the localStorage web repository module and its dedicated contract test; the unified sql.js engine replaces both (see entry above).

[2026-08-08] ~ | spec/infrastructure/003-web-sqlite-engine/ (1-spec.md, 2-plan.md, 3-tasks.md), spec/constitution/ (3-roadmap.md, 7-platform-differences.md), docs/changelog.md
- Web verification loop (T3 + T17) PASS, run with Playwright against a live Expo web build on 8081:
  - [x] Metro serves sql-wasm-browser.wasm (200 OK at /assets/?unstable_path=.../sql-wasm-browser.wasm); the app fully boots with 0 console errors, so initSqlJs({ locateFile }) loads in a real browser.
  - [x] Fresh IndexedDB seeds the app: Home boots with the Total account, +0,00 EUR, expense/income tabs and seeded categories (My Wallet visible on AddTransaction).
  - [x] CRUD persists across a reload: added a 12,50 EUR Groceries expense, navigated Home, then did a full page reload � Home still shows -12,50 EUR and the Groceries 100% breakdown.
  - [x] "Delete all data" reseeds: Settings > Data > Delete all data > Confirm > typed DELETE > Confirm; after reload Home is back to factory seed (+0,00 EUR, no transactions).
- All 9 acceptance criteria of the 003 spec marked done; T1-T20 all checked in 3-tasks.md; npm run test:all green (typecheck + lint + 202 tests, 23 files).
- Also updated spec/constitution/7-platform-differences.md (storage matrix now SQLite on both platforms with the platform-resolved openEngine; IndexedDB limits section replaces the localStorage one; photo-on-web rationale reworded) and spec/constitution/3-roadmap.md (003-web-sqlite-engine completed).

[2026-08-08] ~ | docs/programming-concepts.md, docs/harnesses.md, spec/constitution/ (2-tech-stack.md, 3-roadmap.md), README.md, README.es.md, README.ca.md (new)
- Docs storage cleanup: live documentation no longer references the retired localStorage/webStorage architecture.
- programming-concepts.md: SQLite section now covers both platforms; new "IndexedDB (web SQLite)" concept section; "localStorage" and "Platform switching (SQLite / localStorage)" sections replaced by "Platform-resolved database engine" (engine.ts / engine.web.ts / openEngine); stale-data example rewritten around database.ts; native-vs-web migrations section replaced by "Versioned migrations across platforms" (single PRAGMA user_version runner).
- harnesses.md: verification loop clears IndexedDB (not localStorage).
- 2-tech-stack.md: database file tree reflects the current structure (engine.ts, engine.web.ts, sqliteWeb.ts, storage/indexedDb.ts; webStorage.ts and userRepo.ts removed); persistence convention now "one SQLite engine on all platforms".
- 3-roadmap.md: removed stale "(native) / localStorage (web)" phrasing from the 001/002/003/018/023 entries and the WAL-cleanup / 002-database-schemas notes; Drizzle rationale refreshed (custom DatabaseHandle needs a custom adapter).
- README.md / README.es.md: Persistence row updated (sql.js WASM + IndexedDB on web); language links now plain text ([Español] · [Català] / [English] · [Català]).
- New README.ca.md: full Catalan translation of the English README, linking [English] and [Español].
- Historical entries in spec/features/* and completed infrastructure specs were intentionally left untouched.

[2026-08-08] ~ | spec/features/024-photo-on-web/ (1-spec.md, 2-plan.md, 3-tasks.md), FinlyApp/src/hooks/usePhotos.ts, FinlyApp/src/utils/photoUtils.ts, FinlyApp/src/components/ (PhotoSection.tsx, TransactionForm.tsx), FinlyApp/src/screens/ (TransactionDetailsScreen.tsx, settings/PersonalizationScreen.tsx), FinlyApp/tests/utils/photoUtils.test.ts (new), FinlyApp/tests/component/PhotoSection.test.tsx (new), spec/constitution/ (3-roadmap.md, 7-platform-differences.md), AGENTS.md, docs/harnesses.md, docs/changelog.md
- 024-photo-on-web: photo attachment extended to web (previously 023 was iOS/Android-only, photos always null on web).
- Web persistence: picked images are read as base64 data URIs (FileReader over the picker's web `File`) and stored in the existing `transactions.photo` JSON array; the sql.js/IndexedDB engine persists the column, so photos survive full page reloads. No new dependencies; native file-URI storage is unchanged.
- Guards: removed the three 023 `isNative` gates (PhotoSection render in TransactionForm, details photo row, Settings "Show photo" checkbox — now available on all platforms). Camera stays native-only: PhotoSection hides "Take photo" on web (gallery only).
- Cleanup: `deletePhotoFile` no-ops on `data:` URIs (web photos live in the DB row); bulk delete paths need no web branch.
- Tests: photoUtils.test.ts (data-URI parse round-trips; deletePhotoFile no-op on data:, deletes on file:) and PhotoSection.test.tsx (camera hidden on web, gallery shown; remove-confirm flow).
- Docs: 7-platform-differences.md photo matrix/decision updated for 024; harnesses.md + AGENTS.md clarify web gallery picking is checkable while camera capture stays native-only.

[2026-08-08] ~ | FinlyApp/src/components/PhotoSection.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx, docs/changelog.md
- Fixed duplicate React key warning when the same data URI is attached twice (e.g. re-picking the same file): photo list keys changed from the raw URI to `${uri}-${index}` in both the Add/Modify PhotoSection thumbnails and the Details photo grid. Without this, duplicate keys caused a ghost duplicated thumbnail in the form.
- 024 web verification loop (T14) PASS with Playwright at 375px against a live Expo web build on 8081, all 14 acceptance criteria checked:
  - [x] PhotoSection visible on web when config.addShowPhoto is true; "Show photo" checkbox visible in PersonalizationScreen (toggle hides/shows the section on AddTransaction and the setting persists in the config table).
  - [x] "Add from gallery" opens the native file picker and the picked file renders as a base64 data-URI thumbnail (`data:image/png;base64,...` confirmed in the DOM).
  - [x] Photos persist across a full page reload (Details re-renders the data-URI thumbnails from the sql.js/IndexedDB row).
  - [x] Up to 3 photos per transaction: at MAX_PHOTOS the "+" button is no longer rendered; no console errors, no ghost thumbnails.
  - [x] "Take photo" (camera) option not shown on web — the source modal offers only "Add from gallery" and "Cancel".
  - [x] Photo removal (× + confirmation modal) works on web and the removal persists after save.
  - [x] TransactionDetailsScreen shows tappable thumbnails on web and the full-screen viewer Modal (black background, contain, close button) opens and closes cleanly.
  - [x] ModifyTransactionScreen preloads web photos and allows adding/removing in one session.
  - [x] Deleting a transaction with photos deletes the row cleanly (photo gone, balance resets, survives reload).
  - [x] deletePhotoFile no-op on data: URIs and parsePhotos data-URI round-trips are covered by unit tests (photoUtils.test.ts); multiline/es/ca texts and theme/text-size respected via the existing 023 i18n labels.
  - [x] npm run test:all green after the key fixes (typecheck + lint + 213 tests, 25 files).
- Camera capture stays "not checkable on web"; native-only criteria (camera) are out of the web loop by design.

[2026-08-08] + | FinlyApp/src/database/ (backup.ts, backupService.ts), FinlyApp/src/utils/ (backupIO.ts, backupIO.web.ts), FinlyApp/src/screens/settings/DataScreen.tsx, FinlyApp/src/i18n/ (en.ts, es.ts, ca.ts), FinlyApp/tests/database/backup.test.ts, FinlyApp/package.json, spec/features/025-data-backup/, spec/constitution/ (3-roadmap.md, 7-platform-differences.md), docs/harnesses.md
- Feature 025 Data Export/Import (backup): export the whole database (users, accounts, categories, transactions incl. photos, tags, tag links, config) as a versioned JSON snapshot and restore it on any platform.
- src/database/backup.ts: pure DB layer (buildBackup / parseBackup / applyBackup) over the shared DatabaseHandle � snapshot schema with formatVersion 1 + schema guard, import reuses the row Zod schemas, transactional apply (FK-safe delete order, dependency-order inserts, full rollback on any violation).
- src/database/backupService.ts: exportBackup() / importBackup() facades (newer-version guard); re-exported from src/database/index.ts (split out so tests never pull the repository layer's expo-file-system import).
- src/utils/backupIO.ts (native) + backupIO.web.ts (web): native writes to documentDirectory via expo-file-system and shares via expo-sharing, imports via expo-document-picker; web downloads via Blob + <a download> and imports via a programmatic <input type="file"> + FileReader. Added expo-sharing + expo-document-picker (SDK 54) deps.
- DataScreen: "Export data" / "Import data" SettingsRows above the delete rows; import gated by a ConfirmationModal, then resetAll() + updateConfig(configRepository.get()).
- Tests (backup.test.ts, 11 tests): snapshot collections match schema tables, serialize/parse round-trip, empty-DB export, full round-trip restoring photos (data URIs) + tag links, invalid JSON/format/rows rejection, FK-violation rollback leaving data unchanged, facade round-trip and newer-version guard.
- test:all green (typecheck + lint + 224 tests, 26 files).

[2026-08-09] ~ | FinlyApp/src/screens/settings/DataScreen.tsx, FinlyApp/src/screens/settings/PersonalizationScreen.tsx, FinlyApp/src/database/configDefaults.ts, FinlyApp/src/database/backup.ts, FinlyApp/tests/database/backup.test.ts, FinlyApp/tests/database/configDefaults.test.ts
- Fix: default-account config (Personalization) kept pointing at a deleted account after "Delete all data" (showed "[Nothing selected]").
- configDefaults.ts: new pure helper sanitizeDefaultAccounts(config, accounts) that nulls homeDefaultAccountId/addDefaultAccountId when the id is missing or references the total account.
- backup.ts applyBackup: transactional self-heal UPDATE that nulls home_default_account_id/add_default_account_id when the backup's config references an account not present in the snapshot (is_total = 0).
- PersonalizationScreen: selected value falls back to 'total'/'null' when the configured id no longer matches an option, so the UI never shows a dangling selection.
- Tests: backup.test.ts (config keys referencing missing/total accounts nulled; valid id preserved) + new configDefaults.test.ts for sanitizeDefaultAccounts.
- test:all green (typecheck + lint + 231 tests, 27 files).

[2026-08-09] ~ | FinlyApp/src/database/database.ts, FinlyApp/src/database/configDefaults.ts, FinlyApp/src/database/backup.ts, FinlyApp/src/screens/settings/DataScreen.tsx, FinlyApp/src/components/settings/SettingsRow.tsx, FinlyApp/src/i18n/ (en.ts, es.ts, ca.ts), FinlyApp/tests/database/resetDatabase.test.ts (new), spec/features/003-settings-screen/ (1-spec.md, 2-plan.md, 3-tasks.md), spec/infrastructure/003-web-sqlite-engine/1-spec.md, spec/constitution/3-roadmap.md
- "Delete all data" now keeps settings: new clearDataKeepSettings() in database.ts wipes transactions/accounts/categories/tags, re-seeds seed data, and preserves the config table, nulling only home_default_account_id/add_default_account_id when the referenced account no longer exists (sanitizeDefaultAccountConfig, shared with backup.ts applyBackup). Settings (language, theme, currency, defaults) are kept; defaults pointing at surviving seed accounts (e.g. "My Wallet") are preserved.
- New "Reset to factory state" destructive row (refresh-outline, red) with the same two-step type-DELETE confirmation: calls resetDatabase() (existing factory reset) which wipes data and re-seeds config to defaults (language English, dark theme, etc.).
- DataScreen reloads config after both flows (updateConfig(await configRepository.get())); deleted redundant per-repo deleteAll calls.
- SettingsRow: added optional description prop (label + description column layout, secondary color); the three destructive rows show a short multilingual description of what each option deletes/keeps.
- i18n: settings_delete_data_confirm_message reworded (settings kept); new settings_factory_reset, settings_factory_reset_confirm_title, settings_factory_reset_confirm_message, and *__description keys in en/es/ca.
- Tests: new resetDatabase.test.ts (3 tests) — factory reset restores config defaults + seed data; clearDataKeepSettings preserves language and sanitizes only dangling account defaults; defaults referencing surviving accounts kept.
- Specs updated: 003 1-spec §6.2 (delete-all keeps settings) + new §6.3 (factory reset) + Data AC; 2-plan split sections + i18n table; 3-tasks T29/T31/T31b/T32/T33/T34; web-sqlite-engine note; roadmap Data row.
- test:all green (typecheck + lint + 234 tests, 28 files).

[2026-08-10] ~ | FinlyApp/src/components/AmountInput.tsx, FinlyApp/src/components/AccountForm.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/i18n/ (en.ts, es.ts, ca.ts), spec/features/026-account-initial-balance/ (1-spec.md, 2-plan.md, 3-tasks.md, new), spec/constitution/3-roadmap.md
- New optional "Initial balance" field on Create and Modify account screens (feature 026).
- AmountInput: added optional label and accessibilityLabel props (label renders above the amount row; a11y defaults to a11y_amount).
- AccountForm: added showInitialBalance/initialBalanceLabel/initialBalanceA11yLabel/initialBalanceRaw/onInitialBalanceChange props; renders a labeled AmountInput (no calculator) between the icon/color section and the Note field.
- CreateAccountScreen: initialBalanceRaw state; stores initial_balance: parseAmountValue(raw) ?? 0; non-empty invalid value disables Create.
- ModifyAccountScreen: initialBalanceRaw preloaded from the account; saves initial_balance for non-total accounts; field hidden on the Total account (showInitialBalance={!isTotal}); non-empty invalid value disables Save.
- No schema/migration changes: the initial_balance column already existed and was already included in getBalances() and the Total balance, so balances update automatically.
- i18n keys create_account_initial_balance, modify_account_initial_balance, a11y_initial_balance (en/es/ca); add_amount_error reused for invalid input.
- Specs: new 026-account-initial-balance feature folder + roadmap entry.

[2026-08-10] ~ | FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/src/constants/types.ts, FinlyApp/src/components/ (TransactionForm.tsx, CommentInput.tsx), FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/i18n/ (en.ts, es.ts, ca.ts), FinlyApp/src/screens/ (CommentsScreen.tsx, ModifyCommentScreen.tsx, new), FinlyApp/tests/database/ (contractSuite.ts, contractTypes.ts), FinlyApp/tests/component/CommentInput.test.tsx (new), spec/features/027-comments-management/ (1-spec.md, 2-plan.md, 3-tasks.md, new), spec/constitution/3-roadmap.md, docs/changelog.md
- Feature 027 Comments management: bulk edit/delete of the comment text across all transactions that share it.
- transactionRepo: new getDistinctComments() (GROUP BY TRIM(description) with usage counts, NOCASE order), updateComment(old, new) (bulk UPDATE matched by TRIM(description), returns changed rows), deleteComment(comment) (sets description = NULL, returns changed rows), countByDescription(comment); searchComments reworked to DISTINCT trimmed values, prefix-first ranking (CASE WHEN prefix THEN 0 ELSE 1), NOCASE sort, LIMIT MAX_SUGGESTIONS.
- Normalization: TransactionForm saves description: comment.trim() || null (whitespace-only stored as none); editing food -> Food merges the two variants into one group (contract regression test).
- CommentInput: autocomplete only triggers when comment.trim().length >= MIN_COMMENT_SUGGESTION_LENGTH (2); queries with the trimmed term.
- New CommentsScreen (Drawer item after Tags, chatbubble-outline): distinct comment list with "Used in N transactions" counts, header search toggle with client-side substring filter, EmptyState, reload on focus.
- New ModifyCommentScreen ({ comment }): preloaded multiline input with 0/4096 counter, Save disabled when empty/unchanged, Delete via ConfirmationModal showing the exact usage count (countByDescription).
- i18n keys nav_comments + comments_empty/search_placeholder/used_in/modify_title/save/delete/delete_confirm_*/error_empty/merge_hint (en/es/ca).
- Tests: 6 new Phase B contract tests (searchComments trim/dedupe, getDistinctComments grouping, countByDescription, updateComment rename, merge regression, deleteComment) + 7 CommentInput component tests; test:all green (typecheck + lint + 247 tests, 29 files).
- Specs: new 027-comments-management feature folder + roadmap entry.

[2026-08-10] ~ | FinlyApp/src/screens/ModifyTransactionScreen.tsx
- Fix: ModifyTransactionScreen was reading the transaction from the stale AppContext `transactions` cache (filtered by active account/period), so after deleting or editing a comment from the Comments/ModifyComment screens, the Edit screen still showed the old comment. Now fetches the transaction directly from the DB via `useFocusLoad` + `transactionRepository.getById(transactionId)`, mirroring TransactionDetailsScreen. This ensures the form always preloads the latest comment value.

[2026-08-10] ~ | FinlyApp/src/components/CommentInput.tsx, FinlyApp/tests/component/CommentInput.test.tsx
- Fix: CommentInput's autocomplete search was firing on mount whenever a pre-filled comment exceeded the minimum length (e.g. opening ModifyTransaction with comment "Casa" immediately showed suggestion coincidences without any user interaction). Now gates the search on input focus: a `focused` state guards the search `useEffect` (`if (!focused) return`), and the TextInput's `onFocus`/`onBlur` toggle it. The parent's `onFocus` callback (used by TransactionForm for scroll-to-end) is still invoked alongside `setFocused(true)`. This means suggestions only appear after the user taps the comment input, matching the expected UX.
- Tests: updated 4 existing CommentInput tests to focus the input before expecting a search; added a regression test "does not search on mount with a pre-filled comment before focus". Test count: 248 (29 files).

[2026-08-11] ~ | FinlyApp/src/components/CommentInput.tsx, FinlyApp/tests/component/CommentInput.test.tsx
- Fix: clicking an autocomplete suggestion did nothing on web. On react-native-web, onPress/onPressIn fire only after a full press (release / 50ms active delay), but the input's blur on mousedown cleared the suggestions and unmounted the row before those handlers could fire. Replaced the suggestion row's Pressable with a View using the responder system: onStartShouldSetResponder claims the press immediately, onResponderGrant suppresses the blur-triggered clear, and onResponderRelease selects the suggestion. Press semantics are preserved (selection on release), the row keeps cursor: pointer, and native behavior is unchanged.
- Tests: updated the two selection tests to fire esponderGrant/esponderRelease instead of pressIn/pressOut/press, keeping the web blur-regression test. Test count: 249 (29 files).

[2026-08-11] ~ | FinlyApp/src/components/CommentInput.tsx
- Fix: with 5 suggestions, the last row of the autocomplete panel was cropped at its bottom. The panel had maxHeight: 180, but each suggestion row is ~38px (padding + scaled font line-height + bottom border), so 5 rows (~189px) exceeded the cap and RNW clipped the overflow without scroll. Removed maxHeight from suggestionsPanel so the panel auto-sizes to its content (safe: the list is capped at MAX_SUGGESTIONS = 5), giving every row full height at all text sizes. Also added suggestionItemLast: the last row drops its bottom border and gets 8px bottom radius to match the panel's rounded corners.

[2026-08-11] ~ | FinlyApp/src/screens/AddCategoryScreen.tsx
- Change: replaced the undocumented FAB on the Add category screen with the standard '+' 'Create' dashed tile in the last grid position, aligning it with the Categories screen and the TransactionForm when there are 7 or fewer categories. The tile was already wired (CategoryGrid onAddMore navigates to CreateCategory) but hidden (showAddMore={false}); now showAddMore + addMoreLabel=add_cat_create render it. Removed the Fab import/usage and reduced the bottom scroll padding (was 80px FAB clearance). This also fulfils the acceptance criteria of spec 005 S5 and 006 that the 'Create' button lives in the last grid position.

[2026-08-11] ~ | FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added the header search toggle to the Tags and Categories management screens, matching the Comments and Add-category screens. Both screens now show a SearchBar when the search icon in the header is pressed and filter client-side as you type: TagsScreen matches the tag name (tags are user-created, never translated); CategoriesScreen matches the current-language display name of each category via getDisplayCategoryName (multi-term, all terms must match) within the active expense/income tab, so default categories are searchable in the selected language only. Reuses the SearchBar component and existing keys add_cat_search / add_cat_no_results / filter_no_results; new i18n key tags_search added in en/es/ca. No schema or data changes.

[2026-08-11] ~ | spec/features/008-categories-screen/1-spec.md, spec/features/018-tag-management/1-spec.md, spec/constitution/3-roadmap.md
- Docs: updated the specs of the Categories (008) and Tags (018) management screens to document the new header search feature (search toggle in the header, SearchBar with placeholders dd_cat_search / new 	ags_search, client-side case-insensitive filtering, restore on close, and 'No results found' empty state). 008 documents that categories are matched by their current-language display name via getDisplayCategoryName within the active type tab (default categories searchable in the active language only, multi-term). Added [x] acceptance criteria for the implemented feature in both specs, and synced the roadmap (3-roadmap.md) bullets for 008 and 018.


[2026-08-11] ~ | FinlyApp/src/utils/transactionSearch.ts, FinlyApp/tests/utils/transactionSearch.test.ts, FinlyApp/src/hooks/useTransactionFilters.ts, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added free-text search to the All Transactions screen (spec 015). The header now has a search icon toggle that reveals a SearchBar below the type tabs, matching the Tags/Categories pattern. New pure helper matchesTransactionSearch() in src/utils/transactionSearch.ts defines the exact match rule: case-insensitive substring, multi-term AND (space-split). A term matches a transaction if it appears in its comment/description, its category display name (current language, via getDisplayCategoryName), its tag names, or its account name. useTransactionFilters now accepts optional categories + searchTerm and applies the text filter to the already-filtered set (composing with account/type/category/period/tag filters and sort). Closing the search bar clears and restores the list; an active search with no matches shows 'No results found'. New i18n key transactions_search added in en/es/ca. Home screen unaffected (searchTerm defaults to empty). No schema or data changes.
- Tests: 8 new matchesTransactionSearch tests (empty query, description/category/tag/account matching, case-insensitivity, multi-term AND, substring, null description). test:all green (typecheck + lint + 257 tests, 30 files).
- Docs: updated spec 015 (new 'Transaction search' section, layout, acceptance criteria) + roadmap bullet.


[2026-08-12] ~ | FinlyApp/src/utils/accountSearch.ts, FinlyApp/tests/utils/accountSearch.test.ts, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added free-text search to the Accounts screen (spec 011). The header now has a search icon toggle that reveals a SearchBar below the total balance section, matching the Tags/Categories/All Transactions pattern. New pure helper matchesAccountSearch() in src/utils/accountSearch.ts defines the exact match rule: case-insensitive substring, multi-term AND (space-split). A term matches an account if it appears in its display name (current language, via getDisplayAccountName � defaults like 'My Wallet' are translated) or its description/note (getDisplayAccountDescription). The Total account row stays always visible at the top; search filters only the real accounts below it. Closing the search bar restores the full list; an active search with no matches shows 'No results found'. New i18n key accounts_search added in en/es/ca. No schema or data changes.
- Tests: 8 new matchesAccountSearch tests (empty query, display-name matching, custom renamed account, description, name+description combined, multi-term AND, no match, substring). test:all green (typecheck + lint + 265 tests, 31 files).
- Docs: updated spec 011 (new 'Search' section, acceptance criteria) + roadmap bullet.

[2026-08-12] ~ | FinlyApp/src/constants/types.ts, FinlyApp/src/utils/limits.ts, FinlyApp/tests/utils/limits.test.ts, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/CreateTagScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added creation limits for categories and tags, enforced at the UI layer only. New constants MAX_CATEGORIES_PER_TYPE (30) and MAX_TAGS (50) in src/constants/types.ts, plus a pure helper countAtLimit() in src/utils/limits.ts. CreateCategoryScreen now counts the existing categories of the selected type (from AppContext categories, reactive to the type radio) and disables the Add button + shows 'Maximum of 30 categories per type reached' when the cap is hit; CreateTagScreen does the same for tags (50) using AppContext tags. Default seed ships 21 expense / 10 income categories, so a fresh install can add up to 9 more expense categories. New i18n keys create_cat_error_limit and create_tag_error_limit in en/es/ca. No schema, migration or repository changes.
- Tests: 3 new countAtLimit tests (below/at/above the cap). test:all green (typecheck + lint + 268 tests, 32 files).
- Docs: updated spec 006 (new section 'Limit of categories per type' + acceptance criteria) and spec 018 (tag limit) + roadmap bullets.

[2026-08-12] ~ | FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/components/TagSection.tsx
- Change: tag creation entry points are hidden once the 50-tag maximum (MAX_TAGS) is reached. On the Tags screen, the '+' FAB is replaced by the message 'Maximum of 50 tags reached' rendered centered in the same bottom slot, so the user understands why the '+' is gone. In the transaction form, the '+ Add tag' chip is removed at the cap (the existing 50 tags remain selectable and searchable; the inline create modal can no longer be opened). The CreateTag screen guard is kept as a safety net. No schema, migration, repository or i18n changes.
- Docs: updated spec 018 (FAB hidden at cap + message) and spec 019 ('+ Add tag' chip hidden at cap) + roadmap bullet.

[2026-08-12] ~ | FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/AddCategoryScreen.tsx
- Change: category creation entry points are hidden once the 30-per-type maximum (MAX_CATEGORIES_PER_TYPE) is reached, mirroring the Tags pattern. On the Categories page (spec 008), the 'Create' tile is removed from the grid of the active tab and replaced by the message 'Maximum of 30 categories per type reached' rendered centered below the grid; since the limit is computed per active tab, switching to the other type (expense/income) restores the tile if that type is below the cap. The Add Category screen inside the transaction form (spec 005) applies the same hide+message for its fixed type. The CreateCategory screen guard is kept as a safety net. No schema, migration, repository or i18n changes (reuses create_cat_error_limit).
- Docs: updated spec 008 (Create tile hidden at cap), spec 005 (Create tile hidden at cap) and spec 006 (note about hidden entry points) + roadmap bullet.

[2026-08-13] ~ | FinlyApp/src/components/ConfirmationModal.tsx, FinlyApp/src/components/ColorPickerModal.tsx
- Change: modal buttons now display their labels neatly when they wrap to multiple lines. The ConfirmationModal and ColorPickerModal button styles only set fontWeight on the text, so long labels (e.g. Spanish 'Eliminar permanentemente' in the delete-category confirmation modal) wrapped with left-aligned lines, and the row stretching made the shorter button's text sit at the top instead of the middle. Added textAlign: 'center' to both buttonText styles (each wrapped line is centered horizontally) and justifyContent: 'center' to both button styles (labels stay vertically centered even when the row stretches buttons to equal height). No logic, schema or i18n changes.

[2026-08-13] ~ | FinlyApp/src/components/TagFilterBar.tsx
- Change: on web the tag filter bar (Home, Transactions, AllTransactions screens) now shows a visible horizontal scrollbar when the chips overflow, so every tag chip is reachable. The root cause was `showsHorizontalScrollIndicator={false}`, which React Native Web maps to `scrollbar-width: none` on the scroll container: the bar still scrolled (touch/trackpad) but desktop users had no scrollbar and no drag-to-scroll, so chips past the viewport were clipped and unreachable. The indicator is now suppressed only on native (`showsHorizontalScrollIndicator={isWeb}`), and a web-only bottom padding (`paddingBottom: 16`) keeps the scrollbar clear of the chip text. No logic, schema or i18n changes.
- Docs: updated spec 020 (web scrollbar layout note + acceptance criterion) + roadmap bullet.

[2026-08-13] ~ | FinlyApp/src/database/repositories/tagRepo.ts, FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/tests/database/contractTypes.ts, FinlyApp/tests/database/contractSuite.ts, FinlyApp/src/components/SelectionActionBar.tsx, FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added multi-select bulk delete to the Tags and Comments management screens. Both headers now show a 'Select' text button (toggle to 'Done') next to the search icon that enters selection mode: each row shows a leading checkbox (`checkbox-outline`/`checkbox`) and tapping a row toggles its selection instead of navigating, while header search keeps filtering the selectable list. A new shared SelectionActionBar bottom bar (Cancel + `Delete (N)`, disabled when nothing is selected) replaces the '+' FAB on Tags during selection and appears on Comments. Deleting opens one ConfirmationModal for the whole batch ('Delete N tags?' / 'Delete N comments?'); on confirm, new repo methods run the whole batch in a single query — `tagRepo.deleteMany(ids)` (DELETE FROM tags WHERE id IN (...), junction rows cascade via ON DELETE CASCADE) and `transactionRepo.deleteComments(values)` (UPDATE transactions SET description = NULL WHERE TRIM(description) IN (...)) — then the selection resets and the list reloads (refreshTags() on Tags, getDistinctComments() in place on Comments). No schema or migration changes.
- Tests: 2 new Phase B contract tests (tags deleteMany removes tags + their transaction links; deleteComments clears several comments at once and reports the total) running against the native SQLite backend via the shared contract suite. test:all green (typecheck + lint + 269 tests, 32 files).
- Docs: updated spec 018 (multi-select bulk delete section + repo method + acceptance criteria) and spec 027 (new section 5 'Multi-select bulk delete' + acceptance criteria) + roadmap bullet.

[2026-08-13] ~ | FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added usage counters against the limits on the Tags and Categories pages. The Tags screen shows a caption above the list with the current tag count out of the 50-tag maximum (`tags_counter`, e.g. '12 of 50 tags'), hidden during selection mode so it never competes with the action bar; the '+' FAB and at-limit message behavior is unchanged. The Categories screen shows a caption below the Expense/Income tabs with the active type's count out of the 30-per-type maximum (`categories_counter`, e.g. '21 of 30 categories'), recomputed on every tab switch; the 'Create' tile hide/limit-message behavior is unchanged. New parameterized i18n keys `tags_counter` and `categories_counter` in en/es/ca. No schema, migration, repository or test changes.
- Docs: updated spec 018 (counter requirement + acceptance criterion) and spec 008 (counter requirement + acceptance criterion) + roadmap entry 034-limit-indicators.

[2026-08-14] ~ | FinlyApp/src/hooks/useNameDuplicateCheck.ts
- Change: the submit button (Create/Save) on the name-based form screens (Create/Modify Tag, Create/Modify Category, Create/Modify Account) no longer blinks while typing a name. The duplicate-name check is debounced (300 ms, DEBOUNCE_MS), but the 'checking' flag only turned on once the debounced check actually ran, so right after a keystroke the button briefly rendered enabled (no error yet, not checking), then flipped to disabled while the check queried the DB, then enabled again once it passed - a visible flicker on mobile. The scheduled check now flips the flag synchronously, so the button stays disabled for the whole validation window (debounce + query) and transitions to primary exactly once when a unique name passes. No schema, i18n, repository or test changes; all screens already derive their disabled state from the same flag.

[2026-08-14] ~ | AGENTS.md, PROMPT.md, docs/harnesses.md, docs/git-commands.md, .agents/skills/verification-loop/SKILL.md
- Change: documentation update codifying the agent process conventions. AGENTS.md gained an ENVIRONMENT section (host is Windows/PowerShell 5.1, no ripgrep in the shell - use the grep/glob/read tools, Playwright MCP at http://localhost:8081, dev-server lifecycle) and a spec-docs convention bullet (a code change updates only spec/features/<NNN>/1-spec.md + spec/constitution/3-roadmap.md and flips acceptance criteria [ ] -> [x]; never edit 2-plan.md or 3-tasks.md for feature updates); its GIT WORKFLOW now states the agent never creates or switches branches and that an explicit 'do not create a branch' instruction wins. PROMPT.md renumbered the session steps to cover branch-name-only requests, the spec-docs convention, browser/server cleanup, and the no-ripgrep Windows shell. docs/harnesses.md records the current suite baseline (32 test files / 269 tests, 2026-08-14) as a regression signal and adds a Windows/PowerShell notes block with the exact dev-server start/stop commands and PID-file cleanup. docs/git-commands.md handles 'give me the branch name' alone and the one-off 'do not create a branch' override. The verification-loop skill documents the Windows (PowerShell) start/stop commands. No code, schema, i18n or test changes.

[2026-08-14] ~ | FinlyApp/src/database/drizzle/{schema,proxy,engine}.ts, FinlyApp/src/database/repositories/{accountRepo,categoryRepo,tagRepo,transactionRepo,configRepo}.ts, FinlyApp/src/database/helpers.ts, FinlyApp/tests/database/{drizzleProxy,drizzleDrift,helpers}.test.ts, FinlyApp/package.json
- Change: adopted Drizzle ORM as the query layer of the data access layer. Repositories stop composing raw SQL strings and use the Drizzle query builder against a new `src/database/drizzle/schema.ts` (7 tables mirroring migration 001, including the `transaction_tags` composite primary key). A `sqlite-proxy` adapter (`proxy.ts`) maps the Drizzle remote callback onto the shared `DatabaseHandle`: `run` -> `runAsync` (returning `{ rows: [{ lastInsertRowId, changes }] }`, surfaced by `runResultOf`), `get` -> `getFirstAsync` (`{ rows: null }` when absent), `all`/`values` -> `getAllAsync` as positional arrays (Drizzle maps rows by column index). `engine.ts` exposes a lazy `getDrizzle()` singleton and `withTransaction(task)` wrapping `withTransactionAsync`; Drizzle's own `db.transaction()` is deliberately unused so web keeps its persist-on-commit IndexedDB batching. All writes use `.run()` (never `.returning()`, which executes via `getAllAsync` and would skip web persistence); creates read `lastInsertRowId` from the run result. Collations/functions the builder cannot express (COLLATE NOCASE ordering, LOWER() name checks, TRIM()/LIKE comment queries, COALESCE(SUM(CASE ...)) balances, NOT EXISTS untagged filters) stay as parameterized `sql` fragments. Multi-statement ops (deleteAllTransactions, category delete/reassign, createWithTags/updateWithTags) keep transaction semantics. Backup/import tooling, migrations (`PRAGMA user_version`), Zod validation and `photoCleanup` remain on the raw handle. `buildUpdateQuery`/`buildNameExistsQuery` helpers and their test cases are deleted (`UNTAGGED_ID`/`isTotalAccount` kept). Public exports of `src/database/index.ts` unchanged; no screen/context edits.
- Tests: 2 new Phase B files — `drizzleProxy.test.ts` (adapter run/get/all/values semantics, positional rows, `{ rows: null }`, error propagation) and `drizzleDrift.test.ts` (drizzle columns equal `PRAGMA table_info` after migration, NOT NULL skipped for PK columns). `helpers.test.ts` trimmed. Contract suite passes unchanged. test:all green (typecheck + lint + 271 tests, 34 files).
- Docs: new spec `infrastructure/004-drizzle-orm` (spec/plan/tasks all [x]), roadmap entry 004-drizzle-orm (Status: completed), `docs/programming-concepts.md` Drizzle entries, AGENTS.md ## DATABASE updated (repos written with Drizzle `sqlite-proxy` over `DatabaseHandle`; no drizzle-kit).

[2026-08-14] ~ | FinlyApp/src/context/AppContext.tsx
- Change: fixed Home showing stale chart/category data after an account was created or deleted while viewing the Total account. `refreshAccounts()` bumped `transactionsVersion` (recomputing top-bar totals and balances) but never reloaded the `transactions` state, so the chart (`activeCategories`) and category/tag breakdown kept the removed account's transactions. Added `transactionsVersion` to the dependency array of the transactions-loading effect so any account change also reloads the transaction list; all derived data (totals, balances, transactions) now reacts uniformly to the version counter. Verified in browser: create account -> add transaction -> Total view shows it -> delete account -> Total chart and category list reset correctly. test:all green (typecheck + lint + 271 tests, 34 files).

[2026-08-14] ~ | FinlyApp/src/components/form/LabeledTextField.tsx
- Change: fixed input hint (placeholder) text being too dark to read in dark mode. The shared `LabeledTextField` did not set `placeholderTextColor`, so every screen using it (Create/Modify account name, Create category name, Create/Modify tag name, Modify comment) fell back to the platform default placeholder color, which is nearly invisible on the dark background. Added `placeholderTextColor={c.textSecondary}` (dark theme `#94A3B8`), the same color already used by `CommentInput`, `AmountInput`, `SearchBar`, `TagSection`, `ModifyCategoryScreen`, and `DataScreen`. Audited all `TextInput` usages with `placeholder`; only `LabeledTextField` was missing the prop. Verified in browser (375px, dark theme): Account name, Comment, Amount "0", Category name, and Tag name placeholders all render `rgb(148, 163, 184)`. test:all green (typecheck + lint + 271 tests, 34 files).

[2026-08-14] ~ | FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx
- Change: hidden the Select and Search header actions on the Tags and Comments screens when their lists are empty. Both screens rendered these actions unconditionally, so a brand-new user with no tags/comments saw useless Select + Search buttons. `TagsScreen` now gates `headerRight` on `tags.length > 0` (tag list comes from context) and `CommentsScreen` on `comments.length > 0` (loaded on focus), adding `tags.length`/`comments.length` to the `useLayoutEffect` dependency arrays so the header reacts when the list appears or disappears. Empty search results still keep the buttons, since they only hide when the underlying list has zero items. Accounts and Categories screens were left unchanged (Total account is always present; categories are seeded). Verified in browser: empty Tags/Comments show no header actions; adding one tag or one comment (via a transaction) makes them appear; 0 console errors. test:all green (typecheck + lint + 271 tests, 34 files).

[2026-08-14] ~ | FinlyApp/src/components/DonutChart.tsx, FinlyApp/src/utils/formatters.ts, FinlyApp/tests/utils/formatters.test.ts
- Change: kept the total centered in the donut chart fully visible inside the hole. The center text was an absolutely-positioned, width-unconstrained `Text` (18px bold), so large formatted amounts (e.g. `1.234.567,89 €`) overflowed the hole, which is only `(60 − 15/2) × 2 = 105px` wide. Now: (1) the center container is constrained to the hole's inner diameter; (2) the font size auto-shrinks via the new pure util `fitFontSize(text, baseSize, maxWidth, { factor = 0.6, safety = 0.95, minSize = 10 })` in `src/utils/formatters.ts` — short strings keep the base size, long ones shrink proportionally, never below the minimum and never truncated; (3) the donut proportions were widened for more room (radius 60 → 66, strokeWidth 15 → 13; hole 105 → 119px, outer ring still inside the 160px viewBox). The calculation is deterministic JS so it behaves identically on iOS/Android/web; RN's `adjustsFontSizeToFit` was rejected because react-native-web does not implement it, and `onTextLayout` is unsupported on web as well. Tests: 5 new `fitFontSize` unit tests. Verified in browser (375px): with transactions summing to `1.234.567,89 €`, the center total text's bounding box stays inside the 119px hole. test:all green (typecheck + lint + 276 tests, 34 files).

[2026-08-15] ~ | FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/components/CategoryGrid.tsx, FinlyApp/src/components/CategoryTransferModal.tsx, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/database/repositories/categoryRepo.ts, FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/tests/database/contractTypes.ts, FinlyApp/tests/database/contractSuite.ts, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Change: added multi-select bulk delete to the Categories screen. The header now shows a 'Select' text button (toggle to 'Done') next to the search icon, only when the active type has at least one category, that enters selection mode: each grid tile shows a checkmark and tapping toggles its selection instead of navigating to Modify category, while the 'Create' tile, the limit message and the counter are hidden and the header search keeps filtering. Selection is scoped to the active type (switching the Expense/Income tabs exits selection mode and clears it). A shared SelectionActionBar bottom bar (Cancel + `Delete (N)`, disabled when nothing is selected) drives the flow. Deleting enforces at least one category per type: selecting every category of the active type blocks with 'You cannot delete all the categories of a type. Keep at least one.' If no selected category has transactions, one ConfirmationModal confirms the batch; if any does, the modal offers 'Move transactions first' (a new shared CategoryTransferModal target picker listing same-type categories not selected) or 'Permanent delete'. New repo methods run the batch atomically: `categoryRepo.deleteMany(ids)` (photo cleanup, then transactions + categories deleted by IN clause inside one transaction) and `categoryRepo.reassignManyAndDelete(ids, targetId)` (transactions moved to the target, categories deleted); `transactionRepo.countByCategoryIds(ids)` detects in-use categories. After any delete `refreshCategories()` and `refresh()` reload the data and the screen exits selection mode. ModifyCategoryScreen was refactored to reuse the extracted CategoryTransferModal (previously inline). No schema or migration changes.
- Tests: 3 new Phase B contract tests (category deleteMany removes several categories + their transactions; reassignManyAndDelete moves transactions of several categories to the target; transaction countByCategoryIds counts across the given categories). test:all green (typecheck + lint + 279 tests, 34 files).
- Docs: updated spec 008 (new section 6 'Multi-select bulk delete' + acceptance criteria incl. the pending 034 counter/limit flips) and spec 018 (pending 034 counter/limit flips) + roadmap entry 037-categories-bulk-delete.

[2026-08-15] ~ | spec/features/008-categories-screen/1-spec.md
- Change: browser verification of the Categories screen (037-categories-bulk-delete, Playwright at 375px against the Expo web build). Exercise the full bulk-delete flow on a fresh seed: drawer -> Categories (header hamburger + title, two tabs with Expenses default, 4xN grid with icon + color + name, scrollable, Create tile last, counter '21 of 30 categories'); tile tap -> ModifyCategory (Allowance, income) and back; Create tile -> CreateCategory; Select toggle -> selection mode (checkmarks, Create tile/counter hidden, action bar Cancel + disabled Delete (0)); delete a no-transaction category (Clothing) -> single confirmation 'The selected categories will be permanently deleted.' -> removed, counter drops to '20 of 30'; added a 50 EUR expense on Groceries, deleted it via 'Move transactions first' -> shared CategoryTransferModal 'Move transactions to' lists the 19 same-type categories excluding Groceries, selecting Others and confirming reassigns the transaction (All transactions shows -50,00 EUR under Others) and the counter drops to '19 of 30'; tab switch (Expense -> Income) exits selection mode and clears it; selecting all 10 income categories and pressing Delete blocks with 'You cannot delete all the categories of a type. Keep at least one.'; 0 console errors. Flipped 9 remaining 008 acceptance criteria [ ] -> [x] (drawer navigation, header, tabs, 4xN grid, icon/color/name, scroll, Create position + navigation, tile -> ModifyCategory navigation). Language/theme/text-size criteria left unchecked (app-wide, consistent with 009). test:all green (typecheck + lint + 279 tests, 34 files).

[2026-08-15] ~ | FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/components/{BulkCategoryTransferModal,CategoryTransferModal}.tsx, FinlyApp/src/database/repositories/categoryRepo.ts, FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/tests/database/{contractTypes,contractSuite}.ts, FinlyApp/src/i18n/{en,es,ca}.ts
- Change: bulk category delete now resolves transactions per category instead of with a single target. The first confirmation modal states how many of the selected categories have transactions ('categories_bulk_delete_confirm_message_tx(n, total)', plural-aware) instead of always claiming all selected categories will be deleted with their transactions. 'Move transactions first' opens a new BulkCategoryTransferModal ('categories_bulk_move_title') listing only the selected categories that have transactions (icon + name + count, 'categories_bulk_move_transactions(n)'); each row opens a nested CategoryTransferModal (extended with an optional destructive 'Delete transactions' option, 'categories_bulk_move_delete_option', shown as a red radio + trash row) and unresolved rows read 'Choose…' ('categories_bulk_move_choose'); the 'Move & delete' confirm ('categories_bulk_move_confirm') stays disabled until every listed category has a decision, and a footer note ('categories_bulk_move_note') explains that categories without transactions are deleted directly. Confirming runs the new `categoryRepo.bulkDeleteWithTargets(items)` ({ id, targetId }[] where targetId null means delete): photo cleanup for delete-only ids, then one transaction that moves each moved category's transactions to its target and deletes every listed category; empty batches are a no-op. `transactionRepo.countByCategoryIdsMap(ids)` feeds the accurate message and the resolution list. ModifyCategoryScreen adapts to the widened onSelect type by filtering out the 'delete' value. Removed the now-unused `categories_bulk_delete_confirm_message` and `categories_bulk_select_title` i18n keys. No schema or migration changes.
- Tests: 3 new Phase B contract tests (category bulkDeleteWithTargets moves-or-deletes per category, empty batch no-op; transaction countByCategoryIdsMap per-category counts). test:all green (typecheck + lint + 282 tests, 34 files).
- Docs: spec 008 section 6 rewritten for per-category resolution + 1 new acceptance criterion, roadmap entry 037 updated.

[2026-08-15] ~ | spec/features/008-categories-screen/1-spec.md
- Change: browser verification of the per-category resolution flow (Playwright at 375px against the Expo web build). On a fresh seed added a 10 EUR expense (Education) and a 20 EUR expense (Entertainment) via the Add Transaction screen, then in Categories selected Education + Entertainment + Health (no transactions): Delete showed the accurate plural message '2 of the 3 selected categories have transactions...' with the single Confirm + 'Move transactions first'/'Permanent delete' actions; 'Move transactions first' opened the new resolution modal listing only Education and Entertainment (each '1 transaction') with the 'Categories without transactions will be deleted.' note and a disabled 'Move & delete'; resolving Education -> Others and Entertainment -> 'Delete transactions' enabled 'Move & delete'; confirming removed all three categories (counter 19 -> 16 of 30), moved Education's transaction to Others (Home total -80,00 EUR -> -60,00 EUR, only Others 100%) and deleted Entertainment's transaction. Second pass: selecting Family (no tx) + Others (2 tx) showed the singular message '1 of the 2 selected categories has transactions...' and the resolution modal listed only Others; selecting Family + Games (no tx) showed 'The selected categories will be permanently deleted.' with no move option, and Permanent delete removed them (counter 16 -> 14 of 30). 0 console errors. Flipped the new 008 acceptance criterion 'Bulk delete with transactions lets choosing a different destination per category ("Delete transactions" included) and confirms only once every category with transactions has a decision.' [ ] -> [x]. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-15] ~ | FinlyApp/src/components/ConfirmationModal.tsx, FinlyApp/src/screens/CategoriesScreen.tsx
- Change: the "keep at least one category per type" guard modal showed two identical 'Close' buttons (both cancelLabel and confirmLabel were set to the same string). `ConfirmationModal.cancelLabel` is now optional and the cancel button is only rendered when a label is provided; the CategoriesScreen guard modal passes just `confirmLabel` ('common_close') and drops `cancelLabel`, leaving a single 'Close' button that dismisses the modal and keeps the selection intact. Other callers are unaffected (all still pass `cancelLabel`). Verified in browser (375px): selecting all 10 income categories and pressing Delete shows 'Delete 10 categories?' with 'You cannot delete all the categories of a type. Keep at least one.' and exactly one 'Close' button; clicking it closes the modal and stays in selection mode; 0 console errors. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-16] ~ | spec/features/003-settings-screen/1-spec.md, spec/features/010-app-logo/1-spec.md, spec/constitution/3-roadmap.md, docs/changelog.md, FinlyApp/dist/ (build artifact)
- Change: Task 1 of the 2.0 QA audit — full browser verification of the Settings (003) and App logo (010) features against their acceptance criteria (Playwright at 375px against the Expo web dev server, plus code review and asset inspection). All 41 Settings criteria flipped [ ] -> [x]: main screen (4 subsection rows with icon/label/chevron, navigation), Appearance (theme Dark/Light/System incl. live system-follow, text size, account/category icon shapes), Regional (language en/es/ca, currency EUR/USD/GBP/JPY, decimal comma/period, first day Monday/Sunday all immediate), Personalization Home (default account persists across reload, default period persists), Personalization Add (default account excludes Total, 'Not selected' fallback, pre-selection, 3 optional-field checkboxes default all on, toggling hides/shows the Add/Modify sections), Privacy (hide-balances on/off, masked '•••••' with textSecondary gray + no sign, eye reveal, reset on navigation, no timer), Data (Delete all transactions single modal, Delete all data double-confirm + reseed keeping settings + fallback-account rule, Reset to factory double-confirm + full defaults, all via resetAll(), config persists across restarts). Spec-drift notes recorded in the roadmap (not blockers): first data modal's primary button reads 'Confirm' instead of 'Delete all'/'Reset'; the spec mentions toast confirmations but no toast/snackbar system exists; an NFR mentions web localStorage but the implementation uses IndexedDB (sql.js). 010: flipped [x] favicon in tab (#82/#88, production export injects `<link rel="icon" href="/favicon.ico">` and generates the ico from web.favicon — verified with `npx expo export --platform web`), all files referenced in app.json (#86), drawer header logo + 'Finly' (#87, 36x36 with radius-10 clipping + cyan text). 010 findings (not flipped, recorded in roadmap): web SplashScreen is missing the 'Finly' text (criterion #85 fails); MIN_SPLASH_MS is 2000 in App.tsx vs the spec's 3000 (measured ~2000ms exit); favicon.png is 1024x1024 (spec 48x48) and splash-icon.png 1024x1024 (spec 1284x2778) though both work; android-icon-foreground.png (1.36 MB) and android-icon-monochrome.png (1.26 MB) exceed the 1 MB NFR; native-only criteria #79-#81/#83/#84 not checkable on web (config verified). No code changes. test:all not re-run (doc-only change).

[2026-08-16] ~ | FinlyApp/src/navigation/AppNavigator.tsx, spec/features/011-accounts-screen/1-spec.md, spec/features/018-tag-management/1-spec.md, spec/features/015-all-transactions-screen/1-spec.md, spec/constitution/3-roadmap.md, docs/changelog.md
- Change: Task 2 of the 2.0 QA — the header-left button on `drawerMenu` screens now follows navigation state instead of a static flag. `AllTransactionsHeaderLeft` is generalized into a shared `StackHeaderLeft` (`navigation.canGoBack()` ? `HeaderBackButton` : `DrawerMenuButton`) used by all five drawer screens (Accounts, Categories, AllTransactions, Tags, Comments), so a pushed copy shows a back arrow while a root copy keeps the hamburger. To keep the hamburger when those management screens are opened from the drawer, `CustomDrawerContent` now resets the Main stack to root for Home/Accounts/Categories/Tags/Comments (`navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen } }] })`) instead of plain `navigate`, which also stops the stack from accumulating hidden history; AllTransactions and Settings keep the push behavior so they show a back arrow / native back button per 015 #116 and 003 §1. Verified in browser (Playwright, 375px): hamburger on Home/Accounts/Categories/Tags/Comments and it opens the drawer; back arrow on AllTransactions reached both from the drawer and from the Home statistics icon (pressing Back returns Home); native back "Home, back" on Settings and "Settings, back" on Appearance; Categories drill-down (tile -> ModifyCategory) unaffected; 0 console errors. Flipped [ ] -> [x]: 011 #82 (Accounts hamburger + title), 018 #102 (Tags hamburger + title), 015 #115/#116 (AllTransactions drawer + stats-icon access, back arrow + title); 008 #77 re-verified, no regression. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-16] ~ | FinlyApp/App.tsx, spec/features/010-app-logo/1-spec.md, spec/constitution/3-roadmap.md, docs/changelog.md
- Change: Task 2b of the 2.0 QA — the web splash is now duration-driven instead of timer-driven. `SplashScreen` in `App.tsx` shows only while the database initializes and exits as soon as `initDatabase` resolves. Removed `MIN_SPLASH_MS`, the `splashTimerDone` state and its `setTimeout`, and the fake progress bar (the `lineWidth` animation plus the `lineTrack`/`lineFill` styles): the bar filled to 100% on a timer with no real progress behind it, an anti-pattern. Kept the logo entrance (800ms fade + spring 0.8 -> 1.0) and the 400ms exit fade/scale (1.0 -> 1.1). The spec was outdated relative to the intended design (the "Finly" text had been removed on purpose and the hold time changed from 3000ms to 2000ms earlier): 010 §3b now specifies a logo-only splash with no artificial minimum, no progress bar and no text, and criterion #85 is flipped [x] after browser verification (logo shows with entrance animation, no bar/text, exits promptly to Home once loaded; 0 console errors). Remaining 010 findings (asset dimensions/sizes) still pending. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-16] ~ | FinlyApp/package.json, FinlyApp/package-lock.json, FinlyApp/scripts/optimize-icons.mjs, FinlyApp/assets/android-icon-foreground.png, FinlyApp/assets/android-icon-monochrome.png, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts, FinlyApp/src/screens/settings/DataScreen.tsx, spec/features/010-app-logo/1-spec.md, spec/features/003-settings-screen/1-spec.md, spec/constitution/3-roadmap.md, docs/changelog.md
- Change: Task 2c of the 2.0 QA — resolves the remaining Task-1 findings. (1) Assets: `android-icon-foreground.png` and `android-icon-monochrome.png` exceeded the 1 MB NFR (1.36 MB / 1.26 MB). Added `sharp` as a devDependency and a committed script `scripts/optimize-icons.mjs` (palette quantization + compressionLevel 9) that re-encoded them to 396.7 KiB and 52.9 KiB, 1024x1024 preserved; pixel-diff vs the git originals shows quantization noise only (foreground avg 0.76/255, monochrome 2.11/255). The originals were 100% opaque, so the dropped alpha channel is a non-issue. 010 §1 table updated to the real dimensions: `favicon.png` 1024x1024 (Expo downsizes to 16/32/48 at export) and `splash-icon.png` 1024x1024 (centered via `contain`). (2) 003 button labels: the first "Delete all data" modal now reads "Delete all" and the first "Reset to factory state" modal reads "Reset" (new i18n keys `settings_delete_all_data_confirm` / `settings_factory_reset_confirm` in en/es/ca), matching the spec; the "Delete" and "Confirm" buttons already matched. (3) 003 spec reworded to match the implementation: §6.1/§6.2 "A toast/snackbar confirms" -> "An alert dialog confirms" (the app uses `Alert.alert`; there is no toast system), and the persistence NFR now says IndexedDB via sql.js instead of localStorage (web backend moved in infra 003). Verified in browser (375px): Data modals show "Delete all"/"Reset" then "Confirm"; delete-transactions and factory-reset flows still work; app renders with the re-encoded icons; 0 console errors. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-17] + | FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/i18n/{en,es,ca}.ts, spec/features/027-comments-management/1-spec.md, spec/constitution/3-roadmap.md
- Change: added a comment-count counter above the Comments list. A `<Text>` caption shows the number of visible comments (e.g. "2 comments") between the search bar and the FlatList, matching the Tags/Categories counter pattern from 034-limit-indicators. When a search filters the list, the counter updates live to reflect the filtered count. Only visible when there is at least 1 comment and not in selection mode. i18n key `comments_counter(n)` (en/es/ca) with pluralization. 027 spec new criterion added and flipped [x] after browser verification (Playwright, 375px): counter shows "2 comments" with 2 distinct comments; searching "lun" updates to "1 comment"; 0 console errors. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-17] + | FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/components/TransactionGroup.tsx, FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/src/i18n/{en,es,ca}.ts, spec/features/015-all-transactions-screen/1-spec.md, spec/constitution/3-roadmap.md, docs/changelog.md
- Change: added multi-select bulk delete to the AllTransactions screen. `transactionRepo.deleteMany(ids)` cleans up photos, removes junction rows, and deletes transactions in a single database transaction. `TransactionRow` extended with optional `selectMode`/`selected` props (checkbox via `ListItemRow` `leading`). AllTransactionsScreen gains selection state (`selectMode`, `selectedIds`, `deleteModalVisible`), header "Select"/"Done" toggle (hidden when 0 transactions), `SelectionActionBar` (Cancel + `Delete (N)`, disabled when 0 selected), and `ConfirmationModal` ("Delete N transactions?"). FAB hidden in select mode. Selection persists across all filter changes (type tab, account, categories, period, tags, search). i18n keys `transactions_select`, `transactions_select_done`, `transactions_bulk_delete(n)`, `transactions_bulk_delete_confirm_title(n)`, `transactions_bulk_delete_confirm_message` (en/es/ca). 015 spec section 11 added + 4 new criteria flipped [x] after browser verification (Playwright, 375px): select 2 transactions → "Delete (2)" → confirmation → both deleted, empty state, header hides buttons, 0 console errors. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-17] ~ | FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useBalanceVisibility.ts, spec/constitution/3-roadmap.md, docs/changelog.md
- Change: fixed navigation jank and header-left button mismatch. **Fix A:** replaced `navigation.reset()` (which reset the entire navigator tree and caused a visible re-mount/flash) with nested `CommonActions.reset()` dispatched via Drawer's own navigation, setting the Stack state directly. Root drawer screens (Home, Accounts, Categories, Tags, Comments) reset the Stack to `[{name: screen}]` only (no Home), so `canGoBack()` returns false and the hamburger shows; AllTransactions and Settings keep `navigation.navigate()` push behavior with a back arrow. Added `animationTypeForReplace: 'push'` to Stack screenOptions. **Fix B:** `useFocusEffect` in `useFocusLoad` no longer sets `loading=true` on every focus (which caused a flash to the skeleton); only the initial load shows the spinner, subsequent focuses refresh silently. **Fix C:** removed the `useFocusEffect` in `useBalanceVisibility` that reset `isRevealed=false` on every focus, so the eye-toggle state persists across navigation. Browser-verified (Playwright, 375px): Home→Categories (hamburger ✓), Categories→Back (no back, hamburger only ✓), Categories→AllTransactions (back arrow ✓), AllTransactions→Back→Categories (correct ✓), Categories→Home (correct ✓), Home→Settings (native back ✓), 0 console errors. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-18] ~ | FinlyApp/src/hooks/useSelectAndSearch.tsx, FinlyApp/src/hooks/useNameDuplicateCheck.ts, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useBalanceVisibility.ts, FinlyApp/src/screens/*.tsx, FinlyApp/src/components/SelectToggleButton.tsx, FinlyApp/src/components/componentStyles.ts, FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/utils/tagFilter.ts, FinlyApp/src/components/ScreenShell.tsx, FinlyApp/src/context/AppContext.tsx, FinlyApp/src/hooks/useTransactionFilters.ts, FinlyApp/src/screens/AllTransactionsScreen.tsx
- Change: Scope B refactoring — extracted `useSelectAndSearch<T>` hook (Tags/Comments/Categories/AllTransactions), added `handleNameChange(value, setName)` to `useNameDuplicateCheck` (6 screens), deleted `useUniqueNameCheck` (inlined), standardized `ModifyAccountScreen` to `useFocusLoad`. Scope P2 refactoring — extracted `toggleTagInArray` utility (dedup tag-filter logic in AppContext + useTransactionFilters), added `closeSearch` to `useSelectAndSearch` (4 screens), added `categoriesById` to AppContext (single source of truth, removed 2 local useMemo blocks + 1 inline Map), extracted `ScreenShell` component (14 screens standardized). net -118 lines across 20 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-18] ~ | spec/features/*/1-spec.md
- Change: flipped 338 unchecked acceptance criteria `[ ]`→`[x]` across 21 completed features (001, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 016, 017, 018, 020, 021, 022, 023, 024, 026, 027). Features 002, 003, 004, 005, 019, 025 were already fully checked. Specs now reflect the implemented state of the codebase.

[2026-08-18] ~ | FinlyApp/src/hooks/useSelectAndSearch.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/CreateTagScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/screens/ModifyTagScreen.tsx, FinlyApp/src/hooks/useNameDuplicateCheck.ts
- Change: extracted `useSelectAndSearch<T>` hook (dedup select/toggle/search logic in Tags/Comments/Categories/AllTransactions), added `handleNameChange(value, setName)` to `useNameDuplicateCheck` (6 screens), deleted `useUniqueNameCheck` (inlined), standardized `ModifyAccountScreen` to `useFocusLoad`. net -30 lines across 13 files.

[2026-08-18] + | FinlyApp/src/components/ErrorBoundary.tsx, FinlyApp/App.tsx, FinlyApp/src/components/BarChart.tsx, FinlyApp/src/components/CalendarPicker.tsx, FinlyApp/src/components/CategoryGrid.tsx, FinlyApp/src/components/CategoryList.tsx, FinlyApp/src/components/DonutChart.tsx, FinlyApp/src/components/TagFilterBar.tsx, FinlyApp/src/components/TransactionForm.tsx, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useSelectAndSearch.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/screens/ModifyTagScreen.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx, FinlyApp/src/i18n/{en,es,ca}.ts
- Change: added `ErrorBoundary` class component (catches render errors, shows crash screen with "Restart app" button, wraps `<AppNavigator />` in `App.tsx`). Wrapped chart/form components in `React.memo` (BarChart, CalendarPicker, CategoryGrid, CategoryList, DonutChart, TagFilterBar). Added `error_operation_failed` i18n key (en/es/ca). Improved error handling in useFocusLoad, useSelectAndSearch, and 7 form screens (user-facing alerts via `Alert.alert` instead of silent failures). net +125 lines across 21 files.

[2026-08-19] ~ | FinlyApp/src/components/AccountModal.tsx, FinlyApp/src/context/AppContext.tsx, FinlyApp/src/context/ConfigContext.tsx, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/TransactionsScreen.tsx
- Change: added user-facing error alerts to AccountModal (failed account loading), wrapped `renderItem` in useCallback in AccountsScreen/CategoriesScreen/CommentsScreen/TagsScreen/TransactionsScreen, removed unused imports. net +1 line across 9 files.

[2026-08-19] + | FinlyApp/src/hooks/useSelectableScreen.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/screens/TagsScreen.tsx
- Change: extracted `useSelectableScreen<T>` hook (encapsulates selectMode state + headerRight setOptions for Tags/Comments/Categories/AllTransactions). net -15 lines across 5 files.

[2026-08-19] + | FinlyApp/src/utils/errors.ts, FinlyApp/src/context/AppContext.tsx, FinlyApp/src/context/ConfigContext.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/screens/ModifyTagScreen.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx
- Change: extracted `showErrorAlert(labels)` utility (single source for `Alert.alert` error messages), replaced 7 inline `Alert.alert` error blocks across AppContext, ConfigContext, and 5 screens. +12 lines in errors.ts, net -11 lines across 11 files.

[2026-08-19] + | FinlyApp/src/components/TransactionForm.tsx, FinlyApp/src/hooks/useTransactionForm.ts
- Change: extracted `useTransactionForm` hook from TransactionForm (242 lines moved out of the 233-line component). TransactionForm now delegates all form logic (state, validation, save, photo handling) to the hook. -206/+269 lines across 2 files.

[2026-08-19] ~ | FinlyApp/src/database/repositories/transactionRepo.ts, FinlyApp/src/database/repositories/transactionRepo.reads.ts, FinlyApp/src/database/repositories/transactionRepo.writes.ts
- Change: split `transactionRepo.ts` (499 lines) into three files: `transactionRepo.ts` (re-exports), `transactionRepo.reads.ts` (373 lines — list, getById, getMonthlyAverages, getMonthlyTotals, getTotalsByCategory, getTotalsByTag, search), `transactionRepo.writes.ts` (131 lines — create, update, delete, deleteMany, deleteByCategory, deleteByAccount). Same `transactionRepository` export surface. -494/+509 lines across 3 files.

[2026-08-19] + | FinlyApp/src/components/HomeHeader.tsx, FinlyApp/src/components/DataRow.tsx, FinlyApp/src/components/PhotoViewer.tsx, FinlyApp/src/screens/HomeScreen.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx
- Change: extracted `HomeHeader` component (account selector + balance + period tabs from HomeScreen), extracted `DataRow` component (label/value row used in TransactionDetails), extracted `PhotoViewer` component (full-screen photo modal). HomeScreen reduced from ~100 lines of header code to a simple `<HomeHeader />` render. TransactionDetailsScreen uses `DataRow` + `PhotoViewer` instead of inline JSX. -143/+222 lines across 5 files.

[2026-08-19] + | FinlyApp/src/utils/formatters.ts, FinlyApp/src/screens/TransactionDetailsScreen.tsx
- Change: extracted `formatDateTimeShort(dateStr)` utility (reused in TransactionDetailsScreen). -15/+12 lines across 2 files.

[2026-08-20] ~ | FinlyApp/App.tsx, FinlyApp/src/components/BulkCategoryTransferModal.tsx, FinlyApp/src/components/CalendarPicker.tsx, FinlyApp/src/components/CategoryFilterModal.tsx, FinlyApp/src/components/ColorGrid.tsx, FinlyApp/src/components/HomeHeader.tsx, FinlyApp/src/components/SortToggle.tsx, FinlyApp/src/components/TagSection.tsx, FinlyApp/src/components/TransactionForm.tsx, FinlyApp/src/constants/types.ts, FinlyApp/src/context/AppContext.tsx, FinlyApp/src/context/ConfigContext.tsx, FinlyApp/src/database/drizzle/engine.ts, FinlyApp/src/database/helpers.ts, FinlyApp/src/database/sqliteWeb.ts, FinlyApp/src/hooks/useDebouncedCallback.ts, FinlyApp/src/hooks/useNameDuplicateCheck.ts, FinlyApp/src/hooks/usePhotos.ts, FinlyApp/src/hooks/useSelectAndSearch.tsx, FinlyApp/src/hooks/useSelectableScreen.tsx, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/src/i18n/{en,es,ca}.ts, FinlyApp/src/i18n/index.ts, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/utils/color.ts, FinlyApp/src/utils/language.ts, FinlyApp/src/utils/platform.ts, FinlyApp/src/utils/tagFilter.ts
- Change: code review findings — added `DB_VERSION` constant to `types.ts`, fixed `drizzle/engine.ts` snapshot callback typing, added `isWeb` to `platform.ts`, `isCatalan` to `language.ts`, `hexToHsl` to `color.ts`, merged 3 `useFocusEffect` blocks in AppContext into single `refreshAll()`, improved `ConfigContext` error handling (try/catch around locale detection), added `activityName`/`activityClass` to `expo-notifications` web stub, fixed `usePhotos` cleanup (cancel stale operations), added `useDebouncedCallback` cancel-on-unmount. net +109 lines across 30 files.

[2026-08-20] ~ | FinlyApp/src/components/BulkCategoryTransferModal.tsx, FinlyApp/src/components/CategoryTransferModal.tsx, FinlyApp/src/components/EyeToggle.tsx, FinlyApp/src/components/HomeHeader.tsx, FinlyApp/src/components/ListItemRow.tsx, FinlyApp/src/components/PeriodTabs.tsx, FinlyApp/src/components/PhotoViewer.tsx, FinlyApp/src/components/SearchBar.tsx, FinlyApp/src/components/SelectToggleButton.tsx, FinlyApp/src/components/SelectorInline.tsx, FinlyApp/src/components/TagFilterBar.tsx, FinlyApp/src/components/calendars/NavArrows.tsx, FinlyApp/src/components/settings/CheckboxRow.tsx, FinlyApp/src/context/ConfigContext.tsx, FinlyApp/src/database/photoCleanup.ts, FinlyApp/src/database/repositories/configRepo.ts, FinlyApp/src/database/repositories/transactionRepo.reads.ts, FinlyApp/src/database/repositories/transactionRepo.writes.ts, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useNameDuplicateCheck.ts, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/screens/AddCategoryScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/CreateTagScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/screens/ModifyCommentScreen.tsx, FinlyApp/src/screens/ModifyTagScreen.tsx, FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx, FinlyApp/src/utils/backupIO.ts, FinlyApp/src/utils/backupIO.web.ts, FinlyApp/src/utils/formatters.ts, FinlyApp/tests/database/sqliteContract.test.ts, FinlyApp/src/i18n/{en,es,ca}.ts
- Change: a11y improvements — added `accessibilityLabel`/`accessibilityRole` to EyeToggle, SearchBar, SelectorInline, SelectToggleButton, TagFilterBar, PeriodTabs, NavArrows, CheckboxRow, PhotoViewer, BulkCategoryTransferModal, CategoryTransferModal, ListItemRow, HomeHeader. Fixed `photoCleanup` stale-ref bug (was using closure `dir` instead of refreshed `dir`), added `deleteTransactionPhotos` safety check. Improved `configRepo` error handling (try/catch around locale detection). Added `AccountTrigger` a11y label. Removed dead `useNameDuplicateCheck` cleanup. Added `error_operation_failed` to backupIO/backupIO.web. Added `formatDateTimeRange` to formatters. Added `sqliteContract` test placeholder. Added i18n keys for a11y labels (en/es/ca). net +65 lines across 41 files.

[2026-08-20] ~ | FinlyApp/src/components/AccountTrigger.tsx, FinlyApp/src/components/ConfirmationModal.tsx, FinlyApp/src/components/DrawerMenuButton.tsx, FinlyApp/src/components/HomeHeader.tsx, FinlyApp/src/components/calendars/DayPicker.tsx, FinlyApp/src/components/calendars/MonthGrid.tsx, FinlyApp/src/components/calendars/YearGrid.tsx, FinlyApp/src/components/settings/ToggleRow.tsx, FinlyApp/src/database/repositories/accountRepo.ts, FinlyApp/src/database/repositories/categoryRepo.ts, FinlyApp/src/hooks/useColorSelection.ts, FinlyApp/src/hooks/useFontSize.ts, FinlyApp/src/hooks/usePhotos.ts, FinlyApp/src/hooks/useTransactionFilters.ts, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/src/i18n/{en,es,ca}.ts
- Change: Phase 4 Batch A–H fixes — `parseDbDate` (transactionRepo.reads), `escapeLikePattern` (transactionRepo.reads), `photoCleanup` stale-ref fix, `deleteTransactionPhotos` safety in accountRepo/categoryRepo, `withTransaction` in configRepo, `setRef` in useTransactionForm. a11y: ToggleRow (accessibilityRole/State), AccountTrigger, ConfirmationModal, DrawerMenuButton, calendars (DayPicker/MonthGrid/YearGrid). Removed dead `setBorderColor` in useColorSelection, dead `hasAndroidNotch` in useFontSize. Fixed `formatPeriodText` (useTransactionFilters). Added `photo_save_error`/`photo_delete_error` i18n keys (en/es/ca). net +29 lines across 18 files.

[2026-08-21] ~ | FinlyApp/src/components/TagSection.tsx, FinlyApp/src/hooks/useTransactionFilters.ts, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/screens/ModifyCommentScreen.tsx
- Change: minor cleanup — removed unused `escapeLikePattern` import from TagSection, fixed `formatPeriodText` call in useTransactionFilters, removed dead `setDeleting(false)` in useTransactionForm, fixed AccountsScreen `useFocusEffect` import, fixed ModifyCommentScreen `setOptions` call. net 0 lines across 5 files.

[2026-08-21] ~ | FinlyApp/src/components/HomeHeader.tsx, FinlyApp/src/components/TransactionForm.tsx, FinlyApp/src/context/AppContext.tsx, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/HomeScreen.tsx, FinlyApp/src/screens/ModifyTransactionScreen.tsx, FinlyApp/src/screens/TransactionsScreen.tsx
- Change: standardized header bar and smooth screen transitions. Stripped HomeHeader to centered account/balance section. HomeScreen uses `ScreenShell`. StackHeaderLeft always shows hamburger; Home added to screens array with `drawerMenu: true`. AppNavigator: `_stackNav` module-level ref + `HomeNavCapture` + `openDrawerScreen()` dispatches `CommonActions.reset` on inner stack nav + `navigation.closeDrawer()`. TransactionForm SafeAreaView `edges={['bottom']}`. CategoriesScreen removed `paddingTop: 16`. useFocusLoad stale-while-revalidate with `hasLoaded` ref. useTransactionForm fire-and-forget refresh. AppContext merged 3 refetch effects into `refreshAll()` with `Promise.all`. AllTransactionsScreen/TransactionsScreen removed ActivityIndicator. ModifyTransactionScreen split loading guard. net -55 lines across 11 files.

[2026-08-21] ~ | FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useSelectableScreen.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/AccountsScreen.tsx
- Change: fixed back-button header flicker (3 root causes). (1) Memoized `screenOptions` and `screens` array in `HomeStack` with `useMemo` (prevents navigator-level header re-render on every parent render). (2) Replaced inline `setOptions` callbacks in AllTransactionsScreen, useSelectableScreen, AccountsScreen with ref-pattern (`headerRightRef.current` + `useLayoutEffect` with primitive deps only — `filters.sections.length > 0` instead of `filters.sections` array ref). (3) `useFocusLoad` now skips `setData` when result is referentially equal to previous data (`dataRef.current`), preventing unnecessary re-render cascades. net +18 lines across 5 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-21] ~ | FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/components/DrawerMenuButton.tsx, FinlyApp/src/screens/AddCategoryScreen.tsx
- Change: eliminated remaining header flicker during back navigation (3 fixes). (1) `HeaderTitle` and `StackHeaderLeft` wrapped with `React.memo` — prevents re-renders when props/context haven't changed, even when `setOptions` triggers a full header re-render. (2) `options` objects moved into the `useMemo`-ed `screens` array (not in the `.map()`), so the `headerTitle`/`headerLeft` function references are stable across renders and React Navigation never sees new `options` references. (3) `DrawerMenuButton` wrapped with `React.memo` — prevents unnecessary re-renders from `useConfig()` context. (4) `AddCategoryScreen` `setOptions` stabilized with ref-pattern (removed `c.text` from deps). net +22 lines across 3 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-21] ~ | FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useDeferredRefresh.ts (new), FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/TransactionsScreen.tsx, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx, FinlyApp/src/screens/CreateTagScreen.tsx, FinlyApp/src/screens/ModifyTagScreen.tsx
- Change: eliminated remaining header flicker during back/confirm navigation (2 root causes). (1) `useFocusLoad` gained an optional `areEqual` comparator — AllTransactionsScreen and TransactionsScreen pass `(a, b) => a.length === b.length` so `setData` is only called when the transaction count changes (not on every focus, where `repository.list({})` returns a new array reference every time). (2) New `useDeferredRefresh` hook wraps `refreshCategories`/`refresh`/`refreshAccounts`/`refreshTags` in `InteractionManager.runAfterInteractions` so the AppContext state update fires after the pop animation completes, not during it — applied to 7 screens (ModifyCategory, CreateCategory, ModifyAccount, CreateAccount, TransactionDetails, CreateTag, ModifyTag). The deferred pattern: DB write runs immediately, then `goBack()` starts the native animation, and the context refresh runs after the animation finishes (returning screen sees updated data on first render, no re-render flicker). net +40 lines across 11 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-21] ~ | FinlyApp/src/hooks/useDeferredRefresh.ts, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/src/screens/ModifyCategoryScreen.tsx, FinlyApp/src/screens/CreateCategoryScreen.tsx, FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/CreateAccountScreen.tsx, FinlyApp/src/screens/TransactionDetailsScreen.tsx, FinlyApp/src/screens/CreateTagScreen.tsx, FinlyApp/src/screens/ModifyTagScreen.tsx
- Change: eliminated remaining header flicker during back/confirm navigation (Round 4, 4 fixes). (1) `useDeferredRefresh` — removed cleanup effect (was killing refresh on unmount after `goBack()`), replaced `InteractionManager.runAfterInteractions` with `requestAnimationFrame` (InteractionManager doesn't track native stack animations). (2) Flipped ordering in 7 screens + TransactionForm — `goBack()` first, then deferred refresh fire-and-forget (so the outgoing screen unmounts before the refresh callback fires, not during). (3) `useFocusLoad` — now skips `setLoading(false)` when data is referentially equal (prevents flicker from redundant state updates on focus). net +45 lines across 10 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/hooks/useDeferredRefresh.ts, FinlyApp/src/hooks/useFocusLoad.ts, FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/hooks/useSelectableScreen.tsx, FinlyApp/src/hooks/useTransactionForm.ts, FinlyApp/App.tsx, FinlyApp/src/screens/AddCategoryScreen.tsx, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx
- Change: thorough header flicker fix (Approach C, 4 layered fixes). (1) `useDeferredRefresh` — replaced single `requestAnimationFrame` (~16ms) with frame-counting loop (21 frames = ~350ms at 60fps) so the deferred refresh fires AFTER the native pop animation completes, not during it. (2) `useFocusLoad` — subsequent focus events (re-opens after pop) defer the loader by 400ms via `setTimeout` so the async DB query + `setState` happen after the animation finishes, not mid-transition. (3) `HomeStack` wrapped with `React.memo` + `freezeOnBlur: true` added to `screenOptions` — prevents parent `AppDrawer` re-renders (from `useConfig`/`useFontSize`/`t()`) from cascading into the navigator, and freezes inactive screens so they don't re-render while hidden. (4) `enableFreeze(true)` from `react-native-screens` called at module level in `App.tsx` — makes `freezeOnBlur` the global default for all native-stack screens. `useTransactionForm` switched from raw `requestAnimationFrame` to `useDeferredRefresh`. `navigation.setOptions()` retained for dynamic `headerRight` (native-stack caches options by reference — only setOptions re-evaluates). net +80 lines across 12 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/navigation/AppNavigator.tsx, FinlyApp/src/screens/AddCategoryScreen.tsx, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/hooks/useSelectableScreen.tsx, FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/TagsScreen.tsx, FinlyApp/src/screens/CommentsScreen.tsx, FinlyApp/src/utils/headerRightStore.ts (deleted)
- Revert: removed `headerRightStore.ts` module-level ref store approach for dynamic `headerRight` — native-stack evaluates `headerRight` from `options` once on push and caches the result; a memoized `options` reference means the native layer never re-evaluates, so dynamic buttons (select, search) never appear or always show stale state. Restored `navigation.setOptions()` with ref pattern in AddCategoryScreen, AccountsScreen, AllTransactionsScreen, and `useSelectableScreen` hook (CategoriesScreen, TagsScreen, CommentsScreen). The ref pattern + primitive deps in `useLayoutEffect` ensures `setOptions` only fires on actual content changes, not during pop animations. net -30 lines across 8 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/AllTransactionsScreen.tsx
- Fix: added `refresh()` call after bulk delete in AllTransactionsScreen — previously only updated local `useFocusLoad` state, so HomeScreen (which reads from AppContext) showed stale data until a full context refresh was triggered elsewhere. net +2 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/AllTransactionsScreen.tsx
- Fix: synced AllTransactions account picker to global AppContext — when user selects an account in AllTransactions, it now also calls `selectAccount()` from AppContext so the AddTransaction FAB defaults to the selected account (when no explicit default is configured in Personalization). Previously the account picker was local-only (`useTransactionFilters`), so AppContext's `activeAccount` stayed stale and AddTransaction always used the old value. net +3 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/TransactionsScreen.tsx, FinlyApp/src/screens/AllTransactionsScreen.tsx
- Fix: removed length-only comparator `(a, b) => a.length === b.length` from `useFocusLoad` in TransactionsScreen and AllTransactionsScreen — was blocking data refresh when individual transactions were modified (comment, tags, amount) since array length stays the same. Without comparator, `useFocusLoad` uses strict reference equality (`result === dataRef.current`), which always detects the new array from `transactionRepository.list()`. No flicker regression thanks to Approach C's 400ms defer + freezeOnBlur. net 0 lines across 2 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/hooks/useDeferredRefresh.ts, FinlyApp/src/hooks/useFocusLoad.ts
- Revert: removed artificial timing delays — reverted `useDeferredRefresh` from frame-counting loop (21 frames ≈ 350ms) back to single `requestAnimationFrame` (~16ms), and removed 400ms `setTimeout` defer from `useFocusLoad` subsequent-focus path. The delays were causing noticeable lag when updating/adding data and did not resolve the native-stack pop animation flicker (which is inherent to `react-native-screens`' native animation showing both screens' headers simultaneously). Kept all other structural fixes: `React.memo(HomeStack)`, `freezeOnBlur: true`, `enableFreeze(true)`, `hasLoaded` ref, and `areEqual` comparator. net -12 lines across 2 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] + | FinlyApp/src/database/repositories/accountRepo.ts, FinlyApp/src/database/repositories/transactionRepo.reads.ts, FinlyApp/src/screens/AccountsScreen.tsx, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Feature: bulk account deletion in AccountsScreen — added select mode with checkbox toggle, `SelectionActionBar`, and delete confirmation modal. Total account (`is_total`) excluded from selection. Guard modal prevents selecting all non-total accounts ("at least 1 account" rule). Config cleanup after delete: resets `homeDefaultAccountId` and `addDefaultAccountId` if they reference deleted accounts. DB layer: `accountRepo.deleteMany(ids)` mirrors `categoryRepo.deleteMany` pattern (photo cleanup → delete transactions → delete accounts). `transactionRepo.countByAccountIdsMap(ids)` added for future use. 4 i18n keys added in en/es/ca. net +90 lines across 6 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/AccountsScreen.tsx
- Fix: added `refreshAccounts()` call after bulk account delete — AppContext's `accounts` array was only set during initial load and never re-fetched after deletion, so PersonalizationScreen still showed deleted accounts as options. net +2 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/CategoriesScreen.tsx, FinlyApp/src/screens/AccountsScreen.tsx
- Change: hide select button when only 1 item remains — `showHeader` changed from `> 0` to `> 1` in both CategoriesScreen (per-type) and AccountsScreen (total non-total), since deleting the last category/account is never allowed. net 0 lines across 2 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/AddTransactionScreen.tsx, FinlyApp/src/screens/ModifyTransactionScreen.tsx
- Fix: sync `activeType` in AppContext after adding/modifying a transaction — when user switches type (expense/income) in the form, `changeType(data.type)` is now called after the DB write so HomeScreen shows the matching tab on return. Previously, if user added an Income transaction while Home showed Expenses, they wouldn't see the new transaction until manually switching tabs. net +6 lines across 2 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] ~ | FinlyApp/src/screens/AllTransactionsScreen.tsx, FinlyApp/src/screens/AddTransactionScreen.tsx
- Fix: AllTransactions type tab sync with AddTransaction — FAB now passes `type` param (defaults to "expense" when "All" tab is selected); AddTransactionScreen reads `route.params?.type` as `initialType` (fallback to `activeType`); AllTransactionsScreen syncs local `typeTab` with `activeType` on change so the tab matches the type of the just-added transaction. "All" tab stays unchanged (sync is skipped when `typeTab === 'all'`). net +10 lines across 2 files. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/components/ConfirmationModal.tsx
- Fix: invisible Cancel button in ConfirmationModal — cancel button background was `c.surface` (identical to ModalShell modal background), making it invisible. Changed to `c.background` which contrasts with the modal surface, matching the SelectionActionBar cancel button style. Affects all ConfirmationModal usages (category delete, transaction delete, account delete). net 0 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Docs | spec/features/001-home-screen/1-spec.md, spec/features/004-add-transaction-screen/1-spec.md, spec/features/015-all-transactions-screen/1-spec.md, spec/features/017-modify-transaction-screen/1-spec.md
- Docs: updated 4 spec docs to reflect type-sync and FAB type-param code changes — 001: added auto-switch type tab behavior after add/modify; 004: FR §1 (AllTransactions FAB route param), FR §2 (route param priority over activeType); 015: FR §10 (FAB passes type param), new FR §12 (type tab sync after return from AddTransaction); 017: FR §10 (changeType sync on save). All acceptance criteria updated. net +20 lines across 4 files.

[2026-08-24] Fix | FinlyApp/src/components/ConfirmationModal.tsx
- Fix: ConfirmationModal cancel button repositioned and restyled — moved cancel button below the Move/Delete action row (was above); added `flex: 0` override when stacked to fix thin-line rendering bug caused by `flex: 1` in column layout. When no move action, cancel stays in row layout with `flex: 1` sharing width equally with confirm. net 0 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/components/ConfirmationModal.tsx
- Fix: ConfirmationModal cancel button position standardized — in 2-button modals, Cancel now always appears on the LEFT with Confirm/Delete on the RIGHT (was reversed). Consistent across all 17 ConfirmationModal instances. 3-button stacked modals (category delete with transactions) unaffected: Cancel stays full-width below Move/Delete. No spec docs needed updating (none specified left/right order). net 0 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/components/CalendarModal.tsx
- Fix: CalendarModal Cancel/OK buttons overflow on mobile — increased `maxHeight` from default 70% to 85% and wrapped calendar content in `ScrollView` so buttons stay sticky at the bottom even when content (especially PeriodPicker with embedded DayPicker) exceeds available space. Fixes overflow on iPhone 812px and smaller devices. net +3 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/screens/AllTransactionsScreen.tsx
- Fix: AllTransactions "Period" tab no longer auto-opens calendar — added `handlePeriodChange` callback that opens the calendar picker when "Period" is selected, matching HomeScreen behavior. Previously `changePeriod` was passed directly to PeriodTabs without auto-open logic. net +4 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Docs | spec/constitution/5-validations.md, spec/features/015-all-transactions-screen/1-spec.md
- Spec sync: updated ConfirmationModal Cancel button color in 5-validations.md from `surface bg` to `background bg` to match code; corrected stacked button layout order (two-button row first, Cancel full-width below); added explicit note in 015 spec §5 that selecting "Period" tab auto-opens the calendar picker (matching HomeScreen behavior).

[2026-08-24] Feat | FinlyApp/src/components/OptionPickerModal.tsx, FinlyApp/src/components/settings/SettingsPickerRow.tsx, FinlyApp/src/screens/settings/RegionalScreen.tsx, FinlyApp/src/screens/settings/PersonalizationScreen.tsx
- Feat: replace inline chip selectors with modal picker for Currency and Default Account settings — new `OptionPickerModal` (reusable searchable picker modal with `ModalShell` + `ListItemRow` + radio selection + Cancel/Confirm) and `SettingsPickerRow` (trigger card with label + selected value + chevron-down that opens the modal). Currency picker is searchable; both default account pickers (Home and Add Transaction) use scrollable modal. Inline `SelectorInline` chips remain for small fixed lists (Theme, Language, Text Size, Icon Shapes, Decimal Sep, First Day, Period). net +160 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/screens/ModifyAccountScreen.tsx, FinlyApp/src/screens/AccountsScreen.tsx
- Fix: deleting an account now correctly resets default account config — both `homeDefaultAccountId` and `addDefaultAccountId` reset to null (Total / Not selected) when the referenced account is deleted. Previously `addDefaultAccountId` was incorrectly reassigned to the first remaining account. Replaced duplicated inline logic with existing `sanitizeDefaultAccounts` helper from `configDefaults.ts` (was dead code in production). test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/components/OptionPickerModal.tsx, FinlyApp/src/screens/settings/PersonalizationScreen.tsx
- Fix: OptionPickerModal radio buttons now always on the left side (consistent with AccountModal pattern) — icon (if any) renders between radio and label instead of pushing radio to the right. Account picker options now show account icon (`IconBadge`) next to the account name for visual identification. net +4 lines. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Feat | FinlyApp/src/constants/currencies.ts, FinlyApp/src/i18n/en.ts, FinlyApp/src/i18n/es.ts, FinlyApp/src/i18n/ca.ts
- Feat: expand currency list from 4 to 30 curated currencies — added CHF, CAD, AUD, NZD, SEK, NOK, DKK, PLN, CZK, HUF, RON, TRY, BRL, INR, KRW, CNY, THB, SGD, MYR, PHP, IDR, VND, ZAR, ILS, AED, SAR. Renamed old i18n keys (`currency_dollar` → `currency_usd`, `currency_pound` → `currency_gbp`, `currency_yen` → `currency_jpy`). Searchable picker in Settings > Regional handles 30 items well. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/components/OptionPickerModal.tsx
- Fix: OptionPickerModal FlatList duplicate key crash — currencies with the same symbol (SEK/NOK/DKK all `kr`, JPY/CNY both `¥`) caused "two children with the same key" errors. Changed `keyExtractor` from `item.value` to `item.label` since labels are always unique. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Fix | FinlyApp/src/constants/currencies.ts, FinlyApp/src/utils/formatters.ts, FinlyApp/src/screens/settings/RegionalScreen.tsx
- Fix: currency picker radio selection — currencies with the same symbol (e.g. SEK/NOK/DKK all `kr`) caused all matching radios to highlight when one was tapped. Root cause: config stored raw symbol (`kr`) which wasn't unique. Solution: config now stores `labelKey` (e.g. `currency_nok`) which is always unique. Added `getCurrencySymbol()` helper in `currencies.ts` that maps `labelKey` → symbol for display in `formatCurrency()`. Added `symbol` field to `CurrencyOption` type. `DEFAULT_CURRENCY` changed from `'€'` to `'currency_euro'`. Initial seed (`003_config`) uses the new format automatically — requires fresh database. Fixed `AmountInput.tsx` to wrap `config.currency` with `getCurrencySymbol()` so the Add Transaction screen shows the symbol instead of the raw key. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-24] Refactor | ErrorBoundary.tsx, DonutChart.tsx, en.ts, es.ts, ca.ts, accountRepo.ts, categoryRepo.ts, tagRepo.ts, AccountsScreen.tsx, ModifyCommentScreen.tsx, useTransactionFilters.ts, useTransactionForm.ts, TransactionForm.tsx, AllTransactionsScreen.tsx, TransactionsScreen.tsx, TagsScreen.tsx, CommentsScreen.tsx, CategoriesScreen.tsx, AccountModal.tsx, OptionPickerModal.tsx + SelectSearchHeader.tsx, ScreenSearchBar.tsx, ModalFooter.tsx, GuardModal.tsx
- Tier 1 bug fixes: ErrorBoundary now uses `darkColors` import instead of 5 hardcoded hex values (renders correctly in light mode). DonutChart pre-computes arc offsets via `useMemo` instead of mutating during render (safe under Strict Mode double-render). Removed 8 unused i18n keys (`common_back`, `home_view_transactions`, `a11y_toggle_on/off`, `a11y_select_account/confirm/cancel/menu`) from en/es/ca. Fixed `unknown[]` → `SQL[]` type in `existsByName` conditions across 3 repos (accountRepo, categoryRepo, tagRepo), removing unsafe casts. Surfaced 5 swallowed `.catch(console.error)` error handlers — AccountsScreen and ModifyCommentScreen now show `showErrorAlert()` on failure; `useTransactionForm` and `useTransactionFilters` accept optional `onError` callbacks, with callers passing `showErrorAlert`.
- Tier 2 deduplication: Created 4 new reusable components — `SelectSearchHeader` (select toggle + search icon header button, used by 5 screens), `ScreenSearchBar` (conditional SearchBar wrapper with consistent padding, used by 4 screens), `ModalFooter` (cancel/confirm button row, used by AccountModal and OptionPickerModal), `GuardModal` (non-destructive "can't delete all" confirmation, used by AccountsScreen and CategoriesScreen). Refactored 5 screens (Accounts, Categories, Tags, Comments, AllTransactions) and 2 modals (AccountModal, OptionPickerModal) to use the new components, removing ~150 lines of duplicated JSX and styles. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Refactor | DaySelector.tsx, TransactionsScreen.tsx, AllTransactionsScreen.tsx, CreateTagScreen.tsx, ModifyCategoryScreen.tsx, RegionalScreen.tsx, ColorPickerModal.tsx, PhotoViewer.tsx, PeriodPicker.tsx, TransactionForm.tsx, PersonalizationScreen.tsx
- Tier 3-5 quick wins (9 items): Deleted 4 unused styles (`loadingContainer` x2, `container`, `sectionTitle`). Memoized 3 `new Date()` calls in DaySelector via `useMemo`. Extracted inline `{ marginTop: 12 }` to `styles.tagFilter` in TransactionsScreen and AllTransactionsScreen. Fixed `ReactNode` import in RegionalScreen (moved from react-native to react). Replaced hardcoded `'#22D3EE'` fallback with `c.primary` in ColorPickerModal, added missing `c.primary` useEffect dep. Added `accessibilityLabel` to PhotoViewer close button and `accessibilityRole="checkbox"` to PeriodPicker allTime toggle. Fixed TransactionForm to use project's `RootStackParamList` type instead of raw `@react-navigation/native` import. Renamed `PERIODS` → `PERIOD_OPTIONS` in PersonalizationScreen to avoid shadowing. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Refactor | ModifyTransactionScreen.tsx, IconGrid.tsx, AccountForm.tsx, TransactionsScreen.tsx, SettingsScreen.tsx, EmptyState.tsx, IconBadge.tsx, IconColorSection.tsx, SortToggle.tsx, SettingsRow.tsx, useDeferredRefresh.ts
- Remaining tier 3-5 quick wins (3 items): Replaced direct `SafeAreaView` usage in ModifyTransactionScreen with `ScreenShell` for consistency with all other screens. Consolidated `IconName` imports from 2 paths (IconGrid re-export vs canonical constants/types) to single source in `constants/types.ts` across 8 files, removed re-export from IconGrid. Fixed `useDeferredRefresh` to `await` the async function call and catch errors with `console.error` instead of silently swallowing them. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Refactor | DataRow.tsx, TransactionDetailsScreen.tsx, photoCleanup.ts
- Item #14: Removed internal styling props (`c: ColorPalette`, `fs: (s: number) => number`) from `DataRow` component — now calls `useConfig()` and `useFontSize()` internally. Removed `ColorPalette` type import. Updated 7 `<DataRow>` usages in `TransactionDetailsScreen` to stop passing `c={c} fs={fs}`.
- Item #26: Rewrote `photoCleanup.ts` to use Drizzle ORM query builder instead of raw `getDatabase()` + `db.getAllAsync()` SQL. Uses `getDrizzle()`, `db.select().from(transactions).where(...)` with `sql` template literals for dynamic column and NULL checks. Column map (`COLUMN_MAP`) maps string column names to typed Drizzle column objects. Same error handling and file deletion logic preserved. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Feat | languages.ts, language.ts, schemas.ts, i18n/index.ts, en.ts, es.ts, ca.ts, fr.ts, de.ts, pt.ts, it.ts, RegionalScreen.tsx
- Added 4 new languages: French, German, Portuguese, Italian. Added to `LANGUAGES` constant and Zod `languageSchema`. Added `isFrench/isGerman/isPortuguese/isItalian` helpers to `utils/language.ts`. Created 4 full i18n translation files (fr.ts, de.ts, pt.ts, it.ts) with ~405 keys each. Added `lang_fr/de/pt/it` labels to all 7 i18n files. Replaced `SelectorInline` language picker with `SettingsPickerRow` combobox (same pattern as currency picker) — supports 7 languages with search and radio selection. Added emoji flags for fr (🇫🇷), de (🇩🇪), pt (🇧🇷), it (🇮🇹). Registered all 4 new languages in `i18n/index.ts`. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Fix | ModalFooter.tsx
- Changed `ModalFooter` default `destructive` from `true` to `false`. This fixes `AccountModal` and `OptionPickerModal` (languages, currencies, default accounts) showing red confirm buttons — they now correctly show blue (`c.primary`). `ConfirmationModal` usages are unaffected (they use their own inline buttons). test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Fix | fr.ts, de.ts, pt.ts, it.ts, formatters.ts, RegionalScreen.tsx, CalendarModal.tsx, SortToggle.tsx, PeriodPicker.tsx, AccountForm.tsx, CreateAccountScreen.tsx, ModifyAccountScreen.tsx, CreateCategoryScreen.tsx, ModifyCategoryScreen.tsx
- Added `Language` type annotations to `fr.ts`, `de.ts`, `pt.ts` so missing/extra keys are caught at compile time.
- Corrected French `settings_delete_data_confirm_placeholder` from English "Type DELETE here" to "Tapez DELETE ici".
- Fixed Italian `settings_import_success_message` typo "stati" (states) → "dati" (data).
- Added web flag icons (France, Germany, Portugal, Italy) to `FLAG_WEB` in `RegionalScreen` — previously fr/de/pt/it showed no flag on web.
- Fixed stale temp state in `CalendarModal` — added `useEffect` to reset `tempDate`/`tempRangeStart`/`tempRangeEnd` when the modal reopens.
- Fixed `SortToggle` — removed `stopPropagation` (a no-op in React Native) by restructuring the arrow icon as a sibling touchable, so pressing the arrow no longer also fires the sort toggle.
- Fixed `PeriodPicker` — reset `allTime`/`selecting` when the range changes (modal reopen).
- Fixed `AccountForm` — `inputStyle` no longer receives `false` (now ternary `nameDisabled ? {...} : undefined`).
- Changed `parseDbDate` to return epoch sentinel `new Date(0)` for invalid input instead of current date, preventing corrupt dates from sorting as "today".
- Added `Keyboard.dismiss()` before submit in `CreateAccountScreen`, `ModifyAccountScreen`, `CreateCategoryScreen`, `ModifyCategoryScreen` for consistency with tag/comment screens.
- test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Fix | TagSection.tsx, PhotoSection.tsx, CategoryTransferModal.tsx, BulkCategoryTransferModal.tsx, ColorPickerModal.tsx, CalendarModal.tsx, CalculatorModal.tsx
- Unified modal button colors across all modals to match the standard pattern (`ConfirmationModal`/`ModalFooter`): Cancel is now a ghost/outline button (`c.background` fill + `c.border` border + `c.text`), confirm buttons use `c.primary` with `c.background` text (destructive stays `c.red` + `WHITE`).
- `TagSection` (Add tag): Cancel changed from `c.surface` fill to ghost outline.
- `PhotoSection` (Add photo): Cancel changed from `c.surface` fill to full-width ghost outline.
- `CategoryTransferModal` / `BulkCategoryTransferModal`: Cancel changed from `c.surface`+`c.border` fill to ghost outline; confirm text `WHITE` → `c.background` (removed unused `WHITE` import in Bulk).
- `ColorPickerModal`: Cancel changed from `c.surface`+`c.border` to ghost outline; OK text `WHITE` → `c.background` (removed unused `WHITE` import).
- `CalendarModal`: Cancel changed from `c.surface` fill to ghost outline (added `borderWidth`).
- `CalculatorModal`: Cancel changed from `c.surface` fill to ghost outline; Accept text `WHITE` → `c.background`.
- Added `accessibilityRole="button"` to all cancel/confirm touchables for consistency.
- test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Fix | CalculatorModal.tsx
- Fixed calculator modal height changing while typing/calculating. The display area now has a fixed height (computed from the current font-size setting) that always reserves 2 expression lines + 1 result line with comfortable line-height (1.4), so the modal no longer grows when the expression wraps to a second line, and the error/result text is not cropped at the bottom. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Fix | DonutChart.tsx
- Rewrote donut chart segment rendering to fix tiny slices (e.g. 4€ vs 99€) drawing as distorted triangles/"weird lines". Segments are now drawn as explicit SVG arc `<Path>` elements computed from each category's percentage/angles instead of `<Circle strokeDasharray>` (which renders small dashes incorrectly). Single 100% segments fall back to a plain full circle. Same dimensions, colors, rotation and flush segment caps preserved. test:all green (typecheck + lint + 282 tests, 34 files).

[2026-08-26] Fix | formatters.ts, usePhotos.ts, TransactionDetailsScreen.tsx
- Fixed `formatDateLong` producing Spanish-style dates for fr/de/it (e.g. "3 de mars de 2024"). Now each language renders its own format: fr "3 août 2026", de "3. August 2026" (month casing preserved), it "3 agosto 2026", ca "3 d'agost de 2026" (with `d'` elision before vowel-initial months, e.g. "3 de març de 2026" otherwise); es/ca/pt keep "3 de agosto/agost/agosto de 2026" and en "August 3, 2026". Added per-language unit tests.
- Extracted duplicated photo copy-to-storage logic in `usePhotos.ts` into a shared `copyPhotoToStorage` helper (both camera take and gallery pick paths).
- Removed a redundant first `getTagsByTransactionId` DB query in `TransactionDetailsScreen.loadTags` (result was discarded; the follow-up `getTagsByTransactionIds` already returns `[]` when empty).
- Wrapped `TransactionDetailsScreen.handleDelete` in `useCallback` to avoid recreating it on every render. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-26] Refactor | usePeriodNavigation.ts, HomeScreen.tsx, AllTransactionsScreen.tsx, CalculatorModal.tsx
- Extracted the duplicated `handlePeriodChange`/`handleRangeChange` period-navigation logic (previously verbatim in `HomeScreen` and `AllTransactionsScreen`) into a new shared `usePeriodNavigation(openCalendar)` hook; screens now call the hook and keep only their local `calendarVisible` state.
- Fixed the misleading `handleButton` `useCallback` in `CalculatorModal.tsx`, which depended on `expression` but only the `equals` branch used it (recreating the handler on every keystroke). Added an `expressionRef` so the handler now has stable `[]` deps with identical behavior. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-28] Fix | PeriodPicker.tsx, CalendarModal.tsx
- Fixed custom period (start day → end day) range selection collapsing: the `useEffect` in `PeriodPicker` reset `selecting` back to `'start'` on every `tempStart`/`tempEnd` update, so after picking a start day the next tap was treated as a new start instead of the end day, collapsing the range to the last tap. Removed that effect (timing/behavior is now driven only by taps) and reset the phase to `'start'` when toggling the All checkbox; `CalendarModal` now remounts `PeriodPicker` on each open (`key={visible ? 'open' : 'closed'}`) so a fresh open always starts in the start-date phase. Verified in the browser (selected "1 Aug" → "10 Aug", applied range "from 1 Aug to 10 Aug 2026"; All toggle still resets cleanly). test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-28] Refactor | DaySelector.tsx, ErrorBoundary.tsx, it.ts, pt.ts
- `DaySelector`: renamed the `useMemo` local `const t = new Date()` to `now` so it no longer shadows the imported `t()` translator (3 references updated).
- `ErrorBoundary`: guarded the `componentDidCatch` `console.error` with `if (__DEV__)` so the caught-stack trace is only logged in development, not production.
- `it.ts`: replaced angular imperative "Ne conserva almeno una." with the natural Italian "Conservane almeno una." in `categories_bulk_delete_min_one`.
- `it.ts` / `pt.ts`: added the missing prepositions in the settings section headings — pt "FORMA ÍCONE CATEGORIA/CONTA" → "FORMA DE ÍCONE DE CATEGORIA/CONTA"; it "FORMATO MONETA" → "FORMATO VALUTA" and "FORMA ICONA CATEGORIA/CONTO" → "FORMA DELL'ICONA DELLA CATEGORIA/DEL CONTO".
- Note: audit candidate "remove `PRAGMA foreign_keys = ON;` in `sqliteWeb.ts`" was investigated and *rejected* — a test (`sqliteWebEngine.test.ts`) proves `db.export()` resets `foreign_keys` to OFF, so that line re-enables it after each persist and is required. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-28] Refactor | types.ts, calculator.ts, amountInput.ts, formatters usage, accountRepo.ts, configDefaults.ts, configRepo.ts, PersonalizationScreen.tsx, colors.ts, themes.ts, seedData.ts, TransactionDetailsScreen.tsx, DonutChart.tsx
- `MAX_AMOUNT` (999999999.99) is now the single source in `constants/types.ts`, with `MAX_AMOUNT_INTEGER_DIGITS` derived from it; `calculator.ts` (`MAX_VALUE`) and `amountInput.ts` (inline `9`) now import these instead of re-declaring the same limit.
- `TransactionsScreen` and `AllTransactionsScreen` now use the existing `formatSignedCurrency` (identical `amount >= 0` sign semantics) instead of inline `+`/`''` prefixes; `TransactionDetailsScreen` keeps its type-based sign but folded it into one expression.
- `accountRepo.ts` balance SQL now compares against `TRANSACTION_TYPES.income` instead of the raw `'income'` literal, so renaming the constant can't silently flip every balance's sign.
- Config `'null'` sentinel centralized as `CONFIG_NULL_SENTINEL` in `configDefaults.ts`; `sanitizeDefaultAccountConfig` now derives the affected DB keys from `DB_KEY_MAP` (with a validated `dbKeyFor` helper) instead of hard-coding `home_default_account_id`/`add_default_account_id`, and `configRepo.ts` + `PersonalizationScreen` reuse the sentinel.
- Runtime palette single-sourced in `constants/colors.ts` (`PRIMARY`, `RED`, `GREEN`, `AMBER`, `PINK`, `BLUE`, `ACCENT`, plus the full category palette `SKY`, `PURPLE`, `SLATE`, `FUCHSIA`, `ROSE`, `ORANGE`, `INDIGO`, `TEAL`, `PINK_DARK`, `EMERALD`, `YELLOW`, `DARK_INDIGO`, `RED_BRIGHT`, `SKY_BRIGHT`, `YELLOW_BRIGHT`, `VIOLET`, `MAGENTA`, `GREEN_BRIGHT`, `SLATE_DARK`); `QUICK_COLORS`, `darkColors` (primary/accent/green/red), and every `seedData.ts` account/category hue now reference these constants — no color literals remain in the seed. Only the immutable DB migration/schema column-default strings stay as literal snapshots.
- `TransactionDetailsScreen` reuses the already-computed `transactionDate` memo for the created-date line instead of calling `parseDbDate(transaction.date)` twice.
- `DonutChart` derives `SIZE` (160) and `CENTER = SIZE / 2` from one constant and uses them in the `<Svg>` viewBox and the `rotate(-90, cx, cy)` transform, removing the duplicated raw `160`/`80` literals. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-28] Refactor | formatters.ts, TransactionGroup.tsx, TransactionDetailsScreen.tsx
- Added `AMOUNT_SIGNS` (`positive: '+'`, `negative: '-'`) in `utils/formatters.ts` and re-used it everywhere a currency amount's sign is rendered: `formatCurrency`, `formatSignedCurrency`, `TransactionGroup` (income `+` / expense `-`) and `TransactionDetailsScreen` (expense `-` / income `+`). Removes the duplicated `'+'`/`'-'` literals (the `add`/`subtract` MathOp symbols in `constants/types.ts` are a separate concern and were left untouched). test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-28] Refactor | PersonalizationScreen.tsx
- Extracted the "Total account" picker sentinel as `HOME_TOTAL_OPTION` (`'total'`), used in the 3 spots of the home-default-account picker; it is distinct from `CONFIG_NULL_SENTINEL` (`'null'`, means "not selected" for the add-account field) so the two are not merged.
- `PERIOD_OPTIONS` now reference the shared `PERIODS.day/week/month/year` constants instead of re-declaring `'day'`/`'week'`/`'month'`/`'year'` literals.
- Note: the `seedData.ts` type strings (`'income'`/`'expense'`, 31×) and the migration CHECK constraints were intentionally left as literals — they are DB-boundary data written once at seed/migration time, consistent with the project's "immutable schema/default strings stay as snapshots" boundary. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-29] Refactor | RadioButton reuse, search dedup, category type helpers, transaction totals, badge dedup
- Reused the existing `RadioButton` component in `AccountModal.tsx` and `OptionPickerModal.tsx` instead of duplicating inline `radio`/`radioInner` styles and JSX (identical visuals: 20px, `c.textSecondary` border).
- Added `searchTerms(query)` + `matchesAllTerms(query, ...haystacks)` to a new `utils/search.ts`, and a new `useSearchFilter<T>(items, query, getHaystacks, keep?)` hook; `utils/accountSearch.ts` + `utils/transactionSearch.ts` now delegate to `matchesAllTerms`, and `TagsScreen`, `CommentsScreen`, `CategoriesScreen`, `AddCategoryScreen`, `CategoryFilterModal` use the hook/helper instead of inline tokenizer/filter logic.
- Added `categoriesOfType(categories, type)` + `countCategoriesOfType(categories, type)` to `utils/categoryUtils.ts`; migrated the ~11 inline `categories.filter(c => c.type === ...)` / `.length` sites across `CategoryFilterModal`, `AppContext`, `AddCategoryScreen`, `AllTransactionsScreen`, `CategoriesScreen`, `CreateCategoryScreen`, `useTransactionForm` (the extra-condition filter in `ModifyCategoryScreen` kept inline).
- Added `roundTo2(n)` + `netTransactionTotal(transactions)` to `utils/calculator.ts`; `TransactionsScreen` (category total) and `AllTransactionsScreen` (account balance) now compute net totals via the shared helper instead of re-implementing the sign sum.
- Added a local `NamedEntityBadge` component in `TransactionDetailsScreen.tsx` for the two near-identical account/category detail rows (same 28px badge + name layout); `PersonalizationScreen`'s option-icon nodes (24px, Option.icon ReactNode) were left as-is since their structure differs (row vs bare icon node).
- Note: R6 (`toggleTagInArray` reuse for category/tag filter toggles) was rejected earlier because `toggleTagInArray` carries UNTAGGED-exclusivity semantics specific to tag filtering. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-29] Fix | ConfirmationModal.tsx
- Fixed the Cancel button in the delete-category-with-transactions confirmation (3-button layout: Move, Delete, Cancel) looking thin/broken. Two issues: (1) the modal's `styles.button` was missing `borderWidth: 1` (with transparent default), so the Cancel's `c.border` outline never rendered — unlike the canonical ghost button in `ModalFooter`/`CategoryTransferModal`; (2) the Cancel is a direct child of the stacked column whose `flex: 1` basis of `0%` collapsed its height to the text line while the Move/Delete buttons above were 64px tall (their long label wraps to two lines in the side-by-side row), so the Cancel read as slim. Fixed by adding the visible border and by giving all three stacked buttons a uniform 56px height (`actionRow` fixed height + `stackedButton` minHeight, `numberOfLines={2}` on the wrapped labels). Verified in the browser at 375px: Move 126×56, Permanent delete 126×56, Cancel 263×56, label text centered without clipping. The plain 2-button Cancel variant also now shows the outline. test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-29] Fix | ConfirmationModal.tsx - buttons flowing outside the modal on short screens
- When a delete-with-transactions confirmation (category: Move/Delete/Cancel; account: longer 2-button message) had enough content, the modal hit `ModalShell`'s `maxHeight: '70%'` cap and the buttons kept their full height, sticking out below the rounded modal box (user report: Cancel half outside the modal on mobile).
- Fixed by wrapping the message + `children` in a `ScrollView` (flexShrink 1, flexGrow 0) so the content area compresses and scrolls instead of pushing the buttons out, with the buttons container pinned (`flexShrink: 0`) and `scrollContent` `paddingBottom: 16` for the gap the message's margin used to provide. The `ScrollView` also gets its own explicit `maxHeight` (70% of window minus modal padding, header budget and the fixed button heights): a native `ScrollView` only becomes bounded when it has a definite max height - it ignores `flexShrink` inside a parent that carries only `maxHeight`, which was the real on-device failure (the buttons were pushed below the capped modal box while web hid the same bug). Also hardened `ModalShell` itself: the percentage `maxHeight: '70%'` (reliable in CSS but flaky inside native Yoga's flex layout when the bound is a percentage) is now resolved to an explicit pixel cap via `useWindowDimensions()` (`Math.round(h * 0.7)`), giving every modal a deterministic bounded height on native and web alike. Verified in the browser with the app text size set to Large (worst case): 375x667 modal 172->496 with Cancel 416->472 inside; 375x568 modal 122->446 with Cancel 366->422 inside; cap-forcing 375x440 modal caps at exactly 308 (70%) with Cancel 294->350 inside and the message area scrolling internally (clientH 100, scrollH 116). test:all green (typecheck + lint + 283 tests, 34 files).

[2026-08-29] Fix | ConfirmationModal.tsx - structural footer pinning (Cancel pinned inside the modal box)
- The user still saw Cancel half outside the modal on their device after the ScrollView + pixel-cap fixes (re-tested including a clean build), even though the layout provably fits in web (Playwright) and native (yoga-layout WASM repro at 667/568/480 heights, 28-150 msg heights: footer always lands inside the capped card). Root cause theory: on-device the native `ScrollView` measured its content larger than the computed `maxHeight` budget, so it grew and shoved the footer out of the card - a case regular flex rules could not constrain.
- Fix: the buttons are now structurally pinned instead of participating in the column flow. The buttons container is `position: 'absolute'` pinned to the modal box (`left/right/bottom: 0`) with the modal's own `paddingHorizontal: 24` + `paddingBottom: 24` replicated inside it, so the pressable buttons sit exactly where they did before but can never leave the card: an absolutely-positioned child is anchored to the modal's bounds regardless of how tall the scroll area or message grows. To prevent content from hiding under the pinned footer, `scrollContent` now gets a dynamic `paddingBottom` clearance (footer height + 12: 124+12 for the stacked Move/Delete/Cancel, 56+12 for the 2-button variant), and `scrollMaxHeight` was simplified to `70% window - 24 padding - header budget - 4` (since the absolute footer no longer consumes flow space, the old footer-clearance subtraction was double-counting). Yoga repro confirms the absolute footer's bottom edge equals the card's bottom edge exactly in every scenario (buttons then sit 24px above the card edge via the internal padding).
- Verified in the browser at app text size Large: stacked delete-category-with-transactions at 375x667 modal 174->494 (Cancel 414->470, 24px from card bottom), 375x568 modal 124->444 (Cancel 364->420), cap-forcing 375x440 modal 92->349 (Cancel 269->325, scroll inner area); plain 2-button delete-category message at 375x440 modal 114->326 (Cancel + Permanent delete 234->302, no overlap with the message). test:all green (typecheck + lint + 283 tests, 34 files). Awaiting device confirmation - if the user still sees it, a screenshot + device model/OS/font-size is required since the case cannot be reproduced on web.

[2026-08-29] Fix | ModifyCategoryScreen.tsx, CreateCategoryScreen.tsx, AccountForm.tsx, form/formStyles.ts, form/KeyboardSpacer.tsx (-)
- User report: Modify category screen showed a big empty gap below the Save button. Cause: the form screens ended with `KeyboardSpacer`, an Android-only `<View style={{height: 200}}>` appended to the content of the `FormScrollView`, which reserved a fixed 200px band under the last control at all times (not just when the keyboard was open). Since `MainActivity` already sets `windowSoftInputMode="adjustResize"` (the window shrinks to the keyboard area and the form `ScrollView` stays scrollable, so the last field/button is always reachable), the spacer was redundant and only produced dead space at the bottom of the scroll content.
- Fix: removed the `KeyboardSpacer` usages from `ModifyCategoryScreen`, `CreateCategoryScreen` and `AccountForm` (Create/Modify category and Create/Modify account screens), deleted `form/KeyboardSpacer.tsx`, and dropped the `keyboardSpacer` style from `form/formStyles.ts`. Now the scroll content ends at the button with the regular `scrollContent` bottom padding (32); on iOS/web it renders nothing (it already was null there). test:all green (typecheck + lint + 283 tests, 34 files).

