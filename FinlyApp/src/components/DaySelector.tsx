import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { esMismoDia } from '../utils/formatters';

interface Props {
  diaSeleccionado: Date;
  onSelect: (fecha: Date) => void;
  onOpenCalendar: () => void;
}

export default function DaySelector({ diaSeleccionado, onSelect, onOpenCalendar }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const anteayer = new Date(hoy);
  anteayer.setDate(hoy.getDate() - 2);

  const esHoy = esMismoDia(diaSeleccionado, hoy);
  const esAyer = esMismoDia(diaSeleccionado, ayer);
  const seleccionadoEsOtro = !esHoy && !esAyer;

  const formatearFechaCorta = (fecha: Date) => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = texto.months_short[fecha.getMonth()];
    return `${dia} ${mes}`;
  };

  const formatearFechaLarga = (fecha: Date) => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = texto.months_short[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const esAnioActual = anio === hoy.getFullYear();
    return esAnioActual ? `${dia} ${mes}` : `${dia} ${mes} ${anio}`;
  };

  const tercerFecha = seleccionadoEsOtro ? diaSeleccionado : anteayer;
  const tercerSeleccionado = seleccionadoEsOtro;

  const renderOpcion = (fecha: Date, label: string, isSelected: boolean, esDinamico = false) => (
    <TouchableOpacity
      style={[
        styles.opcion,
        { backgroundColor: isSelected ? c.primario + '22' : c.fondoAlto },
        isSelected && { borderWidth: 2, borderColor: c.primario },
      ]}
      onPress={() => onSelect(fecha)}
    >
      <Text style={[styles.fecha, { color: c.texto, fontSize: fs(14) }]}>
        {esDinamico ? formatearFechaLarga(fecha) : formatearFechaCorta(fecha)}
      </Text>
      <Text style={[styles.label, { color: isSelected ? c.primario : c.textoSuave, fontSize: fs(12) }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.titulo, { color: c.texto, fontSize: fs(15) }]}>
          {texto.add_day}
        </Text>
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={onOpenCalendar}
          accessibilityLabel={texto.cal_select_day}
        >
          <Ionicons name="calendar-outline" size={20} color={c.primario} />
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {renderOpcion(hoy, texto.add_today, esHoy)}
        {renderOpcion(ayer, texto.add_yesterday, esAyer)}
        {renderOpcion(
          tercerFecha,
          tercerSeleccionado ? texto.add_selected : texto.add_day_before,
          tercerSeleccionado,
          true,
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titulo: {
    fontWeight: '600',
  },
  calendarButton: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  opcion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  fecha: {
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    fontWeight: '500',
  },
});
