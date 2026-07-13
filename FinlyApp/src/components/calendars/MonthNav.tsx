import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMonthName } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export default function MonthNav({ year, month, onChange }: Props) {
  const today = new Date();
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const isLast = year === today.getFullYear() && month >= today.getMonth() + 1;

  const goToMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newYear > today.getFullYear() || (newYear === today.getFullYear() && newMonth > today.getMonth() + 1)) return;
    onChange(newYear, newMonth);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => goToMonth(-1)}>
        <Ionicons name="chevron-back-outline" size={22} color={c.text} />
      </TouchableOpacity>
      <Text style={{ color: c.text, fontSize: fs(16), fontWeight: '700' }}>{getMonthName(month)} {year}</Text>
      <TouchableOpacity
        onPress={() => goToMonth(1)}
        style={{ opacity: isLast ? 0.3 : 1 }}
        disabled={isLast}
      >
        <Ionicons name="chevron-forward-outline" size={22} color={c.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
