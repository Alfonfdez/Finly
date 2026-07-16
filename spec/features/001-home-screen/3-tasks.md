# Tasks — 001 Home screen (React Native)
Execution order. Mark each task when completed.

[ ] T1 — Initialize Expo project with TypeScript. Install dependencies (React Navigation, AsyncStorage, react-native-svg, DateTimePicker). Create folder structure `src/` (screens, components, context, data, storage, utils).

[ ] T2 — Configure color palette in `src/constants/colors.ts`. Create mock data in `src/data/mockData.ts` (accounts, categories, periods) with the same structure as the web version.

[ ] T3 — Implement `AppContext.tsx` with global state: cuentaActiva, tipoActivo, periodoActivo, fechaPersonalizada, and query methods (categoriasActivas, totalCategoriasActivas, seleccionarCuenta, cambiarTipo, cambiarPeriodo).

[ ] T4 — Create `AppNavigator.tsx` with Drawer + Stack Navigator. Configure HomeScreen as the main screen.

[ ] T5 — Build HomeScreen layout: header with active account and total, menu button (Drawer), transactions button. The total must change color (green/red) based on balance.

[ ] T6 — Implement `AccountModal.tsx`: modal with FlatList of accounts (icon, name, total). When selecting an account, update the context and close the modal.

[ ] T7 — Implement `TypeTabs.tsx` (Expenses/Income) and `PeriodTabs.tsx` (Day/Week/Month/Year/Period). When changing a tab, update the context and re-render charts and list.

[ ] T8 — Implement `CalendarPicker.tsx` with native DateTimePicker. Do not allow selecting future dates. For the "Period" tab, show a range selector.

[ ] T9 — Implement `DonutChart.tsx` with react-native-svg (circles with strokeDasharray). Implement `BarChart.tsx` (horizontal stacked bars with View). Toggle between both on tap.

[ ] T10 — Implement `CategoryList.tsx` with FlatList: SVG icon, name, percentage, total. When tapping a category, navigate to TransactionsScreen with filter.

[ ] T11 — Add FAB "+" (floating TouchableOpacity) that navigates to AddTransaction. Add transactions button in the header that navigates to TransactionsScreen.

[ ] T12 — Implement `storage.ts` with CRUD functions for AsyncStorage (getCuentas, saveTransaccion, getTransacciones, etc.). Connect with the context.

[ ] T13 — Verification: `npx expo start` and test on iOS/Android emulator. Validate all acceptance criteria from `1-spec.md`.
