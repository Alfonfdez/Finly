# Implementation plan — 002 Local database design

## Technical decision: SQLite with expo-sqlite

AsyncStorage is replaced with **SQLite** using the `expo-sqlite` module (included in Expo SDK). Reasons:

- **Relational model**: finances have natural relationships (users → accounts → transactions → categories). SQLite is the standard for embedded databases.
- **Complex queries**: aggregations by period and category with `GROUP BY`, `SUM`, date filters.
- **Referential integrity**: foreign keys with `ON DELETE CASCADE`.
- **Performance**: SQLite handles thousands of transactions without issues; AsyncStorage degrades with volume.
- **Future migration**: makes it easier to export to a server if synchronization is needed.
- **Native support in Expo**: `expo-sqlite` works without eject or additional native configurations.
- **Indexes**: creation of indexes to optimize frequent queries by account, category, type, and date.

## New dependencies

```bash
npx expo install expo-sqlite
```

## Files

```
FinlyApp/src/
├── database/
│   ├── database.ts           ← initialization, migrations, connection
│   ├── migrations/
│   │   ├── 001_initial.ts    ← CREATE TABLES + CREATE INDEX
│   │   └── 002_seed.ts       ← insertion of initial test data
│   ├── repositories/
│   │   ├── usuarioRepo.ts    ← CRUD users
│   │   ├── cuentaRepo.ts     ← CRUD accounts
│   │   ├── categoriaRepo.ts  ← CRUD categories
│   │   └── transaccionRepo.ts← CRUD transactions + aggregated queries
│   └── types.ts              ← TypeScript interfaces (Cuenta, Categoria, Transaccion)
│
└── context/
    └── AppContext.tsx         ← updated to use SQLite repositories
```

## Data architecture

```
AppContext
  └── repositories (data access layer)
        └── database.ts (SQLite connection)
              └── Finly.db (local file)
```

## Initialization flow

1. `App.tsx` calls `initDatabase()` in `database.ts`.
2. `database.ts` opens/creates `Finly.db` and runs pending migrations.
3. If it is the first time, `002_seed.ts` inserts test data (mockData) into the database.
4. `AppContext.tsx` connects to the repositories and loads the initial state.
5. CRUD operations are done through the repositories, not directly.

## Versioned migrations

Each migration is numbered (001, 002, …). The database stores the current version in an internal `_migrations` table. On startup, migrations greater than the current version are executed in order.

- `001_initial.ts`: creates all tables (`usuarios`, `cuentas`, `categorias`, `transacciones`) and indexes.
- `002_seed.ts`: inserts the default user and test data (accounts, categories, and transactions from the current mockData).

## Main functions by repository

### usuarioRepo
- `insertar(datos)` → creates default user
- `obtenerPorId(id)` → gets user
- `actualizar(id, datos)` → modifies name, currency, etc.

### cuentaRepo
- `listar(usuarioId)` → all accounts
- `insertar(datos)` → new account
- `actualizar(id, datos)` → modify name, balance, icon
- `eliminar(id)` → deletes account and associated transactions
- `obtenerSaldoActual(id)` → initial balance + sum of income - sum of expenses

### categoriaRepo
- `listar(usuarioId, tipo?)` → all or filtered by type
- `insertar(datos)` → new category
- `actualizar(id, datos)` → modify name, icon, color
- `eliminar(id)` → deletes category and associated transactions

### transaccionRepo
- `listar(filtros)` → by account, category, type, date range
- `insertar(datos)` → new transaction
- `actualizar(id, datos)` → modify transaction
- `eliminar(id)` → delete transaction
- `totalPorPeriodo(usuarioId, tipo, fechaInicio, fechaFin)` → grouped SUM
- `desglosePorCategorias(usuarioId, tipo, fechaInicio, fechaFin)` → aggregation by category

## Test data loading (seed)

When creating the database for the first time, the current test data from mockData is inserted:

1. A default user is created (`Usuario Demo`).
2. Accounts are inserted: Efectivo, Banco, Ahorros (with `saldo_inicial: 0`).
3. Categories are inserted: Nómina, Freelance, Alimentación, Transporte, Ocio, Vivienda, Salud, Inversiones.
4. Example transactions are inserted with dates in `YYYY-MM-DD HH:MM:SS` format.

## Verification

Run `npx expo start` on an emulator/device. Verify that:
- The database is created without errors.
- Test data is loaded correctly on startup.
- Accounts, categories, and transactions can be created.
- Aggregation queries return correct values.
- All acceptance criteria from `1-spec.md` are met.
