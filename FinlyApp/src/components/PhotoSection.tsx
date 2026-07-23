import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

const MAX_PHOTOS = 3;

interface Props {
  photos: string[];
  onTakePhoto: () => void;
  onPickFromGallery: () => void;
  onRemovePhoto: (uri: string) => void;
}

export default function PhotoSection({ photos, onTakePhoto, onPickFromGallery, onRemovePhoto }: Props) {
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const handleSourceOption = (action: () => void) => {
    setSourceModalVisible(false);
    action();
  };

  const handlePressDelete = (uri: string) => {
    setPhotoToDelete(uri);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (photoToDelete) {
      onRemovePhoto(photoToDelete);
    }
    setDeleteModalVisible(false);
    setPhotoToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setPhotoToDelete(null);
  };

  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>
        {labels.add_photo}
      </Text>
      <View style={styles.photoRow}>
        {photos.map((uri) => (
          <View key={uri} style={styles.photoWrapper}>
            <TouchableOpacity
              style={[styles.photoButton, { backgroundColor: c.surface }]}
              onPress={() => {}}
              activeOpacity={1}
            >
              <Image source={{ uri }} style={styles.photoThumbnail} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: c.red }]}
              onPress={() => handlePressDelete(uri)}
              accessibilityLabel={labels.photo_remove}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {canAddMore && (
          <TouchableOpacity
            style={[styles.photoButton, styles.addButton, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => setSourceModalVisible(true)}
            accessibilityLabel={labels.add_photo}
          >
            <Ionicons name="add" size={28} color={c.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={sourceModalVisible} transparent animationType="fade" onRequestClose={() => setSourceModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.background }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(18) }]}>
              {labels.add_photo_title}
            </Text>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: c.surface }]}
              onPress={() => handleSourceOption(onTakePhoto)}
            >
              <Ionicons name="camera-outline" size={24} color={c.primary} />
              <Text style={[styles.modalOptionText, { color: c.text, fontSize: fs(15) }]}>
                {labels.add_photo_camera}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { backgroundColor: c.surface }]}
              onPress={() => handleSourceOption(onPickFromGallery)}
            >
              <Ionicons name="images-outline" size={24} color={c.primary} />
              <Text style={[styles.modalOptionText, { color: c.text, fontSize: fs(15) }]}>
                {labels.add_photo_gallery}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalCancelButton, { backgroundColor: c.surface }]}
              onPress={() => setSourceModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: c.textSecondary, fontSize: fs(14) }]}>
                {labels.cal_cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={handleCancelDelete}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: c.background }]}>
            <Text style={[styles.modalTitle, { color: c.text, fontSize: fs(16) }]}>
              {labels.photo_delete_title}
            </Text>
            <Text style={[styles.modalMessage, { color: c.textSecondary, fontSize: fs(14) }]}>
              {labels.photo_delete_message}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={handleCancelDelete}
              >
                <Text style={[styles.modalButtonText, { color: c.text, fontSize: fs(14) }]}>
                  {labels.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: c.red }]}
                onPress={handleConfirmDelete}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontSize: fs(14) }]}>
                  {labels.delete}
                </Text>
              </TouchableOpacity>
            </View>
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
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoWrapper: {
    position: 'relative',
  },
  photoButton: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addButton: {
    borderStyle: 'dashed',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontWeight: '600',
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
