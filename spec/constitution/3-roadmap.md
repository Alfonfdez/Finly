# Roadmap

App móvil (React Native / Expo) con múltiples pantallas.

## 001-pagina-inicial
Estado: completado.

Pantalla principal con:
a) Cabecera con:
  - Menú hamburguesa (Drawer Navigator) a la izquierda con: Inicio, Ajustes, Transacciones, y placeholder para Cuentas/Categorías (próximamente).
  - En el centro, selector de "Cuenta" que abre un modal con la lista de cuentas.
  - Debajo de la cuenta, el "Total" (diferencia entre gastos e ingresos).
  - A la derecha, botón para abrir pantalla "Transacciones".

b) Bloque inferior:
  - Tabs "Gastos" / "Ingresos".
  - Tabs de período: "Día", "Semana", "Mes", "Año", "Período".
  - Cada período muestra un selector de fecha nativo (DateTimePicker).
    - Día: selector de día (sin fecha futura).
    - Semana: selector de semana.
    - Mes: selector de mes.
    - Año: selector de año.
    - Período: selector de rango de fechas.

c) Bloque gráfico:
  - Gráfico de anillos (SVG) con gastos/ingresos por categoría.
  - Se puede cambiar a gráfico de barras horizontal al pulsar sobre él.

d) Botón "+" flotante (FAB) que navega a la pantalla "Añadir Gasto/Ingreso".

e) Lista de desglose por categorías (icono, nombre, porcentaje, total).

f) Las transacciones se almacenan en SQLite (nativo) o localStorage (web) y se cargan al iniciar la app.

Especificación: spec/features/001-pagina-inicial/.

## 002-diseño-DB
Estado: completado.

Diseño de la base de datos local con 4 tablas principales:
- `users`: usuario con nombre, email, avatar, divisa.
- `accounts`: cuentas con saldo inicial, icono, color.
- `categories`: categorías con nombre, icono, color, tipo (expense/income).
- `transactions`: transacciones con cuenta, categoría, tipo, cantidad, descripción, fecha.
- `config`: tabla de configuración clave-valor.

Incluye: 5 migraciones versionadas, índices en columnas frecuentemente consultadas, foreign keys con ON DELETE CASCADE, y datos seed de prueba.

Especificación: spec/features/002-diseño-DB/.

## 003-pagina-configuracion
Estado: completado.

Pantalla de ajustes con 5 secciones:
- Apariencia: tema Oscuro / Claro / Sistema con cambio en tiempo real.
- Calendario: primer día de la semana (Lunes / Domingo).
- Formato monetario: divisa (Euro / Dólar / Libra / Yen) y separador decimal (coma / punto).
- Idioma: English / Español / Català con iconos de bandera.
- Tamaño de texto: Pequeño / Mediano / Grande.

Config persistente en SQLite (nativo) o localStorage (web).

Especificación: spec/features/003-pagina-configuracion/.

## 004-pagina-anadir-transaccion
Estado: completado.

Pantalla para añadir gasto/ingreso con:
- Tabs Gastos/Ingresos.
- Input de cantidad con validación y símbolo de divisa.
- Selector de cuenta.
- Grid de categorías (7 ítems + botón "Más").
- Selector de día con 3 modos (Hoy / Ayer / Dinámico) + calendario.
- Sección de etiquetas con búsqueda y creación.
- Input de comentario con contador de caracteres (4096 máx.) y autocompletado.
- Sección de foto (cámara/galería) — UI preparada, funcionalidad pendiente.
- Botón "Añadir" con validación y texto de ayuda.

Especificación: spec/features/004-pagina-anadir-transaccion/.

## 005-pagina-anadir-categoria
Estado: completado.

Pantalla para seleccionar categoría existente:
- Grid 4×N de categorías filtradas por tipo (gasto/ingreso).
- Barra de búsqueda con filtrado por caracteres contenidos (case-insensitive).
- Estado vacío cuando no hay resultados.
- Botón "Crear" al final del grid (navega a 006).
- Selección de categoría y navegación de vuelta a Añadir Transacción.

