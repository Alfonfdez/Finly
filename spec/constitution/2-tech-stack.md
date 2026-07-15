# Tech Stack

## Lenguajes y herramientas
- **React Native** (Expo managed workflow, SDK 54) — framework principal para iOS y Android.
- **TypeScript** — tipado estático para el código.
- **React Navigation** (native-stack + drawer) — navegación entre pantallas.
- **SQLite** (expo-sqlite) — persistencia local en nativo. `DATABASE_VERSION = 6`.
- **localStorage** — persistencia local en web (mismas interfaces que SQLite).
- **@expo/vector-icons** (Ionicons) — librería de iconos usada en toda la app.
- **react-native-svg** — gráfico de anillos (donut) y barras personalizado.
- **reanimated-color-picker** — selector de colores dinámico (CreateCategoryScreen).
- **@react-native-community/datetimepicker** — selector de fecha nativo.
- **React Context** — estado global de la app (AppContext + ConfigContext).
- **react-native-reanimated** — animaciones y worklets.
- **react-native-gesture-handler** — soporte de gestos (requerido por navegación y drawer).
- **react-native-screens** — optimización de pantallas nativas.
- **react-native-safe-area-context** — gestión de safe area.

## Estructura de archivos (proyecto React Native con Expo)

```
FinlyApp/
+-- app.json
+-- App.tsx                         <- entrada principal
+-- tsconfig.json
+-- package.json
|
+-- src/
|   +-- navigation/
|   |   +-- AppNavigator.tsx        <- Stack + Drawer navigator
|   |
|   +-- screens/
|   |   +-- HomeScreen.tsx          <- pantalla principal (panel)
|   |   +-- AddTransactionScreen.tsx <- anadir gasto/ingreso
|   |   +-- AddCategoryScreen.tsx   <- seleccionar categoria
|   |   +-- CreateCategoryScreen.tsx <- crear categoria
|   |   +-- ModifyCategoryScreen.tsx <- editar categoria
|   |   +-- CategoriesScreen.tsx    <- lista de categorias
|   |   +-- TransactionsScreen.tsx  <- transacciones por categoria (014)
|   |   +-- AllTransactionsScreen.tsx <- todas las transacciones (015)
|   |   +-- TransactionDetailsScreen.tsx <- detalles de transaccion (016)
|   |   +-- ModifyTransactionScreen.tsx <- modificar transaccion (017)
|   |   +-- AccountsScreen.tsx      <- lista de cuentas
|   |   +-- CreateAccountScreen.tsx <- crear cuenta
|   |   +-- ModifyAccountScreen.tsx <- editar cuenta
|   |   +-- SettingsScreen.tsx      <- configuracion de la app
|   |
|   +-- components/
|   |   +-- AccountModal.tsx        <- modal de seleccion de cuentas
|   |   +-- AccountSelector.tsx     <- trigger de seleccion de cuenta
|   |   +-- BarChart.tsx            <- barra horizontal apilada
|   |   +-- CalculatorModal.tsx     <- calculadora emergente
|   |   +-- CalendarModal.tsx       <- modal contenedor de calendarios
|   |   +-- CalendarPicker.tsx      <- selector de fecha textual
|   |   +-- CategoryGrid.tsx        <- grid 4xN de categorias
|   |   +-- CategoryList.tsx        <- lista de desglose por categorias
|   |   +-- ColorGrid.tsx           <- grid de colores para categorias
|   |   +-- ColorPickerModal.tsx    <- modal de selector de color
|   |   +-- CommentInput.tsx        <- input de comentario con contador
|   |   +-- DaySelector.tsx         <- selector de dia (Hoy/Ayer/Dinamico)
|   |   +-- DonutChart.tsx          <- grafico de anillos SVG
|   |   +-- IconGrid.tsx            <- grid de iconos para categorias
|   |   +-- PeriodTabs.tsx          <- tabs Dia/Semana/Mes/Ano/Periodo
|   |   +-- PhotoSection.tsx        <- seccion de foto (camara/galeria)
|   |   +-- SearchBar.tsx           <- barra de busqueda reutilizable
|   |   +-- SortToggle.tsx          <- toggle de ordenacion fecha/cantidad
|   |   +-- TagSection.tsx          <- seccion de etiquetas
|   |   +-- TransactionGroup.tsx    <- grupo de transacciones por fecha
|   |   +-- TypeTabs.tsx            <- tabs Gastos/Ingresos
|   |   +-- calendars/              <- selectores de fecha
|   |       +-- DayPicker.tsx       <- rejilla mensual de dias
|   |       +-- MonthGrid.tsx       <- rejilla de 12 meses
|   |       +-- MonthNav.tsx        <- navegacion mes anterior/siguiente
|   |       +-- PeriodPicker.tsx    <- selector de rango de fechas
|   |       +-- WeekPicker.tsx      <- selector de semana
|   |       +-- YearGrid.tsx        <- rejilla de 12 anos
|   |       +-- YearNav.tsx         <- navegacion de anos
|   |       +-- types.ts            <- tipos compartidos de calendarios
|   |       +-- CalendarModal.tsx   <- modal contenedor de calendarios
|   |       +-- CalendarPicker.tsx  <- selector de fecha textual
|   |
|   +-- context/
|   |   +-- AppContext.tsx           <- estado de negocio (cuentas, categorias, transacciones)
|   |   +-- ConfigContext.tsx        <- preferencias del usuario (tema, divisa, idioma)
|   |
|   +-- database/
|   |   +-- database.ts             <- inicializacion SQLite + migraciones (DATABASE_VERSION = 6)
|   |   +-- types.ts                <- interfaces TypeScript de entidades
|   |   +-- index.ts                <- switching por plataforma (SQLite vs localStorage)
|   |   +-- webStorage.ts           <- fallback con localStorage para web
|   |   +-- migrations/
|   |   |   +-- 001_initial.ts      <- CREATE TABLE + indices
|   |   |   +-- 002_seed.ts         <- datos de prueba iniciales
|   |   |   +-- 003_config.ts       <- tabla config + valores por defecto
|   |   |   +-- 004_new_categories.ts <- categorias adicionales
|   |   |   +-- 005_english_schema.ts <- migracion a nombres en ingles
|   |   |   +-- 006_account_description.ts <- campo descripcion en cuentas
|   |   +-- repositories/
|   |       +-- userRepo.ts         <- CRUD usuarios
|   |       +-- accountRepo.ts      <- CRUD cuentas + calculo de saldo
|   |       +-- categoryRepo.ts     <- CRUD categorias
|   |       +-- transactionRepo.ts  <- CRUD transacciones + agregaciones
|   |       +-- configRepo.ts       <- persistencia de configuracion
|   |
|   +-- i18n/
|   |   +-- index.ts                <- selector de idioma + helper getCategoryName
|   |   +-- en.ts                   <- traducciones en ingles
|   |   +-- es.ts                   <- traducciones en espanol
|   |   +-- ca.ts                   <- traducciones en catalan
|   |
|   +-- hooks/
|   |   +-- useFontSize.ts          <- hook de escalado de texto
|   |   +-- useTransactionFilters.ts <- filtrado, ordenacion y agrupacion de transacciones
|   |
|   +-- constants/
|   |   +-- themes.ts               <- paletas dark + light (ColorPalette)
|   |   +-- colors.ts               <- paleta legacy (solo oscuro)
|   |   +-- types.ts                <- tipos compartidos (Period, TransactionType, RootStackParamList)
|   |   +-- platformStyles.ts       <- estilos especificos por plataforma
|   |   +-- accountIcons.ts         <- lista de iconos disponibles para cuentas
|   |
|   +-- data/
|   |   +-- mockData.ts             <- datos mock (legacy, no usado en runtime)
|   |
|   +-- utils/
|       +-- formatters.ts           <- formatear moneda, fechas, etc.
|       +-- calculator.ts           <- logica de calculadora
|
+-- assets/
    +-- (iconos, fuentes, etc.)
```

