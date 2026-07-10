import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../../constants/colors';
import { obtenerNombreMes } from '../../utils/formatters';
import { CalendarBaseProps } from './types';

export default function MonthGrid({ fecha, onSelect }: CalendarBaseProps) {
  const hoy = new Date();
  const año = fecha.getFullYear();
  const meses = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onSelect(new Date(año - 1, fecha.getMonth(), 1))}>
          <Ionicons name="chevron-back-outline" size={22} color={colores.texto} />
        </TouchableOpacity>
        <Text style={styles.titulo}>{año}</Text>
        <TouchableOpacity
          onPress={() => año < hoy.getFullYear() && onSelect(new Date(año + 1, fecha.getMonth(), 1))}
          style={{ opacity: año < hoy.getFullYear() ? 1 : 0.3 }}
          disabled={año >= hoy.getFullYear()}
        >
          <Ionicons name="chevron-forward-outline" size={22} color={colores.texto} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {meses.map(m => {
          const fechaMes = new Date(año, m - 1, 1);
          const futuro = fechaMes > new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          const activo = m === fecha.getMonth() + 1;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.item, activo && styles.itemActivo, futuro && styles.itemFuturo]}
              onPress={() => !futuro && onSelect(new Date(año, m - 1, 1))}
              disabled={futuro}
            >
              <Text style={[styles.itemTexto, activo && styles.itemTextoActivo, futuro && styles.itemTextoFuturo]}>
                {obtenerNombreMes(m).slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  titulo: { color: colores.texto, fontSize: 18, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: '23%', aspectRatio: 1.2, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colores.fondoAlto },
  itemActivo: { backgroundColor: colores.primario },
  itemFuturo: { opacity: 0.3 },
  itemTexto: { color: colores.texto, fontSize: 14, fontWeight: '500' },
  itemTextoActivo: { color: colores.fondo, fontWeight: '700' },
  itemTextoFuturo: { color: colores.textoSuave },
});
