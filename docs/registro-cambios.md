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

[2026-07-12] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md
- Actualizada sección "Selección de día" con lógica detallada: tabla de estados por pestaña principal, formato de fechas, inicialización y comportamiento interactivo.

[2026-07-12] ~ | spec/features/004-pagina-anadir-transaccion/3-tasks.md
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

[2026-07-12] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md
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

[2026-07-13] + | spec/features/007-calculadora/
- Creada spec completa para la calculadora: 1-spec.md (requisitos funcionales), 2-plan.md (arquitectura y componentes), 3-tasks.md (13 tareas en 4 fases + verificación).
- Incluye: modal con teclado numérico, operaciones básicas, botones Aceptar/Cancelar, integración con AddTransactionScreen.
- Componente reutilizable para otras pantallas.

[2026-07-13] ~ | spec/constitution/3-roadmap.md
- Añadido feature 007-calculadora con estado pendiente.

[2026-07-13] ~ | README.md
- Añadido spec/007-calculadora a la estructura del proyecto.
- Añadida funcionalidad "Calculadora básica integrada (próximamente)" a la lista de features.
- Actualizada lista de features SDD: 001-007.

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

[2026-07-13] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md
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

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Fix: Al volver de CreateCategoryScreen con nueva categoría, scroll automático al inicio para ver la categoría seleccionada.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx, src/components/CommentInput.tsx
- Fix: Eliminado listener keyboardDidShow que causaba scroll automático al abrir la pantalla en móvil.
- Añadido onFocus a CommentInput para hacer scrollToEnd solo cuando el usuario pulsa en el input de comentario.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Mejorada UX del input de cantidad: ahora muestra "0" como placeholder, se limpia al enfocar y muestra el importe formateado solo cuando hay un valor.

[2026-07-13] ~ | spec/features/004-pagina-anadir-transaccion/1-spec.md, spec/constitution/3-roadmap.md
- Actualizada sección "Campo de cantidad" con UX de placeholder "0" y limpieza al enfocar.
- Actualizado roadmap: selector de color dinámico en vez de rejilla estática.

[2026-07-13] + | src/i18n/en.ts, es.ts, ca.ts
- Añadidas claves i18n para CalculatorModal: calc_title, calc_accept, calc_cancel, calc_error.

[2026-07-13] + | src/utils/calculator.ts
- Creada función evaluate() con parser manual que respeta precedencia de operadores (+, -, *, /), maneja decimales y valida expresiones.

[2026-07-13] + | src/components/CalculatorModal.tsx
- Creado modal de calculadora: teclado 5×4 con botones 0-9, `.`, operadores, `=`, `C`, `⌫`. Display con expresión y resultado. Botones Aceptar/Cancelar. Tema oscuro/claro con useConfig.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Integrado CalculatorModal: botón calculator-outline abre modal, onAccept actualiza amountRaw con el resultado.

[2026-07-13] ~ | src/components/CalculatorModal.tsx
- Fix: Reemplazado SafeAreaView de react-native por react-native-safe-area-context (elimina deprecation warning).
- Fix: Web ahora muestra la calculadora como popup centrado (overlay + modal con maxWidth 360) en vez de pantalla completa. Botones con tamaño fijo (70×50) en web.

[2026-07-13] ~ | src/components/CalculatorModal.tsx
- Fix: Corregido layout de botones en web: eliminado aspectRatio en web, añadido padding al modal web, justify-content center en filas. Empty cells también con tamaño fijo en web.

[2026-07-13] ~ | src/components/CalculatorModal.tsx
- Refactor: Separados estilos completamente en mobileStyles y webStyles para evitar conflictos de flex. Web usa botones fijos 72×52, modal fijo 360px.

[2026-07-13] ~ | src/screens/AddTransactionScreen.tsx
- Fix: Resultado de la calculadora ahora se valida con parseAmountInput antes de pegar en el campo de cantidad (máx 9 dígitos enteros, 2 decimales).

