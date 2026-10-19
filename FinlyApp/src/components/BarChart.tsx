import { memo, useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import type { CategoryWithTotal } from '../constants/types';
import { formatAmount, fitFontSize, HIDDEN_BALANCE } from '../utils/formatters';
import { getDisplayCategoryName } from '../i18n';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { CARD_BORDER_RADIUS } from './componentStyles';

interface Props {
  data: CategoryWithTotal[];
  total?: number;
  /** "Hide balances and totals" is on: show the mask instead of the total. */
  hidden?: boolean;
}

const H_PADDING = 16;

function BarChartInner({ data, total = 0, hidden = false }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const [width, setWidth] = useState(0);

  const formatted = hidden ? HIDDEN_BALANCE : formatAmount(total, config);
  // Same style as the donut centre: fit the total to the available width.
  const totalFontSize = width > 0 ? fitFontSize(formatted, fs(18), width - H_PADDING * 2) : fs(18);

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Text style={[styles.total, { color: hidden ? c.textSecondary : c.text, fontSize: totalFontSize }]} numberOfLines={1}>
        {formatted}
      </Text>

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
    paddingHorizontal: H_PADDING,
    paddingVertical: 12,
  },
  total: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  barBackground: {
    height: 24,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  segment: { height: '100%' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendColor: { width: 10, height: 10, borderRadius: 5 },
});

export default memo(BarChartInner);
