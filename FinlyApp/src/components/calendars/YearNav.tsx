import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import { t } from '../../i18n';
import { resolveDateBounds } from '../../utils/calendarBounds';
import CalendarNavRow from './CalendarNavRow';

interface Props {
  year: number;
  onChange: (newYear: number) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export default function YearNav({ year, onChange, minDate, maxDate }: Props) {
  const today = useToday();
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const { min, max } = resolveDateBounds(minDate, maxDate, today);
  const nextDisabled = !!max && year >= max.getFullYear();
  const prevDisabled = !!min && year <= min.getFullYear();
  const currentYear = Math.min(today.getFullYear(), max?.getFullYear() ?? today.getFullYear());
  const showJump = year < currentYear - 1;

  return (
    <CalendarNavRow
      title={String(year)}
      titleSize={fs(18)}
      color={c.text}
      onPrev={() => onChange(year - 1)}
      onNext={() => onChange(year + 1)}
      onJumpToCurrent={() => onChange(currentYear)}
      showJump={showJump}
      nextDisabled={nextDisabled}
      prevDisabled={prevDisabled}
      prevLabel={labels.a11y_previous_year}
      nextLabel={labels.a11y_next_year}
    />
  );
}
