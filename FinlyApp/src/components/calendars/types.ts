import { Period } from '../../constants/types';

export type { Period };

export interface CalendarBaseProps {
  date: Date;
  onSelect: (date: Date) => void;
}
