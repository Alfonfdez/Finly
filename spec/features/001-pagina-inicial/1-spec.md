# 001 — Página inicial (app móvil)

- **Objetivo**
Una pantalla principal en la app donde se muestra la Cuenta actual, el Total (diferencia ingresos/gastos), se puede elegir entre Gastos o Ingresos y un período de tiempo. Hay un botón "+" que navega a la pantalla de añadir gasto/ingreso.

- **Requisitos funcionales**
1. Cabecera con menú hamburguesa (Drawer) a la izquierda para futuras funciones:
   a) Añadir, modificar o eliminar "Cuentas".
   b) Añadir, modificar o eliminar "Categorías".
   c) "Ajustes": modo claro/oscuro, personalización (primer día de semana, separador decimal, divisa, idioma).

2. En el centro de la cabecera, texto "Total" clicable que abre un modal para seleccionar una cuenta. Debajo del Total se muestra el resumen de Ingresos y Gastos.

3. A la derecha de la cabecera, botón que navega a la pantalla "Transacciones" (lista de transacciones filtrable por tipo y período).

4. Tabs "Gastos" / "Ingresos" para alternar el tipo mostrado.

5. Tabs de período: "Día", "Semana", "Mes", "Año", "Período".
   Al seleccionar un período, se puede abrir un selector de fecha nativo:
   - Día: selector de día (sin fechas futuras).
   - Semana: selector de semana.
   - Mes: selector de mes.
   - Año: selector de año.
   - Período: selector de rango de fechas.

6. Gráfico de anillos (SVG) que muestra gastos/ingresos del período seleccionado, desglosado por categorías con su color. Al pulsar el gráfico, alterna a gráfico de barras horizontal.

7. Botón "+" (Floating Action Button) que navega a la pantalla "Añadir Gasto/Ingreso".

8. Lista de desglose por categorías: icono SVG, nombre, porcentaje, total numérico con 2 decimales y símbolo de divisa (€ por defecto). Al pulsar una categoría, navega a "Transacciones" filtrada por esa categoría.

- **Contenido**
Datos mock iniciales (cuentas, categorías, transacciones de ejemplo). Más adelante los datos vendrán de AsyncStorage con lo que el usuario introduzca.

- **Requisitos no funcionales**
- Diseño: modo oscuro, paleta definida (fondo, fondoAlto, texto, textSuave, primario, acento).
- Responsive: 100% móvil, adaptable a diferentes tamaños de pantalla.
- Accesibilidad: contraste suficiente, TouchableOpacity con hitSlop amplio, etiquetas accesibles.

- **Fuera de alcance**
Sincronización en la nube, autenticación, uso sin conexión (AsyncStorage ya es local).

- **Criterios de aceptación**
[ ] El Drawer Navigator se abre correctamente con las opciones (mockups iniciales).
[ ] Al pulsar "Total" se abre un modal con la lista de cuentas, mostrando icono, nombre y total.
[ ] El saldo Total se muestra en verde si es positivo, rojo si es negativo, con símbolo €.
[ ] El botón de transacciones navega a la pantalla correspondiente.
[ ] Correcta alternancia entre "Gastos" e "Ingresos".
[ ] Se muestran los 5 tabs de período correctamente.
[ ] Al seleccionar un período se puede elegir una fecha con el selector nativo.
[ ] El selector de fecha no permite seleccionar días futuros.
[ ] Se muestra correctamente el gráfico de anillos con datos del período.
[ ] Al pulsar el gráfico de anillos, se muestra el de barras, y viceversa.
[ ] El botón "+" navega a la pantalla "Añadir Gasto/Ingreso".
[ ] La lista de categorías muestra icono, nombre, porcentaje y total correctamente.
[ ] Al pulsar una categoría, navega a "Transacciones" con ese filtro.
