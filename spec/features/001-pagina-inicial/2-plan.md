# Plan de implementación — 001 Página principal (React Native)

## Requisito previo
Inicializar proyecto Expo:
```bash
npx create-expo-app@latest ControlGastos --template blank-typescript
cd ControlGastos
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/drawer react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage react-native-svg @react-native-community/datetimepicker
```

## Archivos

```
src/
├── navigation/
│   └── AppNavigator.tsx        ← Stack + Drawer navigator
│
├── screens/
│   ├── HomeScreen.tsx          ← pantalla principal
│   ├── AddTransaction.tsx      ← añadir gasto/ingreso (placeholder)
│   └── TransactionsScreen.tsx  ← detalle transacciones (placeholder)
│
├── components/
│   ├── DonutChart.tsx          ← gráfico anillos con react-native-svg
│   ├── BarChart.tsx            ← barra horizontal apilada
│   ├── CategoryList.tsx        ← FlatList con categorías
│   ├── CalendarPicker.tsx      ← selector fecha con DateTimePicker
│   ├── AccountModal.tsx        ← Modal con lista de cuentas
│   ├── PeriodTabs.tsx          ← tabs Día/Semana/Mes/Año/Período
│   └── TypeTabs.tsx            ← tabs Gastos/Ingresos
│
├── context/
│   └── AppContext.tsx           ← Context + Provider (estado global)
│
├── data/
│   └── mockData.ts             ← datos mock (cuentas, categorías, períodos)
│
├── storage/
│   └── storage.ts              ← CRUD con AsyncStorage
│
└── utils/
    └── formatters.ts           ← formato moneda, fechas, meses
```

## Configuración de colores

Crear `src/constants/colors.ts` con la paleta oscura:
- `fondo: '#0F172A'`
- `fondoAlto: '#1E293B'`
- `texto: '#E2E8F0'`
- `textoSuave: '#94A3B8'`
- `primario: '#22D3EE'`
- `acento: '#A78BFA'`

## Navegación

```
Drawer.Navigator
  └── Stack.Navigator
        ├── HomeScreen          ← pantalla principal
        ├── AddTransaction      ← añadir gasto/ingreso
        └── TransactionsScreen  ← detalle transacciones
```

## Arquitectura de componentes

```
AppContext (Provider)
  └── AppNavigator
        └── HomeScreen
              ├── Header (cuenta activa, total, menú)
              ├── TypeTabs (Gastos/Ingresos)
              ├── PeriodTabs + CalendarPicker
              ├── DonutChart / BarChart (toggle)
              ├── FAB "+"
              └── CategoryList (FlatList)
```

**Estado global (AppContext):**
- `cuentaActiva`, `tipoActivo`, `periodoActivo`, `fechaPersonalizada`
- `categoriasActivas()` — devuelve categorías filtradas por estado actual
- Funciones: `seleccionarCuenta()`, `cambiarTipo()`, `cambiarPeriodo()`

## Decisiones

- **Expo managed workflow** para evitar configuraciones nativas complejas.
- **Context API** para estado global (suficiente para el tamaño de la app; no necesita Redux/Zustand).
- **react-native-svg** para el donut chart (control total sobre el SVG, sin dependencias pesadas).
- **Mock data inicial** en `mockData.ts` con la misma estructura que la versión web.
- **AsyncStorage** para persistencia local; migración futura a SQLite si es necesario.
- **Sin librería de UI** — estilos con StyleSheet.create() y la paleta definida.

## Verificación

Ejecutar `npx expo start` y probar en emulador/dispositivo físico. Validar todos los criterios de aceptación de `1-spec.md`.
