import { View, TouchableOpacity, Modal, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';

export const EXTENDED_COLORS = [
  '#22D3EE', '#F87171', '#34D399', '#FBBF24', '#F472B6',
  '#60A5FA', '#A78BFA', '#94A3B8', '#FCD34D', '#6EE7B7',
  '#FB923C', '#E879F9', '#C084FC', '#38BDF8', '#4ADE80',
  '#FB7185', '#FCA5A5', '#86EFAC', '#FDE68A', '#A5B4FC',
];

const COLS = 5;

interface Props {
  visible: boolean;
  selectedColor: string | null;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export default function ColorPickerModal({ visible, selectedColor, onSelect, onClose }: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const handleSelect = (color: string) => {
    onSelect(color);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modal, { backgroundColor: c.surface }]}>
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>
              {labels.create_cat_color_picker_title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.cancel, { color: c.primary, fontSize: fs(14) }]}>
                {labels.create_cat_color_picker_cancel}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {EXTENDED_COLORS.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.circle,
                    { backgroundColor: color },
                    isSelected && { borderWidth: 3, borderColor: c.text },
                  ]}
                  onPress={() => handleSelect(color)}
                  accessibilityLabel={color}
                  accessibilityState={{ selected: isSelected }}
                >
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  cancel: {
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