[2026-07-13] ~ | src/utils/calculator.ts
- Fix: Añadido límite MAX_VALUE (999,999,999.99). Valores que exceden el máximo muestran error en vez de producir notación científica.

[2026-07-14] + | spec/features/008-pagina-categorias/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Creada spec completa para la página de categorías: 1-spec.md (requisitos funcionales), 2-plan.md (arquitectura y componentes), 3-tasks.md (9 tareas en 3 fases).
- Incluye: tabs Gastos/Ingresos, grid 4×N de categorías, botón "Crear" que navega a CreateCategoryScreen, pulsar categoría que navega a ModifyCategoryScreen.

[2026-07-14] + | spec/features/009-pagina-modificar-eliminar-categoria/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Creada spec completa para la página de modificar categoría: 1-spec.md (requisitos funcionales), 2-plan.md (arquitectura y componentes), 3-tasks.md (16 tareas en 5 fases).
- Incluye: icono actual + nombre editable con validación de duplicados (excluyendo la actual), tipo informativo, grid de iconos y colores preseleccionados, botón "Eliminar" con doble modal (confirmación + selección de categoría de destino para reasignación de transacciones), botón "Guardar".

[2026-07-14] ~ | spec/constitution/3-roadmap.md
- Actualizado roadmap: 007-calculadora marcado como completado. Añadidos 008-pagina-categorias y 009-pagina-modificar-eliminar-categoria con estado pendiente.

[2026-07-14] ~ | src/constants/types.ts, src/navigation/AppNavigator.tsx, src/screens/CategoriesScreen.tsx (+)
- Implementada feature 008-pagina-categorias:
  - Añadido `Categories` y `ModifyCategory` al RootStackParamList en types.ts.
  - Creado CategoriesScreen.tsx con header (hamburguesa + título), TypeTabs, grid 4×N, botón "Crear".
  - Añadido CategoriesScreen al HomeStack en AppNavigator.tsx.
  - Movido DrawerItem "Categorías" fuera de "Coming soon" y conectado a navegación real.
  - DrawerItem navega a CategoriesScreen; grid navega a CreateCategoryScreen (existente) o a ModifyCategoryScreen (próximamente).

[2026-07-14] ~ | src/navigation/AppNavigator.tsx
- Fix: Home DrawerItem ahora navega a 'Main' con { screen: 'Home' } para resetear el stack al pulsar "Inicio" desde pantallas anidadas (ej. Categories).

[2026-07-14] + | src/screens/ModifyCategoryScreen.tsx
- Implementada feature 009-pagina-modificar-eliminar-categoria:
  - Pantalla completa con icono actual + nombre editable, validación de duplicados excluyendo categoría actual, tipo informativo, grid de iconos, grid de colores y botón "Guardar".
  - Flujo de eliminación con doble modal: confirmación de borrado + selección de categoría destino (radio + icono + nombre).
  - Reasignación de transacciones vía transactionRepository.reassignCategory.
[2026-07-14] ~ | src/i18n/en.ts, es.ts, ca.ts
- Añadidas 10 claves i18n para ModifyCategoryScreen: modify_cat_title, modify_cat_type, modify_cat_delete, modify_cat_save, modify_cat_delete_confirm_title, modify_cat_delete_confirm_message, modify_cat_delete_confirm_cancel, modify_cat_delete_confirm_delete, modify_cat_select_title, modify_cat_select_cancel, modify_cat_select_confirm.
[2026-07-14] ~ | src/database/repositories/categoryRepo.ts, src/database/webStorage.ts
- Modificado existsByName para aceptar parámetro opcional excludeId que excluye la categoría actual de la comprobación de duplicados.
[2026-07-14] ~ | src/database/repositories/transactionRepo.ts, src/database/webStorage.ts
- Añadida función reassignCategory(oldCategoryId, newCategoryId) para reasignar transacciones de una categoría a otra.
[2026-07-14] ~ | src/navigation/AppNavigator.tsx
- Añadido ModifyCategoryScreen al HomeStack con título multilingual.
[2026-07-14] ~ | src/screens/ModifyCategoryScreen.tsx
- Añadida validación visual de nombre vacío: muestra mensaje de error en rojo "Introduzca un nombre para la categoría" debajo del input cuando el nombre está vacío, además de deshabilitar el botón Guardar.

