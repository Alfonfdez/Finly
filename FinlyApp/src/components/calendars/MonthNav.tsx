import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getMonthName } from '../../utils/formatters';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import NavArrows from './NavArrows';
import { MONTHS_PER_YEAR } from '../../constants/calendar';

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export default function MonthNav({ year, month, onChange, minDate, maxDate }: Props) {
  const today = useMemo(() => new Date(), []);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  // undefined keeps the historical "no future" default; null means unbounded.
  const max = maxDate === undefined ? today : maxDate;
  const min = minDate ?? null;
  const atMax = !!max && (year > max.getFullYear() || (year === max.getFullYear() && month >= max.getMonth() + 1));
  const atMin = !!min && (year < min.getFullYear() || (year === min.getFullYear() && month <= min.getMonth() + 1));

  const goToMonth = (delta: number) => {
    if (delta > 0 && atMax) return;
    if (delta < 0 && atMin) return;
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > MONTHS_PER_YEAR) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = MONTHS_PER_YEAR; newYear--; }
    onChange(newYear, newMonth);
  };

  return (
    <View style={styles.container}>
      <NavArrows
        color={c.text}
        onPrev={() => goToMonth(-1)}
        onNext={() => goToMonth(1)}
        nextDisabled={atMax}
        prevDisabled={atMin}
      />
      <Text style={{ color: c.text, fontSize: fs(16), fontWeight: '700' }}>{getMonthName(month)} {year}</Text>
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