## Diseno visual
- Paletas oscura y clara definidas en `constants/themes.ts` con interfaz `ColorPalette`.
- Tokens: `background`, `surface`, `text`, `textSecondary`, `primary`, `accent`, `green`, `red`, `border`.
- Tema seleccionable desde Settings (Oscuro / Claro / Sistema) con cambio en tiempo real.
- Sin libreria de UI externa; estilos con `StyleSheet.create()` de React Native.
- Iconos: `@expo/vector-icons` (Ionicons) — se usa `Ionicons` en toda la app.
- Tipografia: sistema nativa (SF Pro en iOS, Roboto en Android) con escalado configurable.

## Tipografia

### Sistema de escalado
- Hook `useFontSize()` devuelve `fs(size)` que escala segun la preferencia del usuario.
- Factores: Pequenio = x0.85, Mediano = x1.0, Grande = x1.15.
- Todos los tamanios de fuente en la app deben usar `fs()` — nunca valores hardcoded.
- La funcion redondea al entero mas cercano para evitar sub-pixeles.

### Tamanios de fuente por elemento

| fs(N) | Uso | Ejemplos |
|-------|-----|----------|
| `fs(11)` | Textos auxiliares, labels de grafico | CategoryGrid names, BarChart labels |
| `fs(12)` | Badges, metadata, secondary labels, breakdown | AccountSelector balance, TransactionGroup date |
| `fs(13)` | Period tabs, sort labels, tag chips | PeriodTabs, SortToggle, TagSection |
| `fs(14)` | **Estandar** — cuerpo de texto, nombres, botones | AccountSelector trigger, CategoryList, modals |
| `fs(15)` | Nombres de items en listas, search input | AccountScreen names, SearchBar, TypeTabs |
| `fs(16)` | Titulos de pantalla, titulos de modal | Modal titles, TransactionsScreen header |
| `fs(17)` | Titulos de header del Stack navigator | Todos los `headerTitle` en AppNavigator.tsx |
| `fs(18)` | Totales en modales, chart center text | DonutChart total, CalculatorModal display |
| `fs(20)` | Display de calculadora (resultado) | CalculatorModal result |
| `fs(22)` | Totales de pantalla (saldo, total categoria) | AccountsScreen total, TransactionsScreen categoryTotal |
| `fs(24)` | Titulos grandes de pantalla | AddTransactionScreen title |
| `fs(28)` | Total principal del HomeScreen | HomeScreen total balance |

