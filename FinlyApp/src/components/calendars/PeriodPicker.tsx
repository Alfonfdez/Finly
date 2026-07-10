import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores } from '../../constants/colors';
import { obtenerNombreMesAbrev } from '../../utils/formatters';
import DayPicker from './DayPicker';

interface Props {
  inicioTemp: Date;
  finTemp: Date;
  onTempRangoChange: (inicio: Date, fin: Date) => void;
}

export default function PeriodPicker({ inicioTemp, finTemp, onTempRangoChange }: Props) {
  const [todos, setTodos] = useState(false);
  const [seleccionando, setSeleccionando] = useState<'inicio' | 'fin'>('inicio');

  const fechaMinima = new Date(2026, 0, 1);
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
    ? 'Todos'
    : seleccionando === 'fin' && inicioTemp.getTime() === finTemp.getTime()
      ? `desde ${inicioTemp.getDate()} ${obtenerNombreMesAbrev(inicioTemp.getMonth() + 1)} — seleccione fin`
      : `desde ${inicioTemp.getDate()} ${obtenerNombreMesAbrev(inicioTemp.getMonth() + 1)} hasta ${finTemp.getDate()} ${obtenerNombreMesAbrev(finTemp.getMonth() + 1)}, ${finTemp.getFullYear()}`;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{textoRango}</Text>

      <TouchableOpacity style={styles.todosRow} onPress={handleTodos}>
        <View style={[styles.checkbox, todos && styles.checkboxActivo]} />
        <Text style={styles.todosTexto}>Todos</Text>
      </TouchableOpacity>

      {!todos && (
        <View style={styles.indicador}>
          <Text style={styles.indicadorTexto}>
            {seleccionando === 'inicio' ? 'Seleccione fecha de inicio' : 'Seleccione fecha de fin'}
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  titulo: { color: colores.textoSuave, fontSize: 13, marginBottom: 12 },
  todosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colores.textoSuave,
    marginRight: 8,
  },
  checkboxActivo: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  todosTexto: { color: colores.texto, fontSize: 14 },
  indicador: {
    backgroundColor: colores.fondoAlto,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  indicadorTexto: {
    color: colores.primario,
    fontSize: 13,
    fontWeight: '600',
  },
});
