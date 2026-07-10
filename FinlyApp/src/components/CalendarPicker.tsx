import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores } from '../constants/colors';
import { formatearFecha, obtenerNombreMes, formatoSemana } from '../utils/formatters';
import CalendarModal from './CalendarModal';
import { Periodo } from './calendars/types';

interface Props {
  periodo: Periodo;
  fecha: Date;
  onFechaChange: (fecha: Date) => void;
  onRangoChange?: (inicio: Date, fin: Date) => void;
  inicioRango?: Date;
  finRango?: Date;
  visible?: boolean;
  onAbrir?: () => void;
  onClose?: () => void;
}

export default function CalendarPicker({
  periodo, fecha, onFechaChange, onRangoChange,
  inicioRango, finRango, visible = false, onAbrir, onClose,
}: Props) {
  const hoy = new Date();

  const textoFecha = () => {
    switch (periodo) {
      case 'dia': return formatearFecha(fecha);
      case 'semana': return formatoSemana(fecha);
      case 'mes': return `${obtenerNombreMes(fecha.getMonth() + 1)} de ${fecha.getFullYear()}`;
      case 'año': return fecha.getFullYear().toString();
      case 'periodo': {
        const i = inicioRango ?? new Date(hoy.getFullYear(), 0, 1);
        const f = finRango ?? hoy;
        return `desde ${i.getDate()} ${obtenerNombreMes(i.getMonth() + 1).slice(0, 3).toLowerCase()} hasta ${f.getDate()} ${obtenerNombreMes(f.getMonth() + 1).slice(0, 3).toLowerCase()}, ${f.getFullYear()}`;
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.boton}
        onPress={onAbrir}
        accessibilityLabel={`Cambiar fecha: ${textoFecha()}`}
      >
        <Text style={styles.texto}>{textoFecha()}</Text>
      </TouchableOpacity>
      <CalendarModal
        visible={visible}
        periodo={periodo}
        fecha={fecha}
        inicioRango={inicioRango}
        finRango={finRango}
        onSelectFecha={onFechaChange}
        onSelectRango={onRangoChange}
        onClose={() => onClose?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 4,
  },
  boton: {
    backgroundColor: colores.fondoAlto,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  texto: {
    color: colores.primario,
    fontSize: 14,
    fontWeight: '600',
  },
});
