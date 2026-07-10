import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../constants/colors';
import { Cuenta } from '../data/mockData';
import { formatearMoneda } from '../utils/formatters';

interface Props {
  visible: boolean;
  cuentas: Cuenta[];
  onSelect: (cuenta: Cuenta) => void;
  onClose: () => void;
}

export default function AccountModal({ visible, cuentas, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.titulo}>Seleccionar cuenta</Text>
          <FlatList
            data={cuentas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelect(item)}
                accessibilityLabel={`Seleccionar cuenta ${item.nombre}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.icono, { backgroundColor: item.color + '30' }]}>
                  <Ionicons name={item.icono as any} size={22} color={item.color} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.nombre}>{item.nombre}</Text>
                  <Text style={styles.saldo}>{formatearMoneda(item.saldo)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.cerrar} onPress={onClose}>
            <Text style={styles.cerrarTexto}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colores.fondoAlto,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  titulo: {
    color: colores.texto,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nombre: {
    color: colores.texto,
    fontSize: 16,
  },
  saldo: {
    color: colores.textoSuave,
    fontSize: 14,
    marginTop: 2,
  },
  cerrar: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cerrarTexto: {
    color: colores.primario,
    fontSize: 16,
    fontWeight: '600',
  },
});
