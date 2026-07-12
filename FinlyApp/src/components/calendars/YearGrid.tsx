import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarBaseProps } from './types';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

export default function YearGrid({ fecha, onSelect }: CalendarBaseProps) {
  const hoy = new Date();
  const [añoInicio, setAñoInicio] = useState(fecha.getFullYear() - 5);
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const años = Array.from({ length: 12 }, (_, i) => añoInicio + i);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAñoInicio(a => a - 12)}>
          <Ionicons name="chevron-back-outline" size={22} color={c.texto} />
        </TouchableOpacity>
        <Text style={{ color: c.texto, fontSize: fs(18), fontWeight: '700' }}>{añoInicio} - {añoInicio + 11}</Text>
        <TouchableOpacity
          onPress={() => añoInicio + 11 < hoy.getFullYear() && setAñoInicio(a => a + 12)}
          style={{ opacity: añoInicio + 11 < hoy.getFullYear() ? 1 : 0.3 }}
          disabled={añoInicio + 11 >= hoy.getFullYear()}
        >
          <Ionicons name="chevron-forward-outline" size={22} color={c.texto} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {años.map(a => {
          const futuro = a > hoy.getFullYear();
          const activo = a === fecha.getFullYear();
          return (
            <TouchableOpacity
              key={a}
              style={[styles.item, futuro && { opacity: 0.3 }]}
              onPress={() => !futuro && onSelect(new Date(a, 0, 1))}
              disabled={futuro}
            >
              <View style={[styles.itemInner, { backgroundColor: c.fondoAlto }, activo && { backgroundColor: c.primario }]}>
                <Text style={[styles.itemTexto, { color: c.texto, fontSize: fs(14) }, activo && { color: c.fondo, fontWeight: '700' }, futuro && { color: c.textoSuave }]}>
                  {a}
                </Text>
              </View>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: '23%', aspectRatio: 1.2 },
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  itemTexto: { fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
});
