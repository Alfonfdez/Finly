import { Platform } from 'react-native';
import { Usuario, Cuenta, Categoria, Transaccion } from './types';
import { TipoTransaccion } from '../constants/types';
import { Configuracion } from '../context/ConfigContext';

const STORAGE_PREFIX = '@Finly/';

function getStore<T>(key: string): T[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  return raw ? JSON.parse(raw) : [];
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function now(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// --- Initialization (no-op on web, data is seeded via localStorage) ---
export async function initWebStorage(): Promise<void> {
  const usuarios = getStore<Usuario>('usuarios');
  if (usuarios.length === 0) {
    seedWebData();
  } else {
    migrateWebCategories();
  }
}

function migrateWebCategories(): void {
  const categorias = getStore<Categoria>('categorias');
  const existingIds = new Set(categorias.map(c => c.id));

  const invalidIcons: Record<string, string> = {
    'gamepad-outline': 'game-controller-outline',
  };

  const iconById: Record<number, string> = {
    5: 'musical-notes-outline',
    10: 'game-controller-outline',
    23: 'wallet-outline',
  };

  let changed = false;
  const updated = categorias.map(c => {
    let icono = c.icono;
    if (iconById[c.id]) icono = iconById[c.id];
    if (invalidIcons[icono]) icono = invalidIcons[icono];
    if (icono !== c.icono) changed = true;
    return { ...c, icono };
  });

  if (changed) {
    setStore('categorias', updated);
  }

  const newCategories: Categoria[] = [
    { id: 9, usuario_id: 1, nombre: 'Viaje', icono: 'airplane-outline', color: '#38BDF8', tipo: 'gasto', created_at: now() },
    { id: 10, usuario_id: 1, nombre: 'Videojuego', icono: 'game-controller-outline', color: '#A78BFA', tipo: 'gasto', created_at: now() },
    { id: 11, usuario_id: 1, nombre: 'Juego', icono: 'dice-outline', color: '#FB923C', tipo: 'gasto', created_at: now() },
    { id: 12, usuario_id: 1, nombre: 'Restaurante', icono: 'restaurant-outline', color: '#F87171', tipo: 'gasto', created_at: now() },
    { id: 13, usuario_id: 1, nombre: 'Educación', icono: 'school-outline', color: '#34D399', tipo: 'gasto', created_at: now() },
    { id: 14, usuario_id: 1, nombre: 'Familia', icono: 'people-outline', color: '#F472B6', tipo: 'gasto', created_at: now() },
    { id: 15, usuario_id: 1, nombre: 'Compras', icono: 'bag-outline', color: '#FBBF24', tipo: 'gasto', created_at: now() },
    { id: 16, usuario_id: 1, nombre: 'Ropa', icono: 'shirt-outline', color: '#C084FC', tipo: 'gasto', created_at: now() },
    { id: 17, usuario_id: 1, nombre: 'Ejercicio', icono: 'fitness-outline', color: '#22D3EE', tipo: 'gasto', created_at: now() },
    { id: 18, usuario_id: 1, nombre: 'Otros', icono: 'ellipsis-horizontal-outline', color: '#94A3B8', tipo: 'gasto', created_at: now() },
    { id: 19, usuario_id: 1, nombre: 'Entretenimiento', icono: 'film-outline', color: '#E879F9', tipo: 'gasto', created_at: now() },
    { id: 20, usuario_id: 1, nombre: 'Regalos', icono: 'gift-outline', color: '#FB7185', tipo: 'gasto', created_at: now() },
    { id: 21, usuario_id: 1, nombre: 'Regalo', icono: 'gift-outline', color: '#FB7185', tipo: 'ingreso', created_at: now() },
    { id: 22, usuario_id: 1, nombre: 'Otro', icono: 'ellipsis-horizontal-outline', color: '#94A3B8', tipo: 'ingreso', created_at: now() },
    { id: 23, usuario_id: 1, nombre: 'Intereses', icono: 'wallet-outline', color: '#4ADE80', tipo: 'ingreso', created_at: now() },
  ];

  const toAdd = newCategories.filter(c => !existingIds.has(c.id));
  if (toAdd.length > 0) {
    const current = getStore<Categoria>('categorias');
    setStore('categorias', [...current, ...toAdd]);
  }
}

function seedWebData(): void {
  const usuarios: Usuario[] = [{ id: 1, nombre: 'Usuario Demo', email: null, avatar: null, moneda: '€', created_at: now() }];
  const cuentas: Cuenta[] = [
    { id: 1, usuario_id: 1, nombre: 'Efectivo', saldo_inicial: 0, icono: 'wallet-outline', color: '#22D3EE', created_at: now() },
    { id: 2, usuario_id: 1, nombre: 'Banco', saldo_inicial: 0, icono: 'business-outline', color: '#A78BFA', created_at: now() },
    { id: 3, usuario_id: 1, nombre: 'Ahorros', saldo_inicial: 0, icono: 'cash-outline', color: '#34D399', created_at: now() },
  ];
  const categorias: Categoria[] = [
    { id: 1, usuario_id: 1, nombre: 'Nómina', icono: 'briefcase-outline', color: '#22D3EE', tipo: 'ingreso', created_at: now() },
    { id: 2, usuario_id: 1, nombre: 'Freelance', icono: 'code-slash-outline', color: '#A78BFA', tipo: 'ingreso', created_at: now() },
    { id: 3, usuario_id: 1, nombre: 'Alimentación', icono: 'cart-outline', color: '#F87171', tipo: 'gasto', created_at: now() },
    { id: 4, usuario_id: 1, nombre: 'Transporte', icono: 'bus-outline', color: '#FBBF24', tipo: 'gasto', created_at: now() },
    { id: 5, usuario_id: 1, nombre: 'Ocio', icono: 'musical-notes-outline', color: '#F472B6', tipo: 'gasto', created_at: now() },
    { id: 6, usuario_id: 1, nombre: 'Vivienda', icono: 'home-outline', color: '#60A5FA', tipo: 'gasto', created_at: now() },
    { id: 7, usuario_id: 1, nombre: 'Salud', icono: 'heart-outline', color: '#34D399', tipo: 'gasto', created_at: now() },
    { id: 8, usuario_id: 1, nombre: 'Inversiones', icono: 'trending-up-outline', color: '#A78BFA', tipo: 'ingreso', created_at: now() },
    { id: 9, usuario_id: 1, nombre: 'Viaje', icono: 'airplane-outline', color: '#38BDF8', tipo: 'gasto', created_at: now() },
    { id: 10, usuario_id: 1, nombre: 'Videojuego', icono: 'game-controller-outline', color: '#A78BFA', tipo: 'gasto', created_at: now() },
    { id: 11, usuario_id: 1, nombre: 'Juego', icono: 'dice-outline', color: '#FB923C', tipo: 'gasto', created_at: now() },
    { id: 12, usuario_id: 1, nombre: 'Restaurante', icono: 'restaurant-outline', color: '#F87171', tipo: 'gasto', created_at: now() },
    { id: 13, usuario_id: 1, nombre: 'Educación', icono: 'school-outline', color: '#34D399', tipo: 'gasto', created_at: now() },
    { id: 14, usuario_id: 1, nombre: 'Familia', icono: 'people-outline', color: '#F472B6', tipo: 'gasto', created_at: now() },
    { id: 15, usuario_id: 1, nombre: 'Compras', icono: 'bag-outline', color: '#FBBF24', tipo: 'gasto', created_at: now() },
    { id: 16, usuario_id: 1, nombre: 'Ropa', icono: 'shirt-outline', color: '#C084FC', tipo: 'gasto', created_at: now() },
    { id: 17, usuario_id: 1, nombre: 'Ejercicio', icono: 'fitness-outline', color: '#22D3EE', tipo: 'gasto', created_at: now() },
    { id: 18, usuario_id: 1, nombre: 'Otros', icono: 'ellipsis-horizontal-outline', color: '#94A3B8', tipo: 'gasto', created_at: now() },
    { id: 19, usuario_id: 1, nombre: 'Entretenimiento', icono: 'film-outline', color: '#E879F9', tipo: 'gasto', created_at: now() },
    { id: 20, usuario_id: 1, nombre: 'Regalos', icono: 'gift-outline', color: '#FB7185', tipo: 'gasto', created_at: now() },
    { id: 21, usuario_id: 1, nombre: 'Regalo', icono: 'gift-outline', color: '#FB7185', tipo: 'ingreso', created_at: now() },
    { id: 22, usuario_id: 1, nombre: 'Otro', icono: 'ellipsis-horizontal-outline', color: '#94A3B8', tipo: 'ingreso', created_at: now() },
    { id: 23, usuario_id: 1, nombre: 'Intereses', icono: 'wallet-outline', color: '#4ADE80', tipo: 'ingreso', created_at: now() },
  ];
  const transacciones: Transaccion[] = [
    { id: 1, cuenta_id: 1, categoria_id: 1, tipo: 'ingreso', cantidad: 2100.00, descripcion: 'Nómina Julio', fecha: '2026-07-01 00:00:00', created_at: now() },
    { id: 2, cuenta_id: 1, categoria_id: 2, tipo: 'ingreso', cantidad: 500.00, descripcion: 'Proyecto web', fecha: '2026-07-05 00:00:00', created_at: now() },
    { id: 3, cuenta_id: 2, categoria_id: 3, tipo: 'gasto', cantidad: 85.50, descripcion: 'Compra semanal', fecha: '2026-07-03 00:00:00', created_at: now() },
    { id: 4, cuenta_id: 2, categoria_id: 4, tipo: 'gasto', cantidad: 30.00, descripcion: 'Gasolina', fecha: '2026-07-04 00:00:00', created_at: now() },
    { id: 5, cuenta_id: 1, categoria_id: 5, tipo: 'gasto', cantidad: 45.00, descripcion: 'Cine', fecha: '2026-07-06 00:00:00', created_at: now() },
    { id: 6, cuenta_id: 2, categoria_id: 6, tipo: 'gasto', cantidad: 650.00, descripcion: 'Alquiler Julio', fecha: '2026-07-01 00:00:00', created_at: now() },
    { id: 7, cuenta_id: 1, categoria_id: 3, tipo: 'gasto', cantidad: 42.30, descripcion: 'Restaurante', fecha: '2026-07-07 00:00:00', created_at: now() },
    { id: 8, cuenta_id: 2, categoria_id: 7, tipo: 'gasto', cantidad: 25.00, descripcion: 'Farmacia', fecha: '2026-07-08 00:00:00', created_at: now() },
    { id: 9, cuenta_id: 3, categoria_id: 8, tipo: 'ingreso', cantidad: 200.00, descripcion: 'Dividendos', fecha: '2026-07-10 00:00:00', created_at: now() },
    { id: 10, cuenta_id: 1, categoria_id: 5, tipo: 'gasto', cantidad: 12.50, descripcion: 'Cafetería', fecha: '2026-07-10 00:00:00', created_at: now() },
  ];
  setStore('usuarios', usuarios);
  setStore('cuentas', cuentas);
  setStore('categorias', categorias);
  setStore('transacciones', transacciones);
}

// --- Repositories (web) ---

export const webUsuarioRepo = {
  async insertar(datos: Omit<Usuario, 'id' | 'created_at'>): Promise<Usuario> {
    const items = getStore<Usuario>('usuarios');
    const item: Usuario = { ...datos, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('usuarios', items);
    return item;
  },
  async obtenerPorId(id: number): Promise<Usuario | null> {
    return getStore<Usuario>('usuarios').find(u => u.id === id) ?? null;
  },
  async actualizar(id: number, datos: Partial<Omit<Usuario, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Usuario>('usuarios');
    const idx = items.findIndex(u => u.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...datos };
    setStore('usuarios', items);
  },
};

export const webCuentaRepo = {
  async listar(usuarioId: number): Promise<Cuenta[]> {
    return getStore<Cuenta>('cuentas')
      .filter(c => c.usuario_id === usuarioId)
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  },
  async insertar(datos: Omit<Cuenta, 'id' | 'created_at'>): Promise<Cuenta> {
    const items = getStore<Cuenta>('cuentas');
    const item: Cuenta = { ...datos, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('cuentas', items);
    return item;
  },
  async actualizar(id: number, datos: Partial<Omit<Cuenta, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Cuenta>('cuentas');
    const idx = items.findIndex(c => c.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...datos };
    setStore('cuentas', items);
  },
  async eliminar(id: number): Promise<void> {
    const items = getStore<Cuenta>('cuentas');
    setStore('cuentas', items.filter(c => c.id !== id));
    const transacciones = getStore<Transaccion>('transacciones');
    setStore('transacciones', transacciones.filter(t => t.cuenta_id !== id));
  },
  async obtenerSaldoActual(id: number): Promise<number> {
    const cuentas = getStore<Cuenta>('cuentas');
    const transacciones = getStore<Transaccion>('transacciones');
    const cuenta = cuentas.find(c => c.id === id);
    if (!cuenta) return 0;
    const saldoTransacciones = transacciones
      .filter(t => t.cuenta_id === id)
      .reduce((sum, t) => sum + (t.tipo === 'ingreso' ? t.cantidad : -t.cantidad), 0);
    return cuenta.saldo_inicial + saldoTransacciones;
  },
};

export const webCategoriaRepo = {
  async listar(usuarioId: number, tipo?: TipoTransaccion): Promise<Categoria[]> {
    let items = getStore<Categoria>('categorias').filter(c => c.usuario_id === usuarioId);
    if (tipo) items = items.filter(c => c.tipo === tipo);
    return items.sort((a, b) => a.nombre.localeCompare(b.nombre));
  },
  async insertar(datos: Omit<Categoria, 'id' | 'created_at'>): Promise<Categoria> {
    const items = getStore<Categoria>('categorias');
    const item: Categoria = { ...datos, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('categorias', items);
    return item;
  },
  async actualizar(id: number, datos: Partial<Omit<Categoria, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Categoria>('categorias');
    const idx = items.findIndex(c => c.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...datos };
    setStore('categorias', items);
  },
  async eliminar(id: number): Promise<void> {
    const items = getStore<Categoria>('categorias');
    setStore('categorias', items.filter(c => c.id !== id));
    const transacciones = getStore<Transaccion>('transacciones');
    setStore('transacciones', transacciones.filter(t => t.categoria_id !== id));
  },
};

export const webTransaccionRepo = {
  async listar(filtros: { cuenta_id?: number; categoria_id?: number; tipo?: TipoTransaccion; fecha_inicio?: string; fecha_fin?: string } = {}): Promise<Transaccion[]> {
    let items = getStore<Transaccion>('transacciones');
    if (filtros.cuenta_id !== undefined) items = items.filter(t => t.cuenta_id === filtros.cuenta_id);
    if (filtros.categoria_id !== undefined) items = items.filter(t => t.categoria_id === filtros.categoria_id);
    if (filtros.tipo !== undefined) items = items.filter(t => t.tipo === filtros.tipo);
    if (filtros.fecha_inicio !== undefined) items = items.filter(t => t.fecha >= filtros.fecha_inicio!);
    if (filtros.fecha_fin !== undefined) items = items.filter(t => t.fecha <= filtros.fecha_fin!);
    return items.sort((a, b) => b.fecha.localeCompare(a.fecha));
  },
  async insertar(datos: Omit<Transaccion, 'id' | 'created_at'>): Promise<Transaccion> {
    const items = getStore<Transaccion>('transacciones');
    const item: Transaccion = { ...datos, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('transacciones', items);
    return item;
  },
  async actualizar(id: number, datos: Partial<Omit<Transaccion, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Transaccion>('transacciones');
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...datos };
    setStore('transacciones', items);
  },
  async eliminar(id: number): Promise<void> {
    const items = getStore<Transaccion>('transacciones');
    setStore('transacciones', items.filter(t => t.id !== id));
  },
  async totalPorPeriodo(cuentaId: number, tipo: TipoTransaccion, fechaInicio: string, fechaFin: string): Promise<number> {
    return getStore<Transaccion>('transacciones')
      .filter(t => t.cuenta_id === cuentaId && t.tipo === tipo && t.fecha >= fechaInicio && t.fecha <= fechaFin)
      .reduce((sum, t) => sum + t.cantidad, 0);
  },
  async desglosePorCategorias(cuentaId: number, tipo: TipoTransaccion, fechaInicio: string, fechaFin: string): Promise<{ categoria_id: number; nombre: string; icono: string; color: string; total: number }[]> {
    const transacciones = getStore<Transaccion>('transacciones')
      .filter(t => t.cuenta_id === cuentaId && t.tipo === tipo && t.fecha >= fechaInicio && t.fecha <= fechaFin);
    const categorias = getStore<Categoria>('categorias');
    const grouped = new Map<number, number>();
    for (const t of transacciones) {
      grouped.set(t.categoria_id, (grouped.get(t.categoria_id) ?? 0) + t.cantidad);
    }
    return Array.from(grouped.entries())
      .map(([catId, total]) => {
        const cat = categorias.find(c => c.id === catId);
        return { categoria_id: catId, nombre: cat?.nombre ?? '', icono: cat?.icono ?? '', color: cat?.color ?? '', total };
      })
      .sort((a, b) => b.total - a.total);
  },
};

const CONFIG_DEFAULTS: Configuracion = {
  tema: 'oscuro',
  primerDiaSemana: 1,
  divisa: '€',
  separadorDecimal: ',',
  idioma: 'es',
  tamanoTexto: 'mediano',
};

const CONFIG_KEY = '@Finly/configuracion';

export const webConfigRepo = {
  async obtener(): Promise<Configuracion> {
    if (typeof localStorage === 'undefined') return CONFIG_DEFAULTS;
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...CONFIG_DEFAULTS, ...JSON.parse(raw) } : CONFIG_DEFAULTS;
  },
  async guardar(parcial: Partial<Configuracion>): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const actual = await this.obtener();
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...actual, ...parcial }));
  },
};
