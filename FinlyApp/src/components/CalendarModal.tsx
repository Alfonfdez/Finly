import { useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Periodo } from './calendars/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import DayPicker from './calendars/DayPicker';
import WeekPicker from './calendars/WeekPicker';
import MonthGrid from './calendars/MonthGrid';
import YearGrid from './calendars/YearGrid';
import PeriodPicker from './calendars/PeriodPicker';

interface Props {
  visible: boolean;
  periodo: Periodo;
  fecha: Date;
  inicioRango?: Date;
  finRango?: Date;
  onSelectFecha: (fecha: Date) => void;
  onSelectRango?: (inicio: Date, fin: Date) => void;
  onClose: () => void;
  primerDia?: 0 | 1;
}

const TITULOS_KEY: Record<Periodo, keyof ReturnType<typeof t>> = {
  dia: 'cal_select_day',
  semana: 'cal_select_week',
  mes: 'cal_select_month',
  año: 'cal_select_year',
  periodo: 'cal_select_period',
};

function textoSubtitulo(periodo: Periodo, fecha: Date): string {
  const texto = t();
  const meses = texto.months;
  const mesesCortos = texto.months_short;
  const m = meses[fecha.getMonth()];
  const mc = mesesCortos[fecha.getMonth()];

  switch (periodo) {
    case 'dia': {
      return `${fecha.getDate()} ${m} ${fecha.getFullYear()}`;
    }
    case 'semana': {
      const inicio = new Date(fecha);
      const diaSem = inicio.getDay();
      inicio.setDate(inicio.getDate() - (diaSem === 0 ? 6 : diaSem - 1));
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      const dI = inicio.getDate();
      const mI = mesesCortos[inicio.getMonth()];
      const dF = fin.getDate();
      const mF = mesesCortos[fin.getMonth()];
      return `${dI} ${mI} – ${dF} ${mF} ${fecha.getFullYear()}`;
    }
    case 'mes': return `${m} ${fecha.getFullYear()}`;
    case 'año': return fecha.getFullYear().toString();
    default: return '';
  }
}

export default function CalendarModal({
  visible, periodo, fecha, inicioRango, finRango,
  onSelectFecha, onSelectRango, onClose, primerDia = 1,
}: Props) {
  const [fechaTemp, setFechaTemp] = useState(fecha);
  const [rangoInicioTemp, setRangoInicioTemp] = useState(inicioRango ?? new Date(new Date().getFullYear(), 0, 1));
  const [rangoFinTemp, setRangoFinTemp] = useState(finRango ?? new Date());
  const { config, coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const handleSelect = useCallback((d: Date) => {
    setFechaTemp(d);
  }, []);

  const handleRangoChange = useCallback((inicio: Date, fin: Date) => {
    setRangoInicioTemp(inicio);
    setRangoFinTemp(fin);
  }, []);

  const handleOk = useCallback(() => {
    if (periodo === 'periodo') {
      onSelectRango?.(rangoInicioTemp, rangoFinTemp);
    } else {
      onSelectFecha(fechaTemp);
    }
    onClose();
  }, [periodo, fechaTemp, rangoInicioTemp, rangoFinTemp, onSelectFecha, onSelectRango, onClose]);

  const handleCancel = useCallback(() => {
    setFechaTemp(fecha);
    setRangoInicioTemp(inicioRango ?? new Date(new Date().getFullYear(), 0, 1));
    setRangoFinTemp(finRango ?? new Date());
    onClose();
  }, [fecha, inicioRango, finRango, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.fondo }]}>
          <Text style={[styles.titulo, { color: c.texto, fontSize: fs(18) }]}>{texto[TITULOS_KEY[periodo]] as string}</Text>
          {periodo !== 'periodo' && <Text style={[styles.subtitulo, { color: c.textoSuave, fontSize: fs(13) }]}>{textoSubtitulo(periodo, fechaTemp)}</Text>}

          {periodo === 'dia' && (
            <DayPicker fecha={fechaTemp} onSelect={handleSelect} primerDia={primerDia} />
          )}
          {periodo === 'semana' && (
            <WeekPicker fecha={fechaTemp} onSelect={handleSelect} primerDia={primerDia} />
          )}
          {periodo === 'mes' && (
            <MonthGrid fecha={fechaTemp} onSelect={handleSelect} />
          )}
          {periodo === 'año' && (
            <YearGrid fecha={fechaTemp} onSelect={handleSelect} />
          )}
          {periodo === 'periodo' && (
            <PeriodPicker
              inicioTemp={rangoInicioTemp}
              finTemp={rangoFinTemp}
              onTempRangoChange={handleRangoChange}
              primerDia={primerDia}
            />
          )}

          <View style={[styles.botones, { borderTopColor: c.borde }]}>
            <TouchableOpacity style={[styles.botonCancelar, { backgroundColor: c.fondoAlto }]} onPress={handleCancel}>
              <Text style={[styles.botonCancelarTexto, { color: c.textoSuave, fontSize: fs(14) }]}>{texto.cal_cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botonOk, { backgroundColor: c.primario }]} onPress={handleOk}>
              <Text style={[styles.botonOkTexto, { color: c.fondo, fontSize: fs(14) }]}>{texto.cal_ok}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
      default: { elevation: 10 },
    }),
  },
  titulo: { fontWeight: '700', marginBottom: 2 },
  subtitulo: { marginBottom: 12 },
  botones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  botonCancelar: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  botonCancelarTexto: { fontWeight: '600' },
  botonOk: { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 8 },
  botonOkTexto: { fontWeight: '700' },
});
