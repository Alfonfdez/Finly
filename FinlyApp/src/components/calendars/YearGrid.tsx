import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarBaseProps } from './types';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import NavArrows from './NavArrows';
import { calendarStyles, FUTURE_OPACITY } from './calendarStyles';
import { YEARS_PER_PAGE } from '../../constants/calendar';

export default function YearGrid({ date, onSelect }: CalendarBaseProps) {
  const today = useMemo(() => new Date(), []);
  const [startYear, setStartYear] = useState(date.getFullYear() - Math.floor((YEARS_PER_PAGE - 1) / 2));
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const years = useMemo(() => Array.from({ length: YEARS_PER_PAGE }, (_, i) => startYear + i), [startYear]);

  return (
    <View style={calendarStyles.container}>
      <View style={styles.header}>
        <NavArrows
          color={c.text}
          onPrev={() => setStartYear(a => a - YEARS_PER_PAGE)}
          onNext={() => setStartYear(a => a + YEARS_PER_PAGE)}
          nextDisabled={startYear + YEARS_PER_PAGE - 1 >= today.getFullYear()}
        />
        <Text style={{ color: c.text, fontSize: fs(18), fontWeight: '700' }}>{startYear} - {startYear + YEARS_PER_PAGE - 1}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
});
