import { getMonthName } from '../../utils/formatters';
import { resolveDateBounds } from '../../utils/calendarBounds';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import CalendarNavRow from './CalendarNavRow';
import { MONTHS_PER_YEAR } from '../../constants/calendar';

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export default function MonthNav({ year, month, onChange, minDate, maxDate }: Props) {
  const today = useToday();
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const { min, max } = resolveDateBounds(minDate, maxDate, today);
  const atMax = !!max && (year > max.getFullYear() || (year === max.getFullYear() && month >= max.getMonth() + 1));
  const atMin = !!min && (year < min.getFullYear() || (year === min.getFullYear() && month <= min.getMonth() + 1));

  const goToMonth = (delta: number) => {
    if (delta > 0 && atMax) return;
    if (delta < 0 && atMin) return;
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > MONTHS_PER_YEAR) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = MONTHS_PER_YEAR; newYear--; }
    onChange(newYear, newMonth);
  };

  const targetYear = Math.min(today.getFullYear(), max?.getFullYear() ?? today.getFullYear());
  const targetMonth = targetYear === today.getFullYear()
    ? Math.min(today.getMonth() + 1, (max?.getMonth() ?? today.getMonth()) + 1)
    : (max?.getMonth() ?? today.getMonth()) + 1;
  const showJump = year === targetYear && month < targetMonth - 1;

  return (
    <CalendarNavRow
      title={`${getMonthName(month)} ${year}`}
      titleSize={fs(15)}
      color={c.text}
      onPrev={() => goToMonth(-1)}
      onNext={() => goToMonth(1)}
      onJumpToCurrent={() => onChange(targetYear, targetMonth)}
      showJump={showJump}
      nextDisabled={atMax}
      prevDisabled={atMin}
    />
  );
}
