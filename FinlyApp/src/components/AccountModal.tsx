import { ComponentProps } from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cuenta } from '../database/types';
import { formatearMoneda } from '../utils/formatters';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface CuentaConSaldo extends Cuenta {
  saldo: number;
}

interface Props {
  visible: boolean;
  cuentas: CuentaConSaldo[];
  onSelect: (cuenta: CuentaConSaldo) => void;
  onClose: () => void;
}

export default function AccountModal({ visible, cuentas, onSelect, onClose }: Props) {
  const { config, coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: c.fondoAlto }]}>
          <Text style={[styles.titulo, { color: c.texto, fontSize: fs(18) }]}>{texto.account_select}</Text>
          <FlatList
            data={cuentas}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.item, { borderBottomColor: c.borde }]}
                onPress={() => onSelect(item)}
                accessibilityLabel={`Seleccionar cuenta ${item.nombre}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.icono, { backgroundColor: item.color + '30' }]}>
                  <Ionicons name={item.icono as ComponentProps<typeof Ionicons>['name']} size={22} color={item.color} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.nombre, { color: c.texto, fontSize: fs(16) }]}>{item.nombre}</Text>
                  <Text style={[styles.saldo, { color: c.textoSuave, fontSize: fs(14) }]}>{formatearMoneda(item.saldo, config.divisa, config.separadorDecimal)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.cerrar} onPress={onClose}>
            <Text style={[styles.cerrarTexto, { color: c.primario, fontSize: fs(16) }]}>{texto.account_close}</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  titulo: { fontWeight: '700', marginBottom: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  nombre: {},
  saldo: { marginTop: 2 },
  cerrar: { alignItems: 'center', paddingVertical: 14, marginTop: 8 },
  cerrarTexto: { fontWeight: '600' },
});