[2026-07-14] + | spec/features/010-app-logo/
- Creada spec completa para el logotipo personalizado de Finly con 6 assets PNG.
[2026-07-14] ~ | FinlyApp/assets/ (6 archivos)
- Reemplazados iconos genéricos de Expo por el logotipo personalizado de Finly.
[2026-07-14] ~ | FinlyApp/app.json
- Añadida sección splash con image, resizeMode: contain y backgroundColor: #0F172A.
[2026-07-14] ~ | docs/programming-concepts.md
- Añadidas secciones: App icon, Android adaptive icon, Splash screen, Favicon.
[2026-07-14] ~ | src/navigation/AppNavigator.tsx
- Añadido logo (icon.png) en el header del Drawer junto al texto "Finly": Image 36×36 con borderRadius 10, flexDirection row, gap 12.
[2026-07-14] - | FinlyApp/dist/
- Eliminada caché de web (dist/) para forzar regeneración de favicon con el nuevo logo.
[2026-07-14] ~ | src/context/ConfigContext.tsx
- Añadido scrollbar web dinámico: sincroniza colores del scrollbar (thumb + track) con el tema activo (oscuro/claro) mediante CSS injectado en el head.
[2026-07-14] ~ | App.tsx
- Añadido componente SplashScreen con logo (80×80), texto "Finly" (color primario) y ActivityIndicator.
- Reemplazado loading state simple por splash completo. Funciona en web y nativo.
- Añadido tiempo mínimo de splash de 2 segundos (MIN_SPLASH_MS = 2000) para que sea visible aunque la DB cargue rápido.
- Mejorada animación del splash: logo fade-in + scale-up con spring, texto fade-in con delay, pulse suave continuo en el logo, y fade-out + scale-up al salir.
- Aumentado MIN_SPLASH_MS a 3000ms. Logo fade-in 800ms con más bounce. Texto fade-in 600ms con 500ms delay.
- Reemplazado pulse circular por barra de progreso lineal que se llena de izquierda a derecha (120px, 2px height, cyan sobre track gris).

[2026-07-14] ~ | src/context/ConfigContext.tsx, src/database/repositories/configRepo.ts, src/database/webStorage.ts
- Añadido campo categoryIconShape ('square' | 'circle', default 'square') al tipo Config y a ambos repositorios (SQLite + web).
[2026-07-14] ~ | src/i18n/en.ts, es.ts, ca.ts
- Añadidas claves i18n: settings_category_icon_shape, shape_square, shape_circle.
[2026-07-14] ~ | src/screens/SettingsScreen.tsx
- Añadida sección "Aspecto de categorías" con selector Cuadrado/Círculo.
[2026-07-14] ~ | src/components/CategoryGrid.tsx, src/components/CategoryList.tsx, src/components/IconGrid.tsx
- Actualizados para leer config.categoryIconShape y aplicar borderRadius dinámico (12 cuadrado / 999 círculo).
[2026-07-14] ~ | src/screens/CategoriesScreen.tsx, src/screens/AddCategoryScreen.tsx, src/screens/CreateCategoryScreen.tsx, src/screens/ModifyCategoryScreen.tsx
- Actualizados grids de categorías y previsualizaciones para usar la forma configurada (cuadrado/círculo).

[2026-07-14] ~ | spec/features/011-pagina-cuentas/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Añadido botón flotante "+" (FAB) en la esquina inferior derecha que navega a CreateAccountScreen (013).
- Añadida segunda fila opcional para nota (descripción) debajo del nombre en cada cuenta. Fila principal siempre con 3 columnas (icono, nombre, saldo); segunda fila solo visible si la cuenta tiene nota, texto en color suave y tamaño reducido.
- Actualizado flujo de navegación, wireframe y criterios de aceptación.

