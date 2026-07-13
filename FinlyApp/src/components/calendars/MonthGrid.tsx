import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getMonthName } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

export default function MonthGrid({ date, onSelect }: CalendarBaseProps) {
  const today = new Date();
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
      <View style={styles.grid}>
        {months.map(m => {
          const monthDate = new Date(year, m - 1, 1);
          const isFuture = monthDate > new Date(today.getFullYear(), today.getMonth(), 1);
          const isActive = m === date.getMonth() + 1;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.item, isFuture && { opacity: 0.3 }]}
              onPress={() => !isFuture && onSelect(new Date(year, m - 1, 1))}
              disabled={isFuture}
            >
              <View style={[styles.itemInner, { backgroundColor: c.surface }, isActive && { backgroundColor: c.primary }]}>
                <Text style={[styles.itemText, { color: c.text, fontSize: fs(14) }, isActive && { color: c.background, fontWeight: '700' }, isFuture && { color: c.textSecondary }]}>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: '23%', aspectRatio: 1.2 },
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  itemText: { fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
});
