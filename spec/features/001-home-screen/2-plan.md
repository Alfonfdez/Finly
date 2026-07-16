# Implementation plan — 001 Home screen (React Native)

## Prerequisite
Initialize Expo project:
```bash
npx create-expo-app@latest ControlGastos --template blank-typescript
cd ControlGastos
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/drawer react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-svg @react-native-community/datetimepicker
```

## Files

```
src/
├── navigation/
│   └── AppNavigator.tsx        ← Stack + Drawer navigator
│
├── screens/
│   ├── HomeScreen.tsx          ← main screen
│   ├── AddTransaction.tsx      ← add expense/income (placeholder)
│   └── TransactionsScreen.tsx  ← transaction details (placeholder)
│
├── components/
│   ├── DonutChart.tsx          ← donut chart with react-native-svg
│   ├── BarChart.tsx            ← horizontal stacked bar
│   ├── CategoryList.tsx        ← FlatList with categories
│   ├── CalendarPicker.tsx      ← date picker with DateTimePicker
│   ├── AccountModal.tsx        ← modal with account list
│   ├── PeriodTabs.tsx          ← Day/Week/Month/Year/Period tabs
│   └── TypeTabs.tsx            ← Expenses/Income tabs
│
├── context/
│   └── AppContext.tsx           ← Context + Provider (global state)
│
├── data/
│   └── mockData.ts             ← mock data (accounts, categories, periods)
│
├── storage/
│   └── storage.ts              ← CRUD with AsyncStorage
│
└── utils/
    └── formatters.ts           ← currency, date, month formatters
```

## Color configuration

Create `src/constants/colors.ts` with the dark palette:
- `fondo: '#0F172A'`
- `fondoAlto: '#1E293B'`
- `texto: '#E2E8F0'`
- `textoSuave: '#94A3B8'`
- `primario: '#22D3EE'`
- `acento: '#A78BFA'`

## Navigation

```
Drawer.Navigator
  └── Stack.Navigator
        ├── HomeScreen          ← main screen
        ├── AddTransaction      ← add expense/income
        └── TransactionsScreen  ← transaction details
```

## Component architecture

```
AppContext (Provider)
  └── AppNavigator
        └── HomeScreen
              ├── Header (active account, total, menu)
              ├── TypeTabs (Expenses/Income)
              ├── PeriodTabs + CalendarPicker
              ├── DonutChart / BarChart (toggle)
              ├── FAB "+"
              └── CategoryList (FlatList)
```

**Global state (AppContext):**
- `cuentaActiva`, `tipoActivo`, `periodoActivo`, `fechaPersonalizada`
- `categoriasActivas()` — returns categories filtered by current state
- Methods: `seleccionarCuenta()`, `cambiarTipo()`, `cambiarPeriodo()`

## Decisions

- **Expo managed workflow** to avoid complex native configurations.
- **Context API** for global state (sufficient for the app's size; no need for Redux/Zustand).
- **react-native-svg** for the donut chart (full SVG control, no heavy dependencies).
- **Initial mock data** in `mockData.ts` with the same structure as the web version.
- **AsyncStorage** for local persistence; future migration to SQLite if needed.
- **No UI library** — styles with StyleSheet.create() and the defined palette.

## Verification

Run `npx expo start` and test on emulator/physical device. Validate all acceptance criteria from `1-spec.md`.
