# Programming concepts

# React Native

## React Native
**Definition:** Framework for building native mobile applications using JavaScript/TypeScript and React.
**Explanation:** Allows writing an app that runs on iOS and Android with the same codebase. Uses real native components (not WebView). Finly uses React Native with Expo to simplify development.
**Example:**
```tsx
import { View, Text } from 'react-native';
export default function Saludo() {
  return <View><Text>Hola</Text></View>;
}
```

## Expo
**Definition:** Platform and set of tools that simplifies development with React Native.
**Explanation:** Provides a preconfigured SDK, build management, OTA updates, and access to device APIs without native configurations. Finly uses Expo managed workflow.
**Example:**
```bash
npx create-expo-app@latest FinlyApp --template blank-typescript
npx expo start
```

## StyleSheet.create
**Definition:** React Native method for creating styles efficiently.
**Explanation:** Styles are defined as JavaScript objects. `create()` optimizes performance by creating styles once and reusing them. It is the alternative to traditional CSS.
**Example:**
```tsx
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  texto: { color: '#E2E8F0', fontSize: 16 },
});
```

## react-native-worklets
**Definition:** Library that runs JavaScript functions on a separate thread to avoid blocking the UI.
**Explanation:** react-native-reanimated uses it internally for smooth animations on the UI thread. Each Expo SDK version requires a specific version. If there is a mismatch, it throws the error `TurboModule method "installTurboModule" called with 1 arguments`.
**Example:**
```bash
# SDK 54 requires worklets 0.5.1
npx expo install react-native-worklets@0.5.1
```

# TypeScript

## Interfaces vs Types
**Definition:** TypeScript mechanisms for defining the shape of objects.
**Explanation:** Interfaces (`interface`) are used to define object contracts and are extensible. Types (`type`) are more flexible (unions, tuples). In Finly, interfaces are used for data models.
**Example:**
```tsx
interface Cuenta {
  id: number;
  nombre: string;
  saldo: number;
  icono: string;
}
```

## Type Re-export
**Definition:** TypeScript pattern for re-exporting types from a centralized file, maintaining a Single Source of Truth.
**Explanation:** When multiple files need the same type, it is defined in a single location and re-exported with `export type { X }`. This avoids duplicate definitions and facilitates maintenance. In Finly, `calendars/types.ts` re-exports `Periodo` from `constants/types.ts`.
**Example:**
```tsx
// constants/types.ts — original definition
export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

// calendars/types.ts — re-export
import { Periodo } from '../../constants/types';
export type { Periodo };
```

# React

## Context API
**Definition:** React system for sharing state between components without passing props manually.
**Explanation:** `createContext` creates a state container. `Provider` injects the state into the tree. `useContext` (or a custom hook like `useApp`) consumes it. Avoids "prop drilling".
**Example:**
```tsx
const AppContext = createContext<AppContextType | null>(null);
// Provider wraps the entire app
// useApp() consumes the context from any child component
```

## useState
**Definition:** React hook for adding local state to functional components.
**Explanation:** Returns a [value, setter] pair. When the state changes, the component re-renders. In Finly, it is used to control modals, active tabs, etc.
**Example:**
```tsx
const [modalVisible, setModalVisible] = useState(false);
```

## useMemo
**Definition:** React hook that memoizes the result of an expensive calculation.
**Explanation:** Only recalculates when dependencies change. In Finly, it is used to filter transactions, calculate totals, and generate active categories without recalculating on every render.
**Example:**
```tsx
const totalGastos = useMemo(() =>
  transacciones.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.cantidad, 0),
  [transacciones]
);
```

## useCallback
**Definition:** React hook that memoizes functions to avoid recreating them on every render.
**Explanation:** Similar to useMemo but for functions. Useful for passing them as props to child components and avoiding unnecessary re-renders.
**Example:**
```tsx
const handleCategoriaPress = useCallback((cat) => {
  navigation.navigate('Transactions', { categoriaId: cat.id });
}, [navigation]);
```

# Navigation

## React Navigation (Stack Navigator)
**Definition:** Navigation system that stacks screens on top of each other.
**Explanation:** Each new screen is placed on top of the previous one. The user can go back with the native button. In Finly, it is used to navigate from Home to AddTransaction or Transactions.
**Example:**
```tsx
const Stack = createNativeStackNavigator({
  screens: {
    Home: { screen: HomeScreen, options: { headerShown: false } },
    AddTransaction: { screen: AddTransactionScreen },
  },
});
```

