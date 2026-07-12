import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Periodo } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  activo: Periodo;
  onChange: (periodo: Periodo) => void;
}

export default function PeriodTabs({ activo, onChange }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'dia', label: texto.period_day },
    { key: 'semana', label: texto.period_week },
    { key: 'mes', label: texto.period_month },
    { key: 'año', label: texto.period_year },
    { key: 'periodo', label: texto.period_period },
  ];

  return (
    <View style={styles.container}>
      {periodos.map((p) => (
        <TouchableOpacity
          key={p.key}
          style={[styles.tab, { backgroundColor: activo === p.key ? c.primario : c.fondoAlto }]}
          onPress={() => onChange(p.key)}
          accessibilityLabel={`${texto.a11y_period} ${p.label}`}
        >
          <Text style={{ color: activo === p.key ? c.fondo : c.textoSuave, fontWeight: activo === p.key ? '700' : '600', fontSize: fs(13) }}>{p.label}</Text>
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
