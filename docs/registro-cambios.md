# Registro de Cambios — Finly

[2026-07-10] + | FinlyApp/ completo
- Inicializado proyecto Expo con TypeScript (blank-typescript).
- Instaladas dependencias: React Navigation (Stack + Drawer), AsyncStorage, react-native-svg, DateTimePicker, gestos, reanimated, vector-icons.
- Creada estructura de carpetas src/ (screens, components, context, data, storage, utils, constants, navigation).

[2026-07-10] + | src/constants/colors.ts
- Definida paleta de colores oscuros: fondo, fondoAlto, texto, textoSuave, primario, acento, verde, rojo, borde.

[2026-07-10] + | src/data/mockData.ts
- Creados datos mock: 3 cuentas, 8 categorías, 10 transacciones de ejemplo con interfaces TypeScript (Cuenta, Categoria, Transaccion).

[2026-07-10] + | src/context/AppContext.tsx
- Implementado AppContext con Provider. Estado global: cuentaActiva, tipoActivo, periodoActivo, fechaSeleccionada, fechaPersonalizada.
- Cálculos derivados: transaccionesFiltradas, categoriasActivas, cuentasConSaldo, totalIngresos, totalGastos.
- Funciones: seleccionarCuenta, cambiarTipo, cambiarPeriodo, setFechaSeleccionada, setFechaPersonalizada.

[2026-07-10] + | src/navigation/AppNavigator.tsx
- Configurado DrawerNavigator con menú lateral (Inicio, Cuentas, Categorías, Ajustes mock).
- Configurado StackNavigator anidado con HomeScreen, AddTransactionScreen, TransactionsScreen.
- Estilo oscuro en cabeceras y drawer.

[2026-07-10] + | src/screens/HomeScreen.tsx
- Maquetada pantalla principal: cabecera con menú, selector de cuenta, total, botón transacciones.
- Sección de gráficos (donut/bar toggle), tabs de tipo y período, calendario, lista de categorías, FAB "+".

[2026-07-10] + | src/screens/AddTransactionScreen.tsx
- Pantalla placeholder "Añadir Gasto/Ingreso" con título y mensaje de próximamente.

[2026-07-10] + | src/screens/TransactionsScreen.tsx
- Pantalla de listado de transacciones con FlatList, filtro por categoría desde parámetros de navegación.
- Muestra descripción, categoría, fecha, cantidad con color según tipo (ingreso/gasto).

[2026-07-10] + | src/components/AccountModal.tsx
- Modal de selección de cuenta: FlatList con icono, nombre, saldo. Overlay semitransparente.

[2026-07-10] + | src/components/BarChart.tsx
- Gráfico de barras horizontales apiladas con segmentos de colores por categoría + leyenda.

[2026-07-10] + | src/components/DonutChart.tsx
- Gráfico de anillos SVG con react-native-svg: segmentos circulares con strokeDasharray. Total centrado.

[2026-07-10] + | src/components/CategoryList.tsx
- Lista de desglose por categorías: icono, nombre, barra de progreso, total, porcentaje. Navegación al pulsar.

[2026-07-10] + | src/components/CalendarPicker.tsx
- Selector de fecha textual que muestra el período activo y abre CalendarModal al pulsar.

[2026-07-10] + | src/components/CalendarModal.tsx
- Modal contenedor para todos los selectores de fecha, con botones Ok/Cancelar.

[2026-07-10] + | src/components/TypeTabs.tsx
- Tabs Gastos/Ingresos con estilo oscuro y activo resaltado.

[2026-07-10] + | src/components/PeriodTabs.tsx
- Tabs Día/Semana/Mes/Año/Período con estilo oscuro y activo resaltado.

[2026-07-10] + | src/components/calendars/ (6 archivos)
- DayPicker: calendario tipo rejilla mensual con selección de día, sin fechas futuras.
- WeekPicker: selector de semana con navegación por año y mes.
- MonthGrid: rejilla de 12 meses para seleccionar mes.
- MonthNav: navegación mes anterior/siguiente.
- YearGrid: rejilla de 12 años para seleccionar año.
- PeriodPicker: selector de rango de fechas con opción "Todos".

[2026-07-10] + | src/storage/storage.ts
- Funciones genéricas CRUD para AsyncStorage: getDatos, guardarDatos, insertarItem, eliminarItem, actualizarItem.

[2026-07-10] + | src/utils/formatters.ts
- Utilidades: formatearMoneda, formatearPorcentaje, formatearFecha, obtenerNombreMes, inicio/ fin de semana, esFechaFutura, etc.

[2026-07-10] + | FinlyApp/eas.json
- Creada configuración de EAS Build para development builds en la nube (Android).

