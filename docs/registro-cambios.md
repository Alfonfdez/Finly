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

[2026-07-11] ~ | src/context/AppContext.tsx
- Envuelto el objeto value del Provider en useMemo para evitar re-renders innecesarios en consumidores del contexto.

[2026-07-11] ~ | src/data/mockData.ts
- Reemplazados colores hardcoded (#22D3EE, #A78BFA, #34D399, #F87171) por tokens de colores (colores.primario, colores.acento, colores.verde, colores.rojo) donde coinciden con la paleta del proyecto.

[2026-07-11] ~ | src/components/calendars/PeriodPicker.tsx
- Eliminado año hardcoded 2026. Ahora usa constante ANIO_MINIMO calculada dinámicamente con new Date().getFullYear().

[2026-07-11] ~ | src/components/calendars/MonthGrid.tsx
- Corregido bug: las flechas de navegación de año llamaban a onSelect() propagando una selección de fecha no deseada.
- Añadido estado local año con useState para que la navegación por año sea interna del componente.
- Añadida función cambiarAño con useCallback para encapsular la lógica de incremento/decremento con clamping al año actual.

[2026-07-11] - | src/utils/formatters.ts
- Eliminada función formatearPorcentaje (dead code: nunca era importada por ningún componente).

[2026-07-11] ~ | src/utils/formatters.ts
- Simplificada función formatoSemana: eliminada rama if/else redundante donde ambas ramas devolvían el mismo string.

[2026-07-11] + | src/components/calendars/YearNav.tsx
- Creado componente compartido de navegación por año con flechas prev/next y clamping al año actual.
- Extraído de la lógica duplicada en WeekPicker y MonthGrid.

[2026-07-11] ~ | src/components/calendars/WeekPicker.tsx
- Reemplazada navegación de año manual por componente YearNav compartido.
- Eliminados estilos no usados (añoNav, añoTexto).

[2026-07-11] ~ | src/components/calendars/MonthGrid.tsx
- Reemplazada navegación de año manual por componente YearNav compartido.
- Eliminados estilos no usados (header, titulo).

[2026-07-11] ~ | src/data/mockData.ts
- Eliminados saldos hardcodeados (450.00, 2340.50, 5000.00) de cuentasMock. Ahora todos valen 0 ya que el saldo real se computa dinámicamente en AppContext (cuentasConSaldo).

[2026-07-11] + | src/constants/platformStyles.ts
- Creado archivo de estilos compartidos para plataformas. Contiene scrollbarFlatList con estilos de scrollbar web centralizados.

[2026-07-11] ~ | src/screens/TransactionsScreen.tsx
- Reemplazado Platform.select inline de scrollbar por import compartido scrollbarFlatList.

[2026-07-11] ~ | src/components/CategoryList.tsx
- Reemplazado Platform.select inline de scrollbar por import compartido scrollbarFlatList.

[2026-07-11] ~ | src/screens/HomeScreen.tsx
- Extraído handler handleCuentaSelect con useCallback para el callback onSelect del AccountModal, evitando recreación de función en cada render.

[2026-07-11] ~ | src/screens/TransactionsScreen.tsx
- Fix: Corregido bug de mutación in-place en .sort() usando [...lista].sort() para evitar mutar el array de estado.

[2026-07-11] ~ | src/context/AppContext.tsx
- Memoizado objeto fechas con useMemo para evitar recomputaciones innecesarias de transaccionesFiltradas, totalIngresos y totalGastos en cada render.

[2026-07-11] ~ | src/constants/types.ts
- Eliminado import circular de Categoria desde mockData.ts. CategoriaConTotal ahora define sus campos inline usando TipoTransaccion, evitando dependencia circular.

[2026-07-11] ~ | src/data/mockData.ts
- Importado y utilizado TipoTransaccion (SSOT) en interfaces Categoria y Transaccion, eliminando strings inline duplicados 'gasto' | 'ingreso'.

[2026-07-11] ~ | src/components/CalendarModal.tsx
- Eliminado código muerto: rama idéntica en textoSubtitulo('semana') que retornaba lo mismo con y sin condición.

[2026-07-11] ~ | src/components/calendars/WeekPicker.tsx
- Eliminado código muerto: rama idéntica en formatoSemanaCorto() que retornaba lo mismo con y sin condición.

[2026-07-11] ~ | src/screens/HomeScreen.tsx
- Eliminado estado local duplicado inicioRango/finRango que replicaba fechaPersonalizada del contexto. Ahora CalendarPicker recibe directamente fechaPersonalizada.inicio y fechaPersonalizada.fin.

[2026-07-11] - | src/navigation/AppNavigator.tsx
- Eliminados imports no utilizados: useNavigation y NavigationProp.

[2026-07-11] ~ | src/components/AccountModal.tsx
- Eliminado cast `as any` en Ionicons name. Ahora usa ComponentProps<typeof Ionicons>['name'] para tipado seguro.

[2026-07-11] ~ | src/components/CategoryList.tsx
- Eliminado cast `as any` en Ionicons name. Ahora usa ComponentProps<typeof Ionicons>['name'] para tipado seguro.

[2026-07-11] ~ | src/components/calendars/WeekPicker.tsx
- Extraído formatoSemanaCorto y mismaSemana fuera del cuerpo del componente para evitar recreación en cada render. mismaSemana ahora recibe primerDia como parámetro explícito.

[2026-07-11] ~ | src/context/AppContext.tsx
- Optimizado cuentasConSaldo de O(accounts × transactions) con filter+reduce a O(transactions) con un único reduce que acumula saldos por cuentaId.

[2026-07-12] + | src/database/database.ts
- Implementada inicialización de SQLite con openDatabaseSync, migraciones versionadas usando PRAGMA user_version, y función initDatabase() para arranque de la app.

[2026-07-12] + | src/database/types.ts
- Definidas interfaces TypeScript: Usuario, Cuenta, Categoria, Transaccion alineadas con el esquema SQLite.

[2026-07-12] + | src/database/migrations/001_initial.ts
- Creada migración inicial con CREATE TABLE para usuarios, cuentas, categorías, transacciones e índices (idx_cuentas_usuario, idx_categorias_tipo, idx_transacciones_cuenta, idx_transacciones_categoria, idx_transacciones_tipo).

[2026-07-12] + | src/database/migrations/002_seed.ts
- Implementada carga de datos de prueba: usuario por defecto, 3 cuentas, 8 categorías y 10 transacciones del mockData actual.

[2026-07-12] + | src/database/repositories/usuarioRepo.ts
- Implementado CRUD usuarios: insertar, obtenerPorId, actualizar.

[2026-07-12] + | src/database/repositories/cuentaRepo.ts
- Implementado CRUD cuentas: listar, insertar, actualizar, eliminar, obtenerSaldoActual.

[2026-07-12] + | src/database/repositories/categoriaRepo.ts
- Implementado CRUD categorías: listar (con filtro por tipo), insertar, actualizar, eliminar.

[2026-07-12] + | src/database/repositories/transaccionRepo.ts
- Implementado CRUD transacciones: listar con filtros (cuenta, categoría, tipo, rango de fechas), insertar, actualizar, eliminar. Agregaciones: totalPorPeriodo, desglosePorCategorias.

[2026-07-12] ~ | App.tsx
- Añadida inicialización de SQLite antes de renderizar AppProvider con estado de carga.

[2026-07-12] ~ | src/context/AppContext.tsx
- Reemplazado mockData por repositorios SQLite. Carga de datos con useEffect y estado de cargando. Adaptado a campos snake_case (cuenta_id, categoria_id).

[2026-07-12] ~ | src/screens/HomeScreen.tsx
- Añadido estado de carga con ActivityIndicator cuando cargando es true o cuentaActiva es null.

[2026-07-12] ~ | src/screens/TransactionsScreen.tsx
- Adaptado a campos snake_case: categoria_id en vez de categoriaId.

[2026-07-12] ~ | src/components/AccountModal.tsx
- Añadida interfaz CuentaConSaldo que extiende Cuenta con campo saldo para el modal.

[2026-07-12] - | src/storage/storage.ts
- Eliminado archivo de persistencia con AsyncStorage (reemplazado por SQLite).

[2026-07-12] - | src/storage/
- Eliminada carpeta storage/ completa.

[2026-07-12] ~ | FinlyApp/package.json
- Eliminada dependencia @react-native-async-storage/async-storage.
- Añadida dependencia expo-sqlite.

[2026-07-12] ~ | README.md
- Actualizada tabla de stack: AsyncStorage → SQLite (expo-sqlite).
- Actualizada estructura de proyecto: storage/ → database/ con subcarpetas migrations/ y repositories/.

[2026-07-12] ~ | docs/programming-concepts.md
- Reemplazada sección AsyncStorage por SQLite (expo-sqlite) con nueva definición y ejemplo.

[2026-07-12] ~ | src/screens/HomeScreen.tsx
- Fix: Movido check de loading después de todos los hooks (useState, useCallback) para respetar Rules of Hooks.

[2026-07-12] ~ | src/context/AppContext.tsx
- Fix: cuentasConSaldo ahora calcula saldo real de cada cuenta usando obtenerSaldoActual() en lugar de usar saldo_inicial (siempre 0).

[2026-07-12] ~ | FinlyApp/app.json
- Añadido developmentClient.silentLaunch para reducir el banner de "Checking for updates" en Expo Go.

[2026-07-12] ~ | README.md
- Añadida sección "Desarrollo por USB" con instrucciones para conexión por cable (adb reverse).
- Añadida sección "Desarrollo por Tunnel" con instrucciones para conexión por ngrok.
- Eliminada referencia a data/mockData.ts de la estructura del proyecto.

[2026-07-12] + | src/database/webStorage.ts
- Implementado almacén de datos con localStorage para compatibilidad web. Mismas interfaces que SQLite: seedWebData con datos de prueba, webUsuarioRepo, webCuentaRepo, webCategoriaRepo, webTransaccionRepo.

[2026-07-12] + | src/database/index.ts
- Creado index de repositorios con switching por Platform.OS: SQLite en nativo, localStorage en web.

[2026-07-12] ~ | App.tsx
- Añadido Platform.OS para inicializar webStorage en web y database SQLite en nativo.

[2026-07-12] ~ | src/context/AppContext.tsx
- Importa repositorios desde src/database/index.ts en lugar de archivos directos de repositories/.

[2026-07-12] ~ | docs/programming-concepts.md
- Ampliada sección SQLite con detalles de por qué no funciona en web.
- Añadida sección localStorage con definición y ejemplo.
- Añadida sección "Plataforma switching" explicando el patrón Platform.OS para alternar entre SQLite y localStorage.

[2026-07-12] ~ | src/components/DaySelector.tsx
- Simplificado DaySelector: eliminada lógica de Period mode (periodoActivo, fechaPersonalizada props). Ahora siempre usa diaSeleccionado para toda la lógica de selección.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Añadida inicialización de dia basada en Period mode: si periodoActivo es 'periodo' y el rango es 1 día, hereda fechaPersonalizada.inicio; en otro caso hereda fechaSeleccionada.

[2026-07-12] ~ | spec/features/004-pagina-transaccion/1-spec.md
- Actualizada sección "Selección de día" con lógica detallada: tabla de estados por pestaña principal, formato de fechas, inicialización y comportamiento interactivo.

[2026-07-12] ~ | spec/features/004-pagina-transaccion/3-tasks.md
- Marcadas tareas T1-T21, T24-T26 como completadas. Pendientes T22-T23 (persistencia) y T27 (verificación).

[2026-07-12] + | spec/features/005-pagina-anadir-categoria/
- Creada spec completa para la página de añadir categoría: 1-spec.md (requisitos funcionales), 2-plan.md (arquitectura y componentes), 3-tasks.md (14 tareas en 5 fases).
- Incluye: barra de búsqueda con filtrado por caracteres contenidos, grid 4×N de categorías, selección de categoría y navegación de vuelta, botón "Crear" (TODO).

[2026-07-12] + | src/i18n/en.ts, es.ts, ca.ts
- Añadidas claves i18n para AddCategoryScreen: add_cat_title, add_cat_search, add_cat_no_results, add_cat_create.

[2026-07-12] ~ | src/constants/types.ts
- Añadido AddCategory al RootStackParamList y AddCategoryScreenProps.

[2026-07-12] ~ | src/navigation/AppNavigator.tsx
- Añadido AddCategoryScreen al HomeStack con título multilingual.

[2026-07-12] + | src/components/SearchBar.tsx
- Creado componente reutilizable de barra de búsqueda con input, botón "x" y callback de cambio de texto.

[2026-07-12] ~ | src/screens/AddCategoryScreen.tsx
- Creada pantalla de añadir categoría con header, SearchBar, grid 4×N de categorías filtradas por tipo (gasto/ingreso), lógica de filtrado por caracteres contenidos (case-insensitive), estado vacío con icono de búsqueda no encontrada, y botón "Crear" en la última posición del grid (TODO).
- Añadido botón de búsqueda en el header (headerRight) usando useLayoutEffect.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Añadido useRoute para recibir categoriaId desde AddCategoryScreen.
- Conectado onAddMore de CategoryGrid para navegar a AddCategoryScreen pasando el tipo activo.

[2026-07-12] ~ | src/constants/types.ts
- Añadido parámetro tipo al AddCategory en RootStackParamList.

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Añadido símbolo de divisa (config.divisa) a la derecha del input de cantidad.

[2026-07-12] ~ | spec/features/004-pagina-transaccion/1-spec.md
- Actualizada sección "Campo de cantidad" para incluir el símbolo de divisa a la derecha del input.

[2026-07-12] ~ | src/i18n/en.ts, es.ts, ca.ts
- Añadidas claves i18n para 15 nuevas categorías: cat_travel, cat_videogame, cat_game, cat_restaurant, cat_education, cat_family, cat_shopping, cat_clothing, cat_exercise, cat_others, cat_entertainment, cat_gifts, cat_gift, cat_other, cat_interests.

[2026-07-12] ~ | src/data/mockData.ts
- Añadidas 15 nuevas categorías (12 gastos + 3 ingresos) con iconos y colores únicos.

[2026-07-12] ~ | src/i18n/index.ts
- Actualizado mapping CATEGORIA_I18N_KEYS con los 23 IDs de categorías.

[2026-07-12] ~ | src/database/migrations/002_seed.ts
- Añadidas 15 nuevas categorías al seed data de SQLite.

[2026-07-12] ~ | src/database/webStorage.ts
- Añadidas 15 nuevas categorías al seed data de localStorage (web).

[2026-07-12] ~ | src/screens/AddTransactionScreen.tsx
- Limitado grid de categorías a 7 ítems + botón "Más" (cumple spec: 4×2 = 8 posiciones).

[2026-07-12] + | src/database/migrations/004_nuevas_categorias.ts
- Creada migración 004 para añadir 15 nuevas categorías (12 gastos + 3 ingresos) con INSERT OR IGNORE.

[2026-07-12] ~ | src/database/database.ts
- Actualizada DATABASE_VERSION a 4 y añadida llamada a seed004.

[2026-07-12] ~ | src/database/webStorage.ts
- Añadida función migrateWebCategories para añadir las 15 nuevas categorías a usuarios existentes en web.

[2026-07-12] ~ | src/data/mockData.ts, src/database/migrations/002_seed.ts, src/database/migrations/004_nuevas_categorias.ts, src/database/webStorage.ts
- Cambiado icono de "Ocio" de game-controller-outline a musical-notes-outline.
- Cambiado icono de "Videojuego" de gamepad-outline a game-controller-outline.
- Cambiado icono de "Intereses" de percent-outline a wallet-outline.

[2026-07-13] ~ | src/components/ (todos los archivos .tsx)
- Renombrados identificadores TypeScript de español a inglés en todos los componentes:
  - AccountModal: CuentaConSaldo → AccountWithBalance, saldo → balance, cuentas → accounts, estilos
  - BarChart/DonutChart: datos → data, divisa → currency, separador → separator, dato → item
  - CategoryList/CategoryGrid: categorias → categories, categoria → category, estilos
  - TypeTabs: activo → active, styles.texto → styles.text
  - PeriodTabs: activo → active, periodos → periods
  - CalendarModal: periodo → period, fecha → date, onSelectFecha → onSelectDate, onSelectRango → onSelectRange, inicioRango → rangeStart, finRango → rangeEnd, fechaTemp → tempDate, textoSubtitulo → subtitleText
  - CalendarPicker: periodo → period, fecha → date, onFechaChange → onDateChange, onRangoChange → onRangeChange
  - DaySelector: hoy → today, ayer → yesterday, anteayer → dayBeforeYesterday, diaSeleccionado → selectedDate, esHoy → isToday, etc.
  - TagSection: Etiqueta → Tag, etiquetas → tags, onCrear → onCreate, busqueda → search, estilos
  - CommentInput: comentario → comment
  - PhotoSection: fotoUri → photoUri
  - SearchBar: coloresActivos → activeColors, colores (fondoAlto, borde, texto, textoSuave) → (surface, border, text, textSecondary)
  - calendars/DayPicker: rangoInicio → rangeStart, rangoFin → rangeEnd, enRango → inRange, esBordeInicio → isStartEdge, esBordeFin → isEndEdge, dia → day, esHoy → isToday, hoy → today, año → year, mes → month, estilos
  - calendars/MonthGrid: año → year, activo → isActive, hoy → today
  - calendars/MonthNav: año → year, mes → month, esUltimo → isLast, hoy → today
  - calendars/YearNav: año → year, maxAño → maxYear, puedeAvanzar → canAdvance
  - calendars/YearGrid: activo → isActive, añoInicio → startYear, hoy → today
  - calendars/WeekPicker: formatoSemanaCorto → formatShortWeek, año → year, semanas → weeks, seleccionada → isSelected, hoy → today, estilos
  - calendars/PeriodPicker: onTempRangoChange → onTempRangeChange, seleccionando → selecting, inicioTemp/finTemp → tempStart/tempEnd, hoy → today

[2026-07-13] ~ | Múltiples archivos
- Corregidos errores TypeScript en 8 archivos:
  - AccountModal: importa Account en vez de Cuenta, usa saldo/nombre/icono (SQL column names)
  - AddCategoryScreen: usa getCategoryName en vez de obtenerNombreCategoria
  - HomeScreen: usa formatCurrency en vez de formatearMoneda, usa config.firstDayOfWeek
  - TransactionsScreen: usa formatCurrency y formatDate en vez de formatearMoneda/formatearFecha
  - SettingsScreen: usa config.firstDayOfWeek y updateConfig({ firstDayOfWeek })
  - AddTransactionScreen: corrige props (selectedDate, period, date, onSelectDate, photoUri, selectedTags, onCreate) y Tag interface (name/nombre)
  - CategoryGrid: Category interface usa nombre/icono (SQL column names) para alinearse con database/types

[2026-07-13] ~ | spec/constitution/1-mission.md
- Corregido "archivo o base de datos local" → "base de datos local (SQLite)".
- Movido "plan de ahorros" a sección de alcance futuro (no implementado).
- Añadidos principios: soporte multilingüe, tema oscuro/claro, accesibilidad con escalado de texto.

[2026-07-13] ~ | spec/constitution/2-tech-stack.md
- Reemplazado AsyncStorage por SQLite (expo-sqlite) + localStorage para web.
- Actualizada estructura de archivos completa: screens, components, database, i18n, hooks, constants, context.
- Actualizada sección de diseño visual: themes.ts con paletas dark+light y tokens en inglés.
- Añadidas convenciones: i18n, persistencia con switching por plataforma.

[2026-07-13] ~ | spec/constitution/3-roadmap.md
- Marcado feature 001 como "completado".
- Añadidos features 002-006 con descripciones y estados actualizados.
- Corregida referencia AsyncStorage → SQLite en feature 001.

[2026-07-13] ~ | README.md
- Actualizada tabla de stack: añadido i18n, ConfigContext, localStorage como fallback web.
- Reescrita estructura del proyecto completa: 5 screens, 15+ components, database con 5 migraciones, i18n, hooks, constants, context.
- Añadidas funcionalidades: ajustes, tema oscuro/claro, multilingüe, escalado de texto.
- Actualizada lista de features SDD: 001-006.
- Corregido excalidraw/ → images/ en la ruta de la estructura.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Movido panel de sugerencias de comentarios por encima del input de comentario.
- Eliminado KeyboardAvoidingView y onFocus. Implementado listener Keyboard.addListener('keyboardDidShow') con scrollToEnd tras 300ms.
- Añadido scrollViewRef para controlar el scroll programáticamente.
- Añadido keyboardShouldPersistTaps="handled" al ScrollView.
- Añadido spacer de 200px al final del contenido para permitir scroll hasta el input de comentario.

[2026-07-13] ~ | src/components/CommentInput.tsx
- Revertido prop onFocus (ya no se usa, el scroll lo gestiona el padre con Keyboard listener).

[2026-07-13] ~ | FinlyApp/app.json
- Eliminado softwareKeyboardLayoutMode "resize" (causaba conflicto, no requerido).

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/1-spec.md
- Simplificada sección 4 (Símbolos): grid de 4 columnas con ~40 iconos en scroll vertical, eliminado botón "..." y referencia a catálogo de iconos.
- Simplificada sección 5 (Color): "+" abre un modal con ~20 colores en grid 4×5 en lugar de navegar a una pantalla separada.

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/2-plan.md
- Añadido componente ColorPickerModal.tsx al plan.
- Actualizado wireframe con grid de iconos dinámica y modal de colores.
- Actualizada tabla de iconos: 40 iconos en lugar de 15 + "...".
- Añadida tabla de colores expandidos (20 colores) para el modal.
- Reemplazadas claves i18n de catálogo/selector por claves de modal.

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/3-tasks.md
- Actualizada T7: IconGrid con 40 iconos, scroll vertical, sin "...".
- Actualizada T8: ColorGrid con "+" que abre modal.
- Añadida T8b: ColorPickerModal con 20 colores en grid 4×5.
- Actualizada T9: referencia a ColorPickerModal.

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/1-spec.md, 2-plan.md, 3-tasks.md
- Simplificada validación de duplicados: nombre único global (independientemente del tipo gasto/ingreso).
- Eliminada re-ejecución de validación al cambiar tipo.
- Actualizada función existsByName: eliminado parámetro type, SQL sin filtro AND type=?.

[2026-07-13] + | src/i18n/en.ts, es.ts, ca.ts
- Añadidas 17 claves i18n para CreateCategoryScreen: create_cat_title, create_cat_name, create_cat_name_placeholder, create_cat_type, create_cat_expense, create_cat_income, create_cat_symbols, create_cat_color, create_cat_add, create_cat_error_name_empty, create_cat_error_name_duplicate, create_cat_hint_icon, create_cat_hint_color, create_cat_hint_icon_color, create_cat_color_picker_title, create_cat_color_picker_cancel.

[2026-07-13] ~ | src/constants/types.ts
- Añadido CreateCategory al RootStackParamList y CreateCategoryScreenProps.

[2026-07-13] ~ | src/navigation/AppNavigator.tsx
- Importado y registrado CreateCategoryScreen en HomeStack con título multilingual.

[2026-07-13] ~ | src/screens/AddCategoryScreen.tsx
- Conectado botón "Crear" para navegar a CreateCategoryScreen pasando el tipo activo.

[2026-07-13] + | src/database/repositories/categoryRepo.ts
- Añadida función existsByName(name: string): Promise<boolean> para validación de duplicados globales.

[2026-07-13] + | src/database/webStorage.ts
- Añadida función existsByName(name: string): Promise<boolean> a webCategoryRepo para validación de duplicados en localStorage.

[2026-07-13] + | src/components/IconGrid.tsx
- Creado componente de grid de iconos: 40 iconos Ionicons en grid 4 columnas, scroll vertical, selección con borde de color primario.

[2026-07-13] + | src/components/ColorGrid.tsx
- Creado componente de grid de colores: 7 colores predefinidos en fila circular + botón "+" que abre modal.

[2026-07-13] + | src/components/ColorPickerModal.tsx
- Creado modal de colores expandidos: 20 colores en grid 4×5, selección con checkmark, cierra automáticamente al seleccionar.

[2026-07-13] + | src/screens/CreateCategoryScreen.tsx
- Creada pantalla de crear categoría: input de nombre (max 30 chars, validación de duplicados con debounce 300ms), radio tipo gasto/ingreso, grid de iconos, grid de colores, botón "Añadir" deshabilitado según validación, texto de ayuda dinámico.

[2026-07-13] ~ | src/context/AppContext.tsx
- Añadido refreshCategories() al AppContextType y al Provider para recargar categorías después de crear una nueva.

[2026-07-13] ~ | src/components/IconGrid.tsx
- Corregido grid de 3 a 4 columnas en web: reemplazado cálculo pixel-based con Dimensions.get('window').width por width:'22%' + aspectRatio:1 (mismo patrón que AddCategoryScreen). Eliminados imports innecesarios (ScrollView, Dimensions, useFontSize).

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Corregido botón "+" de categorías: siempre visible. Con >7 categorías navega a AddCategoryScreen, con ≤7 navega directamente a CreateCategoryScreen.

[2026-07-13] ~ | spec/features/004-pagina-transaccion/1-spec.md
- Actualizada sección 5 (Selección de categoría): botón "+" siempre visible con comportamiento condicional según número de categorías. Actualizados criterios de aceptación.

[2026-07-13] ~ | src/components/CategoryGrid.tsx
- Añadido prop `addMoreLabel` para personalizar el texto del botón "+" (default: "Más").

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Botón "+" muestra "Crear" cuando ≤7 categorías (navega a CreateCategoryScreen) y "Más" cuando >7 (navega a AddCategoryScreen).

[2026-07-13] ~ | src/components/IconGrid.tsx
- Corregido icono inválido: coffee-outline → cafe-outline (Ionicons 7 usa "cafe").
- Corregido centrado de iconos en celdas: añadido padding:6 y reducido gap de 10 a 8.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Reducido espacio entre secciones: marginTop de 16 a 12, marginBottom de 8 a 6 en sectionTitle.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Inlined icon grid directamente en la pantalla (mismos estilos que AddCategoryScreen que funciona en móvil). Eliminada dependencia de IconGrid para el render. Se conserva import de CATEGORY_ICONS para la lista de iconos.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Reestructurado layout para coincidir con AddCategoryScreen: SafeAreaView > View (flex:1) > ScrollView (flex:1) en vez de padding en contentContainerStyle. Esto corrige el cálculo de porcentajes en los items del grid en móvil.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Corregido centrado de iconos en grid: reemplazado aspectRatio:1 + width:'22%' por cálculo dinámico con Dimensions.get('window').width. Las celdas ahora usan width y height fijos calculados, eliminando el bug de aspectRatio en móvil.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Corregido grid responsive en web: reemplazado Dimensions.get('window').width (estático) por onLayout en el grid container. cellSize se calcula dinámicamente del ancho real del grid, funciona en móvil y redimensionamiento web.

[2026-07-13] ~ | FinlyApp/package.json
- Añadida dependencia reanimated-color-picker para selector de colores dinámico.

[2026-07-13] ~ | src/components/ColorPickerModal.tsx
- Reemplazado modal de 20 colores estáticos por reanimated-color-picker completo: Panel1 (saturación/brillo), HueSlider, OpacitySlider, Preview con formato hex.
- Añadidos botones OK/Cancel para confirmar selección.
- Sincronización de color temporal con useEffect al abrir modal.

[2026-07-13] ~ | src/i18n/en.ts, es.ts, ca.ts
- Añadida clave create_cat_color_picker_ok para botón de confirmación del selector de colores.

[2026-07-13] ~ | src/components/ColorPickerModal.tsx
- Fix: Eliminado onPress={onClose} del overlay (cerraba modal al soltar clic fuera del picker en web).
- Fix: Cambiado onChange a onChangeJS y eliminado directorio 'worklet' (causaba crash en móvil).

[2026-07-13] ~ | src/components/ColorGrid.tsx
- Reducidos quick colors de 7 a 6.
- Añadido círculo7 para color personalizado del picker (solo visible si selectedColor no está en QUICK_COLORS).
- Botón "+" siempre en posición8.

[2026-07-13] ~ | src/screens/CreateCategoryScreen.tsx
- Icono seleccionado ahora muestra el color elegido (background + icon tint + border) para previsualización en tiempo real.

[2026-07-13] ~ | src/components/ColorGrid.tsx, src/screens/CreateCategoryScreen.tsx
- Añadido prop customColor para persistir el color personalizado del picker.
- Círculo de color personalizado siempre visible una vez elegido (no desaparece al seleccionar otro quick color).

[2026-07-13] ~ | spec/features/006-pagina-crear-categoria/1-spec.md, 2-plan.md, 3-tasks.md
- Actualizada sección Color: 6 quick colors + círculo personalizado + "+" button.
- Actualizado ColorPickerModal: reanimated-color-picker con Panel1 + HueSlider + OpacitySlider + Preview + OK/Cancel.
- Añadida clave i18n create_cat_color_picker_ok en tabla de claves.

[2026-07-13] ~ | README.md, spec/constitution/2-tech-stack.md
- Añadido reanimated-color-picker a la tabla de stack en README.md y constitution/2-tech-stack.md.