Especificación: spec/features/005-pagina-anadir-categoria/.

## 006-pagina-crear-categoria
Estado: completado.

Pantalla para crear categorías personalizadas:
- Selección de icono de una rejilla de iconos disponibles.
- Selección de color con 6 colores predefinidos + selector dinámico (reanimated-color-picker).
- Campo de nombre con validación (no vacío, no duplicado).
- Tipo de categoría (gasto/ingreso) heredado de la pantalla anterior.
- Botón "Crear" que guarda en la base de datos y navega de vuelta.

Especificación: spec/features/006-pagina-crear-categoria/.

## 007-calculadora
Estado: completado.

Modal con calculadora básica para la pantalla de añadir transacción:
- Teclado numérico con operaciones básicas (+, -, *, /).
- Botón "=" para evaluar la expresión y mostrar el resultado.
- Botones "Aceptar" y "Cancelar".
- Al aceptar, pega el resultado en el campo de cantidad.
- Componente reutilizable que puede usarse en otras pantallas.

Especificación: spec/features/007-calculadora/.

## 008-pagina-categorias
Estado: completado.

Pantalla accesible desde el Drawer que muestra todas las categorías existentes organizadas por tipo (gasto/ingreso) en un grid 4×N:
- Tabs Gastos/Ingresos para filtrar por tipo.
- Grid 4×N con icono + color + nombre por categoría.
- Botón "Crear" en la última posición del grid (navega a 006).
- Al pulsar una categoría, navega a modificar categoría (009).

Especificación: spec/features/008-pagina-categorias/.

## 009-pagina-modificar-eliminar-categoria
Estado: completado.

Pantalla para modificar o eliminar una categoría existente:
- Icono actual con color + input editable de nombre (validación de duplicados excluyendo la actual).
- Grid de iconos con el actual preseleccionado.
- Grid de colores con el actual preseleccionado + selector dinámico.
- Botón "Eliminar" con doble modal: confirmación + selección de categoría de destino para reasignar transacciones.
- Botón "Guardar" que persiste los cambios.

Especificación: spec/features/009-pagina-modificar-eliminar-categoria/.

## 010-app-logo
Estado: completado.

Sustituir los iconos genéricos de Expo por el logotipo personalizado de Finly:
- 6 archivos PNG en `assets/` para app icon, Android adaptive icon, favicon y splash screen.
- Configuración en `app.json` con sección `expo.splash` (nativo) y referencias a assets.
- Logo visible en el header del Drawer junto al texto "Finly".

Especificación: spec/features/010-app-logo/.

## 011-pagina-cuentas
Estado: completado.

Pantalla accesible desde el Drawer que muestra todas las cuentas con su saldo:
- Header con menú hamburguesa + título "Cuentas" (multilingual).
- Sección "Total:" con saldo total de todas las cuentas (verde/rojo).
- Lista de cuentas con icono + nombre + saldo.
- Botón flotante "+" (FAB) que navega a crear cuenta (013).
- Al pulsar una cuenta, navega a modificar cuenta (012).

Especificación: spec/features/011-pagina-cuentas/.

## 012-pagina-modificar-eliminar-cuenta
Estado: completado.

Pantalla para modificar o eliminar una cuenta existente:
- Nombre editable con contador 0/30 y validación de vacío + duplicados.
- Grid de iconos (~20 iconos financieros) con el actual preseleccionado.
- Grid de colores con el actual preseleccionado + selector dinámico.
- Campo "Nota" multilínea con límite 200 caracteres.
- Botón "Eliminar" con borrado en cascada de transacciones.
- Botón "Guardar" que persiste los cambios.

Especificación: spec/features/012-pagina-modificar-eliminar-cuenta/.

## 013-pagina-crear-cuenta
Estado: completado.

