import { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getMonthName } from '../../utils/formatters';
import type { CalendarBaseProps } from './types';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { useToday } from '../../hooks/useToday';
import { calendarStyles, DISABLED_OPACITY } from './calendarStyles';
import { resolveDateBounds } from '../../utils/calendarBounds';
import { MONTHS_PER_YEAR } from '../../constants/calendar';

const MONTHS = Array.from({ length: MONTHS_PER_YEAR }, (_, i) => i + 1);

interface Props extends CalendarBaseProps {
  minDate?: Date | null;
  maxDate?: Date | null;
}

export default function MonthGrid({ date, onSelect, minDate, maxDate }: Props) {
  const today = useToday();
  const { min, max } = resolveDateBounds(minDate, maxDate, today);
  const [year, setYear] = useState(date.getFullYear());
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const futureMonthLimit = useMemo(
    () => (max ? new Date(max.getFullYear(), max.getMonth(), 1) : null),
    [max],
  );

  useEffect(() => {
    setYear(date.getFullYear());
  }, [date]);

  const changeYear = useCallback((newYear: number) => {
    if (max && newYear > max.getFullYear()) return;
    if (min && newYear < min.getFullYear()) return;
    setYear(newYear);
  }, [min, max]);

  return (
    <View style={calendarStyles.container}>
      <YearNav year={year} onChange={changeYear} minDate={min} maxDate={max} />
      <View style={calendarStyles.monthRowSpacer} />
      <View style={calendarStyles.grid}>
        {MONTHS.map(m => {
          const monthDate = new Date(year, m - 1, 1);
          const isFuture = futureMonthLimit != null && monthDate > futureMonthLimit;
          const isActive = year === date.getFullYear() && m === date.getMonth() + 1;
          return (
            <TouchableOpacity
              key={m}
              style={[calendarStyles.gridItem, isFuture && { opacity: DISABLED_OPACITY }]}
              onPress={() => !isFuture && onSelect(monthDate)}
              disabled={isFuture}
              accessibilityLabel={getMonthName(m)}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[calendarStyles.gridItemInner, { backgroundColor: c.surface }, isActive && { backgroundColor: c.primary }]}>
                <Text style={[calendarStyles.gridItemText, { color: c.text, fontSize: fs(14) }, isActive && { color: c.background, fontWeight: '700' }, isFuture && { color: c.textSecondary }]}>
                  {getMonthName(m).slice(0, 3)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
