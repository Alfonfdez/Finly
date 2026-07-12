import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { DatoGrafico } from '../constants/types';
import { formatearMoneda } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';

interface Props {
  datos: DatoGrafico[];
  total: number;
  divisa?: string;
  separador?: ',' | '.';
}

export default function DonutChart({ datos, total, divisa = '€', separador = ',' }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  const grosor = 15;

  let offsetAcumulado = 0;

  return (
    <View style={styles.container}>
      <Svg width={160} height={160} viewBox="0 0 160 160">
        <G transform="rotate(-90, 80, 80)">
          <Circle cx="80" cy="80" r={radio} stroke={c.fondoAlto} strokeWidth={grosor} fill="none" />
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
        <Text style={[styles.total, { color: c.texto, fontSize: fs(18) }]}>{formatearMoneda(total, divisa, separador)}</Text>
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
    fontWeight: '700',
  },
});
