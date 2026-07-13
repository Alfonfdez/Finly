# Tech Stack

## Lenguajes y herramientas
- **React Native** (Expo managed workflow, SDK 54) — framework principal para iOS y Android.
- **TypeScript** — tipado estático para el código.
- **React Navigation** — navegación entre pantallas (Stack Navigator + Drawer Navigator).
- **SQLite** (expo-sqlite) — persistencia local en nativo.
- **localStorage** — persistencia local en web (mismas interfaces que SQLite).
- **react-native-svg** — gráfico de anillos (donut) y barras personalizado.
- **@react-native-community/datetimepicker** — selector de fecha nativo.
- **React Context** — estado global de la app (AppContext + ConfigContext).

## Estructura de archivos (proyecto React Native con Expo)

```
FinlyApp/
├── app.json
├── App.tsx                         ← entrada principal
├── tsconfig.json
├── package.json
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.tsx        ← Stack + Drawer navigator
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx          ← pantalla principal (panel)
│   │   ├── AddTransactionScreen.tsx ← añadir gasto/ingreso
│   │   ├── AddCategoryScreen.tsx   ← seleccionar categoría
│   │   ├── TransactionsScreen.tsx  ← detalle de transacciones
│   │   └── SettingsScreen.tsx      ← configuración de la app
│   │
│   ├── components/
│   │   ├── AccountModal.tsx        ← modal de selección de cuentas
│   │   ├── BarChart.tsx            ← barra horizontal apilada
│   │   ├── DonutChart.tsx          ← gráfico de anillos SVG
│   │   ├── CategoryList.tsx        ← lista de desglose por categorías
│   │   ├── CategoryGrid.tsx        ← grid 4×N de categorías
│   │   ├── CalendarPicker.tsx      ← selector de fecha textual
│   │   ├── CalendarModal.tsx       ← modal contenedor de calendarios
│   │   ├── PeriodTabs.tsx          ← tabs Día/Semana/Mes/Año/Período
│   │   ├── TypeTabs.tsx            ← tabs Gastos/Ingresos
│   │   ├── DaySelector.tsx         ← selector de día (Hoy/Ayer/Dinámico)
│   │   ├── SearchBar.tsx           ← barra de búsqueda reutilizable
│   │   ├── TagSection.tsx          ← sección de etiquetas
│   │   ├── CommentInput.tsx        ← input de comentario con contador
│   │   ├── PhotoSection.tsx        ← sección de foto (cámara/galería)
│   │   └── calendars/              ← selectores de fecha
│   │       ├── DayPicker.tsx       ← rejilla mensual de días
│   │       ├── WeekPicker.tsx      ← selector de semana
│   │       ├── MonthGrid.tsx       ← rejilla de 12 meses
│   │       ├── MonthNav.tsx        ← navegación mes anterior/siguiente
│   │       ├── YearGrid.tsx        ← rejilla de 12 años
│   │       ├── YearNav.tsx         ← navegación de años
│   │       ├── PeriodPicker.tsx    ← selector de rango de fechas
│   │       └── types.ts            ← tipos compartidos de calendarios
│   │
│   ├── context/
│   │   ├── AppContext.tsx           ← estado de negocio (cuentas, categorías, transacciones)
│   │   └── ConfigContext.tsx        ← preferencias del usuario (tema, divisa, idioma)
│   │
│   ├── database/
│   │   ├── database.ts             ← inicialización SQLite + migraciones
│   │   ├── types.ts                ← interfaces TypeScript de entidades
│   │   ├── index.ts                ← switching por plataforma (SQLite vs localStorage)
│   │   ├── webStorage.ts           ← fallback con localStorage para web
│   │   ├── migrations/
│   │   │   ├── 001_initial.ts      ← CREATE TABLE + índices
│   │   │   ├── 002_seed.ts         ← datos de prueba iniciales
│   │   │   ├── 003_config.ts       ← tabla config + valores por defecto
│   │   │   ├── 004_new_categories.ts ← categorías adicionales
│   │   │   └── 005_english_schema.ts ← migración a nombres en inglés
│   │   └── repositories/
│   │       ├── userRepo.ts         ← CRUD usuarios
│   │       ├── accountRepo.ts      ← CRUD cuentas + cálculo de saldo
│   │       ├── categoryRepo.ts     ← CRUD categorías
│   │       ├── transactionRepo.ts  ← CRUD transacciones + agregaciones
│   │       └── configRepo.ts       ← persistencia de configuración
│   │
│   ├── i18n/
│   │   ├── index.ts                ← selector de idioma + helper getCategoryName
│   │   ├── en.ts                   ← traducciones en inglés
│   │   ├── es.ts                   ← traducciones en español
│   │   └── ca.ts                   ← traducciones en catalán
│   │
│   ├── hooks/
│   │   └── useFontSize.ts          ← hook de escalado de texto
│   │
│   ├── constants/
│   │   ├── themes.ts               ← paletas dark + light (ColorPalette)
│   │   ├── colors.ts               ← paleta legacy (solo oscuro)
│   │   ├── types.ts                ← tipos compartidos (Period, TransactionType, RootStackParamList)
│   │   └── platformStyles.ts       ← estilos específicos por plataforma
│   │
│   ├── data/
│   │   └── mockData.ts             ← datos mock (legacy, no usado en runtime)
│   │
│   └── utils/
│       └── formatters.ts           ← formatear moneda, fechas, etc.
│
└── assets/
    └── (iconos, fuentes, etc.)
```

## Diseño visual
- Paletas oscura y clara definidas en `constants/themes.ts` con interfaz `ColorPalette`.
- Tokens: `background`, `surface`, `text`, `textSecondary`, `primary`, `accent`, `green`, `red`, `border`.
- Tema seleccionable desde Settings (Oscuro / Claro / Sistema) con cambio en tiempo real.
- Sin librería de UI externa; estilos con `StyleSheet.create()` de React Native.
- Tipografía: sistema nativa (SF Pro en iOS, Roboto en Android) con escalado configurable.

## Convenciones de código
- Contenido en castellano.
- Nomenclatura: camelCase para variables y funciones, PascalCase para componentes y tipos.
- Mobile-first: todos los componentes diseñados para pantalla táctil.
- Código limpio y componentes con una sola responsabilidad.
- i18n: todas las cadenas visibles al usuario pasan por el sistema de traducción (i18n/).
- Persistencia: switching por Platform.OS — SQLite en nativo, localStorage en web.