Pantalla para crear una nueva cuenta:
- Nombre con validación (no vacío, no duplicado) y contador 0/30.
- Grid de iconos (~20 iconos financieros) con fondo gris que cambia al color seleccionado.
- Grid de colores con 6 predefinidos + selector dinámico.
- Campo "Nota" multilínea opcional con límite 200 caracteres.
- Botón "Crear" con validación (nombre + icono + color).
- Al crear, `initial_balance` se establece a 0.

Especificación: spec/features/013-pagina-crear-cuenta/.

## 014-pagina-transacciones-por-pagina-inicial
Estado: completado.

Pantalla de lista de transacciones filtrada por categoría, cuenta y período, accesible desde la pantalla principal (HomeScreen) al pulsar una categoría del desglose:
- Header del Stack navigator con título "Transacciones" (multilingual).
- Sección de categoría: icono + nombre + total con color (verde/rojo) y prefijo (+/-).
- Selector de cuenta con modal de selección (radio + icono + nombre + saldo).
- Ordenación por fecha o cantidad con toggle ASC/DESC.
- Lista agrupada por día con encabezado de fecha.
- FAB "+" centrado para navegar a añadir transacción.
- Se pasa categoryId, type, period, startDate, endDate como parámetros de navegación.
- Layout: SafeAreaView > View.container(flex:1) > [categoryInfo, controls, SectionList, FAB].

Especificación: spec/features/014-pagina-transacciones-por-pagina-inicial/.

## 015-pagina-transacciones-por-menu-hamburguesa
Estado: completado.

Pantalla independiente `AllTransactionsScreen` accesible desde el menú hamburguesa (drawer) o el icono de estadísticas del HomeScreen, sin filtros de categoría ni período:
- Header del Stack navigator con título "Todas las transacciones" (multilingual) e icono `list-outline`.
- Selector de cuenta con saldo total del período (verde/rojo).
- Ordenación por fecha o cantidad con toggle ASC/DESC.
- Lista agrupada por día con encabezado de fecha.
- FAB "+" centrado para navegar a añadir transacción.
- Carga todas las transacciones desde `transactionRepository.list()` sin filtro de `account_id`.
- Layout: SafeAreaView > View.container(flex:1) > [controls, SectionList, FAB].

Especificación: spec/features/015-pagina-transacciones-por-menu-hamburguesa/.

## 016-pagina-detalles-transaccion
Estado: completado.

Pantalla de detalles de una transacción individual, accesible al pulsar cualquier transacción en los listados (TransactionsScreen, AllTransactionsScreen):
- Header con título "Detalles de la transacción" y botón de retroceso.
- Ficha de datos con 5 filas: Cantidad (con color del tipo), Cuenta (icono + nombre), Categoría (icono + nombre), Fecha (formato largo multilingüe), Comentario (o "Sin comentario").
- Botón "Eliminar" con modal de confirmación ("No" / "Sí") que borra y refresca el listado.
- Botón "Editar" que navega a ModifyTransaction (TODO).
- Pie "Creado HH:mm dd MMM aaaa" con formato 24h y año siempre visible.
- Refresco automático del listado al volver (useFocusEffect + refreshTrigger).

Especificación: spec/features/016-pagina-detalles-transaccion/.

## 017-pagina-modificar-transaccion
Estado: completado.

Pantalla para modificar una transacción existente, accesible desde el botón "Editar" de TransactionDetailsScreen:
- Tabs Gastos/Ingresos precargados con el tipo actual.
- Input de cantidad precargado con el valor actual, con validación y calculadora.
- Selector de cuenta precargado.
- Grid de categorías con la categoría actual en la primera posición + botón "Más".
- Selector de día precargado con la fecha de la transacción.
- Sección de etiquetas (TODO persistencia).
- Input de comentario precargado con el texto actual y autocompletado.
- Sección de foto (UI únicamente, TODO).
- Botón "Guardar" con validación que actualiza la transacción.
- Refresco automático del listado al volver.

Especificación: spec/features/017-pagina-modificar-transaccion/.
