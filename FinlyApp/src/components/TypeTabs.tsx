import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TipoTransaccion } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  activo: TipoTransaccion;
  onChange: (tipo: TipoTransaccion) => void;
}

export default function TypeTabs({ activo, onChange }: Props) {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <View style={[styles.container, { backgroundColor: c.fondoAlto }]}>
      <TouchableOpacity
        style={[styles.tab, activo === 'gasto' && { backgroundColor: c.fondo }]}
        onPress={() => onChange('gasto')}
        accessibilityLabel={texto.a11y_show_expenses}
      >
        <Text style={[styles.texto, { color: activo === 'gasto' ? c.texto : c.textoSuave, fontSize: fs(15) }]}>{texto.tab_expenses}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activo === 'ingreso' && { backgroundColor: c.fondo }]}
        onPress={() => onChange('ingreso')}
        accessibilityLabel={texto.a11y_show_income}
      >
        <Text style={[styles.texto, { color: activo === 'ingreso' ? c.texto : c.textoSuave, fontSize: fs(15) }]}>{texto.tab_income}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  texto: {
    fontWeight: '600',
  },
});
