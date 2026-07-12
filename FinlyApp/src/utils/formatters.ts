import { Configuracion } from '../context/ConfigContext';
import { t } from '../i18n';

export function formatearMoneda(cantidad: number, divisa = '€', separador: ',' | '.' = ','): string {
  const signo = cantidad < 0 ? '-' : '';
  const abs = Math.abs(cantidad);
  const entero = Math.floor(abs);
  const dec = Math.round((abs - entero) * 100);

  const milesSep = separador === ',' ? '.' : ',';
  const decSep = separador;

  const enteroStr = entero.toString();
  const enteroFmt = enteroStr.replace(/\B(?=(\d{3})+(?!\d))/g, milesSep);
  const decStr = String(dec).padStart(2, '0');

  return `${signo}${enteroFmt}${decSep}${decStr} ${divisa}`;
}

export function formatearFecha(fecha: Date): string {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año}`;
}

export function obtenerNombreMes(mes: number): string {
  return t().months[mes - 1] ?? '';
}

export function obtenerNombreMesAbrev(mes: number): string {
  return t().months_short[mes - 1] ?? '';
}

export function inicioDeSemana(fecha: Date, primerDia: 0 | 1 = 1): Date {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = (dia < primerDia ? 7 : 0) + dia - primerDia;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function finDeSemana(fecha: Date, primerDia: 0 | 1 = 1): Date {
  const inicio = inicioDeSemana(fecha, primerDia);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 6);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

export function formatoSemana(fecha: Date, primerDia: 0 | 1 = 1): string {
  const inicio = inicioDeSemana(fecha, primerDia);
  const fin = finDeSemana(fecha, primerDia);
  const diaInicio = inicio.getDate();
  const mesInicio = obtenerNombreMesAbrev(inicio.getMonth() + 1);
  const diaFin = fin.getDate();
  const mesFin = obtenerNombreMesAbrev(fin.getMonth() + 1);
  return `${diaInicio} ${mesInicio} - ${diaFin} ${mesFin}`;
}

export function obtenerDiasDelMes(año: number, mes: number): number {
  return new Date(año, mes, 0).getDate();
}

export function esMismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function esFechaFutura(fecha: Date): boolean {
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  return fecha.getTime() > hoy.getTime();
}

const FACTORES: Record<Configuracion['tamanoTexto'], number> = {
  'pequeño': 0.85,
  'mediano': 1.0,
  'grande': 1.15,
};

export function escalarFontSize(size: number, tamano: Configuracion['tamanoTexto']): number {
  return Math.round(size * FACTORES[tamano]);
}
