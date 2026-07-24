import { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getMonthName } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { calendarStyles, FUTURE_OPACITY } from './calendarStyles';

export default function MonthGrid({ date, onSelect }: CalendarBaseProps) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(date.getFullYear());
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const changeYear = useCallback((newYear: number) => {
    if (newYear > today.getFullYear()) return;
    setYear(newYear);
  }, [today]);

  return (
    <View style={styles.container}>
      <YearNav year={year} onChange={changeYear} />
      <View style={calendarStyles.grid}>
        {months.map(m => {
          const monthDate = new Date(year, m - 1, 1);
          const isFuture = monthDate > new Date(today.getFullYear(), today.getMonth(), 1);
          const isActive = m === date.getMonth() + 1;
          return (
            <TouchableOpacity
              key={m}
              style={[calendarStyles.gridItem, isFuture && { opacity: FUTURE_OPACITY }]}
              onPress={() => !isFuture && onSelect(new Date(year, m - 1, 1))}
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

const styles = StyleSheet.create({
  container: { padding: 8 },
});
