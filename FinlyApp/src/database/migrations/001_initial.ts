import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate001(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT,
      avatar TEXT,
      moneda TEXT NOT NULL DEFAULT '€',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS cuentas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      saldo_inicial REAL NOT NULL DEFAULT 0,
      icono TEXT NOT NULL DEFAULT 'wallet',
      color TEXT NOT NULL DEFAULT '#22D3EE',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      icono TEXT NOT NULL DEFAULT 'tag',
      color TEXT NOT NULL DEFAULT '#A78BFA',
      tipo TEXT NOT NULL CHECK(tipo IN ('gasto', 'ingreso')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transacciones (
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

    CREATE INDEX IF NOT EXISTS idx_cuentas_usuario ON cuentas(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON categorias(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_categorias_tipo ON categorias(usuario_id, tipo);
    CREATE INDEX IF NOT EXISTS idx_transacciones_cuenta ON transacciones(cuenta_id, fecha);
    CREATE INDEX IF NOT EXISTS idx_transacciones_categoria ON transacciones(categoria_id, fecha);
    CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo, fecha);
  `);
}
