import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  photoUri: string | null;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
}

export default function PhotoSection({ photoUri, onTakePhoto, onPickFromGallery }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const handleOption = (action: () => void) => {
    setModalVisible(false);
    action();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>
        {labels.add_photo}
      </Text>
      <TouchableOpacity
        style={[styles.photoButton, { backgroundColor: c.surface, borderColor: c.border }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel={labels.add_photo}
      >
        {photoUri ? (
          <Text style={[styles.photoText, { color: c.text, fontSize: fs(14) }]}>
            Selected photo
          </Text>
        ) : (
          <Ionicons name="add" size={32} color={c.textSecondary} />
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.background }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(18) }]}>
              {labels.add_photo_title}
            </Text>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: c.surface }]}
              onPress={() => handleOption(onTakePhoto)}
            >
              <Ionicons name="camera-outline" size={24} color={c.primary} />
              <Text style={[styles.modalOptionText, { color: c.text, fontSize: fs(15) }]}>
                {labels.add_photo_camera}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: c.surface }]}
              onPress={() => handleOption(onPickFromGallery)}
            >
              <Ionicons name="images-outline" size={24} color={c.primary} />
              <Text style={[styles.modalOptionText, { color: c.text, fontSize: fs(15) }]}>
                {labels.add_photo_gallery}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: c.surface }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: c.textSecondary, fontSize: fs(14) }]}>
                {labels.cal_cancel}
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
  title: {
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
