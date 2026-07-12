import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  fotoUri: string | null;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
}

export default function PhotoSection({ fotoUri, onTakePhoto, onPickFromGallery }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const { coloresActivos: c } = useConfig();
  const fs = useFontSize();
  const texto = t();

  const handleOption = (action: () => void) => {
    setModalVisible(false);
    action();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.titulo, { color: c.texto, fontSize: fs(15) }]}>
        {texto.add_photo}
      </Text>
      <TouchableOpacity
        style={[styles.photoButton, { backgroundColor: c.fondoAlto, borderColor: c.borde }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel={texto.add_photo}
      >
        {fotoUri ? (
          <Text style={[styles.photoText, { color: c.texto, fontSize: fs(14) }]}>
            Foto seleccionada
          </Text>
        ) : (
          <Ionicons name="add" size={32} color={c.textoSuave} />
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.fondo }]}>
            <Text style={[styles.modalTitle, { color: c.texto, fontSize: fs(18) }]}>
              {texto.add_photo_title}
            </Text>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: c.fondoAlto }]}
              onPress={() => handleOption(onTakePhoto)}
            >
              <Ionicons name="camera-outline" size={24} color={c.primario} />
              <Text style={[styles.modalOptionText, { color: c.texto, fontSize: fs(15) }]}>
                {texto.add_photo_camera}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: c.fondoAlto }]}
              onPress={() => handleOption(onPickFromGallery)}
            >
              <Ionicons name="images-outline" size={24} color={c.primario} />
              <Text style={[styles.modalOptionText, { color: c.texto, fontSize: fs(15) }]}>
                {texto.add_photo_gallery}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: c.fondoAlto }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: c.textoSuave, fontSize: fs(14) }]}>
                {texto.cal_cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titulo: {
    fontWeight: '600',
    marginBottom: 10,
  },
  photoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: {
    textAlign: 'center',
  },
  modalOverlay: {
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
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  modalOptionText: {
    fontWeight: '500',
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontWeight: '600',
  },
});
