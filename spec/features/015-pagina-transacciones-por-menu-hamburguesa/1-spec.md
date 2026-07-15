# 015 — Página de transacciones (desde menú hamburguesa)

- **Objetivo**
  Pantalla accesible desde el menú hamburguesa (drawer) que muestre la lista completa de transacciones del usuario, sin filtros de categoría ni período. Permite filtrar por cuenta, ordenar las transacciones y navegar a añadir una nueva transacción. Todos los textos son multilingües (es/en/ca).

---

## Requisitos funcionales

### 1. Acceso y navegación

- La pantalla se accede desde dos puntos:
  - **Menú hamburguesa (drawer):** pulsando "Transacciones".
  - **HomeScreen:** pulsando el icono de estadísticas (stats-chart-outline) en la parte superior derecha.
- La pantalla tiene un botón de retroceso (flecha izquierda) en el header para volver a la pantalla anterior.
- El título del header es "Todas las transacciones" (multilingual: es: "Todas las transacciones", en: "All transactions", ca: "Totes les transaccions").
- **No se pasa ningún parámetro de navegación** (sin `categoryId`, `type`, `period`, `startDate`, `endDate`).
- Se muestran todas las transacciones de todas las categorías, tipos y períodos.

### 2. Selector de cuenta y saldo

- Igual que en 014 (sección 2).
- La cuenta por defecto es la seleccionada en el HomeScreen (`activeAccount` del `AppContext`).
- Debajo del selector de cuenta se muestra el saldo total del período para la cuenta seleccionada:
  - Formateado con `formatCurrency()`.
  - Color verde con prefijo "+" si es positivo, rojo con prefijo "-" si es negativo.

### 3. Ordenación

- Igual que en 014 (sección 3).

### 4. Lista de transacciones

- FlatList con **todas** las transacciones del usuario, filtradas únicamente por:
  - Cuenta seleccionada (punto 2).
- **No se filtra por categoría ni por período** (a diferencia de 014).
- **Agrupación por fecha:** igual que en 014 (sección 4).
- Si no hay transacciones para la cuenta seleccionada, se muestra estado vacío: "No hay transacciones" (multilingual).

### 5. Botón flotante "+"

- Botón flotante "+" centrado en la parte inferior (mismo estilo que en 014).

---

## Requisitos no funcionales

- **Pantalla:** `AllTransactionsScreen.tsx` (pantalla independiente, no comparte componente con 014).
- **Estructura de layout:** `SafeAreaView > View.container(flex:1) > [controls, SectionList, FAB(absolute)]`. El FAB se posiciona con `position: absolute` dentro del container. No se usa `keyboardSpacer`.
- **Componentes compartidos:** reutiliza `AccountSelector`, `SortToggle` y `TransactionGroup` de 014.
- **Hook compartido:** reutiliza `useTransactionFilters` para filtrado, ordenación y agrupación.
- Igual que en 014 para el resto de requisitos no funcionales (multilingual, config, texto, iconos).
- **Persistencia**: las transacciones se cargan desde `transactionRepository.list()` **sin filtro de `account_id`** (carga todas las cuentas), y se filtra localmente por la cuenta seleccionada.

---

## Criterios de aceptación

- [ ] La pantalla se accede desde el menú hamburguesa y desde el icono de estadísticas del HomeScreen.
- [ ] El header muestra flecha de retroceso y título "Todas las transacciones" en el idioma activo.
- [ ] Se muestra la cuenta seleccionada con icono + nombre + chevron-down.
- [ ] Al pulsar la cuenta, se abre el modal con lista de cuentas (radio + icono + nombre + saldo).
- [ ] El modal permite cancelar o seleccionar una cuenta diferente.
- [ ] Debajo del selector de cuenta se muestra el saldo total con color (verde/rojo) y prefijo (+/-).
- [ ] Se muestra el toggle de ordenación con "Por fecha" y "Por cantidad".
- [ ] La opción activa tiene color primario y flecha de dirección.
- [ ] Al pulsar la flecha, se invierte la dirección (ASC ↔ DESC).
- [ ] Al pulsar la otra opción, se cambia el criterio de ordenación.
- [ ] Por defecto, las transacciones se ordenan por fecha descendente.
- [ ] Se muestran todas las transacciones de todas las categorías y tipos (sin filtro de categoría ni período).
- [ ] Las transacciones se agrupan por día con encabezado de fecha formateada.
- [ ] Cada transacción muestra icono de categoría + nombre + descripción + cantidad con color.
- [ ] La lista se filtra únicamente por cuenta seleccionada.
- [ ] Si no hay transacciones, se muestra estado vacío.
- [ ] El botón flotante "+" centrado navega a "Añadir transacción" (004).
- [ ] Todos los textos cambian al cambiar el idioma.
- [ ] La pantalla respeta el tema activo y el tamaño de texto.
