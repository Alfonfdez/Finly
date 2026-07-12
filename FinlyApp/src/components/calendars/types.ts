import { Periodo } from '../../constants/types';

export type { Periodo };

export interface CalendarBaseProps {
  fecha: Date;
  onSelect: (fecha: Date) => void;
}
