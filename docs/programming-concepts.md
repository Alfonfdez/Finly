# Programming concepts

> **Purpose:** This document is a **learning reference** for the programming concepts used
> across the project. It explains ideas in a general, educational way. It is **not** a
> project working/tooling document — for the actual Finly setup, conventions, and tooling
> see `docs/harnesses.md`, `docs/changelog.md`, `docs/git-commands.md`, and `docs/assets.md`.

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
  text: { color: '#E2E8F0', fontSize: 16 },
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
interface Account {
  id: number;
  name: string;
  balance: number;
  icon: string;
}
```

## Type Re-export
**Definition:** TypeScript pattern for re-exporting types from a centralized file, maintaining a Single Source of Truth.
**Explanation:** When multiple files need the same type, it is defined in a single location and re-exported with `export type { X }`. This avoids duplicate definitions and facilitates maintenance. In Finly, `calendars/types.ts` re-exports `Periodo` from `constants/types.ts`.
**Example:**
```tsx
// constants/types.ts — original definition
export type Period = 'day' | 'week' | 'month' | 'year' | 'period';

// calendars/types.ts — re-export
import { Period } from '../../constants/types';
export type { Period };
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
const totalExpenses = useMemo(() =>
  transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
  [transactions]
);
```

## useCallback
**Definition:** React hook that memoizes functions to avoid recreating them on every render.
**Explanation:** Similar to useMemo but for functions. Useful for passing them as props to child components and avoiding unnecessary re-renders.
**Example:**
```tsx
const handleCategoryPress = useCallback((cat) => {
  navigation.navigate('Transactions', { categoryId: cat.id });
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
**Explanation:** Shows navigation options in a hidden panel. In Finly, it contains Home, Transactions, Accounts, Categories, Tags, and Settings.
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

function MyScreen() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <Text>Open menu</Text>
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
  Transactions: { categoryId?: number } | undefined;
};

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  navigation.navigate('Transactions', { categoryId: 1 });
}
```

## RouteProp
**Definition:** TypeScript type that defines the shape of route parameters received by a screen.
**Explanation:** Used with `useRoute()` to access navigation parameters with type safety. Eliminates the need for casts with `as`. In Finly, it is used in TransactionsScreen to receive `categoryId` and `type`.
**Example:**
```tsx
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Transactions: { categoryId?: number; type?: string } | undefined;
};

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