## React Navigation (Drawer Navigator)
**Definition:** Side menu that slides from the left edge of the screen.
**Explanation:** Shows navigation options in a hidden panel. In Finly, it contains Home, and placeholders for Accounts, Categories, and Settings.
**Example:**
```tsx
const Drawer = createDrawerNavigator({
  screens: { Main: { screen: HomeStack } },
  screenOptions: { drawerStyle: { backgroundColor: '#1E293B' } },
});
```

## DrawerActions
**Definition:** Reusable actions for controlling the Drawer Navigator from any screen, even if nested inside another navigator.
**Explanation:** When a Screen is inside a Stack that is itself inside a Drawer, `navigation.openDrawer()` does not exist on the Stack's type. The solution is to dispatch the action with `navigation.dispatch(DrawerActions.openDrawer())`. This is the pattern recommended by React Navigation.
**Example:**
```tsx
import { useNavigation, DrawerActions } from '@react-navigation/native';

function MiPantalla() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <Text>Abrir menú</Text>
    </TouchableOpacity>
  );
}
```

## NativeStackNavigationProp
**Definition:** TypeScript type that defines the navigation operations available in a NativeStackNavigator.
**Explanation:** Used to type `useNavigation()` and get autocompletion for `navigation.navigate('ScreenName', params)`. Prevents compile-time errors when passing incorrect screen names or parameters.
**Example:**
```tsx
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  AddTransaction: undefined;
  Transactions: { categoriaId?: number } | undefined;
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  navigation.navigate('Transactions', { categoriaId: 1 });
}
```

## RouteProp
**Definition:** TypeScript type that defines the shape of route parameters received by a screen.
**Explanation:** Used with `useRoute()` to access navigation parameters with type safety. Eliminates the need for casts with `as`. In Finly, it is used in TransactionsScreen to receive `categoriaId` and `tipo`.
**Example:**
```tsx
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Transactions: { categoriaId?: number; tipo?: string } | undefined;
};

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const categoriaId = route.params?.categoriaId;
}
```

# SVG and Charts

## react-native-svg
**Definition:** Library for rendering SVG graphics in React Native.
**Explanation:** Allows drawing vector shapes (circles, rectangles, paths) directly in the app. Finly uses it for the donut chart (DonutChart) with `<Circle>` elements and `strokeDasharray`.
**Example:**
```tsx
import Svg, { Circle } from 'react-native-svg';
<Svg width={160} height={160}>
  <Circle cx="80" cy="80" r={60} stroke="#22D3EE" strokeWidth={15} fill="none" />
</Svg>
```

## strokeDasharray
**Definition:** SVG property that controls the dash and gap pattern on a line.
**Explanation:** Used in the DonutChart to create ring segments. Each category occupies a portion of the total circumference calculated as `(percentage / 100) * 2 * PI * radius`.
**Example:**
```tsx
<Circle
  strokeDasharray={`${longitud} ${circunferencia - longitud}`}
  strokeDashoffset={-offsetAcumulado}
/>
```

# Persistence

## SQLite (expo-sqlite)
**Definition:** Embedded relational database for React Native with native support in Expo.
**Explanation:** Stores data in a local file with a schema of tables, relationships, and SQL queries. Supports referential integrity, cascade deletes, indexes for query optimization, and versioned migrations. In Finly, it is used on mobile devices (Android/iOS) to persist users, accounts, categories, and transactions. It does not work on web because it depends on native modules and WebAssembly that the Expo bundler cannot resolve correctly.
**Example:**
```tsx
import { openDatabaseSync } from 'expo-sqlite';
const db = openDatabaseSync('Finly.db');
await db.runAsync('INSERT INTO cuentas (nombre, icono, color) VALUES (?, ?, ?)', 'Efectivo', 'wallet', '#22D3EE');
const cuentas = await db.getAllAsync('SELECT * FROM cuentas');
```

