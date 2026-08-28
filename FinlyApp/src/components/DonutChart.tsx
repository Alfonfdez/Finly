import { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';
import type { CategoryWithTotal } from '../constants/types';
import { formatCurrency, fitFontSize } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  data: CategoryWithTotal[];
  total: number;
}

const SIZE = 160;
const CENTER = SIZE / 2;
const RADIUS = 66;
const STROKE_WIDTH = 13;
const HOLE_SIZE = (RADIUS - STROKE_WIDTH / 2) * 2;

function describeArc(startAngle: number, endAngle: number): string {
  const startX = CENTER + RADIUS * Math.cos(startAngle);
  const startY = CENTER + RADIUS * Math.sin(startAngle);
  const endX = CENTER + RADIUS * Math.cos(endAngle);
  const endY = CENTER + RADIUS * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
}

function DonutChartInner({ data, total }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();

  const formatted = formatCurrency(total, config.currency, config.decimalSeparator);
  const totalFontSize = fitFontSize(formatted, fs(18), HOLE_SIZE);

  const segments = useMemo(() => {
    let startAngle = 0;
    return data.map((item) => {
      const sweep = (item.percentage / 100) * Math.PI * 2;
      const endAngle = startAngle + sweep;
      const segment = {
        id: item.id,
        color: item.color,
        startAngle,
        endAngle,
      };
      startAngle = endAngle;
      return segment;
    });
  }, [data]);

  const isSingleSegment = data.length === 1;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <G transform={`rotate(-90, ${CENTER}, ${CENTER})`}>
          <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={c.surface} strokeWidth={STROKE_WIDTH} fill="none" />
          {isSingleSegment ? (
            <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke={segments[0]?.color} strokeWidth={STROKE_WIDTH} fill="none" />
          ) : (
            segments.map((seg) => (
              <Path
                key={seg.id}
                d={describeArc(seg.startAngle, seg.endAngle)}
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
            ))
          )}
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
