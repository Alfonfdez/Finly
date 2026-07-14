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

## 004-pagina-transaccion
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

Especificación: spec/features/004-pagina-transaccion/.

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
Estado: pendiente.

Pantalla accesible desde el Drawer que muestra todas las categorías existentes organizadas por tipo (gasto/ingreso) en un grid 4×N:
- Tabs Gastos/Ingresos para filtrar por tipo.
- Grid 4×N con icono + color + nombre por categoría.
- Botón "Crear" en la última posición del grid (navega a 006).
- Al pulsar una categoría, navega a modificar categoría (009).

Especificación: spec/features/008-pagina-categorias/.

## 009-pagina-modificar-categoria
Estado: pendiente.

Pantalla para modificar o eliminar una categoría existente:
- Icono actual con color + input editable de nombre (validación de duplicados excluyendo la actual).
- Grid de iconos con el actual preseleccionado.
- Grid de colores con el actual preseleccionado + selector dinámico.
- Botón "Eliminar" con doble modal: confirmación + selección de categoría de destino para reasignar transacciones.
- Botón "Guardar" que persiste los cambios.

Especificación: spec/features/009-pagina-modificar-categoria/.
