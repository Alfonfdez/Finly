import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { MAX_PHOTOS } from '../constants/types';
import { WHITE } from '../constants/themes';
import { isNative } from '../utils/platform';
import ConfirmationModal from './ConfirmationModal';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import { CARD_BORDER_RADIUS, BUTTON_BORDER_RADIUS, CONTROL_BORDER_RADIUS } from './componentStyles';

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
        {photos.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.photoWrapper}>
            <View style={[styles.photoButton, { backgroundColor: c.surface }]}>
              <Image source={{ uri }} style={styles.photoThumbnail} />
            </View>
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: c.red }]}
              onPress={() => handlePressDelete(uri)}
              accessibilityLabel={labels.photo_remove}
            >
              <Ionicons name="close" size={14} color={WHITE} />
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

      <ModalShell
        visible={sourceModalVisible}
        onClose={() => setSourceModalVisible(false)}
        backgroundColor={c.background}
      >
        <ModalHeader title={labels.add_photo_title} />
        {isNative && (
          <TouchableOpacity
            style={[styles.modalOption, { backgroundColor: c.surface }]}
            onPress={() => handleSourceOption(onTakePhoto)}
          >
            <Ionicons name="camera-outline" size={24} color={c.primary} />
            <Text style={[styles.modalOptionText, { color: c.text, fontSize: fs(15) }]}>
              {labels.add_photo_camera}
            </Text>
          </TouchableOpacity>
        )}
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
          style={[styles.modalCancelButton, { backgroundColor: c.background, borderColor: c.border, borderWidth: 1 }]}
          onPress={() => setSourceModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel={labels.cal_cancel}
        >
          <Text style={[styles.modalCancelText, { color: c.text, fontSize: fs(14) }]}>
            {labels.cal_cancel}
          </Text>
        </TouchableOpacity>
      </ModalShell>

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.photo_delete_title}
        message={labels.photo_delete_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
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
    borderRadius: CARD_BORDER_RADIUS,
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
    borderRadius: BUTTON_BORDER_RADIUS,
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
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: CONTROL_BORDER_RADIUS,
    marginBottom: 8,
    gap: 12,
  },
  modalOptionText: {
    fontWeight: '500',
  },
  modalCancelButton: {
    padding: 12,
    borderRadius: CONTROL_BORDER_RADIUS,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  modalCancelText: {
    fontWeight: '600',
  },
});
