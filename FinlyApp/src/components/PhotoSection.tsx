import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

interface Props {
  photoUri: string | null;
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onRemovePhoto?: () => void;
}

export default function PhotoSection({ photoUri, onTakePhoto, onPickFromGallery, onRemovePhoto }: Props) {
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
        style={[styles.photoButton, { backgroundColor: c.surface, borderColor: photoUri ? 'transparent' : c.border }]}
        onPress={() => setModalVisible(true)}
        accessibilityLabel={labels.add_photo}
      >
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photoThumbnail} />
            {onRemovePhoto && (
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: c.red }]}
                onPress={(e) => { e.stopPropagation?.(); onRemovePhoto(); }}
                accessibilityLabel={labels.photo_remove}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            )}
          </>
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
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