[2026-07-14] ~ | spec/features/012-modificar-cuenta/ → spec/features/012-pagina-modificar-eliminar-cuenta/
- Renombrada carpeta para ser consistente con la convención de nombres (012-pagina-modificar-eliminar-cuenta).

[2026-07-14] + | spec/features/013-pagina-crear-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Creada spec completa para la página de crear cuenta: 1-spec.md (requisitos funcionales), 2-plan.md (arquitectura y componentes), 3-tasks.md (10 tareas en 4 fases).
- Incluye: nombre con validación (vacío + duplicado), grid de iconos (~20 financieros) con color dinámico, grid de colores (6 predefinidos + picker), nota opcional (200 chars), botón "Crear" con validación.

[2026-07-14] ~ | spec/constitution/3-roadmap.md
- Renombrado 012-modificar-cuenta → 012-pagina-modificar-eliminar-cuenta. Añadido 013-pagina-crear-cuenta con estado pendiente.

[2026-07-14] ~ | spec/features/012-pagina-modificar-eliminar-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Uniformización con 013-pagina-crear-cuenta:
  - Añadida tabla completa de ~20 iconos (antes solo referenciada).
  - Añadido comportamiento de color de fondo del icono al cambiar color seleccionado.
  - Sección Color explícita con tabla de 6 colores + "+" y detalle del modal (antes solo referenciaba "misma estructura que 006 y 009").
  - Añadida clave i18n `modify_account_error_empty` en plan.
  - Actualizado T8 para indicar que la lista de iconos se comparte con 013.
  - Actualizado T9 para mencionar el cambio de color de fondo del icono.

[2026-07-14] ~ | spec/features/012-pagina-modificar-eliminar-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Añadida validación de duplicados de nombre (excluyendo cuenta actual, debounce 300ms).
- Cambio en sección Color: grid 8 columnas (6 predefinidos + círculo personalizado condicional + "+"). El círculo personalizado solo se muestra si el color actual no coincide con ninguno de los 6 predefinidos.
- Botón "Guardar" deshabilitado si nombre vacío o duplicado, con texto de ayuda dinámico.
- Añadidas claves i18n `modify_account_error_empty` y `modify_account_error_duplicate`.
- Reutiliza función `existsByName(name, excludeId)` de `accountRepo` (creada en 013).

[2026-07-14] ~ | spec/features/009-pagina-modificar-eliminar-categoria/1-spec.md
- Corregida referencia "misma estructura que en 006" → explicación explícita de 8 columnas.
- Añadido: si el color actual coincide con uno de los 6 predefinidos, ese círculo se marca como seleccionado.
- Añadido: al seleccionar un icono, el color de fondo del icono cambia al color seleccionado (consistencia con 012).

[2026-07-14] ~ | spec/features/013-pagina-crear-cuenta/ (1-spec.md, 2-plan.md, 3-tasks.md)
- Actualizada función `existsByName` para aceptar parámetro opcional `excludeId` (usado en 012 para excluir la cuenta actual).

[2026-07-14] + | spec/features/011-pagina-cuentas/ (implementación)
- Implementada pantalla AccountsScreen.tsx (011): header con menú hamburguesa, sección "Total" con saldo total (verde/rojo), FlatList de cuentas con icono + nombre + nota + saldo, FAB "+" que navega a CreateAccountScreen, estado vacío.
- Añadidas claves i18n `accounts_total` y `accounts_empty` en en.ts, es.ts, ca.ts.
- Añadido `Accounts` a `RootStackParamList` + `AccountsScreenProps` en types.ts.
- Añadidos `CreateAccount` y `ModifyAccount` a `RootStackParamList` como rutas placeholder para navegación forward.
- Añadido campo `description?: string` a la interfaz `Account` en database/types.ts (compatible con migration 006 de 012).
- Actualizado AppNavigator.tsx: AccountsScreen añadido al HomeStack, DrawerItem "Cuentas" conectado para navegar a AccountsScreen.
- Todos los textos son multilingües (es/en/ca).
- TypeScript y ESLint pasan limpio.

