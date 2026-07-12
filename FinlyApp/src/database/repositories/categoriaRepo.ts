import { getDatabase } from '../database';
import { Categoria } from '../types';
import { TipoTransaccion } from '../../constants/types';

export const categoriaRepo = {
  async listar(usuarioId: number, tipo?: TipoTransaccion): Promise<Categoria[]> {
    const db = getDatabase();
    if (tipo) {
      return await db.getAllAsync<Categoria>(
        `SELECT * FROM categorias WHERE usuario_id = ? AND tipo = ? ORDER BY nombre`,
        usuarioId, tipo
      );
    }
    return await db.getAllAsync<Categoria>(
      `SELECT * FROM categorias WHERE usuario_id = ? ORDER BY nombre`,
      usuarioId
    );
  },

  async insertar(datos: Omit<Categoria, 'id' | 'created_at'>): Promise<Categoria> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO categorias (usuario_id, nombre, icono, color, tipo) VALUES (?, ?, ?, ?, ?)`,
      datos.usuario_id, datos.nombre, datos.icono, datos.color, datos.tipo
    );
    return { ...datos, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async actualizar(id: number, datos: Partial<Omit<Categoria, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const campos: string[] = [];
    const valores: (string | number)[] = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.icono !== undefined) { campos.push('icono = ?'); valores.push(datos.icono); }
    if (datos.color !== undefined) { campos.push('color = ?'); valores.push(datos.color); }
    if (datos.tipo !== undefined) { campos.push('tipo = ?'); valores.push(datos.tipo); }

    if (campos.length === 0) return;

    valores.push(id);
    await db.runAsync(
      `UPDATE categorias SET ${campos.join(', ')} WHERE id = ?`,
      ...valores
    );
  },

  async eliminar(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(`DELETE FROM categorias WHERE id = ?`, id);
  },
};
