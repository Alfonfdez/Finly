import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate005(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    // Create new tables with English names and column names
    await db.execAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        avatar TEXT,
        currency TEXT NOT NULL DEFAULT '€',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        initial_balance REAL NOT NULL DEFAULT 0,
        icon TEXT NOT NULL DEFAULT 'wallet',
        color TEXT NOT NULL DEFAULT '#22D3EE',
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL DEFAULT 'tag',
        color TEXT NOT NULL DEFAULT '#A78BFA',
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        amount REAL NOT NULL CHECK(amount > 0),
        description TEXT,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // Migrate data from old tables to new tables
    await db.runAsync(
      `INSERT INTO users (id, name, email, avatar, currency, created_at)
       SELECT id, nombre, email, avatar, moneda, created_at FROM usuarios`
    );

    await db.runAsync(
      `INSERT INTO accounts (id, user_id, name, initial_balance, icon, color, created_at)
       SELECT id, usuario_id, nombre, saldo_inicial, icono, color, created_at FROM cuentas`
    );

    await db.runAsync(
      `INSERT INTO categories (id, user_id, name, icon, color, type, created_at)
       SELECT id, usuario_id, nombre, icono, color,
         CASE tipo WHEN 'gasto' THEN 'expense' WHEN 'ingreso' THEN 'income' ELSE tipo END,
         created_at
       FROM categorias`
    );

    await db.runAsync(
      `INSERT INTO transactions (id, account_id, category_id, type, amount, description, date, created_at)
       SELECT id, cuenta_id, categoria_id,
         CASE tipo WHEN 'gasto' THEN 'expense' WHEN 'ingreso' THEN 'income' ELSE tipo END,
         cantidad, descripcion, fecha, created_at
       FROM transacciones`
    );

    // Migrate config with key and value transformations
    await db.runAsync(
      `INSERT INTO config (key, value)
       SELECT
         CASE clave
           WHEN 'tema' THEN 'theme'
           WHEN 'divisa' THEN 'currency'
           WHEN 'separadorDecimal' THEN 'decimal_separator'
           WHEN 'idioma' THEN 'language'
           WHEN 'tamanoTexto' THEN 'text_size'
           ELSE clave
         END,
         CASE
           WHEN clave = 'tema' AND valor IN ('oscuro', 'claro', 'sistema') THEN
             CASE valor
               WHEN 'oscuro' THEN 'dark'
               WHEN 'claro' THEN 'light'
               WHEN 'sistema' THEN 'system'
             END
           WHEN clave = 'tamanoTexto' AND valor IN ('pequeño', 'mediano', 'grande') THEN
             CASE valor
               WHEN 'pequeño' THEN 'small'
               WHEN 'mediano' THEN 'medium'
               WHEN 'grande' THEN 'large'
             END
           ELSE valor
         END
       FROM configuracion`
    );

    // Drop old tables
    await db.execAsync(`
      DROP TABLE IF EXISTS transacciones;
      DROP TABLE IF EXISTS categorias;
      DROP TABLE IF EXISTS cuentas;
      DROP TABLE IF EXISTS usuarios;
      DROP TABLE IF EXISTS configuracion;
    `);

    // Create indexes on new tables
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(user_id, type);
      CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id, date);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id, date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type, date);
    `);
  });
}
