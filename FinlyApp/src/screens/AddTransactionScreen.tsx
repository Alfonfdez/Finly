import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

export default function AddTransactionScreen() {
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.fondo }]}>
      <View style={[styles.container, { backgroundColor: c.fondo }]}>
        <Text style={[styles.titulo, { color: c.texto, fontSize: fs(20) }]}>{texto.add_title}</Text>
        <Text style={[styles.placeholder, { color: c.textoSuave, fontSize: fs(14) }]}>{texto.add_coming_soon}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  titulo: { fontWeight: '700', marginBottom: 8 },
  placeholder: {},
});