## localStorage
**Definition:** Browser API for storing key-value pairs persistently in the browser.
**Explanation:** Similar to AsyncStorage but native to the browser. Data is stored as JSON strings and persists between sessions. Has a limit of ~5-10 MB depending on the browser. In Finly, it is used as an alternative to SQLite when the app runs on web, since expo-sqlite is not available in that environment.
**Example:**
```tsx
localStorage.setItem('@Finly/cuentas', JSON.stringify(cuentas));
const raw = localStorage.getItem('@Finly/cuentas');
const cuentas = raw ? JSON.parse(raw) : [];
```

## Platform switching (SQLite / localStorage)
**Definition:** Pattern that uses React Native's `Platform.OS` to automatically select the persistence implementation based on the execution environment.
**Explanation:** Since `expo-sqlite` only works on native (Android/iOS) and `localStorage` only exists on web, an abstraction layer is created with the same interface for both implementations. An `index.ts` file exports the correct repositories using a `Platform.OS === 'web'` conditional. The rest of the app (AppContext, components) imports from `index.ts` without knowing the underlying implementation. This allows the app to work on any platform without changes to the business logic.
**Example:**
```tsx
// src/database/index.ts
import { Platform } from 'react-native';
import { cuentaRepo } from './repositories/cuentaRepo';       // SQLite
import { webCuentaRepo } from './webStorage';                  // localStorage

const isWeb = Platform.OS === 'web';
export const cuentaRepository = isWeb ? webCuentaRepo : cuentaRepo;

// AppContext.tsx — consumes the correct implementation automatically
import { cuentaRepository } from '../database';
const cuentas = await cuentaRepository.listar(usuarioId);
```

# UI Components

## FlatList
**Definition:** React Native component for efficiently rendering long lists.
**Explanation:** Only renders elements visible on screen (virtualization), which saves memory. Accepts `data`, `renderItem`, and `keyExtractor`. Used in CategoryList, AccountModal, and TransactionsScreen.
**Example:**
```tsx
<FlatList
  data={items}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => <Text>{item.nombre}</Text>}
/>
```

## Modal
**Definition:** React Native component that displays content overlaid on the current screen.
**Explanation:** Useful for dialogs, selectors, or forms without changing screens. In Finly, it is used for the account selector (AccountModal) and the date selector (CalendarModal).
**Example:**
```tsx
<Modal visible={visible} transparent animationType="slide">
  <View style={overlay}><Text>Contenido del modal</Text></View>
</Modal>
```

## TouchableOpacity
**Definition:** React Native component that reacts to touch with an opacity effect.
**Explanation:** Wraps any element to make it pressable. When pressed, it reduces its opacity. `hitSlop` expands the touch area to improve accessibility.
**Example:**
```tsx
<TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
  <Text>Pulsar</Text>
</TouchableOpacity>
```

## SafeAreaView
**Definition:** React Native component that respects the safe areas of the screen (notch, status bar, etc.).
**Explanation:** Prevents content from being hidden behind operating system elements. Used in all Finly screens.
**Example:**
```tsx
<SafeAreaView style={{ flex: 1 }}>
  <Text>Contenido seguro</Text>
</SafeAreaView>
```

## Conditional rows
**Definition:** UI pattern where a second row is only rendered if optional data exists, keeping the first row always with the same layout.
**Explanation:** When a list item has an optional field (like a note), instead of adding it as an extra column that shifts the layout, it is rendered as a second row below the main one. If the field is empty, the second row is not rendered and the first row takes up the full space. This keeps the layout consistent when there is no optional data.
**Example:**
```tsx
<View>
  {/* Main row: always visible, 3 columns */}
  <View style={styles.row}>
    <Ionicons name={icon} />
    <Text>{name}</Text>
    <Text>{balance}</Text>
  </View>
  {/* Second row: only if note exists */}
  {note ? (
    <Text style={styles.note}>{note}</Text>
  ) : null}
</View>
```

# Design Principles

## Single Source of Truth (SSOT)
**Definition:** Design principle that states that each piece of information should have a single authoritative source in the system.
**Explanation:** Prevents inconsistencies caused by duplicated data in multiple locations. When a value changes, it is only modified in one place. In Finly, types like `Periodo` are defined once in `constants/types.ts` and imported from there in all files that need them, rather than being redefined in each component.
**Example:**
```tsx
// ✅ SSOT: a single file defines the type
// constants/types.ts
export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

// components import from the single source
import { Periodo } from '../constants/types';

// ❌ Without SSOT: the same type defined in 3 different files
type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo'; // in AppContext
type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo'; // in PeriodTabs
type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo'; // in calendars/types
```

