import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { ChartData } from '../constants/types';
import { formatCurrency } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  data: ChartData[];
  total: number;
  currency?: string;
  separator?: ',' | '.';
}

export default function DonutChart({ data, total, currency = '€', separator = ',' }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 15;

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
                key={item.name}
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
        <Text style={[styles.total, { color: c.text, fontSize: fs(18) }]}>{formatCurrency(total, currency, separator)}</Text>
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
  },
  total: {
    fontWeight: '700',
  },
});
