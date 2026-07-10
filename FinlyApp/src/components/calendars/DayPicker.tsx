import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores } from '../../constants/colors';
import { obtenerDiasDelMes, esMismoDia, esFechaFutura } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';

interface Props extends CalendarBaseProps {
  rangoInicio?: Date | null;
  rangoFin?: Date | null;
  vistaInicial?: Date;
}

export default function DayPicker({ fecha, onSelect, rangoInicio, rangoFin, vistaInicial }: Props) {
  const hoy = new Date();
  const [año, setAño] = useState((vistaInicial ?? fecha).getFullYear());
  const [mes, setMes] = useState((vistaInicial ?? fecha).getMonth() + 1);

  const diasEnMes = obtenerDiasDelMes(año, mes);
  const primerDiaSemana = new Date(año, mes - 1, 1).getDay();
  const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  const diasPrevios = (primerDiaSemana + 6) % 7;

  const enRango = (d: Date) => rangoInicio && rangoFin && d >= rangoInicio && d <= rangoFin;
  const esBordeInicio = (d: Date) => rangoInicio && esMismoDia(d, rangoInicio);
  const esBordeFin = (d: Date) => rangoFin && esMismoDia(d, rangoFin);

  return (
    <View style={styles.container}>
      <MonthNav año={año} mes={mes} onChange={(a, m) => { setAño(a); setMes(m); }} />

      <View style={styles.diasSemana}>
        {diasSemana.map(d => (
          <Text key={d} style={styles.diaSemanaTexto}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: diasPrevios }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.diaVacio} />
        ))}
        {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
          const fechaDia = new Date(año, mes - 1, dia);
          const esHoy = esMismoDia(fechaDia, hoy);
          const esSeleccionado = esMismoDia(fechaDia, fecha);
          const futuro = esFechaFutura(fechaDia);
          const dentroRango = enRango(fechaDia);
          const esInicio = esBordeInicio(fechaDia);
          const esFin = esBordeFin(fechaDia);

          return (
            <TouchableOpacity
              key={dia}
              style={[
                styles.dia,
                esHoy && styles.diaHoy,
                esSeleccionado && styles.diaSeleccionado,
                futuro && styles.diaFuturo,
                dentroRango && !esSeleccionado && styles.diaRango,
                esInicio && styles.diaRangoBorde,
                esFin && styles.diaRangoBorde,
              ]}
              onPress={() => !futuro && onSelect(fechaDia)}
              disabled={futuro}
            >
              <Text style={[
                styles.diaTexto,
                esSeleccionado && styles.diaTextoSeleccionado,
                futuro && styles.diaTextoFuturo,
                dentroRango && !esSeleccionado && styles.diaTextoRango,
              ]}>
                {dia}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  diasSemana: { flexDirection: 'row', marginBottom: 8 },
  diaSemanaTexto: { flex: 1, textAlign: 'center', color: colores.textoSuave, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dia: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  diaVacio: { width: '14.28%', aspectRatio: 1 },
  diaHoy: { borderWidth: 1, borderColor: colores.primario },
  diaSeleccionado: { backgroundColor: colores.primario },
  diaRango: { backgroundColor: colores.primario + '25', borderRadius: 0 },
  diaRangoBorde: { backgroundColor: colores.primario + '40' },
  diaFuturo: { opacity: 0.3 },
  diaTexto: { color: colores.texto, fontSize: 14 },
  diaTextoSeleccionado: { color: colores.fondo, fontWeight: '700' },
  diaTextoRango: { color: colores.texto, fontWeight: '600' },
  diaTextoFuturo: { color: colores.textoSuave },
});