## Shared constants across screens
**Definition:** Lists of data (icons, colors, etc.) that are defined once in a `constants/` file and imported from multiple screens.
**Explanation:** When two screens use the same list of options (e.g., account icons in create and modify), the list must be defined in a single shared file. If it is duplicated, changing an icon requires modifying two files. In Finly, `constants/accountIcons.ts` contains the `ACCOUNT_ICONS` list used in both `CreateAccountScreen` and `ModifyAccountScreen`.
**Example:**
```tsx
// constants/accountIcons.ts — SSOT for account icons
export const ACCOUNT_ICONS = [
  'wallet-outline', 'cash-outline', 'card-outline',
  'business-outline', 'bank-outline', ...
] as const;

// CreateAccountScreen.tsx — imports from SSOT
import { ACCOUNT_ICONS } from '../constants/accountIcons';

// ModifyAccountScreen.tsx — same source
import { ACCOUNT_ICONS } from '../constants/accountIcons';
```

## Named Constants (Avoiding Magic Numbers)
**Definition:** Replacing hardcoded literal values with constants that have descriptive names.
**Explanation:** "Magic numbers" or "magic strings" are values that appear out of nowhere in the code, making comprehension and maintenance difficult. If the value changes, you have to search for it throughout the entire codebase. By extracting it to a named constant, its purpose becomes clear and it can be modified in a single place. In Finly, `new Date(2026, 0, 1)` was replaced with `new Date(ANIO_MINIMO, 0, 1)` where `ANIO_MINIMO` is a dynamically calculated constant.
**Example:**
```tsx
// ❌ Magic number: why 2026?
const fechaMinima = new Date(2026, 0, 1);

// ✅ Named constant: the purpose is clear
const ANIO_MINIMO = new Date().getFullYear();
const fechaMinima = new Date(ANIO_MINIMO, 0, 1);
```

## useMemo
**Definition:** React hook that memoizes the result of a calculation and only recalculates when its dependencies change.
**Explanation:** When a derived value depends on multiple states, without `useMemo` it recalculates on every render. `useMemo` stores the result and reuses it if the dependencies have not changed. It is useful for derived objects and arrays that are passed as props or used in comparisons.
**Example:**
```tsx
// ❌ Every render creates a new object → all dependent useEffects re-execute
const fechas = periodoActivo === 'periodo'
  ? fechaPersonalizada
  : calcularInicioFin(periodoActivo, fechaSeleccionada);

// ✅ Only recalculates when periodoActivo, fechaPersonalizada, or fechaSeleccionada change
const fechas = useMemo(
  () => periodoActivo === 'periodo'
    ? fechaPersonalizada
    : calcularInicioFin(periodoActivo, fechaSeleccionada),
  [periodoActivo, fechaPersonalizada, fechaSeleccionada],
);
```

## Spread Before .sort() (Avoiding Mutation)
**Definition:** Using the spread operator `[...array]` before `.sort()` to avoid mutating the original array.
**Explanation:** JavaScript's `.sort()` method **sorts the array in-place**, meaning it modifies it directly. If that array is React state, mutating its internal reference causes bugs (the component does not re-render or behaves unpredictably). By doing `[...lista].sort(...)`, a copy is created and that copy is sorted, leaving the original intact.
**Example:**
```tsx
// ❌ In-place mutation: modifies the state array directly
return lista.sort((a, b) => b.fecha - a.fecha);

// ✅ Safe copy: does not touch the original array
return [...lista].sort((a, b) => b.fecha - a.fecha);
```

## Avoiding Circular Dependencies in Types
**Definition:** When two files import each other (A imports from B, B imports from A), a circular dependency is produced that can cause runtime errors.
**Explanation:** In TypeScript, if `types.ts` imports a type from `mockData.ts` and `mockData.ts` imports another type from `types.ts`, a loop is created. The solution is to break the chain by defining the needed fields directly in the file that needs them, rather than importing them. This is especially common with derived types (`type A = B & { extra }`) where they can be rewritten inline.
**Example:**
```tsx
// ❌ types.ts imports from mockData.ts, and mockData.ts imports from types.ts → circular
import { Categoria } from '../data/mockData';
export type CategoriaConTotal = Categoria & { total: number; porcentaje: number };

// ✅ Defining the fields inline breaks the circular dependency
export type CategoriaConTotal = {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  tipo: TipoTransaccion;
  total: number;
  porcentaje: number;
};
```