function TransactionsScreen() {
  const route = useRoute<TransactionsRouteProp>();
  const categoryId = route.params?.categoryId;
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
**Explanation:** Stores data in a local file with a schema of tables, relationships, and SQL queries. Supports referential integrity, cascade deletes, indexes for query optimization, and versioned migrations. In Finly, it is used on mobile devices (Android/iOS) to persist users, accounts, categories, and transactions. Web runs the same SQLite schema through sql.js (a WebAssembly build of SQLite) persisted to IndexedDB, so both platforms share the same migrations and repositories (see "IndexedDB (web SQLite)" below).
**Example:**
```tsx
import { openDatabaseSync } from 'expo-sqlite';
const db = openDatabaseSync('Finly.db');
await db.runAsync('INSERT INTO accounts (name, icon, color) VALUES (?, ?, ?)', 'Cash', 'wallet', '#22D3EE');
const accounts = await db.getAllAsync('SELECT * FROM accounts');
```

## IndexedDB (web SQLite)
**Definition:** Browser database API for storing large structured data (objects, blobs) asynchronously and persistently per origin.
**Explanation:** IndexedDB keeps the whole exported SQLite database file as a single value under the `Finly.db` store. On web the app opens the same schema with sql.js (`initSqlJs({ locateFile })`), so every query is real SQL — filtering, joins and aggregates behave identically to native. The engine writes the database bytes back once per committed transaction (never while a transaction is open), so a page reload restores exactly the committed state. IndexedDB quota (~50 MB+ per origin) is far above the old `localStorage` ceiling (~5 MB), which was the previous web backend (`src/database/webStorage.ts`, now deleted) and one of the reasons photos stayed hidden on web.
**Example:**
```ts
import { createIndexedDbStorage } from './storage/indexedDb';
const storage = createIndexedDbStorage();   // reads/writes the 'sqlite' record
const bytes = await storage.get();          // Uint8Array | null
await storage.set(exportedBytes);
```

## Platform-resolved database engine (one SQLite on both platforms)
**Definition:** Pattern that opens the same `DatabaseHandle` on every platform, delegating only the *engine* selection to the platform.
**Explanation:** Finly has a single repository layer (`src/database/repositories/*.ts`) and a single set of migrations. A factory module `src/database/engine.ts` (native) and `src/database/engine.web.ts` (web) exports an `openEngine(name)` function that returns the engine: native opens `expo-sqlite` synchronously, web loads the sql.js WASM engine bound to IndexedDB storage. `src/database/database.ts` calls `openEngine` and runs the same `PRAGMA user_version` migrations on either handle. The rest of the app (AppContext, components) imports the repositories from `src/database/index.ts` without knowing which engine backs them.
**Example:**
```tsx
// src/database/engine.ts (native)
import { openDatabaseSync } from 'expo-sqlite';
export async function openEngine(name: string): Promise<DatabaseHandle> {
  return openDatabaseSync(name) as unknown as DatabaseHandle;
}

// src/database/engine.web.ts (web)
import { createIndexedDbStorage } from './storage/indexedDb';
import { createSqlJsDatabase } from './sqliteWeb';
export async function openEngine(_name: string): Promise<DatabaseHandle> {
  const storage = createIndexedDbStorage();
  const bytes = await storage.get();
  return createSqlJsDatabase(bytes, storage, () => sqlWasmUrl);
}

// AppContext.tsx — consumes the repository without knowing the engine
import { accountRepository } from '../database';
const accounts = await accountRepository.list(userId);
```

## Centralized platform checks
**Definition:** Centralized utility module that exports platform detection constants, avoiding repeated `Platform.OS` checks across the codebase.
**Explanation:** Instead of writing `Platform.OS === 'web'` or `Platform.OS !== 'web'` in every file, a single utility file (`src/utils/platform.ts`) exports named constants (`isWeb`, `isNative`, `isIOS`, `isAndroid`). All files import from this utility, making the code more readable and maintainable. If the platform detection logic ever changes, it only needs to be updated in one place.
**Example:**
```tsx
// src/utils/platform.ts
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isNative = Platform.OS !== 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Usage in any screen
import { isNative } from '../utils/platform';
{config.addShowPhoto && isNative && <PhotoSection />}
```

## Centralized language checks
**Definition:** Centralized utility module that exports language type and helper functions, avoiding repeated string comparisons across the codebase.
**Explanation:** Instead of writing `language === 'ca'` or `language === 'es'` in every file, a single utility file (`src/utils/language.ts`) exports the `Language` type and helper functions (`isSpanish()`, `isEnglish()`, `isCatalan()`). All files import from this utility, ensuring consistency and making language-related changes easier. The type definition is also reused by ConfigContext, i18n, and formatters.
**Example:**
```tsx
// src/utils/language.ts
export type Language = 'es' | 'en' | 'ca';
export const LANGUAGES: Language[] = ['en', 'es', 'ca'];
export const isSpanish = (lang: Language) => lang === 'es';
export const isEnglish = (lang: Language) => lang === 'en';
export const isCatalan = (lang: Language) => lang === 'ca';

// Usage in any screen
import { isCatalan } from '../utils/language';
if (isCatalan(language)) {
  return <SenyeraIcon size={size} />;
}
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
  renderItem={({ item }) => <Text>{item.name}</Text>}
/>
```

## Modal
**Definition:** React Native component that displays content overlaid on the current screen.
**Explanation:** Useful for dialogs, selectors, or forms without changing screens. In Finly, it is used for the account selector (AccountModal) and the date selector (CalendarModal).
**Example:**
```tsx
<Modal visible={visible} transparent animationType="slide">
  <View style={overlay}><Text>Modal content</Text></View>
</Modal>
```

## TouchableOpacity
**Definition:** React Native component that reacts to touch with an opacity effect.
**Explanation:** Wraps any element to make it pressable. When pressed, it reduces its opacity. `hitSlop` expands the touch area to improve accessibility.
**Example:**
```tsx
<TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
  <Text>Press</Text>
</TouchableOpacity>
```

## SafeAreaView
**Definition:** React Native component that respects the safe areas of the screen (notch, status bar, etc.).
**Explanation:** Prevents content from being hidden behind operating system elements. Used in all Finly screens.
**Example:**
```tsx
<SafeAreaView style={{ flex: 1 }}>
  <Text>Safe content</Text>
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
export type Period = 'day' | 'week' | 'month' | 'year' | 'period';

// components import from the single source
import { Period } from '../constants/types';

// ❌ Without SSOT: the same type defined in 3 different files
type Period = 'day' | 'week' | 'month' | 'year' | 'period'; // in AppContext
type Period = 'day' | 'week' | 'month' | 'year' | 'period'; // in PeriodTabs
type Period = 'day' | 'week' | 'month' | 'year' | 'period'; // in calendars/types
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
**Explanation:** "Magic numbers" or "magic strings" are values that appear out of nowhere in the code, making comprehension and maintenance difficult. If the value changes, you have to search for it throughout the entire codebase. By extracting it to a named constant, its purpose becomes clear and it can be modified in a single place. In Finly, `new Date(2026, 0, 1)` was replaced with `new Date(MIN_YEAR, 0, 1)` where `MIN_YEAR` is a dynamically calculated constant.
**Example:**
```tsx
// ❌ Magic number: why 2026?
const minDate = new Date(2026, 0, 1);

// ✅ Named constant: the purpose is clear
const MIN_YEAR = new Date().getFullYear();
const minDate = new Date(MIN_YEAR, 0, 1);
```

## useMemo
**Definition:** React hook that memoizes the result of a calculation and only recalculates when its dependencies change.
**Explanation:** When a derived value depends on multiple states, without `useMemo` it recalculates on every render. `useMemo` stores the result and reuses it if the dependencies have not changed. It is useful for derived objects and arrays that are passed as props or used in comparisons.
**Example:**
```tsx
// ❌ Every render creates a new object → all dependent useEffects re-execute
const dates = activePeriod === 'period'
  ? customDate
  : calculateStartEnd(activePeriod, selectedDate);

// ✅ Only recalculates when activePeriod, customDate, or selectedDate change
const dates = useMemo(
  () => activePeriod === 'period'
    ? customDate
    : calculateStartEnd(activePeriod, selectedDate),
  [activePeriod, customDate, selectedDate],
);
```

## Spread Before .sort() (Avoiding Mutation)
**Definition:** Using the spread operator `[...array]` before `.sort()` to avoid mutating the original array.
**Explanation:** JavaScript's `.sort()` method **sorts the array in-place**, meaning it modifies it directly. If that array is React state, mutating its internal reference causes bugs (the component does not re-render or behaves unpredictably). By doing `[...lista].sort(...)`, a copy is created and that copy is sorted, leaving the original intact.
**Example:**
```tsx
// ❌ In-place mutation: modifies the state array directly
return list.sort((a, b) => b.date - a.date);

// ✅ Safe copy: does not touch the original array
return [...list].sort((a, b) => b.date - a.date);
```

## Avoiding Circular Dependencies in Types
**Definition:** When two files import each other (A imports from B, B imports from A), a circular dependency is produced that can cause runtime errors.
**Explanation:** In TypeScript, if `types.ts` imports a type from `mockData.ts` and `mockData.ts` imports another type from `types.ts`, a loop is created. The solution is to break the chain by defining the needed fields directly in the file that needs them, rather than importing them. This is especially common with derived types (`type A = B & { extra }`) where they can be rewritten inline.
**Example:**
```tsx
// ❌ types.ts imports from mockData.ts, and mockData.ts imports from types.ts → circular
import { Category } from '../data/mockData';
export type CategoryWithTotal = Category & { total: number; percentage: number };

// ✅ Defining the fields inline breaks the circular dependency
export type CategoryWithTotal = {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  total: number;
  percentage: number;
};
```

## Dead Code: Identical Branches
**Definition:** Code blocks whose alternative branches produce exactly the same result, making the condition redundant.
**Explanation:** When an `if/else` returns the same thing in both branches, the condition is useless and the entire code can be simplified by removing the `if/else` and keeping only the return. This improves readability and reduces complexity.
**Example:**
```tsx
// ❌ Both branches return the same thing → the if is useless
if (start.getMonth() === end.getMonth()) {
  return `${startDay} ${monthAbbr(start.getMonth())} - ${endDay} ${monthAbbr(end.getMonth())}`;
}
return `${startDay} ${monthAbbr(start.getMonth())} - ${endDay} ${monthAbbr(end.getMonth())}`;

// ✅ Simplified: a single line
return `${startDay} ${monthAbbr(start.getMonth())} - ${endDay} ${monthAbbr(end.getMonth())}`;
```

## ComponentProps (Type-Safe Library Props)
**Definition:** React utility type that extracts the props of a component, allowing dynamic values from external libraries to be typed without using `as any`.
**Explanation:** When a library like `@expo/vector-icons` defines a union type for a prop (e.g., icon names), using `as any` bypasses type checking and hides errors. `ComponentProps<typeof Component>['prop']` extracts the exact type of the prop from the component definition, maintaining type safety. This is the correct way to type values that come from external data (mock data, database) but are used as props of typed components.
**Example:**
```tsx
// ❌ as any: loses all type checking
<Ionicons name={item.icon as any} size={22} color={item.color} />

// ✅ ComponentProps: type-safe against the component definition
import { ComponentProps } from 'react';
<Ionicons name={item.icon as ComponentProps<typeof Ionicons>['name']} size={22} color={item.color} />
```

## Extracting Pure Functions Outside the Component
**Definition:** Moving functions that do not depend on hooks or state out of the component body and into the file scope, so they are not recreated on every render.
**Explanation:** When a function is defined inside a React component, a new reference is created on every render. If that function is passed as a prop or used in a `useMemo`, it causes unnecessary re-renders. Pure functions (that only depend on their parameters) can be defined outside the component and receive the needed values as arguments. This makes them singletons: a single reference for the entire lifetime of the component.
**Example:**
```tsx
// ❌ Recreated on every render
function WeekPicker({ date, firstDay }) {
  function sameWeek(a, b) {
    return weekStart(a, firstDay).getTime() === weekStart(b, firstDay).getTime();
  }
}

// ✅ Defined outside, stable reference
function sameWeek(a: Date, b: Date, firstDay: 0 | 1): boolean {
  return weekStart(a, firstDay).getTime() === weekStart(b, firstDay).getTime();
}

function WeekPicker({ date, firstDay }) {
  // sameWeek is called with firstDay as an argument
  const isSelected = sameWeek(week.start, date, firstDay);
}
```

## Single-Pass Reduce (Avoiding Filter + Reduce)
**Definition:** Replacing multiple iterations (filter followed by reduce) with a single `reduce` that accumulates the desired result directly.
**Explanation:** The `.filter(...).reduce(...)` pattern iterates the array twice: once to filter and once to accumulate. With `.reduce()` both can be done in a single pass, reducing complexity from O(2n) to O(n). This is especially valuable when processing large arrays or when multiple metrics need to be calculated from the same array. Instead of N filters × M accounts, a single `reduce` accumulates a result map.
**Example:**
```tsx
// ❌ O(accounts × transactions): iterates transactions for each account
accounts.map(account => {
  const income = transactions
    .filter(t => t.accountId === account.id && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter(t => t.accountId === account.id && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  return { ...account, balance: income - expenses };
});

// ✅ O(transactions): a single reduce accumulates balances by accountId
const balances = transactions.reduce((acc, t) => {
  acc[t.accountId] = (acc[t.accountId] ?? 0) + (t.type === 'income' ? t.amount : -t.amount);
  return acc;
}, {});
accounts.map(account => ({ ...account, balance: balances[account.id] ?? 0 }));
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
**Explanation:** Used as a schema version counter. Each migration checks if `user_version` is less than its number, runs the necessary SQL changes, and then increments the value with `PRAGMA user_version = N`. This way, the app knows at each startup which migrations are missing without needing additional control tables. In Finly, the current approach uses a single initial schema (createSchema → seedData → seedConfig) with no versioned migrations — the developer resets the DB manually during development.
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
  'INSERT OR IGNORE INTO categories (id, name, icon) VALUES (?, ?, ?)',
  10, 'Videogame', 'game-controller-outline'
);
// If id=10 already exists, it does nothing — the old icon stays
```

## Stale data in persistent storage
**Definition:** Situation where data saved in the database contains values from previous code versions that are no longer valid.
**Explanation:** When a value is corrected in the source code (e.g., renaming an icon from `gamepad-outline` to `game-controller-outline`), users who already have saved data do not receive the change automatically, because persistence retains the old values. This causes runtime errors like `"'gamepad-outline' is not a valid icon name"`. The solution is to add update logic that runs at each startup, correcting the known stale values.
**Example:**
```tsx
// database.ts — corrects stale values at each startup (single backend on all platforms)
await db.runAsync(`UPDATE categories SET icon = 'game-controller-outline' WHERE id = 10`);

// or a guarded step in the versioned migration runner (runs once per version)
if (v < 4) { await seed004(db); } // INSERT OR IGNORE — idempotent
```

## Data migration vs. Schema migration
**Definition:** Distinction between changes to table structure (schema) and changes to the content of existing records (data).
**Explanation:** Schema migration creates tables, adds columns or indexes, and runs once controlled by `PRAGMA user_version`. Data migration corrects or updates existing records and must run at every startup (or with its own version control), because stale data can be present in any schema version. In Finly, `seed004` is schema migration (INSERT OR IGNORE), while the UPDATE statements in `initDatabase()` are data migration that always run.
**Example:**
```tsx
// Schema migration — once (controlled by PRAGMA)
if (v < 4) { await seed004(db); }

// Data migration — every startup (correct stale values)
await db.runAsync(`UPDATE categories SET icon = ? WHERE id = ?`, newIcon, id);
```

## Versioned migrations across platforms (single runner)
**Definition:** Because both native and web run real SQLite, migrations are versioned once with `PRAGMA user_version` on every platform.
**Explanation:** SQLite preserves `PRAGMA user_version` in the database file, so each migration step runs exactly once per database. On web the exported database bytes (including the version) are stored in IndexedDB, so the same runner behaves identically to native: `database.ts` reads the version, applies each pending step inside a transaction, and writes the new version. Data migrations that correct stale values still run at every startup regardless of version.
**Example:**
```tsx
// src/database/database.ts — one runner, any engine (expo-sqlite or sql.js)
const row = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
if (row.user_version < 1) {
  await createSchema(database);
  await database.execAsync('PRAGMA user_version = 1');
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
| `'700'` | Monetary totals, modal titles, active labels, selected items, main HomeScreen total | AccountSelector modal balance, TransactionsScreen categoryTotal, HomeScreen totalText, modal titles, DayPicker selected |

## Text style conventions

### Account names
- **HomeScreen header:** `fs(14)`, `fontWeight: '600'`, color `textSecondary`, no `textTransform: 'uppercase'`
- **AccountSelector trigger:** `fs(14)`, `fontWeight: '600'`, color `text`
- **AccountScreen list:** `fs(15)`, `fontWeight: '600'`, color `text`

### Monetary totals
- **Main total (HomeScreen):** `fs(28)`, `fontWeight: '700'`, dynamic color (green/red), with `+`/`-` prefix
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

# CI/CD

## Continuous Integration (CI)
**Definition:** The practice of merging small code changes frequently and automatically verifying every proposed change the moment it is made.
**Explanation:** CI moves the project's verification commands (tests, type-checking, linting) onto a server that runs them every time a change is pushed or a pull request is opened. It answers the question "does this change still pass everything?" without relying on each developer remembering to run the checks locally. In Finly, the CI server runs the same "done" gate used locally: `npm run test:all`. A failed pipeline marks the PR as red, so broken code cannot be merged.
**Example:**
```bash
# Local gate, now also enforced on the CI server
npm run test:all   # typecheck + lint + unit/contract tests
```

## Continuous Delivery / Deployment (CD)
**Definition:** The practice of automatically building and preparing the application for release after CI passes.
**Explanation:** CD builds on CI. Continuous Delivery means every change that passes CI can be released at any time (a build artifact such as an APK is produced automatically). Continuous Deployment goes further and automatically ships that build to users. They are a spectrum: CI → Continuous Delivery → Continuous Deployment. Finly currently implements CI only; a CD stage (producing an APK artifact) could be added later.
**Example:**
```text
CI (tests pass) → CD Delivery (build APK/IPA) → CD Deployment (ship to stores)
```

## Pipeline
**Definition:** The automated recipe that describes what a CI/CD system does, defined as a file (usually YAML) with jobs and steps.
**Explanation:** A pipeline is a sequence of jobs; each job is a batch of steps that run on the same machine, and each step is one command (e.g. checkout, install dependencies, run tests). If any step fails, the job fails and the change is flagged. In GitHub this file lives in `.github/workflows/`.
**Example:**
```yaml
jobs:
  test:
    steps:
      - checkout the code
      - install dependencies
      - run the tests
```

## GitHub Actions
**Definition:** GitHub's built-in CI/CD service that executes pipelines (workflows) in repositories hosted on GitHub.
**Explanation:** A workflow is a YAML file under `.github/workflows/`. Key vocabulary:
- **Trigger (`on:`)** — when the workflow runs: on push, on pull request, on a schedule, or on specific branches.
- **Job** — a group of steps that run together on one machine.
- **Runner** — the machine that executes a job (GitHub's hosted Ubuntu/macOS/Windows runners, or self-hosted).
- **Step** — a single command or action within a job.
- **Cache** — reused files (e.g. `node_modules`) between runs so dependency installs are fast.
- **Artifact** — a file produced by a run and saved for download (e.g. a test report or an APK).
- **Concurrency** — a setting that cancels superseded runs when a new commit is pushed to the same branch, saving runner minutes.
- **Status check** — the green/red result attached to a commit or PR.

**Example:**
```yaml
on:
  pull_request:
    branches: [develop, main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci
      - run: npm run test:all
```

## Status checks and branch protection
**Definition:** A GitHub feature that blocks merging until the required checks pass.
**Explanation:** A "required status check" makes a specific CI check a condition for merging a pull request. Two practical rules: the check must be enabled only after the workflow has run at least once (GitHub cannot require a check it has never seen), and enabling it is a manual step in the repository settings (Branches → "Require status checks to pass"), not part of the workflow file itself. Once enabled, a red pipeline physically prevents the merge.
**Example:**
```text
PR opened → CI check runs → green ✓ (mergeable) or red ✗ (blocked)
```



# Databases / ORM

## Drizzle ORM
**Definition:** Lightweight, TypeScript-first SQL query builder and ORM.
**Explanation:** Drizzle lets you write typed, composable database queries in TypeScript instead of raw SQL strings. You declare tables once in a schema module and then use `db.select().from(table)`, `db.insert(table).values(...)`, `db.update(table).set(...)` and `db.delete(table)`. Finly uses it as a query builder only: migrations stay on `PRAGMA user_version`, runtime validation stays on Zod, and there is no `drizzle-kit`/codegen. Drizzle runs on both native and web because Finly plugs in its own driver adapter (see 'sqlite-proxy adapter').
**Example:**
```ts
const rows = await db
  .select()
  .from(accounts)
  .where(eq(accounts.user_id, userId))
  .orderBy(sql`is_total DESC, name COLLATE NOCASE`)
  .all();
```

## sqlite-proxy adapter
**Definition:** A Drizzle driver that executes every query through a custom callback instead of a specific database client.
**Explanation:** The callback receives `(sql, params, method)` where `method` is `'run' | 'get' | 'all' | 'values'` and must return `{ rows }`. Drizzle expects **positional arrays** (it maps result columns by index, `row[columnIndex]`), not keyed objects. Finly's adapter (`src/database/drizzle/proxy.ts`) forwards the SQL to its shared `DatabaseHandle` (expo-sqlite on native, sql.js on web) and converts each result to positional rows. A `'get'` with no row must return `{ rows: null }`. Writes must go through `'run'`: on web, `'all'`/`'get'`/`'values'` read via `getAllAsync` and never persist, while `'run'` routes to `runAsync`, which triggers the IndexedDB write at commit.
**Example:**
```ts
if (method === 'run') {
  const result = await db.runAsync(sql, ...params);
  return { rows: [{ lastInsertRowId: result.lastInsertRowId, changes: result.changes }] };
}
```
