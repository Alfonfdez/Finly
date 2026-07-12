import { getDatabase } from '../database';
import { Usuario } from '../types';

export const usuarioRepo = {
  async insertar(datos: Omit<Usuario, 'id' | 'created_at'>): Promise<Usuario> {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT INTO usuarios (nombre, email, avatar, moneda) VALUES (?, ?, ?, ?)`,
      datos.nombre, datos.email ?? null, datos.avatar ?? null, datos.moneda
    );
    return { ...datos, id: result.lastInsertRowId, created_at: new Date().toISOString() };
  },

  async obtenerPorId(id: number): Promise<Usuario | null> {
    const db = getDatabase();
    return await db.getFirstAsync<Usuario>(
      `SELECT * FROM usuarios WHERE id = ?`,
      id
    );
  },

  async actualizar(id: number, datos: Partial<Omit<Usuario, 'id' | 'created_at'>>): Promise<void> {
    const db = getDatabase();
    const campos: string[] = [];
    const valores: (string | number | null)[] = [];

    if (datos.nombre !== undefined) { campos.push('nombre = ?'); valores.push(datos.nombre); }
    if (datos.email !== undefined) { campos.push('email = ?'); valores.push(datos.email); }
    if (datos.avatar !== undefined) { campos.push('avatar = ?'); valores.push(datos.avatar); }
    if (datos.moneda !== undefined) { campos.push('moneda = ?'); valores.push(datos.moneda); }

    if (campos.length === 0) return;

    valores.push(id);
    await db.runAsync(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      ...valores
    );
  },
};
