# Roadmap

App móvil (React Native / Expo) con múltiples pantallas.

## 001-pagina-inicial
Estado: pendiente.

Pantalla principal con:
a) Cabecera con:
  - Menú hamburguesa (Drawer Navigator) a la izquierda para futuras funcionalidades (Cuentas, Categorías, Ajustes).
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

f) Las transacciones se almacenan en AsyncStorage y se cargan al iniciar la app.

Especificación: spec/features/001-pagina-inicial/.
