import { View, Text, StyleSheet } from 'react-native';
import { colores } from '../constants/colors';

interface Dato {
  nombre: string;
  color: string;
  total: number;
  porcentaje: number;
}

interface Props {
  datos: Dato[];
}

export default function BarChart({ datos }: Props) {
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
});
