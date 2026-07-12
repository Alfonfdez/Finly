import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { obtenerNombreMes } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import YearNav from './YearNav';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';

export default function MonthGrid({ fecha, onSelect }: CalendarBaseProps) {
  const hoy = new Date();
  const [año, setAño] = useState(fecha.getFullYear());
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
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
              style={[styles.item, futuro && { opacity: 0.3 }]}
              onPress={() => !futuro && onSelect(new Date(año, m - 1, 1))}
              disabled={futuro}
            >
              <View style={[styles.itemInner, { backgroundColor: c.fondoAlto }, activo && { backgroundColor: c.primario }]}>
                <Text style={[styles.itemTexto, { color: c.texto, fontSize: fs(14) }, activo && { color: c.fondo, fontWeight: '700' }, futuro && { color: c.textoSuave }]}>
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
  itemInner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  itemTexto: { fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
});
