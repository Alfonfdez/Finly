import { useState, useCallback } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colores } from '../constants/colors';
import { obtenerNombreMes } from '../utils/formatters';
import { Periodo, TITULOS } from './calendars/types';
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
}

function textoSubtitulo(periodo: Periodo, fecha: Date): string {
  switch (periodo) {
    case 'dia': {
      const d = fecha.getDate();
      const m = obtenerNombreMes(fecha.getMonth() + 1);
      return `${d} de ${m} de ${fecha.getFullYear()}`;
    }
    case 'semana': {
      const inicio = new Date(fecha);
      const diaSem = inicio.getDay();
      inicio.setDate(inicio.getDate() - (diaSem === 0 ? 6 : diaSem - 1));
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      const dI = inicio.getDate();
      const mI = obtenerNombreMes(inicio.getMonth() + 1);
      const dF = fin.getDate();
      const mF = obtenerNombreMes(fin.getMonth() + 1);
      if (inicio.getMonth() === fin.getMonth()) {
        return `${dI} ${mI.slice(0, 3).toLowerCase()} - ${dF} ${mF.slice(0, 3).toLowerCase()} de ${fecha.getFullYear()}`;
      }
      return `${dI} ${mI.slice(0, 3).toLowerCase()} - ${dF} ${mF.slice(0, 3).toLowerCase()} de ${fecha.getFullYear()}`;
    }
    case 'mes': return `${obtenerNombreMes(fecha.getMonth() + 1)} de ${fecha.getFullYear()}`;
    case 'año': return fecha.getFullYear().toString();
    default: return '';
  }
}

export default function CalendarModal({
  visible, periodo, fecha, inicioRango, finRango,
  onSelectFecha, onSelectRango, onClose,
}: Props) {
  const [fechaTemp, setFechaTemp] = useState(fecha);
  const [rangoInicioTemp, setRangoInicioTemp] = useState(inicioRango ?? new Date(new Date().getFullYear(), 0, 1));
  const [rangoFinTemp, setRangoFinTemp] = useState(finRango ?? new Date());

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
        <View style={styles.modal}>
          <Text style={styles.titulo}>{TITULOS[periodo]}</Text>
          {periodo !== 'periodo' && <Text style={styles.subtitulo}>{textoSubtitulo(periodo, fechaTemp)}</Text>}

          {periodo === 'dia' && (
            <DayPicker fecha={fechaTemp} onSelect={handleSelect} />
          )}
          {periodo === 'semana' && (
            <WeekPicker fecha={fechaTemp} onSelect={handleSelect} />
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
            />
          )}

          <View style={styles.botones}>
            <TouchableOpacity style={styles.botonCancelar} onPress={handleCancel}>
              <Text style={styles.botonCancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botonOk} onPress={handleOk}>
              <Text style={styles.botonOkTexto}>Ok</Text>
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
    backgroundColor: colores.fondo,
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 32px rgba(0,0,0,0.5)' },
      default: { elevation: 10 },
    }),
  },
  titulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitulo: {
    color: colores.textoSuave,
    fontSize: 13,
    marginBottom: 12,
  },
  botones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  botonCancelar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colores.fondoAlto,
  },
  botonCancelarTexto: {
    color: colores.textoSuave,
    fontSize: 14,
    fontWeight: '600',
  },
  botonOk: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colores.primario,
  },
  botonOkTexto: {
    color: colores.fondo,
    fontSize: 14,
    fontWeight: '700',
  },
});
