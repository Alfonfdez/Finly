import { getDatabase } from '../database';
import { Cuenta } from '../types';

export const cuentaRepo = {
  async listar(usuarioId: number): Promise<Cuenta[]> {
    const db = getDatabase();
    return await db.getAllAsync<Cuenta>(
      `SELECT * FROM cuentas WHERE usuario_id = ? ORDER BY nombre`,
      usuarioId
    );
  },

  async insertar(datos: Omit<Cuenta, 'id' | 'created_at'>): Promise<Cuenta> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO cuentas (usuario_id, nombre, saldo_inicial, icono, color) VALUES (?, ?, ?, ?, ?)`,
      datos.usuario_id, datos.nombre, datos.saldo_inicial, datos.icono, datos.color
    );
    return { ...datos, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async actualizar(id: number, datos: Partial<Omit<Cuenta, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const campos: string[] = [];
    const valores: (string | number)[] = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.saldo_inicial !== undefined) { campos.push('saldo_inicial = ?'); valores.push(datos.saldo_inicial); }
    if (datos.icono !== undefined) { campos.push('icono = ?'); valores.push(datos.icono); }
    if (datos.color !== undefined) { campos.push('color = ?'); valores.push(datos.color); }

    if (campos.length === 0) return;

    valores.push(id);
    await db.runAsync(
      `UPDATE cuentas SET ${campos.join(', ')} WHERE id = ?`,
      ...valores
    );
  },

  async eliminar(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM cuentas WHERE id = ?`, id);
  },

  async obtenerSaldoActual(id: number): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ saldo: number }>(
      `SELECT c.saldo_inicial + COALESCE(
        (SELECT SUM(t.cantidad) FROM transacciones t WHERE t.cuenta_id = c.id AND t.tipo = 'ingreso'), 0
      ) - COALESCE(
        (SELECT SUM(t.cantidad) FROM transacciones t WHERE t.cuenta_id = c.id AND t.tipo = 'gasto'), 0
      ) AS saldo
      FROM cuentas c WHERE c.id = ?`,
      id
    );
    return result?.saldo ?? 0;
  },
};
