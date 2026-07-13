import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  year: number;
  maxYear?: number;
  onChange: (newYear: number) => void;
}

export default function YearNav({ year, maxYear = new Date().getFullYear(), onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const canAdvance = year < maxYear;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChange(year - 1)}>
        <Ionicons name="chevron-back-outline" size={22} color={c.text} />
      </TouchableOpacity>
      <Text style={{ color: c.text, fontSize: fs(18), fontWeight: '700' }}>{year}</Text>
      <TouchableOpacity
        onPress={() => canAdvance && onChange(year + 1)}
        style={{ opacity: canAdvance ? 1 : 0.3 }}
        disabled={!canAdvance}
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
    marginBottom: 4,
  },
});
