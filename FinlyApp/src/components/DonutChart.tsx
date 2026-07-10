import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
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
  total: number;
  divisa?: string;
}

export default function DonutChart({ datos, total, divisa = '€' }: Props) {
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  const grosor = 15;

  let offsetAcumulado = 0;

  return (
    <View style={styles.container}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        <G transform="rotate(-90, 80, 80)">
          <Circle cx="80" cy="80" r={radio} stroke={colores.fondoAlto} strokeWidth={grosor} fill="none" />
          {datos.map((dato) => {
            const longitud = (dato.porcentaje / 100) * circunferencia;
            const segmento = (
              <Circle
                key={dato.nombre}
                cx="80"
                cy="80"
                r={radio}
                stroke={dato.color}
                strokeWidth={grosor}
                fill="none"
                strokeDasharray={`${longitud} ${circunferencia - longitud}`}
                strokeDashoffset={-offsetAcumulado}
              />
            );
            offsetAcumulado += longitud;
            return segmento;
          })}
        </G>
      </Svg>
      <View style={styles.totalContainer}>
        <Text style={styles.total}>{formatearMoneda(total, divisa)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  totalContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  total: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '700',
  },
});