[2026-07-10] ~ | FinlyApp/package.json
- Degradado Expo SDK de 57 → 55 → 54 por incompatibilidad con Expo Go del móvil.
- Ajustadas dependencias a SDK 54: expo ~54.0.0, react 19.1.0, react-native 0.81.5, y resto de paquetes a versiones compatibles.
- Eliminados node_modules y package-lock.json en cada cambio.

[2026-07-10] + | FinlyApp/package.json
- Añadido expo-dev-client ~6.0.21 y eas.json para builds en nube (no usado finalmente).

[2026-07-10] ~ | FinlyApp/node_modules
- Instalado react-native-worklets@0.5.1 para corregir error TurboModule "installTurboModule" en SDK 54.

[2026-07-10] ~ | README.md
- Actualizado README para reflejar el estado real del proyecto: nombre del directorio (FinlyApp), persistencia actual (AsyncStorage), componentes existentes (CalendarModal, calendars/), y eliminadas referencias a funcionalidades no implementadas (SQLite, presupuestos, planes de ahorro).

[2026-07-10] ~ | src/components/calendars/DayPicker.tsx, MonthGrid.tsx, YearGrid.tsx
- Reestructurados selectores de calendario para corregir centrado vertical en Android: separada capa de tamaño (TouchableOpacity con aspectRatio) de capa visual (View interno con flex:1 + centrado + fondo/borde).

[2026-07-10] ~ | src/components/calendars/DayPicker.tsx
- Dividido diaInner en dos capas: diaBg (absoluteFill + borderRadius + overflow hidden para recorte visual) y diaCenter (flex:1 + centrado, sin overflow) — corrige desaparición del número 10 en Android por recorte de texto.

[2026-07-10] ~ | src/components/calendars/DayPicker.tsx
- Mejorada visualización de rango en PeriodPicker: diaRango cambia de borderRadius:0 a borderRadius:4 para esquemas más uniformes.
- Añadido !esSeleccionado a condiciones esInicio/esFin para evitar que diaRangoBorde opaque el color de selección del día inicio/fin.

[2026-07-11] + | src/constants/types.ts
- Creado archivo centralizado de tipos compartidos: Periodo, TipoTransaccion, DatoGrafico, CategoriaConTotal, RootStackParamList, HomeScreenProps, TransactionsScreenProps.
- Single Source of Truth para todos los tipos reutilizados en el proyecto.

[2026-07-11] ~ | src/constants/types.ts
- Añadidos tipos de navegación: RootStackParamList, HomeScreenProps, TransactionsScreenProps usando NativeStackScreenProps de React Navigation v7.

[2026-07-11] ~ | src/components/calendars/types.ts
- Eliminada definición local de Periodo. Ahora re-exporta desde src/constants/types.ts.

[2026-07-11] ~ | src/components/PeriodTabs.tsx
- Eliminada definición local de Periodo. Importa desde src/constants/types.ts.

[2026-07-11] ~ | src/components/TypeTabs.tsx
- Eliminada definición inline 'gasto' | 'ingreso'. Importa TipoTransaccion desde src/constants/types.ts.

[2026-07-11] ~ | src/components/BarChart.tsx
- Eliminada interfaz local Dato. Importa DatoGrafico desde src/constants/types.ts.

[2026-07-11] ~ | src/components/DonutChart.tsx
- Eliminada interfaz local Dato. Importa DatoGrafico desde src/constants/types.ts.

[2026-07-11] ~ | src/components/CategoryList.tsx
- Eliminada interfaz local CategoriaItem. Importa CategoriaConTotal desde src/constants/types.ts.

[2026-07-11] ~ | src/context/AppContext.tsx
- Importa Periodo, TipoTransaccion y CategoriaConTotal desde src/constants/types.ts (eliminadas definiciones locales duplicadas).
- Extraída función filtrar() para centralizar la lógica de filtrado de transacciones por cuentaId, tipo y rango de fechas.
- Reemplazados 5 bloques useMemo duplicados de filtrado por llamadas a filtrar().

[2026-07-11] ~ | src/navigation/AppNavigator.tsx
- Eliminado tipo any de props en CustomDrawerContent. Ahora usa DrawerContentComponentProps de @react-navigation/drawer.
- Importado RootStackParamList para consistencia de tipos de navegación.

[2026-07-11] ~ | src/screens/HomeScreen.tsx
- Eliminado tipo any de useNavigation. Ahora usa NativeStackNavigationProp<RootStackParamList, 'Home'>.
- Eliminado tipo any de parámetros en handleCategoriaPress y handlePeriodChange.
- Reemplazado navigation.openDrawer() por navigation.dispatch(DrawerActions.openDrawer()) (patrón recomendado para acceder al Drawer desde un Stack anidado).

[2026-07-11] ~ | src/screens/TransactionsScreen.tsx
- Eliminado cast as { categoriaId?: number } | undefined. Ahora usa RouteProp<RootStackParamList, 'Transactions'> con tipado seguro.
