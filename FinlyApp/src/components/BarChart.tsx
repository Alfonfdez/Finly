import { View, Text, StyleSheet } from 'react-native';
import { DatoGrafico } from '../constants/types';
import { formatearMoneda } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  datos: DatoGrafico[];
  total?: number;
  divisa?: string;
  separador?: ',' | '.';
}

export default function BarChart({ datos, total = 0, divisa = '€', separador = ',' }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const vacio = datos.length === 0;

  return (
    <View style={styles.container}>
      <View style={[styles.barraFondo, { backgroundColor: c.fondoAlto }]}>
        {datos.map((dato) => (
          <View
            key={dato.nombre}
            style={[
              styles.segmento,
              { width: `${Math.max(dato.porcentaje, 0.5)}%`, backgroundColor: dato.color },
            ]}
          />
        ))}
      </View>

      {vacio && (
        <Text style={[styles.vacioTexto, { color: c.textoSuave, fontSize: fs(14) }]}>{formatearMoneda(total, divisa, separador)}</Text>
      )}

      <View style={styles.leyenda}>
        {datos.map((dato) => (
          <View key={dato.nombre} style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: dato.color }]} />
            <Text style={{ color: c.texto, fontSize: fs(12) }}>{dato.nombre}</Text>
            <Text style={{ color: c.textoSuave, fontSize: fs(11) }}>{dato.porcentaje.toFixed(1)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  barraFondo: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  segmento: { height: '100%' },
  leyenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leyendaColor: { width: 10, height: 10, borderRadius: 5 },
  vacioTexto: { textAlign: 'center', marginBottom: 12 },
});
