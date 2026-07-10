import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colores } from '../constants/colors';

export default function AddTransactionScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Añadir Gasto / Ingreso</Text>
        <Text style={styles.placeholder}>Formulario próximamente</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  titulo: {
    color: colores.texto,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  placeholder: {
    color: colores.textoSuave,
    fontSize: 14,
  },
});
