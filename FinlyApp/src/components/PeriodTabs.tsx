import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Period } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  active: Period;
  onChange: (period: Period) => void;
}

export default function PeriodTabs({ active, onChange }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const periods: { key: Period; label: string }[] = [
    { key: 'day', label: labels.period_day },
    { key: 'week', label: labels.period_week },
    { key: 'month', label: labels.period_month },
    { key: 'year', label: labels.period_year },
    { key: 'custom', label: labels.period_period },
  ];

  return (
    <View style={styles.container}>
      {periods.map((p) => (
        <TouchableOpacity
          key={p.key}
          style={[styles.tab, { backgroundColor: active === p.key ? c.primary : c.surface }]}
          onPress={() => onChange(p.key)}
          accessibilityLabel={`${labels.a11y_period} ${p.label}`}
        >
          <Text style={{ color: active === p.key ? c.background : c.textSecondary, fontWeight: active === p.key ? '700' : '600', fontSize: fs(13) }}>{p.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
});
