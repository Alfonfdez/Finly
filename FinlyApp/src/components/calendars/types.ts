import { Periodo } from '../../constants/types';

export type { Periodo };

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
