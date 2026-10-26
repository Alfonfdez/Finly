import { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CalendarBaseProps } from './types';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import { t } from '../../i18n';
import NavArrows from './NavArrows';
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

  // Follow the selected year, but snap to its fixed page: tapping a year on the
  // current page must not move the grid.
  useEffect(() => {
    setStartYear(pageStartFor(date.getFullYear()));
  }, [date]);

  return (
    <View style={calendarStyles.container}>
      <View style={styles.header}>
        <NavArrows
          color={c.text}
          onPrev={() => setStartYear(a => a - YEARS_PER_PAGE)}
          onNext={() => setStartYear(a => a + YEARS_PER_PAGE)}
          nextDisabled={maxYear != null && startYear + YEARS_PER_PAGE - 1 >= maxYear}
          prevDisabled={startYear <= minYear}
          prevLabel={labels.a11y_previous_years}
          nextLabel={labels.a11y_next_years}
        />
        <Text style={{ color: c.text, fontSize: fs(18), fontWeight: '700' }}>{startYear} - {startYear + YEARS_PER_PAGE - 1}</Text>
      </View>
      <View style={calendarStyles.monthRowSpacer} />
      <View style={calendarStyles.grid}>
        {years.map(y => {
          const isFuture = maxYear != null && y > maxYear;
          const isActive = y === date.getFullYear();
          return (
            <TouchableOpacity
              key={y}
              style={[calendarStyles.gridItem, isFuture && { opacity: DISABLED_OPACITY }]}
              onPress={() => !isFuture && onSelect(new Date(y, 0, 1))}
              disabled={isFuture}
              accessibilityLabel={String(y)}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[calendarStyles.gridItemInner, { backgroundColor: c.surface }, isActive && { backgroundColor: c.primary }]}>
                <Text style={[calendarStyles.gridItemText, { color: c.text, fontSize: fs(14) }, isActive && { color: c.background, fontWeight: '700' }, isFuture && { color: c.textSecondary }]}>
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

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
});
