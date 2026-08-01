import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getMonthName } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { calendarStyles, FUTURE_OPACITY } from './calendarStyles';

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function MonthGrid({ date, onSelect }: CalendarBaseProps) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(date.getFullYear());
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const futureMonthLimit = useMemo(() => new Date(today.getFullYear(), today.getMonth(), 1), [today]);
  const changeYear = useCallback((newYear: number) => {
    if (newYear > today.getFullYear()) return;
    setYear(newYear);
  }, [today]);

  return (
    <View style={calendarStyles.container}>
      <YearNav year={year} onChange={changeYear} />
      <View style={calendarStyles.grid}>
        {MONTHS.map(m => {
          const monthDate = new Date(year, m - 1, 1);
          const isFuture = monthDate > futureMonthLimit;
          const isActive = m === date.getMonth() + 1;
          return (
            <TouchableOpacity
              key={m}
              style={[calendarStyles.gridItem, isFuture && { opacity: FUTURE_OPACITY }]}
              onPress={() => !isFuture && onSelect(monthDate)}
              disabled={isFuture}
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
