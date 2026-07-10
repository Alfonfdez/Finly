export type Periodo = 'dia' | 'semana' | 'mes' | 'año' | 'periodo';

export interface CalendarBaseProps {
  fecha: Date;
  onSelect: (fecha: Date) => void;
}

export const TITULOS: Record<Periodo, string> = {
  dia: 'Seleccionar día',
  semana: 'Seleccionar semana',
  mes: 'Seleccionar mes',
  año: 'Seleccionar año',
  periodo: 'Seleccionar período',
};
