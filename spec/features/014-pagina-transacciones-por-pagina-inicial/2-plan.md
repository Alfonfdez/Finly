# Plan de implementación — 014 Página de transacciones (desde página inicial)

## Archivos a crear

```
src/
├── screens/
│   └── TransactionsScreen.tsx       ← reescribir pantalla existente (actualmente básica)
│
├── components/
│   ├── AccountSelector.tsx          ← fila de cuenta + modal de selección
│   ├── SortToggle.tsx               ← toggle Por fecha / Por cantidad con flecha
│   └── TransactionGroup.tsx         ← grupo de transacciones por día (encabezado + filas)
```

## Archivos a modificar

```
src/
├── i18n/
│   ├── en.ts                        ← añadir claves para Transactions
│   ├── es.ts                        ← añadir claves para Transactions
│   └── ca.ts                        ← añadir claves para Transactions
│
├── navigation/
│   └── AppNavigator.tsx             ← actualizar opciones de TransactionsScreen
│
├── constants/
│   └── types.ts                     ← ampliar parámetros de Transactions
│
└── context/
    └── AppContext.tsx                ← verificar que activeAccount está disponible
```

---

## Arquitectura

### TransactionsScreen (reescribir)

Pantalla que muestra transacciones filtradas y ordenadas. Estructura de layout: `SafeAreaView > View.container(flex:1) > [categoryInfo, controls, SectionList, FAB(absolute)]`. No se usa `keyboardSpacer`. Estado local:

```ts
interface TransactionsState {
  selectedAccountId: number;         // cuenta activa (default: activeAccount del AppContext)
  sortBy: 'date' | 'amount';        // criterio de ordenación
  sortDirection: 'asc' | 'desc';    // dirección
}
```

Parámetros de navegación:

```ts
Transactions: {
  categoryId?: number;
  type?: TransactionType;
  period?: Period;
  startDate?: string;
  endDate?: string;
} | undefined;
```

Header: usa el header del Stack navigator (icono + "Transacciones").
Sección de categoría: icono + nombre + total con color (verde/rojo) y prefijo (+/-).

### AccountSelector

- Muestra fila con icono de cuenta (color de fondo) + nombre + chevron-down.
- Al pulsar, abre modal con lista de cuentas (radio + icono + nombre + saldo).
- Props: `accounts: Account[]`, `selectedId: number`, `onSelect(id: number)`, `onCancel()`.
- Reutiliza el patrón del modal de cuentas existente en HomeScreen (`AccountModal`).

### SortToggle

- Fila horizontal con dos textos: "Por fecha" y "Por cantidad".
- La opción activa tiene color primario + icono de flecha (↓/↑).
- La opción inactiva tiene color suave.
- Al pulsar el texto de la otra opción: cambia criterio, mantiene dirección.
- Al pulsar la flecha: invierte dirección (ASC ↔ DESC).
- Props: `sortBy: 'date' | 'amount'`, `direction: 'asc' | 'desc'`, `onToggleSort(field)`, `onToggleDirection()`.

### TransactionGroup

- Encabezado: fecha formateada (ej: "14 de julio de 2026").
- Lista de transacciones del día: icono categoría + nombre categoría + descripción + cantidad.
- Props: `date: string`, `transactions: Transaction[]`, `categories: Category[]`.

### Flujo de datos

```
HomeScreen → pulsar categoría → TransactionsScreen { categoryId, type, period, startDate, endDate }
  ├── cargar transacciones filtradas (cuenta + categoría + período)
  ├── AccountSelector → cambiar cuenta → recargar transacciones
  ├── SortToggle → cambiar orden → reordenar lista
  └── FAB "+" → navegar a AddTransactionScreen
```

### i18n

| Clave | EN | ES | CA |
|---|---|---|---|
| `transactions_title` | Transactions | Transacciones | Transaccions |
| `transactions_empty` | No transactions | No hay transacciones | No hi ha transaccions |
| `transactions_select_account` | Select account | Seleccionar cuenta | Seleccionar compte |
| `transactions_cancel` | Cancel | Cancelar | Cancel·lar |
| `transactions_confirm` | Select | Seleccionar | Seleccionar |
| `transactions_sort_date` | By date | Por fecha | Per data |
| `transactions_sort_amount` | By amount | Por cantidad | Per quantitat |

### Persistencia

Las transacciones se cargan desde `transactionRepository.list()` con filtros:
- `account_id = selectedAccountId`
- `category_id = categoryId` (si se proporciona)
- `date >= startDate AND date <= endDate` (si se proporcionan)

La ordenación se hace en memoria después de cargar.

---

## Decisiones

- **Reescribir vs crear nueva**: se reescribe `TransactionsScreen.tsx` existente (actualmente es un placeholder básico).
- **Reutilizar componentes**: `AccountModal` existente se adapta para el selector de cuentas con radio buttons.
- **Ordenación en memoria**: las transacciones se cargan filtradas de la DB y se ordenan en JS para simplificar.
- **Parámetros de navegación ampliados**: se añaden `period`, `startDate`, `endDate` para filtrar por período del HomeScreen.

## Verificación

1. `npx expo start --web` — probar navegación desde categoría del Home, selector de cuenta, ordenación.
2. `npx expo start` + Expo Go — probar en nativo.
3. Validar todos los criterios de aceptación de `1-spec.md`.
4. Cambiar idioma y verificar textos.
5. Cambiar tema y verificar colores.
6. Cambiar tamaño de texto y verificar escalado.
