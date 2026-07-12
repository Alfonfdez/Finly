import { type SQLiteDatabase } from 'expo-sqlite';

export async function seed004(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    const categorias = [
      [9, 1, 'Viaje', 'airplane-outline', '#38BDF8', 'gasto'],
      [10, 1, 'Videojuego', 'game-controller-outline', '#A78BFA', 'gasto'],
      [11, 1, 'Juego', 'dice-outline', '#FB923C', 'gasto'],
      [12, 1, 'Restaurante', 'restaurant-outline', '#F87171', 'gasto'],
      [13, 1, 'Educación', 'school-outline', '#34D399', 'gasto'],
      [14, 1, 'Familia', 'people-outline', '#F472B6', 'gasto'],
      [15, 1, 'Compras', 'bag-outline', '#FBBF24', 'gasto'],
      [16, 1, 'Ropa', 'shirt-outline', '#C084FC', 'gasto'],
      [17, 1, 'Ejercicio', 'fitness-outline', '#22D3EE', 'gasto'],
      [18, 1, 'Otros', 'ellipsis-horizontal-outline', '#94A3B8', 'gasto'],
      [19, 1, 'Entretenimiento', 'film-outline', '#E879F9', 'gasto'],
      [20, 1, 'Regalos', 'gift-outline', '#FB7185', 'gasto'],
      [21, 1, 'Regalo', 'gift-outline', '#FB7185', 'ingreso'],
      [22, 1, 'Otro', 'ellipsis-horizontal-outline', '#94A3B8', 'ingreso'],
      [23, 1, 'Intereses', 'wallet-outline', '#4ADE80', 'ingreso'],
    ];

    for (const [id, usuario_id, nombre, icono, color, tipo] of categorias) {
      await db.runAsync(
        `INSERT OR IGNORE INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
        id, usuario_id, nombre, icono, color, tipo
      );
    }
  });
}
