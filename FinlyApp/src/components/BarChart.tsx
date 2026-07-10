import { View, Text, StyleSheet } from 'react-native';
import { colores } from '../constants/colors';
import { formatearMoneda } from '../utils/formatters';

interface Dato {
  nombre: string;
  color: string;
  total: number;
  porcentaje: number;
}

interface Props {
  datos: Dato[];
  total?: number;
  divisa?: string;
}

export default function BarChart({ datos, total = 0, divisa = '€' }: Props) {
  const vacio = datos.length === 0;

  return (
    <View style={styles.container}>
      <View style={styles.barraFondo}>
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
        <Text style={styles.vacioTexto}>{formatearMoneda(total, divisa)}</Text>
      )}

      <View style={styles.leyenda}>
        {datos.map((dato) => (
          <View key={dato.nombre} style={styles.leyendaItem}>
            <View style={[styles.leyendaColor, { backgroundColor: dato.color }]} />
            <Text style={styles.leyendaTexto}>{dato.nombre}</Text>
            <Text style={styles.leyendaPorcentaje}>{dato.porcentaje.toFixed(1)}%</Text>
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
    backgroundColor: colores.fondoAlto,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 12,
  },
  segmento: {
    height: '100%',
  },
  leyenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  leyendaColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    color: colores.texto,
    fontSize: 12,
  },
  leyendaPorcentaje: {
    color: colores.textoSuave,
    fontSize: 11,
  },
  vacioTexto: {
    color: colores.textoSuave,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
});