## Dead Code: Identical Branches
**Definition:** Code blocks whose alternative branches produce exactly the same result, making the condition redundant.
**Explanation:** When an `if/else` returns the same thing in both branches, the condition is useless and the entire code can be simplified by removing the `if/else` and keeping only the return. This improves readability and reduces complexity.
**Example:**
```tsx
// ❌ Both branches return the same thing → the if is useless
if (inicio.getMonth() === fin.getMonth()) {
  return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
}
return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;

// ✅ Simplified: a single line
return `${dInicio} ${mAbrev(inicio.getMonth())} - ${dFin} ${mAbrev(fin.getMonth())}`;
```

## ComponentProps (Type-Safe Library Props)
**Definition:** React utility type that extracts the props of a component, allowing dynamic values from external libraries to be typed without using `as any`.
**Explanation:** When a library like `@expo/vector-icons` defines a union type for a prop (e.g., icon names), using `as any` bypasses type checking and hides errors. `ComponentProps<typeof Component>['prop']` extracts the exact type of the prop from the component definition, maintaining type safety. This is the correct way to type values that come from external data (mock data, database) but are used as props of typed components.
**Example:**
```tsx
// ❌ as any: loses all type checking
<Ionicons name={item.icono as any} size={22} color={item.color} />

// ✅ ComponentProps: type-safe against the component definition
import { ComponentProps } from 'react';
<Ionicons name={item.icono as ComponentProps<typeof Ionicons>['name']} size={22} color={item.color} />
```

## Extracting Pure Functions Outside the Component
**Definition:** Moving functions that do not depend on hooks or state out of the component body and into the file scope, so they are not recreated on every render.
**Explanation:** When a function is defined inside a React component, a new reference is created on every render. If that function is passed as a prop or used in a `useMemo`, it causes unnecessary re-renders. Pure functions (that only depend on their parameters) can be defined outside the component and receive the needed values as arguments. This makes them singletons: a single reference for the entire lifetime of the component.
**Example:**
```tsx
// ❌ Recreated on every render
function WeekPicker({ fecha, primerDia }) {
  function mismaSemana(a, b) {
    return inicioDeSemana(a, primerDia).getTime() === inicioDeSemana(b, primerDia).getTime();
  }
}

// ✅ Defined outside, stable reference
function mismaSemana(a: Date, b: Date, primerDia: 0 | 1): boolean {
  return inicioDeSemana(a, primerDia).getTime() === inicioDeSemana(b, primerDia).getTime();
}

function WeekPicker({ fecha, primerDia }) {
  // mismaSemana is called with primerDia as an argument
  const seleccionada = mismaSemana(sem.inicio, fecha, primerDia);
}
```

## Single-Pass Reduce (Avoiding Filter + Reduce)
**Definition:** Replacing multiple iterations (filter followed by reduce) with a single `reduce` that accumulates the desired result directly.
**Explanation:** The `.filter(...).reduce(...)` pattern iterates the array twice: once to filter and once to accumulate. With `.reduce()` both can be done in a single pass, reducing complexity from O(2n) to O(n). This is especially valuable when processing large arrays or when multiple metrics need to be calculated from the same array. Instead of N filters × M accounts, a single `reduce` accumulates a result map.
**Example:**
```tsx
// ❌ O(accounts × transactions): iterates transactions for each account
cuentas.map(cuenta => {
  const ingresos = transacciones
    .filter(t => t.cuentaId === cuenta.id && t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.cantidad, 0);
  const gastos = transacciones
    .filter(t => t.cuentaId === cuenta.id && t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.cantidad, 0);
  return { ...cuenta, saldo: ingresos - gastos };
});

// ✅ O(transactions): a single reduce accumulates balances by accountId
const saldos = transacciones.reduce((acc, t) => {
  acc[t.cuentaId] = (acc[t.cuentaId] ?? 0) + (t.tipo === 'ingreso' ? t.cantidad : -t.cantidad);
  return acc;
}, {});
cuentas.map(cuenta => ({ ...cuenta, saldo: saldos[cuenta.id] ?? 0 }));
```

