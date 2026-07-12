import { type SQLiteDatabase } from 'expo-sqlite';

export async function seed002(db: SQLiteDatabase) {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO usuarios (id, nombre, email, moneda) VALUES (?, ?, ?, ?)`,
      1, 'Usuario Demo', null, '€'
    );

    await db.runAsync(
      `INSERT INTO cuentas (id, usuario_id, nombre, saldo_inicial, icono, color) VALUES (?, ?, ?, ?, ?, ?)`,
      1, 1, 'Efectivo', 0, 'wallet-outline', '#22D3EE'
    );
    await db.runAsync(
      `INSERT INTO cuentas (id, usuario_id, nombre, saldo_inicial, icono, color) VALUES (?, ?, ?, ?, ?, ?)`,
      2, 1, 'Banco', 0, 'business-outline', '#A78BFA'
    );
    await db.runAsync(
      `INSERT INTO cuentas (id, usuario_id, nombre, saldo_inicial, icono, color) VALUES (?, ?, ?, ?, ?, ?)`,
      3, 1, 'Ahorros', 0, 'cash-outline', '#34D399'
    );

    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      1, 1, 'Nómina', 'briefcase-outline', '#22D3EE', 'ingreso'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      2, 1, 'Freelance', 'code-slash-outline', '#A78BFA', 'ingreso'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      3, 1, 'Alimentación', 'cart-outline', '#F87171', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      4, 1, 'Transporte', 'bus-outline', '#FBBF24', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      5, 1, 'Ocio', 'musical-notes-outline', '#F472B6', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      6, 1, 'Vivienda', 'home-outline', '#60A5FA', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      7, 1, 'Salud', 'heart-outline', '#34D399', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      8, 1, 'Inversiones', 'trending-up-outline', '#A78BFA', 'ingreso'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      9, 1, 'Viaje', 'airplane-outline', '#38BDF8', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      10, 1, 'Videojuego', 'game-controller-outline', '#A78BFA', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      11, 1, 'Juego', 'dice-outline', '#FB923C', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      12, 1, 'Restaurante', 'restaurant-outline', '#F87171', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      13, 1, 'Educación', 'school-outline', '#34D399', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      14, 1, 'Familia', 'people-outline', '#F472B6', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      15, 1, 'Compras', 'bag-outline', '#FBBF24', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      16, 1, 'Ropa', 'shirt-outline', '#C084FC', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      17, 1, 'Ejercicio', 'fitness-outline', '#22D3EE', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      18, 1, 'Otros', 'ellipsis-horizontal-outline', '#94A3B8', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      19, 1, 'Entretenimiento', 'film-outline', '#E879F9', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      20, 1, 'Regalos', 'gift-outline', '#FB7185', 'gasto'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      21, 1, 'Regalo', 'gift-outline', '#FB7185', 'ingreso'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      22, 1, 'Otro', 'ellipsis-horizontal-outline', '#94A3B8', 'ingreso'
    );
    await db.runAsync(
      `INSERT INTO categorias (id, usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
      23, 1, 'Intereses', 'wallet-outline', '#4ADE80', 'ingreso'
    );

    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      1, 1, 1, 'ingreso', 2100.00, 'Nómina Julio', '2026-07-01 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      2, 1, 2, 'ingreso', 500.00, 'Proyecto web', '2026-07-05 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      3, 2, 3, 'gasto', 85.50, 'Compra semanal', '2026-07-03 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      4, 2, 4, 'gasto', 30.00, 'Gasolina', '2026-07-04 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      5, 1, 5, 'gasto', 45.00, 'Cine', '2026-07-06 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      6, 2, 6, 'gasto', 650.00, 'Alquiler Julio', '2026-07-01 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      7, 1, 3, 'gasto', 42.30, 'Restaurante', '2026-07-07 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      8, 2, 7, 'gasto', 25.00, 'Farmacia', '2026-07-08 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      9, 3, 8, 'ingreso', 200.00, 'Dividendos', '2026-07-10 00:00:00'
    );
    await db.runAsync(
      `INSERT INTO transacciones (id, cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      10, 1, 5, 'gasto', 12.50, 'Cafetería', '2026-07-10 00:00:00'
    );
  });
}
