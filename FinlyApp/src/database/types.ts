import { TipoTransaccion } from '../constants/types';

export interface Usuario {
  id: number;
  nombre: string;
  email: string | null;
  avatar: string | null;
  moneda: string;
  created_at: string;
}

export interface Cuenta {
  id: number;
  usuario_id: number;
  nombre: string;
  saldo_inicial: number;
  icono: string;
  color: string;
  created_at: string;
}

export interface Categoria {
  id: number;
  usuario_id: number;
  nombre: string;
  icono: string;
  color: string;
  tipo: TipoTransaccion;
  created_at: string;
}

export interface Transaccion {
  id: number;
  cuenta_id: number;
  categoria_id: number;
  tipo: TipoTransaccion;
  cantidad: number;
  descripcion: string | null;
  fecha: string;
  created_at: string;
}
