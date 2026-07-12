import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatearFecha } from '../utils/formatters';
import CalendarModal from './CalendarModal';
import { Periodo } from './calendars/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

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
  primerDia?: 0 | 1;
}

export default function CalendarPicker({
  periodo, fecha, onFechaChange, onRangoChange,
  inicioRango, finRango, visible = false, onAbrir, onClose, primerDia = 1,
}: Props) {
  const hoy = new Date();
  const { config, coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();
  const meses = texto.months;
  const mesesCortos = texto.months_short;

  const textoFecha = () => {
    switch (periodo) {
      case 'dia': return formatearFecha(fecha);
      case 'semana': {
        const inicio = new Date(fecha);
        const diaSem = inicio.getDay();
        inicio.setDate(inicio.getDate() - (diaSem === 0 ? 6 : diaSem - 1));
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 6);
        return `${inicio.getDate()} ${mesesCortos[inicio.getMonth()]} – ${fin.getDate()} ${mesesCortos[fin.getMonth()]}`;
      }
      case 'mes': return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      case 'año': return fecha.getFullYear().toString();
      case 'periodo': {
        const i = inicioRango ?? new Date(hoy.getFullYear(), 0, 1);
        const f = finRango ?? hoy;
        return `${texto.cal_from} ${i.getDate()} ${mesesCortos[i.getMonth()]} ${texto.cal_to} ${f.getDate()} ${mesesCortos[f.getMonth()]} ${f.getFullYear()}`;
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.boton, { backgroundColor: c.fondoAlto }]}
        onPress={onAbrir}
        accessibilityLabel={`${textoFecha()}`}
      >
        <Text style={[styles.texto, { color: c.primario, fontSize: fs(14) }]}>{textoFecha()}</Text>
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
        primerDia={primerDia}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 4 },
  boton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  texto: { fontWeight: '600' },
});
