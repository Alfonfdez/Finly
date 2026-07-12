import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { obtenerDiasDelMes, esMismoDia, esFechaFutura } from '../../utils/formatters';
import { CalendarBaseProps } from './types';
import MonthNav from './MonthNav';
import { useConfig } from '../../context/ConfigContext';
import { t } from '../../i18n';
import { useFontSize } from '../../hooks/useFontSize';

interface Props extends CalendarBaseProps {
  rangoInicio?: Date | null;
  rangoFin?: Date | null;
  vistaInicial?: Date;
  primerDia?: 0 | 1;
}

function offsetPrimerDia(fechaDia: Date, primerDia: 0 | 1): number {
  const diaSemana = fechaDia.getDay();
  if (primerDia === 1) {
    return diaSemana === 0 ? 6 : diaSemana - 1;
  }
  return diaSemana;
}

export default function DayPicker({ fecha, onSelect, rangoInicio, rangoFin, vistaInicial, primerDia = 1 }: Props) {
  const hoy = new Date();
  const [año, setAño] = useState((vistaInicial ?? fecha).getFullYear());
  const [mes, setMes] = useState((vistaInicial ?? fecha).getMonth() + 1);
  const { config, coloresActivos: c } = useConfig();
  const fs = useFontSize();

  const diasEnMes = obtenerDiasDelMes(año, mes);
  const primerDiaMes = new Date(año, mes - 1, 1);
  const diasPrevios = offsetPrimerDia(primerDiaMes, primerDia);
  const headers = primerDia === 1 ? t().days_short_mon : t().days_short_sun;

  const enRango = (d: Date) => rangoInicio && rangoFin && d >= rangoInicio && d <= rangoFin;
  const esBordeInicio = (d: Date) => rangoInicio && esMismoDia(d, rangoInicio);
  const esBordeFin = (d: Date) => rangoFin && esMismoDia(d, rangoFin);

  return (
    <View style={styles.container}>
      <MonthNav año={año} mes={mes} onChange={(a, m) => { setAño(a); setMes(m); }} />

      <View style={styles.diasSemana}>
        {headers.map(d => (
          <Text key={d} style={[styles.diaSemanaTexto, { color: c.textoSuave, fontSize: fs(12) }]}>{d}</Text>
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
              style={[styles.dia, futuro && styles.diaFuturo]}
              onPress={() => !futuro && onSelect(fechaDia)}
              disabled={futuro}
            >
              <View style={styles.diaWrap}>
                <View style={[
                  styles.diaBg,
                  esHoy && [styles.diaHoy, { borderColor: c.primario }],
                  esSeleccionado && [styles.diaSeleccionado, { backgroundColor: c.primario }],
                  dentroRango && !esSeleccionado && { backgroundColor: c.primario + '25', borderRadius: 4 },
                  esInicio && !esSeleccionado && { backgroundColor: c.primario + '40' },
                  esFin && !esSeleccionado && { backgroundColor: c.primario + '40' },
                ]} />
                <View style={styles.diaCenter}>
                  <Text style={[
                    styles.diaTexto,
                    { color: c.texto, fontSize: fs(14) },
                    esSeleccionado && { color: c.fondo, fontWeight: '700' },
                    futuro && { color: c.textoSuave },
                    dentroRango && !esSeleccionado && { fontWeight: '600' },
                  ]}>
                    {String(dia)}
                  </Text>
                </View>
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
  diasSemana: { flexDirection: 'row', marginBottom: 8 },
  diaSemanaTexto: { flex: 1, textAlign: 'center', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dia: { width: '14.28%', aspectRatio: 1 },
  diaVacio: { width: '14.28%', aspectRatio: 1 },
  diaWrap: { flex: 1 },
  diaBg: { ...StyleSheet.absoluteFillObject, borderRadius: 20, overflow: 'hidden' },
  diaCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  diaHoy: { borderWidth: 1 },
  diaSeleccionado: {},
  diaFuturo: { opacity: 0.3 },
  diaTexto: { textAlign: 'center' },
});
