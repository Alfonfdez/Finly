import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colores } from '../constants/colors';
import { TipoTransaccion } from '../constants/types';

interface Props {
  activo: TipoTransaccion;
  onChange: (tipo: TipoTransaccion) => void;
}

export default function TypeTabs({ activo, onChange }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.tab, activo === 'gasto' && styles.activo]}
        onPress={() => onChange('gasto')}
        accessibilityLabel="Mostrar gastos"
      >
        <Text style={[styles.texto, activo === 'gasto' && styles.textoActivo]}>Gastos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activo === 'ingreso' && styles.activo]}
        onPress={() => onChange('ingreso')}
        accessibilityLabel="Mostrar ingresos"
      >
        <Text style={[styles.texto, activo === 'ingreso' && styles.textoActivo]}>Ingresos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colores.fondoAlto,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activo: {
    backgroundColor: colores.fondo,
  },
  texto: {
    color: colores.textoSuave,
    fontSize: 15,
    fontWeight: '600',
  },
  textoActivo: {
    color: colores.texto,
  },
});
