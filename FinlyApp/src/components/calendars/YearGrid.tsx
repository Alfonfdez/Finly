import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../../constants/colors';
import { CalendarBaseProps } from './types';

export default function YearGrid({ fecha, onSelect }: CalendarBaseProps) {
  const hoy = new Date();
  const [añoInicio, setAñoInicio] = useState(fecha.getFullYear() - 5);
  const años = Array.from({ length: 12 }, (_, i) => añoInicio + i);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAñoInicio(a => a - 12)}>
          <Ionicons name="chevron-back-outline" size={22} color={colores.texto} />
        </TouchableOpacity>
        <Text style={styles.titulo}>{añoInicio} - {añoInicio + 11}</Text>
        <TouchableOpacity
          onPress={() => añoInicio + 11 < hoy.getFullYear() && setAñoInicio(a => a + 12)}
          style={{ opacity: añoInicio + 11 < hoy.getFullYear() ? 1 : 0.3 }}
          disabled={añoInicio + 11 >= hoy.getFullYear()}
        >
          <Ionicons name="chevron-forward-outline" size={22} color={colores.texto} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {años.map(a => {
          const futuro = a > hoy.getFullYear();
          const activo = a === fecha.getFullYear();
          return (
            <TouchableOpacity
              key={a}
              style={[styles.item, activo && styles.itemActivo, futuro && styles.itemFuturo]}
              onPress={() => !futuro && onSelect(new Date(a, 0, 1))}
              disabled={futuro}
            >
              <Text style={[styles.itemTexto, activo && styles.itemTextoActivo, futuro && styles.itemTextoFuturo]}>
                {a}
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