# SQL and Database

## Date Formats and SQLite String Comparison
**Definition:** SQLite stores and compares dates as strings, so the string format directly affects the result of `>=` / `<=` comparisons.
**Explanation:** In Finly, dates are stored in the format `"YYYY-MM-DD HH:MM:SS"` (space as separator, local time). When dates are passed as SQL parameters, the format must match exactly. `Date.toISOString()` produces ISO 8601 format (`"2026-07-15T00:00:00.000Z"`) with `T` as the separator and UTC timezone. Since SQLite performs lexicographic string comparison, the `T` character (ASCII 84) is greater than the space (ASCII 32), making `"2026-07-15 10:30:00" >= "2026-07-15T00:00:00.000Z"` always `false`, incorrectly excluding all transactions. The solution is to use a consistent format (`YYYY-MM-DD HH:MM:SS`) for both storage and queries.
**Example:**
```tsx
// ❌ ISO format breaks string comparison in SQLite
const startDate = start.toISOString(); // "2026-07-15T00:00:00.000Z"
await db.getAllAsync('SELECT * FROM transactions WHERE date >= ?', startDate);
// "2026-07-15 10:30:00" >= "2026-07-15T00:00:00.000Z" → false (T > space)

// ✅ Local format consistent with storage
function formatDateForDB(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}
const startDate = formatDateForDB(start); // "2026-07-15 00:00:00"
await db.getAllAsync('SELECT * FROM transactions WHERE date >= ?', startDate);
// "2026-07-15 10:30:00" >= "2026-07-15 00:00:00" → true ✓
```

## PRAGMA user_version
**Definition:** Integer metadata that SQLite stores in the database header to control which migrations have been executed.
**Explanation:** Used as a schema version counter. Each migration checks if `user_version` is less than its number, runs the necessary SQL changes, and then increments the value with `PRAGMA user_version = N`. This way, the app knows at each startup which migrations are missing without needing additional control tables. In Finly, the schema goes from version 0 → 1 (tables), 1→2 (seed), 2→3 (configuration), 3→4 (new categories).
**Example:**
```tsx
let { user_version: v } = await db.getFirstAsync('PRAGMA user_version');
if (v < 1) { await migrate001(db); v = 1; }
if (v < 2) { await seed002(db); v = 2; }
await db.execAsync(`PRAGMA user_version = ${v}`);
```

## INSERT OR IGNORE
**Definition:** INSERT variant that silently skips insertion if the row violates a duplicate key constraint (PRIMARY KEY or UNIQUE).
**Explanation:** Very useful in seeds and migrations so the app can run the same initialization script without failures if the data already exists. The problem is that it does not update existing records: if you changed a value between versions (e.g., an icon), INSERT OR IGNORE will not overwrite the old one. In that case, a separate UPDATE is needed.
**Example:**
```tsx
// Inserts the category only if id=10 does not exist yet
await db.runAsync(
  'INSERT OR IGNORE INTO categorias (id, nombre, icono) VALUES (?, ?, ?)',
  10, 'Videojuego', 'game-controller-outline'
);
// If id=10 already exists, it does nothing — the old icon stays
```

## Stale data in persistent storage
**Definition:** Situation where data saved in the database or localStorage contains values from previous code versions that are no longer valid.
**Explanation:** When a value is corrected in the source code (e.g., renaming an icon from `gamepad-outline` to `game-controller-outline`), users who already have saved data do not receive the change automatically, because persistence retains the old values. This causes runtime errors like `"'gamepad-outline' is not a valid icon name"`. The solution is to add update logic that runs at each startup, correcting the known stale values.
**Example:**
```tsx
// webStorage.ts — migrates stale icons in localStorage
function migrateWebCategories(): void {
  const categorias = getStore<Categoria>('categorias');
  const invalidIcons: Record<string, string> = {
    'gamepad-outline': 'game-controller-outline',
  };
  const updated = categorias.map(c => ({
    ...c,
    icono: invalidIcons[c.icono] ?? c.icono,
  }));
  setStore('categorias', updated);
}

// database.ts — migrates stale icons in SQLite (at each startup)
await db.runAsync(`UPDATE categorias SET icono = 'game-controller-outline' WHERE id = 10`);
```

