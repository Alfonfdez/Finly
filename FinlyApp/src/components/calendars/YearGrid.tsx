import { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { CalendarBaseProps } from './types';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import { t } from '../../i18n';
import CalendarNavRow from './CalendarNavRow';
import { calendarStyles, DISABLED_OPACITY } from './calendarStyles';
import { resolveDateBounds } from '../../utils/calendarBounds';
import { CALENDAR_MIN_YEAR, YEARS_PER_PAGE } from '../../constants/calendar';

interface Props extends CalendarBaseProps {
  minDate?: Date | null;
  maxDate?: Date | null;
}

function pageStartFor(year: number): number {
  return CALENDAR_MIN_YEAR + Math.floor((year - CALENDAR_MIN_YEAR) / YEARS_PER_PAGE) * YEARS_PER_PAGE;
}

export default function YearGrid({ date, onSelect, minDate, maxDate }: Props) {
  const today = useToday();
  const { min, max } = resolveDateBounds(minDate, maxDate, today);
  const minYear = min ? min.getFullYear() : CALENDAR_MIN_YEAR;
  const maxYear = max ? max.getFullYear() : null;
  const [startYear, setStartYear] = useState(() => pageStartFor(date.getFullYear()));
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const years = useMemo(() => Array.from({ length: YEARS_PER_PAGE }, (_, i) => startYear + i), [startYear]);
  const currentPageStart = pageStartFor(today.getFullYear());
  const showJump = startYear < currentPageStart - YEARS_PER_PAGE;

  // Follow the selected year, but snap to its fixed page: tapping a year on the
  // current page must not move the grid.
  useEffect(() => {
    setStartYear(pageStartFor(date.getFullYear()));
  }, [date]);

  return (
    <View style={calendarStyles.container}>
      <CalendarNavRow
        title={`${startYear} - ${startYear + YEARS_PER_PAGE - 1}`}
        titleSize={fs(18)}
        color={c.text}
        onPrev={() => setStartYear(a => a - YEARS_PER_PAGE)}
        onNext={() => setStartYear(a => a + YEARS_PER_PAGE)}
        onJumpToCurrent={() => setStartYear(currentPageStart)}
        showJump={showJump}
        nextDisabled={maxYear != null && startYear + YEARS_PER_PAGE - 1 >= maxYear}
        prevDisabled={startYear <= minYear}
        prevLabel={labels.a11y_previous_years}
        nextLabel={labels.a11y_next_years}
      />
      <View style={calendarStyles.monthRowSpacer} />
      <View style={calendarStyles.grid}>
        {years.map(y => {
          const isOutOfBounds = y < minYear || (maxYear != null && y > maxYear);
          const isActive = y === date.getFullYear();
          return (
            <TouchableOpacity
              key={y}
              style={[calendarStyles.gridItem, isOutOfBounds && { opacity: DISABLED_OPACITY }]}
              onPress={() => !isOutOfBounds && onSelect(new Date(y, 0, 1))}
              disabled={isOutOfBounds}
              accessibilityLabel={String(y)}
              accessibilityState={{ selected: isActive, disabled: isOutOfBounds }}
            >
              <View style={[calendarStyles.gridItemInner, { backgroundColor: c.surface }, isActive && { backgroundColor: c.primary }]}>
                <Text style={[calendarStyles.gridItemText, { color: c.text, fontSize: fs(14) }, isActive && { color: c.background, fontWeight: '700' }, isOutOfBounds && { color: c.textSecondary }]}>
                  {y}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
