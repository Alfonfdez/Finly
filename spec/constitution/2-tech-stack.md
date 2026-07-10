# Tech Stack

## Lenguajes y herramientas
- **React Native** (Expo managed workflow) — framework principal para iOS y Android.
- **TypeScript** — tipado estático para el código.
- **React Navigation** — navegación entre pantallas (Stack Navigator + Drawer Navigator).
- **AsyncStorage** — persistencia local de datos (cuentas, categorías, transacciones).
- **react-native-svg** — gráfico de anillos (donut) personalizado.
- **@react-native-community/datetimepicker** — selector de fecha nativo.
- **React Context** — estado global de la app (cuenta activa, tipo, período).

## Estructura de archivos (proyecto React Native con Expo)

```
App/
├── app.json
├── App.tsx                    ← entrada principal
├── tsconfig.json
├── package.json
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx   ← Stack + Drawer navigator
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx     ← pantalla principal (panel)
│   │   ├── AddTransaction.tsx ← añadir gasto/ingreso
│   │   ├── SelectCategory.tsx ← seleccionar categoría
│   │   ├── CreateCategory.tsx ← crear categoría
│   │   └── Transactions.tsx   ← detalle de transacciones
│   │
│   ├── components/
│   │   ├── DonutChart.tsx     ← gráfico de anillos SVG
│   │   ├── BarChart.tsx       ← barra horizontal apilada
│   │   ├── CategoryList.tsx   ← lista de categorías
│   │   ├── CalendarPicker.tsx ← selector de fecha
│   │   ├── AccountModal.tsx   ← modal de cuentas
│   │   ├── PeriodTabs.tsx     ← tabs Día/Semana/Mes/Año/Período
│   │   └── TypeTabs.tsx       ← tabs Gastos/Ingresos
│   │
│   ├── context/
│   │   └── AppContext.tsx      ← estado global (Context + Provider)
│   │
│   ├── data/
│   │   └── mockData.ts        ← datos mock de cuentas/categorías
│   │
│   ├── storage/
│   │   └── storage.ts         ← funciones CRUD con AsyncStorage
│   │
│   └── utils/
│       └── formatters.ts      ← formatear moneda, fechas, etc.
│
└── assets/
    └── (iconos, fuentes, etc.)
```

## Diseño visual
- Paleta en modo oscuro definida en `constants/colors.ts`.
- Tokens: `fondo`, `fondoAlto`, `texto`, `textoSuave`, `primario`, `acento` (mismos que la maqueta web).
- Sin librería de UI externa; estilos con `StyleSheet.create()` de React Native.
- Tipografía: sistema nativa (SF Pro en iOS, Roboto en Android).

## Convenciones de código
- Contenido en castellano.
- Nomenclatura: camelCase para variables y funciones, PascalCase para componentes y tipos.
- Mobile-first: todos los componentes diseñados para pantalla táctil.
- Código limpio y componentes con una sola responsabilidad.
