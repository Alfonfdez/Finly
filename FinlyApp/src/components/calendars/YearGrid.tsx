import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarBaseProps } from './types';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

export default function YearGrid({ date, onSelect }: CalendarBaseProps) {
  const today = new Date();
  const [startYear, setStartYear] = useState(date.getFullYear() - 5);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setStartYear(a => a - 12)}>
          <Ionicons name="chevron-back-outline" size={22} color={c.text} />
        </TouchableOpacity>
        <Text style={{ color: c.text, fontSize: fs(18), fontWeight: '700' }}>{startYear} - {startYear + 11}</Text>
        <TouchableOpacity
          onPress={() => startYear + 11 < today.getFullYear() && setStartYear(a => a + 12)}
          style={{ opacity: startYear + 11 < today.getFullYear() ? 1 : 0.3 }}
          disabled={startYear + 11 >= today.getFullYear()}
        >
          <Ionicons name="chevron-forward-outline" size={22} color={c.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {years.map(y => {
          const isFuture = y > today.getFullYear();
          const isActive = y === date.getFullYear();
          return (
            <TouchableOpacity
              key={y}
              style={[styles.item, isFuture && { opacity: 0.3 }]}
              onPress={() => !isFuture && onSelect(new Date(y, 0, 1))}
              disabled={isFuture}
            >
              <View style={[styles.itemInner, { backgroundColor: c.surface }, isActive && { backgroundColor: c.primary }]}>
                <Text style={[styles.itemText, { color: c.text, fontSize: fs(14) }, isActive && { color: c.background, fontWeight: '700' }, isFuture && { color: c.textSecondary }]}>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: '23%', aspectRatio: 1.2 },
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  itemText: { fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
});
