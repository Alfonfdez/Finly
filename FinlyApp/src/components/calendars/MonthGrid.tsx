import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores } from '../../constants/colors';
import { obtenerNombreMes } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import YearNav from './YearNav';

export default function MonthGrid({ fecha, onSelect }: CalendarBaseProps) {
  const hoy = new Date();
  const [año, setAño] = useState(fecha.getFullYear());
  const meses = Array.from({ length: 12 }, (_, i) => i + 1);

  const cambiarAño = useCallback((nuevoAño: number) => {
    if (nuevoAño > hoy.getFullYear()) return;
    setAño(nuevoAño);
  }, [hoy]);

  return (
    <View style={styles.container}>
      <YearNav año={año} onChange={cambiarAño} />
      <View style={styles.grid}>
        {meses.map(m => {
          const fechaMes = new Date(año, m - 1, 1);
          const futuro = fechaMes > new Date(hoy.getFullYear(), hoy.getMonth(), 1);
          const activo = m === fecha.getMonth() + 1;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.item, futuro && styles.itemFuturo]}
              onPress={() => !futuro && onSelect(new Date(año, m - 1, 1))}
              disabled={futuro}
            >
              <View style={[styles.itemInner, activo && styles.itemActivo]}>
                <Text style={[styles.itemTexto, activo && styles.itemTextoActivo, futuro && styles.itemTextoFuturo]}>
                  {obtenerNombreMes(m).slice(0, 3)}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { width: '23%', aspectRatio: 1.2 },
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colores.fondoAlto },
  itemActivo: { backgroundColor: colores.primario },
  itemFuturo: { opacity: 0.3 },
  itemTexto: { color: colores.texto, fontSize: 14, fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
  itemTextoActivo: { color: colores.fondo, fontWeight: '700' },
  itemTextoFuturo: { color: colores.textoSuave },
});
