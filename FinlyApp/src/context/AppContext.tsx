import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Cuenta, Categoria, Transaccion, cuentasMock, categoriasMock, transaccionesMock } from '../data/mockData';
import { Periodo, TipoTransaccion, CategoriaConTotal } from '../constants/types';

interface AppState {
  cuentaActiva: Cuenta;
  tipoActivo: TipoTransaccion;
  periodoActivo: Periodo;
  fechaSeleccionada: Date;
  fechaPersonalizada: { inicio: Date; fin: Date };
  cuentas: Cuenta[];
  categorias: Categoria[];
  transacciones: Transaccion[];
}

interface AppContextType extends AppState {
  seleccionarCuenta: (cuenta: Cuenta) => void;
  cambiarTipo: (tipo: TipoTransaccion) => void;
  cambiarPeriodo: (periodo: Periodo) => void;
  setFechaSeleccionada: (fecha: Date) => void;
  setFechaPersonalizada: (fechas: { inicio: Date; fin: Date }) => void;
  transaccionesFiltradas: Transaccion[];
  categoriasActivas: CategoriaConTotal[];
  cuentasConSaldo: Cuenta[];
  totalIngresos: number;
  totalGastos: number;
  totalIngresosGlobal: number;
  totalGastosGlobal: number;
}

const AppContext = createContext<AppContextType | null>(null);

function calcularInicioFin(periodo: Periodo, fecha: Date): { inicio: Date; fin: Date } {
  switch (periodo) {
    case 'dia': {
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
      const fin = new Date(inicio);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'semana': {
      const diaSemana = fecha.getDay();
      const diff = diaSemana === 0 ? 6 : diaSemana - 1;
      const inicio = new Date(fecha);
      inicio.setDate(fecha.getDate() - diff);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'mes': {
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'año': {
      const inicio = new Date(fecha.getFullYear(), 0, 1);
      const fin = new Date(fecha.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { inicio, fin };
    }
    case 'periodo': {
      const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const fin = new Date(fecha);
      fin.setHours(23, 59, 59, 999);
      return { inicio, fin };
    }
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cuentaActiva, setCuentaActiva] = useState<Cuenta>(cuentasMock[0]);
  const [tipoActivo, setTipoActivo] = useState<TipoTransaccion>('gasto');
  const [periodoActivo, setPeriodoActivo] = useState<Periodo>('dia');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [fechaPersonalizada, setFechaPersonalizadaState] = useState<{ inicio: Date; fin: Date }>(() => {
    const ahora = new Date();
    return { inicio: new Date(ahora.getFullYear(), 0, 1), fin: ahora };
  });
  const [cuentas] = useState<Cuenta[]>(cuentasMock);
  const [categorias] = useState<Categoria[]>(categoriasMock);
  const [transacciones] = useState<Transaccion[]>(transaccionesMock);

  const fechas = periodoActivo === 'periodo'
    ? fechaPersonalizada
    : calcularInicioFin(periodoActivo, fechaSeleccionada);

  const filtrar = (
    lista: Transaccion[],
    cuentaId: number,
    tipo?: TipoTransaccion,
    rango?: { inicio: Date; fin: Date },
  ) =>
    lista.filter(t => {
      if (t.cuentaId !== cuentaId) return false;
      if (tipo && t.tipo !== tipo) return false;
      if (rango) {
        const f = new Date(t.fecha);
        if (f < rango.inicio || f > rango.fin) return false;
      }
      return true;
    });

  const transaccionesFiltradas = useMemo(
    () => filtrar(transacciones, cuentaActiva.id, tipoActivo, fechas),
    [transacciones, cuentaActiva.id, tipoActivo, fechas],
  );

  const totalIngresos = useMemo(
    () => filtrar(transacciones, cuentaActiva.id, 'ingreso', fechas)
      .reduce((sum, t) => sum + t.cantidad, 0),
    [transacciones, cuentaActiva.id, fechas],
  );

  const totalGastos = useMemo(
    () => filtrar(transacciones, cuentaActiva.id, 'gasto', fechas)
      .reduce((sum, t) => sum + t.cantidad, 0),
    [transacciones, cuentaActiva.id, fechas],
  );

  const totalIngresosGlobal = useMemo(
    () => filtrar(transacciones, cuentaActiva.id, 'ingreso')
      .reduce((sum, t) => sum + t.cantidad, 0),
    [transacciones, cuentaActiva.id],
  );

  const totalGastosGlobal = useMemo(
    () => filtrar(transacciones, cuentaActiva.id, 'gasto')
      .reduce((sum, t) => sum + t.cantidad, 0),
    [transacciones, cuentaActiva.id],
  );

  const cuentasConSaldo = useMemo(() =>
    cuentas.map(cuenta => {
      const ingresos = transacciones
        .filter(t => t.cuentaId === cuenta.id && t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.cantidad, 0);
      const gastos = transacciones
        .filter(t => t.cuentaId === cuenta.id && t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.cantidad, 0);
      return { ...cuenta, saldo: ingresos - gastos };
    }),
    [cuentas, transacciones]
  );

  const categoriasActivas = useMemo(() => {
    const categoriasDelTipo = categorias.filter(c => c.tipo === tipoActivo);
    const totalTipo = transaccionesFiltradas.reduce((sum, t) => sum + t.cantidad, 0);

    return categoriasDelTipo.map(cat => {
      const total = transaccionesFiltradas
        .filter(t => t.categoriaId === cat.id)
        .reduce((sum, t) => sum + t.cantidad, 0);
      return {
        ...cat,
        total,
        porcentaje: totalTipo > 0 ? (total / totalTipo) * 100 : 0,
      };
    }).filter(cat => cat.total > 0);
  }, [categorias, tipoActivo, transaccionesFiltradas]);

  const value: AppContextType = {
    cuentaActiva,
    tipoActivo,
    periodoActivo,
    fechaSeleccionada,
    fechaPersonalizada,
    cuentas,
    categorias,
    transacciones,
    seleccionarCuenta: setCuentaActiva,
    cambiarTipo: setTipoActivo,
    cambiarPeriodo: setPeriodoActivo,
    setFechaSeleccionada,
    setFechaPersonalizada: setFechaPersonalizadaState,
    transaccionesFiltradas,
    categoriasActivas,
    cuentasConSaldo,
    totalIngresos,
    totalGastos,
    totalIngresosGlobal,
    totalGastosGlobal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
