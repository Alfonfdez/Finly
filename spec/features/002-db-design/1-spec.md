# 002 — Local database design

- **Goal**
Design and implement a local SQLite database that stores user, account, category, and transaction information. Replace the use of AsyncStorage with a relational database that allows complex queries, referential integrity, and better performance with large volumes of data. Existing test data is loaded as an initial seed in the database.

- **Functional requirements**
1. User management (local multi-user support if switching profiles on the same device is desired).
2. Full CRUD for accounts: each account belongs to a user, has a name, initial balance, icon, and color.
3. Full CRUD for categories: each category belongs to a user, has a name, icon, color, and type (expense/income).
4. Full CRUD for transactions: each transaction belongs to an account and a category, has a type (expense/income), amount, description, and date.
5. Efficient queries by period (day, week, month, year, custom range) and by type (expense/income).
6. Aggregations: total income and expenses by period, breakdown by categories with percentages.
7. Initial loading of test data (mockData) when creating the database for the first time.

- **Contents**
SQL schema of the tables, initialization script, CRUD functions in TypeScript, migration from AsyncStorage.

- **Non-functional requirements**
- The database must be created when the app starts for the first time.
- Migrations must be versioned so the schema can be updated in the future.
- Queries must run on the main thread without blocking the UI (use `expo-sqlite` with await).
- Data must be persisted locally without an internet connection.
- The structure must support cascading deletes (e.g., when deleting a category, transactions of that category are also deleted).
- Dates are stored in TEXT format with the pattern `YYYY-MM-DD HH:MM:SS`.
- TypeScript type names must match those in the existing code: `Cuenta`, `Categoria`, `Transaccion`.
- Indexes must be created on frequently queried columns to optimize performance.

- **Out of scope**
Cloud sync, remote authentication, external server, real-time database, migration from AsyncStorage (the app does not yet have production data).

- **Proposed table schema**

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  moneda TEXT NOT NULL DEFAULT '€',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE cuentas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  saldo_inicial REAL NOT NULL DEFAULT 0,
  icono TEXT NOT NULL DEFAULT 'wallet',
  color TEXT NOT NULL DEFAULT '#22D3EE',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#A78BFA',
  tipo TEXT NOT NULL CHECK(tipo IN ('gasto', 'ingreso')),
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE transacciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuenta_id INTEGER NOT NULL,
  categoria_id INTEGER NOT NULL,
  tipo TEXT NOT NULL CHECK(tipo IN ('gasto', 'ingreso')),
  cantidad REAL NOT NULL CHECK(cantidad > 0),
  descripcion TEXT,
  fecha TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE CASCADE,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Indexes to optimize frequent queries
CREATE INDEX idx_cuentas_usuario ON cuentas(usuario_id);
CREATE INDEX idx_categorias_usuario ON categorias(usuario_id);
CREATE INDEX idx_categorias_tipo ON categorias(usuario_id, tipo);
CREATE INDEX idx_transacciones_cuenta ON transacciones(cuenta_id, fecha);
CREATE INDEX idx_transacciones_categoria ON transacciones(categoria_id, fecha);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo, fecha);
```

- **Date format**
All dates are stored in TEXT format with the pattern `YYYY-MM-DD HH:MM:SS`. Example: `'2026-07-01 14:30:00'`. `datetime('now', 'localtime')` is used to automatically generate `created_at` and `fecha` is stored when creating the transaction.

- **Acceptance criteria**
- [ ] The database is created automatically when the app starts if it does not exist.
- [ ] Test data (mockData) is loaded as a seed when creating the database.
- [ ] A user, accounts, categories, and transactions can be inserted.
- [ ] Aggregation queries by period return the correct totals.
- [ ] When deleting a category, its associated transactions are also deleted.
- [ ] When deleting an account, its associated transactions are also deleted.
- [ ] When deleting a user, all their associated data is also deleted.
- [ ] Insertions and queries do not block the user interface.
- [ ] TypeScript type names match the existing ones: `Cuenta`, `Categoria`, `Transaccion`.
