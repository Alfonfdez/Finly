import { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import type { CategoryWithTotal } from '../constants/types';
import { formatCurrency, fitFontSize } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  data: CategoryWithTotal[];
  total: number;
}

const RADIUS = 66;
const STROKE_WIDTH = 13;
const HOLE_SIZE = (RADIUS - STROKE_WIDTH / 2) * 2;

function DonutChartInner({ data, total }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const radius = RADIUS;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = STROKE_WIDTH;

  const formatted = formatCurrency(total, config.currency, config.decimalSeparator);
  const totalFontSize = fitFontSize(formatted, fs(18), HOLE_SIZE);

  let accumulatedOffset = 0;

  return (
    <View style={styles.container}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        <G transform="rotate(-90, 80, 80)">
          <Circle cx="80" cy="80" r={radius} stroke={c.surface} strokeWidth={strokeWidth} fill="none" />
          {data.map((item) => {
            const arcLength = (item.percentage / 100) * circumference;
            const segment = (
              <Circle
                key={item.id}
                cx="80"
                cy="80"
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${arcLength} ${circumference - arcLength}`}
                strokeDashoffset={-accumulatedOffset}
              />
            );
            accumulatedOffset += arcLength;
            return segment;
          })}
        </G>
      </Svg>
      <View style={styles.totalContainer}>
        <Text style={[styles.total, { color: c.text, fontSize: totalFontSize }]} numberOfLines={1}>
          {formatted}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  totalContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: HOLE_SIZE,
    height: HOLE_SIZE,
  },
  total: {
    fontWeight: '700',
  },
});

const DonutChart = memo(DonutChartInner);
export default DonutChart;
