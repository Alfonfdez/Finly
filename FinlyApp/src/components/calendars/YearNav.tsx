import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';
import { resolveDateBounds } from '../../utils/calendarBounds';
import NavArrows from './NavArrows';

interface Props {
  year: number;
  onChange: (newYear: number) => void;
  minDate?: Date | null;
  maxDate?: Date | null;
}

export default function YearNav({ year, onChange, minDate, maxDate }: Props) {
  const today = useMemo(() => new Date(), []);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const { min, max } = resolveDateBounds(minDate, maxDate, today);
  const nextDisabled = !!max && year >= max.getFullYear();
  const prevDisabled = !!min && year <= min.getFullYear();

  return (
    <View style={styles.container}>
      <NavArrows
        color={c.text}
        onPrev={() => onChange(year - 1)}
        onNext={() => onChange(year + 1)}
        nextDisabled={nextDisabled}
        prevDisabled={prevDisabled}
        prevLabel={labels.a11y_previous_year}
        nextLabel={labels.a11y_next_year}
      />
      <Text style={{ color: c.text, fontSize: fs(18), fontWeight: '700' }}>{year}</Text>
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
