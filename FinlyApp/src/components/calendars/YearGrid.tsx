import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarBaseProps } from './types';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import NavArrows from './NavArrows';
import { calendarStyles, FUTURE_OPACITY } from './calendarStyles';

export default function YearGrid({ date, onSelect }: CalendarBaseProps) {
  const today = useMemo(() => new Date(), []);
  const [startYear, setStartYear] = useState(date.getFullYear() - 5);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => startYear + i), [startYear]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <NavArrows
          color={c.text}
          onPrev={() => setStartYear(a => a - 12)}
          onNext={() => setStartYear(a => a + 12)}
          nextDisabled={startYear + 11 >= today.getFullYear()}
        />
        <Text style={{ color: c.text, fontSize: fs(18), fontWeight: '700' }}>{startYear} - {startYear + 11}</Text>
      </View>
      <View style={calendarStyles.grid}>
        {years.map(y => {
          const isFuture = y > today.getFullYear();
          const isActive = y === date.getFullYear();
          return (
            <TouchableOpacity
              key={y}
              style={[calendarStyles.gridItem, isFuture && { opacity: FUTURE_OPACITY }]}
              onPress={() => !isFuture && onSelect(new Date(y, 0, 1))}
              disabled={isFuture}
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
  container: { padding: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
});
