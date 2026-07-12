import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { obtenerNombreMesAbrev } from '../../utils/formatters';
import DayPicker from './DayPicker';
import { useConfig } from '../../context/ConfigContext';
import { useFontSize } from '../../hooks/useFontSize';
import { t } from '../../i18n';

const ANIO_MINIMO = new Date().getFullYear();

interface Props {
  inicioTemp: Date;
  finTemp: Date;
  onTempRangoChange: (inicio: Date, fin: Date) => void;
  primerDia?: 0 | 1;
}

export default function PeriodPicker({ inicioTemp, finTemp, onTempRangoChange, primerDia = 1 }: Props) {
  const [todos, setTodos] = useState(false);
  const [seleccionando, setSeleccionando] = useState<'inicio' | 'fin'>('inicio');
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();
  const mesesCortos = texto.months_short;

  const fechaMinima = new Date(ANIO_MINIMO, 0, 1);
  const hoy = new Date();

  const handleTodos = useCallback(() => {
    const nuevoEstado = !todos;
    setTodos(nuevoEstado);
    if (nuevoEstado) {
      onTempRangoChange(fechaMinima, hoy);
    }
  }, [todos, onTempRangoChange]);

  const handleDayPress = useCallback((d: Date) => {
    if (todos) return;
    if (seleccionando === 'inicio') {
      onTempRangoChange(d, d);
      setSeleccionando('fin');
    } else {
      const i = inicioTemp < d ? inicioTemp : d;
      const f = inicioTemp < d ? d : inicioTemp;
      onTempRangoChange(i, f);
    }
  }, [seleccionando, inicioTemp, todos, onTempRangoChange]);

  const textoRango = todos
    ? texto.cal_all
    : seleccionando === 'fin' && inicioTemp.getTime() === finTemp.getTime()
      ? `${texto.cal_from} ${inicioTemp.getDate()} ${mesesCortos[inicioTemp.getMonth()]} — ${texto.cal_period_to_hint}`
      : `${texto.cal_from} ${inicioTemp.getDate()} ${mesesCortos[inicioTemp.getMonth()]} ${texto.cal_to} ${finTemp.getDate()} ${mesesCortos[finTemp.getMonth()]} ${finTemp.getFullYear()}`;

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: c.textoSuave, fontSize: fs(13) }]}>{textoRango}</Text>

      <TouchableOpacity style={styles.todosRow} onPress={handleTodos}>
        <View style={[styles.checkbox, { borderColor: c.textoSuave }, todos && { backgroundColor: c.primario, borderColor: c.primario }]} />
        <Text style={[styles.todosTexto, { color: c.texto, fontSize: fs(14) }]}>{texto.cal_all}</Text>
      </TouchableOpacity>

      {!todos && (
        <View style={[styles.indicador, { backgroundColor: c.fondoAlto }]}>
          <Text style={[styles.indicadorTexto, { color: c.primario, fontSize: fs(13) }]}>
            {seleccionando === 'inicio' ? texto.cal_select_start : texto.cal_select_end}
          </Text>
        </View>
      )}

      {!todos && (
        <DayPicker
          fecha={seleccionando === 'inicio' ? inicioTemp : finTemp}
          onSelect={handleDayPress}
          rangoInicio={inicioTemp}
          rangoFin={finTemp}
          vistaInicial={new Date()}
          primerDia={primerDia}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  titulo: { marginBottom: 12 },
  todosRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, marginRight: 8 },
  todosTexto: {},
  indicador: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  indicadorTexto: { fontWeight: '600' },
});
