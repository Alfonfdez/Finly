import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../../constants/colors';
import { obtenerNombreMes } from '../../utils/formatters';

interface Props {
  año: number;
  mes: number;
  onChange: (año: number, mes: number) => void;
}

export default function MonthNav({ año, mes, onChange }: Props) {
  const hoy = new Date();
  const esUltimo = año === hoy.getFullYear() && mes >= hoy.getMonth() + 1;

  const irAlMes = (delta: number) => {
    let nuevoMes = mes + delta;
    let nuevoAño = año;
    if (nuevoMes > 12) { nuevoMes = 1; nuevoAño++; }
    if (nuevoMes < 1) { nuevoMes = 12; nuevoAño--; }
    if (nuevoAño > hoy.getFullYear() || (nuevoAño === hoy.getFullYear() && nuevoMes > hoy.getMonth() + 1)) return;
    onChange(nuevoAño, nuevoMes);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => irAlMes(-1)}>
        <Ionicons name="chevron-back-outline" size={22} color={colores.texto} />
      </TouchableOpacity>
      <Text style={styles.titulo}>{obtenerNombreMes(mes)} {año}</Text>
      <TouchableOpacity
        onPress={() => irAlMes(1)}
        style={{ opacity: esUltimo ? 0.3 : 1 }}
        disabled={esUltimo}
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
    marginBottom: 12,
  },
  titulo: { color: colores.texto, fontSize: 16, fontWeight: '700' },
});