### Pesos de fuente

| fontWeight | Uso | Ejemplos |
|------------|-----|----------|
| `'500'` | Texto de cuerpo normal, nombres de items | AccountSelector modal names, CategoryList |
| `'600'` | **Mas usado** — nombres, botones, trigger text, headers | AccountSelector trigger, SortToggle, TypeTabs, headerTitle |
| `'700'` | Totales monetarios, titulos de modal, labels activos | Modal titles, categoryTotal, DayPicker selected |
| `'800'` | Total principal del HomeScreen (unico uso) | HomeScreen totalText |

### Convenciones de formato monetario
- Todos los totales y saldos muestran prefijo `+` (positivo) o `-` (negativo).
- Color: verde (`c.green`) para positivo, rojo (`c.red`) para negativo.
- Formato: `formatCurrency()` con maximo 2 decimales.
- Excepcion: importes individuales de transacciones usan tipo (`income` -> `+`, `expense` -> `-`) en lugar del signo del valor.

### Convenciones de nombre de cuenta
- **HomeScreen header:** `fs(14)`, `'600'`, color `textSecondary`, icono circular 24x24 + chevron-down.
- **AccountSelector trigger:** `fs(14)`, `'600'`, color `text`, icono circular 28x28 + chevron-down.
- **AccountScreen list:** `fs(15)`, `'600'`, color `text`, icono circular 44x44.

## Convenciones de codigo
- Contenido en castellano.
- Nomenclatura: camelCase para variables y funciones, PascalCase para componentes y tipos.
- Mobile-first: todos los componentes disenados para pantalla tactil.
- Codigo limpio y componentes con una sola responsabilidad.
- i18n: todas las cadenas visibles al usuario pasan por el sistema de traduccion (i18n/).
- Persistencia: switching por Platform.OS — SQLite en nativo, localStorage en web.