[2026-07-14] + | docs/programming-concepts.md
- Añadida sección "Herramientas de desarrollo" con concepto ESLint (análisis estático, ejecución, relación con TypeScript).

[2026-07-14] ~ | FinlyApp/src/screens/AccountsScreen.tsx
- Total balance centrado en la sección de Total.

[2026-07-14] ~ | FinlyApp/src/navigation/AppNavigator.tsx
- Movido DrawerItem "Cuentas" junto al resto de elementos implementados (antes del separador).
- Eliminada sección "FUTURAS FUNCIONES" y su separador.
- Cambiado color de label de "Cuentas" de `textSecondary` a `text` (consistencia con el resto).

[2026-07-14] + | spec/features/012-pagina-modificar-eliminar-cuenta/ (implementación)
- Implementada pantalla ModifyAccountScreen.tsx (012): nombre editable (0/30, validación vacío + duplicados con debounce 300ms), grid iconos 4 columnas (~20 iconos financieros, preseleccionado), grid colores 8 columnas via ColorGrid (6 predefinidos + personalizado condicional + "+"), ColorPickerModal, nota multilínea (0/200), botón Guardar.
- Añadidas claves i18n: `modify_account_title`, `modify_account_name`, `modify_account_note`, `modify_account_save`, `modify_account_error_empty`, `modify_account_error_duplicate`, `create_account_symbols`, `create_account_color` (en/es/ca).
- Creada migración 006 (`006_account_description.ts`): `ALTER TABLE accounts ADD COLUMN description TEXT DEFAULT ''`.
- Actualizado `database.ts`: `DATABASE_VERSION` de 5 a 6, import + ejecución de `migrate006`.
- Añadido campo `description` a `accountRepo.update()` y `accountRepo.create()` (nativo).
- Añadida función `existsByName(name, excludeId?)` a `accountRepo` (nativo) y `webAccountRepo` (web).
- Creado `constants/accountIcons.ts` con 19 iconos financieros únicos (compartido con 013).
- Registrado `ModifyAccountScreen` en `AppNavigator.tsx` (HomeStack).

[2026-07-14] + | spec/features/013-pagina-crear-cuenta/ (implementación)
- Implementada pantalla CreateAccountScreen.tsx (013): nombre editable (0/30, placeholder, validación vacío + duplicados con debounce 300ms), grid iconos 4 columnas (ACCOUNT_ICONS compartido), grid colores 8 columnas via ColorGrid + ColorPickerModal, nota multilínea (0/200), botón Crear.
- Añadidas claves i18n: `create_account_title`, `create_account_name`, `create_account_note`, `create_account_button`, `create_account_error_empty`, `create_account_error_duplicate`, `create_account_error_icon`, `create_account_error_color`, `create_account_error_icon_color` (en/es/ca).
- Registrado `CreateAccountScreen` en `AppNavigator.tsx` (HomeStack).
- Botón Crear deshabilitado si falta nombre, icono o color (o nombre duplicado). Texto de ayuda dinámico por prioridad.
- Actualizado spec013: iconos corregidos para coincidir con `constants/accountIcons.ts` (6 reemplazos: bank→home, savings→shield, account-balance→layers, credit-card→scan, money→swap-horizontal, cash-dup→storefront).

[2026-07-14] ~ | AppContext.tsx, CreateAccountScreen.tsx, ModifyAccountScreen.tsx, 011 spec
- Añadido método `refreshAccounts()` a `AppContext` (re-fetch de accounts desde repository). Se expone en la interfaz `AppContextType` y en el value del provider.
- CreateAccountScreen y ModifyAccountScreen llaman `await refreshAccounts()` después de crear/modificar cuenta para que la lista en HomeScreen (AccountModal) se actualice inmediatamente.
- Actualizada sección "Persistencia" en `spec/features/011-pagina-cuentas/1-spec.md` con nota sobre refresco obligatorio tras mutaciones.

