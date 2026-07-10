export function formatearMoneda(cantidad: number, divisa = '€'): string {
  const signo = cantidad < 0 ? '-' : '';
  return `${signo}${Math.abs(cantidad).toFixed(2)} ${divisa}`;
}

export function formatearPorcentaje(valor: number): string {
  return `${Math.round(valor * 100) / 100}%`;
}

export function formatearFecha(fecha: Date): string {
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const año = fecha.getFullYear();
  return `${dia}/${mes}/${año}`;
}

export function obtenerNombreMes(mes: number): string {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[mes - 1] ?? '';
}

export function obtenerNombreMesAbrev(mes: number): string {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return meses[mes - 1] ?? '';
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
  if (inicio.getMonth() === fin.getMonth()) {
    return `${diaInicio} ${mesInicio} - ${diaFin} ${mesFin}`;
  }
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
