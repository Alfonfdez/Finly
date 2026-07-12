import { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { Cuenta, Categoria, Transaccion } from '../database/types';
import { Periodo, TipoTransaccion, CategoriaConTotal } from '../constants/types';
import { cuentaRepository as cuentaRepo } from '../database';
import { categoriaRepository as categoriaRepo } from '../database';
import { transaccionRepository as transaccionRepo } from '../database';

interface AppState {
  cuentaActiva: Cuenta | null;
  tipoActivo: TipoTransaccion;
  periodoActivo: Periodo;
  fechaSeleccionada: Date;
  fechaPersonalizada: { inicio: Date; fin: Date };
  cuentas: Cuenta[];
  categorias: Categoria[];
  transacciones: Transaccion[];
  cargando: boolean;
}

interface AppContextType extends AppState {
  seleccionarCuenta: (cuenta: Cuenta) => void;
  cambiarTipo: (tipo: TipoTransaccion) => void;
  cambiarPeriodo: (periodo: Periodo) => void;
  setFechaSeleccionada: (fecha: Date) => void;
  setFechaPersonalizada: (fechas: { inicio: Date; fin: Date }) => void;
  transaccionesFiltradas: Transaccion[];
  categoriasActivas: CategoriaConTotal[];
  cuentasConSaldo: (Cuenta & { saldo: number })[];
  totalIngresos: number;
  totalGastos: number;
  totalIngresosGlobal: number;
  totalGastosGlobal: number;
}

const AppContext = createContext<AppContextType | null>(null);

const USUARIO_ID = 1;

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

function formatearFechaParaDB(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  const h = String(fecha.getHours()).padStart(2, '0');
  const min = String(fecha.getMinutes()).padStart(2, '0');
  const s = String(fecha.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [cuentaActiva, setCuentaActiva] = useState<Cuenta | null>(null);
  const [tipoActivo, setTipoActivo] = useState<TipoTransaccion>('gasto');
  const [periodoActivo, setPeriodoActivo] = useState<Periodo>('dia');
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [fechaPersonalizada, setFechaPersonalizadaState] = useState<{ inicio: Date; fin: Date }>(() => {
    const ahora = new Date();
    return { inicio: new Date(ahora.getFullYear(), 0, 1), fin: ahora };
  });
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      const [cuentasData, categoriasData] = await Promise.all([
        cuentaRepo.listar(USUARIO_ID),
        categoriaRepo.listar(USUARIO_ID),
      ]);
      setCuentas(cuentasData);
      setCategorias(categoriasData);
      if (cuentasData.length > 0) {
        setCuentaActiva(cuentasData[0]);
      }
      setCargando(false);
    }
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!cuentaActiva) return;
    async function cargarTransacciones() {
      const fechas = periodoActivo === 'periodo'
        ? fechaPersonalizada
        : calcularInicioFin(periodoActivo, fechaSeleccionada);

      const datos = await transaccionRepo.listar({
        cuenta_id: cuentaActiva!.id,
        fecha_inicio: formatearFechaParaDB(fechas.inicio),
        fecha_fin: formatearFechaParaDB(fechas.fin),
      });
      setTransacciones(datos);
    }
    cargarTransacciones();
  }, [cuentaActiva, periodoActivo, fechaSeleccionada, fechaPersonalizada]);

  const fechas = useMemo(
    () => periodoActivo === 'periodo'
      ? fechaPersonalizada
      : calcularInicioFin(periodoActivo, fechaSeleccionada),
    [periodoActivo, fechaPersonalizada, fechaSeleccionada],
  );

  const transaccionesFiltradas = useMemo(
    () => transacciones.filter(t => {
      if (tipoActivo && t.tipo !== tipoActivo) return false;
      return true;
    }),
    [transacciones, tipoActivo],
  );

  const totalIngresos = useMemo(
    () => transaccionesFiltradas
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.cantidad, 0),
    [transaccionesFiltradas],
  );

  const totalGastos = useMemo(
    () => transaccionesFiltradas
      .filter(t => t.tipo === 'gasto')
      .reduce((sum, t) => sum + t.cantidad, 0),
    [transaccionesFiltradas],
  );

  const [totalIngresosGlobal, setTotalIngresosGlobal] = useState(0);
  const [totalGastosGlobal, setTotalGastosGlobal] = useState(0);

  useEffect(() => {
    if (!cuentaActiva) return;
    async function cargarTotales() {
      const [ingresos, gastos] = await Promise.all([
        transaccionRepo.totalPorPeriodo(cuentaActiva!.id, 'ingreso', '1900-01-01', '2100-12-31'),
        transaccionRepo.totalPorPeriodo(cuentaActiva!.id, 'gasto', '1900-01-01', '2100-12-31'),
      ]);
      setTotalIngresosGlobal(ingresos);
      setTotalGastosGlobal(gastos);
    }
    cargarTotales();
  }, [cuentaActiva, transacciones]);

  const [cuentasConSaldo, setCuentasConSaldo] = useState<(Cuenta & { saldo: number })[]>([]);

  useEffect(() => {
    async function calcularSaldos() {
      const resultados = await Promise.all(
        cuentas.map(async (cuenta) => {
          const saldo = await cuentaRepo.obtenerSaldoActual(cuenta.id);
          return { ...cuenta, saldo };
        })
      );
      setCuentasConSaldo(resultados);
    }
    if (cuentas.length > 0) {
      calcularSaldos();
    }
  }, [cuentas, transacciones]);

  const categoriasActivas = useMemo(() => {
    const categoriasDelTipo = categorias.filter(c => c.tipo === tipoActivo);
    const totalTipo = transaccionesFiltradas.reduce((sum, t) => sum + t.cantidad, 0);

    return categoriasDelTipo.map(cat => {
      const total = transaccionesFiltradas
        .filter(t => t.categoria_id === cat.id)
        .reduce((sum, t) => sum + t.cantidad, 0);
      return {
        id: cat.id,
        nombre: cat.nombre,
        icono: cat.icono,
        color: cat.color,
        tipo: cat.tipo,
        total,
        porcentaje: totalTipo > 0 ? (total / totalTipo) * 100 : 0,
      };
    }).filter(cat => cat.total > 0);
  }, [categorias, tipoActivo, transaccionesFiltradas]);

  const value: AppContextType = useMemo(() => ({
    cuentaActiva,
    tipoActivo,
    periodoActivo,
    fechaSeleccionada,
    fechaPersonalizada,
    cuentas,
    categorias,
    transacciones,
    cargando,
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
  }), [
    cuentaActiva, tipoActivo, periodoActivo, fechaSeleccionada, fechaPersonalizada,
    cuentas, categorias, transacciones, cargando,
    transaccionesFiltradas, categoriasActivas, cuentasConSaldo,
    totalIngresos, totalGastos, totalIngresosGlobal, totalGastosGlobal,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
