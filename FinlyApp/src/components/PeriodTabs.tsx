import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores } from '../constants/colors';
import { Periodo } from '../constants/types';

interface Props {
  activo: Periodo;
  onChange: (periodo: Periodo) => void;
}

const periodos: { key: Periodo; label: string }[] = [
  { key: 'dia', label: 'Día' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes', label: 'Mes' },
  { key: 'año', label: 'Año' },
  { key: 'periodo', label: 'Período' },
];

export default function PeriodTabs({ activo, onChange }: Props) {
  return (
    <View style={styles.container}>
      {periodos.map((p) => (
        <TouchableOpacity
          key={p.key}
          style={[styles.tab, activo === p.key && styles.activo]}
          onPress={() => onChange(p.key)}
          accessibilityLabel={`Período ${p.label}`}
        >
          <Text style={[styles.texto, activo === p.key && styles.textoActivo]}>{p.label}</Text>
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
    backgroundColor: colores.fondoAlto,
  },
  activo: {
    backgroundColor: colores.primario,
  },
  texto: {
    color: colores.textoSuave,
    fontSize: 13,
    fontWeight: '600',
  },
  textoActivo: {
    color: colores.fondo,
    fontWeight: '700',
  },
});
