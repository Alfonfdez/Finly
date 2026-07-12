import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrate003(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS configuracion (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
  `);

  const defaults: [string, string][] = [
    ['tema', 'oscuro'],
    ['primerDiaSemana', '1'],
    ['divisa', '€'],
    ['separadorDecimal', ','],
    ['idioma', 'es'],
    ['tamanoTexto', 'mediano'],
  ];

  for (const [clave, valor] of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)',
      clave,
      valor
    );
  }
}
