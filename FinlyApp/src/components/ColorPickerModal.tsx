import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Text, StyleSheet } from 'react-native';
import ColorPicker, { Panel1, HueSlider, OpacitySlider, Preview } from 'reanimated-color-picker';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t } from '../i18n';
import { colors } from '../constants/colors';

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
  const [tempColor, setTempColor] = useState(selectedColor ?? '#22D3EE');

  useEffect(() => {
    if (visible) {
      setTempColor(selectedColor ?? '#22D3EE');
    }
  }, [visible, selectedColor]);

  const handleConfirm = () => {
    onSelect(tempColor);
    onClose();
  };

  const handleChange = ({ hex }: { hex: string }) => {
    setTempColor(hex);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.surface }]}>
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>
              {labels.create_cat_color_picker_title}
            </Text>
          </View>

          <View style={styles.pickerContainer}>
            <ColorPicker
              value={tempColor}
              onChangeJS={handleChange}
              style={styles.picker}
              boundedThumb
            >
              <Panel1 style={styles.panel} />
              <HueSlider style={styles.slider} />
              <OpacitySlider style={styles.slider} />
              <Preview hideInitialColor />
            </ColorPicker>
          </View>

          <View style={[styles.footer, { borderTopColor: c.border }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: c.text, fontSize: fs(14) }]}>
                {labels.create_cat_color_picker_cancel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: c.primary }]}
              onPress={handleConfirm}
            >
              <Text style={[styles.buttonText, { color: colors.white, fontSize: fs(14) }]}>
                {labels.create_cat_color_picker_ok}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    width: '90%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  picker: {
    width: '100%',
    padding: 0,
  },
  panel: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 30,
    borderRadius: 15,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: '600',
  },
});
