export interface Cuenta {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  saldo: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  tipo: 'gasto' | 'ingreso';
}

export interface Transaccion {
  id: number;
  cuentaId: number;
  categoriaId: number;
  tipo: 'gasto' | 'ingreso';
  cantidad: number;
  descripcion: string;
  fecha: string;
}

export const cuentasMock: Cuenta[] = [
  { id: 1, nombre: 'Efectivo', icono: 'wallet-outline', color: '#22D3EE', saldo: 450.00 },
  { id: 2, nombre: 'Banco', icono: 'business-outline', color: '#A78BFA', saldo: 2340.50 },
  { id: 3, nombre: 'Ahorros', icono: 'cash-outline', color: '#34D399', saldo: 5000.00 },
];

export const categoriasMock: Categoria[] = [
  { id: 1, nombre: 'Nómina', icono: 'briefcase-outline', color: '#22D3EE', tipo: 'ingreso' },
  { id: 2, nombre: 'Freelance', icono: 'code-slash-outline', color: '#A78BFA', tipo: 'ingreso' },
  { id: 3, nombre: 'Alimentación', icono: 'cart-outline', color: '#F87171', tipo: 'gasto' },
  { id: 4, nombre: 'Transporte', icono: 'bus-outline', color: '#FBBF24', tipo: 'gasto' },
  { id: 5, nombre: 'Ocio', icono: 'game-controller-outline', color: '#F472B6', tipo: 'gasto' },
  { id: 6, nombre: 'Vivienda', icono: 'home-outline', color: '#60A5FA', tipo: 'gasto' },
  { id: 7, nombre: 'Salud', icono: 'heart-outline', color: '#34D399', tipo: 'gasto' },
  { id: 8, nombre: 'Inversiones', icono: 'trending-up-outline', color: '#A78BFA', tipo: 'ingreso' },
];

export const transaccionesMock: Transaccion[] = [
  { id: 1, cuentaId: 1, categoriaId: 1, tipo: 'ingreso', cantidad: 2100.00, descripcion: 'Nómina Julio', fecha: '2026-07-01' },
  { id: 2, cuentaId: 1, categoriaId: 2, tipo: 'ingreso', cantidad: 500.00, descripcion: 'Proyecto web', fecha: '2026-07-05' },
  { id: 3, cuentaId: 2, categoriaId: 3, tipo: 'gasto', cantidad: 85.50, descripcion: 'Compra semanal', fecha: '2026-07-03' },
  { id: 4, cuentaId: 2, categoriaId: 4, tipo: 'gasto', cantidad: 30.00, descripcion: 'Gasolina', fecha: '2026-07-04' },
  { id: 5, cuentaId: 1, categoriaId: 5, tipo: 'gasto', cantidad: 45.00, descripcion: 'Cine', fecha: '2026-07-06' },
  { id: 6, cuentaId: 2, categoriaId: 6, tipo: 'gasto', cantidad: 650.00, descripcion: 'Alquiler Julio', fecha: '2026-07-01' },
  { id: 7, cuentaId: 1, categoriaId: 3, tipo: 'gasto', cantidad: 42.30, descripcion: 'Restaurante', fecha: '2026-07-07' },
  { id: 8, cuentaId: 2, categoriaId: 7, tipo: 'gasto', cantidad: 25.00, descripcion: 'Farmacia', fecha: '2026-07-08' },
  { id: 9, cuentaId: 3, categoriaId: 8, tipo: 'ingreso', cantidad: 200.00, descripcion: 'Dividendos', fecha: '2026-07-10' },
  { id: 10, cuentaId: 1, categoriaId: 5, tipo: 'gasto', cantidad: 12.50, descripcion: 'Cafetería', fecha: '2026-07-10' },
];