[2026-07-14] ~ | formatters.ts, 011 spec
- Corregido `formatCurrency()` en `src/utils/formatters.ts`: añadido `Math.round(abs * 100) / 100` antes de extraer parte entera y decimal, para evitar que errores de punto flotante produzcan 3 decimales (ej. "999,100" en lugar de "999,10").
- Añadido requisito no funcional en `011 spec`: "Formato monetario: todos los importes se muestran con máximo 2 decimales".
- Añadido criterio de aceptación en `011 spec`: total balance con máximo 2 decimales.

[2026-07-14] + | spec/features/012-pagina-modificar-eliminar-cuenta/ (spec delete account)
- Añadida sección "6. Botón Eliminar" en `1-spec.md`: borrado en cascada con un solo modal de confirmación (nombre de cuenta interpolado, mensaje de advertencia, Cancelar/Eliminar).
- Actualizado objetivo en `1-spec.md` para mencionar eliminación con borrado en cascada.
- Añadido requisito no funcional sobre borrado en cascada en `1-spec.md`.
- Añadidos 3 criterios de aceptación para el flujo de eliminación en `1-spec.md`.
- Añadidos 5 keys i18n (`modify_account_delete*`) en `2-plan.md`.
- Añadido `transactionRepo.deleteByAccountId` a lista de cambios de repo en `2-plan.md`.
- Actualizado diagrama de navegación en `2-plan.md` con ruta de eliminación.
- Añadidas tareas T8 (repo deleteByAccountId), T12 (botón eliminar + modal) en `3-tasks.md`. Total: 14 tareas.

[2026-07-14] + | ModifyAccountScreen.tsx, transactionRepo.ts, webStorage.ts, i18n/
- Implementado botón "Eliminar" en ModifyAccountScreen (012): botón rojo con icono trash antes del botón Guardar, modal de confirmación con nombre de cuenta interpolado, mensaje de borrado de transacciones, Cancelar/Eliminar.
- Añadido `deleteByAccountId(id)` a `transactionRepo.ts` (SQL: `DELETE FROM transactions WHERE account_id = ?`) y `webStorage.ts` (filter out transactions).
- Añadidas 5 keys i18n en en.ts, es.ts, ca.ts: `modify_account_delete`, `modify_account_delete_confirm_title`, `modify_account_delete_confirm_message`, `modify_account_delete_confirm_cancel`, `modify_account_delete_confirm_delete`.

[2026-07-14] ~ | spec/features/009 y 012 (rename folders)
- Renombrada carpeta `009-pagina-modificar-categoria` → `009-pagina-modificar-eliminar-categoria`.
- Renombrada carpeta `012-pagina-modificar-cuenta` → `012-pagina-modificar-eliminar-cuenta`.
- Actualizados títulos en `1-spec.md`, `2-plan.md`, `3-tasks.md` de ambas features (añadido "/eliminar").
- Actualizadas referencias en `spec/constitution/3-roadmap.md` (4 ocurrencias).
- Actualizadas referencias en `docs/registro-cambios.md` (11 ocurrencias históricas).

[2026-07-14] ~ | spec/features/004 (rename folder)
- Renombrada carpeta `004-pagina-transaccion` → `004-pagina-anadir-transaccion`.
- Actualizadas referencias en `spec/constitution/3-roadmap.md` (2 ocurrencias) y `docs/registro-cambios.md` (5 ocurrencias históricas).

[2026-07-14] + | spec/features/014-pagina-transacciones/ (nueva spec)
- Creada spec `014-pagina-transacciones` para la pantalla de lista de transacciones filtrada.
- `1-spec.md`: selector de cuenta con modal, ordenación por fecha/cantidad con toggle ASC/DESC, lista agrupada por día, FAB "+", 16 criterios de aceptación.
- `2-plan.md`: plan con componentes AccountSelector, SortToggle, TransactionGroup. Reescritura de TransactionsScreen existente.
- `3-tasks.md`: 11 tareas en 4 fases.
- Añadida entrada en `spec/constitution/3-roadmap.md`.
