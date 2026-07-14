# 014 — Página de transacciones

- **Objetivo**
  Pantalla accesible desde la pantalla principal (HomeScreen) que muestre la lista de transacciones filtrada por categoría, cuenta y período. Permite cambiar la cuenta, ordenar las transacciones y navegar a añadir una nueva transacción. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde `HomeScreen` al pulsar una categoría del desglose (CategoryList).
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a `HomeScreen`.
- El título del header es "Transacciones" (multilingual).
- Se pasa como parámetro de navegación: `categoryId` (opcional), `type` (expense/income), `period`, `startDate`, `endDate`.

### 2. Selector de cuenta

- Fila horizontal en la parte superior, lado izquierdo.
- Muestra: icono de la cuenta (con color de fondo) + nombre de la cuenta + icono chevron-down.
- La cuenta por defecto es la seleccionada en el HomeScreen (`activeAccount` del `AppContext`).
- Al pulsar, se abre un modal de selección de cuenta:

**Modal "Seleccione una cuenta"**
- Título: "Seleccione una cuenta" (multilingual).
- Lista de todas las cuentas del usuario, cada fila con:
  - Radio button (selección única).
  - Icono de la cuenta (con color de fondo).
  - Nombre de la cuenta.
  - Saldo formateado con `formatCurrency()`.
- Solo una cuenta puede seleccionarse a la vez.
- Botones: "Cancelar" (multilingual) y "Seleccionar" (multilingual).
- Al pulsar "Cancelar", se cierra el modal sin cambiar la cuenta.
- Al pulsar "Seleccionar", se actualiza la cuenta seleccionada y se recargan las transacciones filtradas por esa cuenta.

### 3. Ordenación

- Fila horizontal en la parte superior, lado derecho.
- Dos opciones de ordenación que funcionan como toggle:
  - **"Por fecha"** (multilingual): ordena por fecha de la transacción.
  - **"Por cantidad"** (multilingual): ordena por cantidad de la transacción.
- La opción activa se muestra con color primario; la inactiva en color suave.
- Junto al texto de la opción activa, un icono de flecha (↓ o ↑) que indica la dirección:
  - ↓ = descendente (mayor a menor / más reciente a más antiguo).
  - ↑ = ascendente (menor a mayor / más antiguo a más reciente).
- Al pulsar el icono de flecha, se invierte la dirección (ASC ↔ DESC).
- Al pulsar el texto de la otra opción, se cambia el criterio de ordenación y se mantiene la dirección actual.
- **Valores por defecto:** ordenar por fecha descendente (↓, más reciente primero).

### 4. Lista de transacciones

- FlatList con las transacciones filtradas por:
  - Cuenta seleccionada (punto 2).
  - Categoría (parámetro `categoryId` de navegación).
  - Período (parámetros `startDate` y `endDate` de navegación).
- **Agrupación por fecha:** las transacciones se agrupan por día. Cada grupo tiene:
  - **Fila de encabezado:** fecha formateada (ej: "14 de julio de 2026", multilingual).
  - **Filas de transacción:** una por cada transacción del día, con:
    - Icono de la categoría (con color de fondo).
    - Nombre de la categoría.
    - Descripción/mensaje de la transacción.
    - Cantidad formateada con `formatCurrency()`, en verde si es ingreso, rojo si es gasto.
- Si no hay transacciones para los filtros seleccionados, se muestra estado vacío: "No hay transacciones" (multilingual).

### 5. Botón flotante "+"

- Botón flotante "+" en la esquina inferior derecha (mismo estilo que en AccountsScreen).
- Al pulsar, navega a `AddTransactionScreen` (004).
- El botón se superpone sobre la lista de transacciones (position absolute).

---

## Requisitos no funcionales

- **Multilingual**: todos los textos visibles deben usar `t()` del sistema i18n existente.
- **Configuración**: usar `useConfig().activeColors` para colores.
- **Texto**: usar `useFontSize()` para escalado.
- **Navegación**: se añade al `HomeStack` en `AppNavigator.tsx`.
- **Persistencia**: las transacciones se cargan desde `transactionRepository` (SQLite nativo / localStorage web).
- **Formato monetario**: usar `formatCurrency()` existente (máximo 2 decimales).
- **Iconos**: `@expo/vector-icons` (Ionicons).

---

## Criterios de aceptación

- [ ] El header muestra flecha de retroceso y título "Transacciones" en el idioma activo.
- [ ] Se muestra la cuenta seleccionada con icono + nombre + chevron-down.
- [ ] Al pulsar la cuenta, se abre el modal con lista de cuentas (radio + icono + nombre + saldo).
- [ ] El modal permite cancelar o seleccionar una cuenta diferente.
- [ ] Se muestra el toggle de ordenación con "Por fecha" y "Por cantidad".
- [ ] La opción activa tiene color primario y flecha de dirección.
- [ ] Al pulsar la flecha, se invierte la dirección (ASC ↔ DESC).
- [ ] Al pulsar la otra opción, se cambia el criterio de ordenación.
- [ ] Por defecto, las transacciones se ordenan por fecha descendente.
- [ ] Las transacciones se agrupan por día con encabezado de fecha formateada.
- [ ] Cada transacción muestra icono de categoría + nombre + descripción + cantidad con color.
- [ ] La lista se filtra por cuenta, categoría y período.
- [ ] Si no hay transacciones, se muestra estado vacío.
- [ ] El botón flotante "+" navega a "Añadir transacción" (004).
- [ ] Todos los textos cambian al cambiar el idioma.
- [ ] La pantalla respeta el tema activo y el tamaño de texto.