## Data migration vs. Schema migration
**Definition:** Distinction between changes to table structure (schema) and changes to the content of existing records (data).
**Explanation:** Schema migration creates tables, adds columns or indexes, and runs once controlled by `PRAGMA user_version`. Data migration corrects or updates existing records and must run at every startup (or with its own version control), because stale data can be present in any schema version. In Finly, `seed004` is schema migration (INSERT OR IGNORE), while the UPDATE statements in `initDatabase()` are data migration that always run.
**Example:**
```tsx
// Schema migration — once (controlled by PRAGMA)
if (v < 4) { await seed004(db); }

// Data migration — every startup (correct stale values)
await db.runAsync(`UPDATE categorias SET icono = ? WHERE id = ?`, nuevoIcono, id);
```

## Difference between native (SQLite) and web (localStorage) in migrations
**Definition:** In native environments, migration runs once thanks to `PRAGMA user_version`; on web, data lives in `localStorage` and there is no automatic version control.
**Explanation:** In native, SQLite preserves `PRAGMA user_version` between sessions, so each migration runs exactly once. On web, `localStorage` is a simple dictionary with no concept of version, so the data migration logic must run every time the app starts (similar to an "integrity check"). This means web migrations must be idempotent: running them multiple times produces the same result as running them once.
**Example:**
```tsx
// webStorage.ts — runs every time the app starts on web
export async function initWebStorage(): Promise<void> {
  const usuarios = getStore<Usuario>('usuarios');
  if (usuarios.length === 0) {
    seedWebData();
  } else {
    migrateWebCategories(); // idempotent: corrects stale data
  }
}
```

# App Icons (Expo)

## App icon
**Definition:** PNG image that represents the app on the device's home screen, app menu, and system settings.
**Explanation:** Expo uses `icon.png` (1024×1024) as the main icon. During the build, Expo automatically resizes it to all the sizes each platform needs. In `app.json`, it is referenced in `expo.icon`.
**Example:**
```json
{
  "expo": {
    "icon": "./assets/icon.png"
  }
}
```

## Android adaptive icon
**Definition:** Android 8+ (API 26+) adaptive icon system that allows different shapes (circle, square, squircle) depending on the manufacturer.
**Explanation:** Composed of two 1024×1024 PNG layers: foreground (the logo image, with transparent background) and background (a solid color). Android crops them according to the device mask. There is also an optional monochrome layer (API 33+) for themed icons. In Expo, they are configured in `expo.android.adaptiveIcon`.
**Example:**
```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundColor": "#E6F4FE",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      }
    }
  }
}
```

## Splash screen
**Definition:** Loading screen that briefly appears while the app starts.
**Explanation:** Expo shows a native splash screen while loading the JavaScript bundle. It is configured with a centered PNG image and a background color. In Expo SDK 54+, it is recommended to configure it in `expo.splash` in `app.json` (not via the legacy `expo-splash-screen` plugin).
**Example:**
```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    }
  }
}
```

