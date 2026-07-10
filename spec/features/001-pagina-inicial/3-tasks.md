# Tareas — 001 Página principal (React Native)
Orden de ejecución. Marca cada tarea al completarlo.

[ ] T1 — Inicializar proyecto Expo con TypeScript. Instalar dependencias (React Navigation, AsyncStorage, react-native-svg, DateTimePicker). Crear estructura de carpetas `src/` (screens, components, context, data, storage, utils).

[ ] T2 — Configurar paleta de colores en `src/constants/colors.ts`. Crear mock data en `src/data/mockData.ts` (cuentas, categorías, períodos) con la misma estructura que la versión web.

[ ] T3 — Implementar `AppContext.tsx` con el estado global: cuentaActiva, tipoActivo, periodoActivo, fechaPersonalizada, y los métodos de consulta (categoriasActivas, totalCategoriasActivas, seleccionarCuenta, cambiarTipo, cambiarPeriodo).

[ ] T4 — Crear `AppNavigator.tsx` con Drawer + Stack Navigator. Configurar HomeScreen como pantalla principal.

[ ] T5 — Maquetar HomeScreen: cabecera con cuenta activa y total, botón de menú (Drawer), botón de transacciones. El total debe cambiar de color (verde/rojo) según el saldo.

[ ] T6 — Implementar `AccountModal.tsx`: modal con FlatList de cuentas (icono, nombre, total). Al seleccionar una cuenta, se actualiza el contexto y se cierra el modal.

[ ] T7 — Implementar `TypeTabs.tsx` (Gastos/Ingresos) y `PeriodTabs.tsx` (Día/Semana/Mes/Año/Período). Al cambiar un tab, actualizar el contexto y re-renderizar gráficos y lista.

[ ] T8 — Implementar `CalendarPicker.tsx` con DateTimePicker nativo. No permitir seleccionar fechas futuras. Para el tab "Período", mostrar selector de rango.

[ ] T9 — Implementar `DonutChart.tsx` con react-native-svg (círculos con strokeDasharray). Implementar `BarChart.tsx` (barras horizontales apiladas con View). Toggle entre ambos al pulsar.

[ ] T10 — Implementar `CategoryList.tsx` con FlatList: icono SVG, nombre, porcentaje, total. Al pulsar una categoría, navegar a TransactionsScreen con filtro.

[ ] T11 — Agregar FAB "+" (TouchableOpacity flotante) que navega a AddTransaction. Agregar botón de transacciones en cabecera que navega a TransactionsScreen.

[ ] T12 — Implementar `storage.ts` con funciones CRUD para AsyncStorage (getCuentas, saveTransaccion, getTransacciones, etc.). Conectar con el contexto.

[ ] T13 — Verificación: `npx expo start` y probar en emulador iOS/Android. Validar todos los criterios de aceptación de `1-spec.md`.
