import { View, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WHITE } from '../constants/themes';
import { t } from '../i18n';

export default function PhotoViewer({
  photos, visible, selectedIndex, onClose,
}: {
  photos: string[];
  visible: boolean;
  selectedIndex: number;
  onClose: () => void;
}) {
  const labels = t();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.viewerOverlay}>
        <TouchableOpacity style={styles.viewerClose} onPress={onClose} accessibilityLabel={labels.common_close}>
          <Ionicons name="close" size={28} color={WHITE} />
        </TouchableOpacity>
        {photos.length > 0 && (
          <Image source={{ uri: photos[selectedIndex] ?? photos[0] }} resizeMode="contain" style={styles.viewerImage} />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 1,
    padding: 8,
  },
  viewerImage: {
    width: '90%',
    height: '80%',
  },
});
