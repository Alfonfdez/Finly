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
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  const grosor = 15;

  let accumulatedOffset = 0;

  return (
    <View style={styles.container}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        <G transform="rotate(-90, 80, 80)">
          <Circle cx="80" cy="80" r={radio} stroke={c.surface} strokeWidth={grosor} fill="none" />
          {data.map((item) => {
            const longitud = (item.percentage / 100) * circunferencia;
            const segmento = (
              <Circle
                key={item.name}
                cx="80"
                cy="80"
                r={radio}
                stroke={item.color}
                strokeWidth={grosor}
                fill="none"
                strokeDasharray={`${longitud} ${circunferencia - longitud}`}
                strokeDashoffset={-accumulatedOffset}
              />
            );
            accumulatedOffset += longitud;
            return segmento;
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
