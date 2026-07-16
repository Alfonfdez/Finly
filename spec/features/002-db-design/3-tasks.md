# Tasks — 002 Local database design
Execution order. Check each task when completed.

[ ] T1 — Install `expo-sqlite`. Create `src/database/` folder with `database.ts`, `types.ts`, and `migrations/`.

[ ] T2 — Implement `database.ts`: open connection, run versioned migrations, expose the database instance.

[ ] T3 — Write `migrations/001_initial.ts` with the CREATE TABLE for all tables (usuarios, cuentas, categorias, transacciones) and necessary indexes.

[ ] T4 — Write `migrations/002_seed.ts` with test data insertion: default user, accounts, categories, and transactions from the current mockData.

[ ] T5 — Implement `types.ts` with TypeScript interfaces: `Cuenta`, `Categoria`, `Transaccion`.

[ ] T6 — Implement `usuarioRepo.ts`: insert default user, get, update.

[ ] T7 — Implement `cuentaRepo.ts`: list, insert, update, delete, obtenerSaldoActual.

[ ] T8 — Implement `categoriaRepo.ts`: list (with optional filter by type), insert, update, delete.

[ ] T9 — Implement `transaccionRepo.ts`: list with filters (account, category, type, date range), insert, update, delete. Aggregations: totalPorPeriodo, desglosePorCategorias.

[ ] T10 — Update `AppContext.tsx` to use SQLite repositories instead of mockData.

[ ] T11 — Verification: test on emulator that the database is created, test data is loaded, CRUD operations work, and aggregations return correct data.
