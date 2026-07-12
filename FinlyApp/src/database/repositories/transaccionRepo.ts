import { getDatabase } from '../database';
import { Transaccion } from '../types';
import { TipoTransaccion } from '../../constants/types';

interface FiltrosTransaccion {
  cuenta_id?: number;
  categoria_id?: number;
  tipo?: TipoTransaccion;
  fecha_inicio?: string;
  fecha_fin?: string;
}

interface TotalPorPeriodo {
  total: number;
}

interface DesglosePorCategoria {
  categoria_id: number;
  nombre: string;
  icono: string;
  color: string;
  total: number;
}

export const transaccionRepo = {
  async listar(filtros: FiltrosTransaccion = {}): Promise<Transaccion[]> {
    const db = getDatabase();
    let sql = `SELECT * FROM transacciones WHERE 1=1`;
    const params: (string | number)[] = [];

    if (filtros.cuenta_id !== undefined) {
      sql += ` AND cuenta_id = ?`;
      params.push(filtros.cuenta_id);
    }
    if (filtros.categoria_id !== undefined) {
      sql += ` AND categoria_id = ?`;
      params.push(filtros.categoria_id);
    }
    if (filtros.tipo !== undefined) {
      sql += ` AND tipo = ?`;
      params.push(filtros.tipo);
    }
    if (filtros.fecha_inicio !== undefined) {
      sql += ` AND fecha >= ?`;
      params.push(filtros.fecha_inicio);
    }
    if (filtros.fecha_fin !== undefined) {
      sql += ` AND fecha <= ?`;
      params.push(filtros.fecha_fin);
    }

    sql += ` ORDER BY fecha DESC`;

    return await db.getAllAsync<Transaccion>(sql, ...params);
  },

  async insertar(datos: Omit<Transaccion, 'id' | 'created_at'>): Promise<Transaccion> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO transacciones (cuenta_id, categoria_id, tipo, cantidad, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?)`,
      datos.cuenta_id, datos.categoria_id, datos.tipo, datos.cantidad, datos.descripcion ?? null, datos.fecha
    );
    return { ...datos, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async actualizar(id: number, datos: Partial<Omit<Transaccion, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const campos: string[] = [];
    const valores: (string | number | null)[] = [];

    if (datos.cuenta_id !== undefined) { campos.push('cuenta_id = ?'); valores.push(datos.cuenta_id); }
    if (datos.categoria_id !== undefined) { campos.push('categoria_id = ?'); valores.push(datos.categoria_id); }
    if (datos.tipo !== undefined) { campos.push('tipo = ?'); valores.push(datos.tipo); }
    if (datos.cantidad !== undefined) { campos.push('cantidad = ?'); valores.push(datos.cantidad); }
    if (datos.descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(datos.descripcion); }
    if (datos.fecha !== undefined) { campos.push('fecha = ?'); valores.push(datos.fecha); }

    if (campos.length === 0) return;

    valores.push(id);
    await db.runAsync(
      `UPDATE transacciones SET ${campos.join(', ')} WHERE id = ?`,
      ...valores
    );
  },

  async eliminar(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM transacciones WHERE id = ?`, id);
  },

  async totalPorPeriodo(
    cuentaId: number,
    tipo: TipoTransaccion,
    fechaInicio: string,
    fechaFin: string
  ): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<TotalPorPeriodo>(
      `SELECT COALESCE(SUM(cantidad), 0) AS total
       FROM transacciones
       WHERE cuenta_id = ? AND tipo = ? AND fecha >= ? AND fecha <= ?`,
      cuentaId, tipo, fechaInicio, fechaFin
    );
    return result?.total ?? 0;
  },

  async desglosePorCategorias(
    cuentaId: number,
    tipo: TipoTransaccion,
    fechaInicio: string,
    fechaFin: string
  ): Promise<DesglosePorCategoria[]> {
    const db = getDatabase();
    return await db.getAllAsync<DesglosePorCategoria>(
      `SELECT t.categoria_id, c.nombre, c.icono, c.color, SUM(t.cantidad) AS total
       FROM transacciones t
       INNER JOIN categorias c ON t.categoria_id = c.id
       WHERE t.cuenta_id = ? AND t.tipo = ? AND t.fecha >= ? AND t.fecha <= ?
       GROUP BY t.categoria_id
       ORDER BY total DESC`,
      cuentaId, tipo, fechaInicio, fechaFin
    );
  },
};
