import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../../constants/colors';

interface Props {
  año: number;
  maxAño?: number;
  onChange: (nuevoAño: number) => void;
}

export default function YearNav({ año, maxAño = new Date().getFullYear(), onChange }: Props) {
  const puedeRetroceder = true;
  const puedeAvanzar = año < maxAño;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onChange(año - 1)}>
        <Ionicons name="chevron-back-outline" size={22} color={colores.texto} />
      </TouchableOpacity>
      <Text style={styles.titulo}>{año}</Text>
      <TouchableOpacity
        onPress={() => puedeAvanzar && onChange(año + 1)}
        style={{ opacity: puedeAvanzar ? 1 : 0.3 }}
        disabled={!puedeAvanzar}
      >
        <Ionicons name="chevron-forward-outline" size={22} color={colores.texto} />
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
  titulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '700',
  },
});
