import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

interface Props {
  año: number;
  maxAño?: number;
  onChange: (nuevoAño: number) => void;
}

export default function YearNav({ año, maxAño = new Date().getFullYear(), onChange }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const puedeAvanzar = año < maxAño;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChange(año - 1)}>
        <Ionicons name="chevron-back-outline" size={22} color={c.texto} />
      </TouchableOpacity>
      <Text style={{ color: c.texto, fontSize: fs(18), fontWeight: '700' }}>{año}</Text>
      <TouchableOpacity
        onPress={() => puedeAvanzar && onChange(año + 1)}
        style={{ opacity: puedeAvanzar ? 1 : 0.3 }}
        disabled={!puedeAvanzar}
      >
        <Ionicons name="chevron-forward-outline" size={22} color={c.texto} />
      </TouchableOpacity>
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