## Favicon
**Definition:** Icon that appears in the browser tab when opening the app on web.
**Explanation:** Expo uses `favicon.png` (48×48) for web. It is referenced in `expo.web.favicon`. Only applies to the web platform.
**Example:**
```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

# Development Tools

## ESLint
**Definition:** Static analysis tool that detects code errors and improves quality without running the app.
**Explanation:** ESLint reviews source code for problematic patterns, common errors, and style inconsistencies. In Finly, it is run with `npx eslint <file>` and configured via `eslint.config.js` (flat config). It does not replace TypeScript — they complement each other: TypeScript checks types, ESLint checks code patterns.
**Example:**
```bash
npx eslint src/screens/AccountsScreen.tsx
```

# Typography and Font Sizes

## Font scaling system (`fs()`)
**Definition:** `useFontSize()` hook that scales all app font sizes according to the user's preference (Small / Medium / Large).
**Explanation:** `fs()` takes a base size (in px at "Medium" scale) and returns the scaled value according to the configured factor: Small = ×0.85, Medium = ×1.0, Large = ×1.15. All font sizes in the app should use `fs()` instead of hardcoded values to respect accessibility. The function rounds to the nearest integer to avoid sub-pixels.
**Example:**
```tsx
const fs = useFontSize();
<Text style={{ fontSize: fs(14) }}>  // 12px / 14px / 16px depending on config
<Text style={{ fontSize: fs(22) }}>  // 19px / 22px / 25px depending on config
```

## Font size table by element
**Definition:** Reference guide for which `fs(N)` size to use for each type of UI element.
**Explanation:** Based on an audit of the complete codebase. The values are arguments to `fs()`, not final px. The actual size depends on the user's configuration.

| fs(N) | Usage | Examples |
|-------|-------|----------|
| `fs(11)` | Auxiliary text, chart labels, small grid categories | CategoryGrid names, BarChart labels, DayPicker year/month |
| `fs(12)` | Badges, metadata, secondary labels, income/expenses breakdown | AccountSelector balance, TransactionGroup date, HomeScreen breakdown |
| `fs(13)` | Period tabs, sort labels, tag chips | PeriodTabs, SortToggle, TagSection |
| `fs(14)` | **Standard size** — body text, account/category names, buttons | AccountSelector trigger, CategoryList names, modal titles, settings labels |
| `fs(15)` | Item names in lists, search input | AccountScreen names, SearchBar, TypeTabs, CommentInput |
| `fs(16)` | Screen titles, modal titles, section headers | Modal titles, TransactionsScreen header, CategoriesScreen |
| `fs(17)` | Stack navigator header titles | All `headerTitle` in AppNavigator.tsx |
| `fs(18)` | Large totals in modals, chart center text | DonutChart total, CalculatorModal display, PhotoSection |
| `fs(20)` | Calculator display (result) | CalculatorModal result |
| `fs(22)` | Screen totals (account balance, category total) | AccountsScreen total, TransactionsScreen categoryTotal, AllTransactionsScreen balance |
| `fs(24)` | Large screen titles | AddTransactionScreen title |
| `fs(28)` | Main HomeScreen total | HomeScreen total balance |

## Font weights (fontWeight)
**Definition:** Font weights used in the app, all as numeric strings.
**Explanation:** The app does not use a custom `fontFamily` — it relies on the system font. Weights are applied as strings (`'500'`, `'600'`, etc.), not as keywords (`'bold'`).

| fontWeight | Usage | Examples |
|------------|-------|----------|
| `'500'` | Normal body text, item names, labels | AccountSelector modal names, CategoryList, DaySelector |
| `'600'` | **Most used** — account/category names, buttons, trigger text, light headers | AccountSelector trigger, AccountScreen names, SortToggle, TypeTabs, AppNavigator headerTitle |
| `'700'` | Monetary totals, modal titles, active labels, selected items | AccountSelector modal balance, TransactionsScreen categoryTotal, modal titles, DayPicker selected |
| `'800'` | Main HomeScreen total (only usage) | HomeScreen totalText |

## Text style conventions

### Account names
- **HomeScreen header:** `fs(14)`, `fontWeight: '600'`, color `textSecondary`, no `textTransform: 'uppercase'`
- **AccountSelector trigger:** `fs(14)`, `fontWeight: '600'`, color `text`
- **AccountScreen list:** `fs(15)`, `fontWeight: '600'`, color `text`

### Monetary totals
- **Main total (HomeScreen):** `fs(28)`, `fontWeight: '800'`, dynamic color (green/red), with `+`/`-` prefix
- **Screen total (Accounts, Transactions):** `fs(22)`, `fontWeight: '700'`, dynamic color, with `+`/`-` prefix
- **Balance in modal:** `fs(12)`, `fontWeight: '700'`, color `textSecondary`
- **Transaction amount:** `fs(14)`, `fontWeight: '600'`, color green (income) / red (expense)

### Screen headers
- **Stack navigator headerTitle:** `fs(17)`, `fontWeight: '600'`, with icon + text
- **Sections within screen:** `fs(16)`, `fontWeight: '700'`

### Buttons
- **FAB (floating button):** `fs(28)` for the "+" symbol, `fontWeight: '600'`
- **Modal buttons:** `fs(14)`, `fontWeight: '600'`
- **Active tab:** `fs(13)` or `fs(14)`, `fontWeight: '600'`, color `primary`
