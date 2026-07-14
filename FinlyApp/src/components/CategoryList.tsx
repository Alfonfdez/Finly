import { ComponentProps } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scrollbarFlatList } from '../constants/platformStyles';
import { CategoryWithTotal } from '../constants/types';
import { formatCurrency } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  categories: CategoryWithTotal[];
  total: number;
  currency?: string;
  separator?: ',' | '.';
  onPress?: (category: CategoryWithTotal) => void;
}

export default function CategoryList({ categories, total, currency = '€', separator = ',', onPress }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const round = config.categoryIconShape === 'circle';

  return (
    <FlatList
      style={scrollbarFlatList}
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { borderBottomColor: c.border }]}
          onPress={() => onPress?.(item)}
          accessibilityLabel={`${labels.a11y_category} ${item.name}, ${item.percentage.toFixed(1)}%`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={[styles.icon, { backgroundColor: item.color + '30', borderRadius: round ? 20 : 12 }]}>
            <Ionicons name={item.icon as ComponentProps<typeof Ionicons>['name']} size={20} color={item.color} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.text, fontSize: fs(14) }]}>{item.name}</Text>
            <View style={[styles.barBackground, { backgroundColor: c.surface }]}>
              <View style={[styles.barFill, { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }]} />
            </View>
          </View>
          <View style={styles.amounts}>
            <Text style={[styles.total, { color: c.text, fontSize: fs(14) }]}>{formatCurrency(item.total, currency, separator)}</Text>
            <Text style={[styles.percentage, { color: c.textSecondary, fontSize: fs(12) }]}>{item.percentage.toFixed(1)}%</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1, marginRight: 12 },
  name: { fontWeight: '500', marginBottom: 6 },
  barBackground: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  amounts: { alignItems: 'flex-end' },
  total: { fontWeight: '600' },
  percentage: { marginTop: 2 },
});
