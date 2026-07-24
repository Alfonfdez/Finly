import { View, Text, StyleSheet } from 'react-native';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import NavArrows from './NavArrows';

interface Props {
  year: number;
  maxYear?: number;
  onChange: (newYear: number) => void;
}

export default function YearNav({ year, maxYear = new Date().getFullYear(), onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={styles.container}>
      <NavArrows
        color={c.text}
        onPrev={() => onChange(year - 1)}
        onNext={() => onChange(year + 1)}
        nextDisabled={year >= maxYear}
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
