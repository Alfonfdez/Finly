import { View, Text, StyleSheet } from 'react-native';
import { CategoryWithTotal } from '../constants/types';
import { formatCurrency } from '../utils/formatters';
import { getDisplayCategoryName } from '../i18n';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  data: CategoryWithTotal[];
  total?: number;
}

export default function BarChart({ data, total = 0 }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const isEmpty = data.length === 0;

  return (
    <View style={styles.container}>
      <View style={[styles.barBackground, { backgroundColor: c.surface }]}>
        {data.map((item) => (
          <View
            key={item.id}
            style={[
              styles.segment,
              { width: `${Math.max(item.percentage, 0.5)}%`, backgroundColor: item.color },
            ]}
          />
        ))}
      </View>

      {isEmpty && (
        <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(14) }]}>{formatCurrency(total, config.currency, config.decimalSeparator)}</Text>
      )}

      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.id} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={{ color: c.text, fontSize: fs(12) }}>{getDisplayCategoryName(item)}</Text>
            <Text style={{ color: c.textSecondary, fontSize: fs(11) }}>{item.percentage.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  barBackground: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  segment: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendColor: { width: 10, height: 10, borderRadius: 5 },
  emptyText: { textAlign: 'center', marginBottom: 12 },
});
