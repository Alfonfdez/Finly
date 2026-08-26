import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import { WHITE } from '../constants/themes';

interface Props {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
}

export default function ModalFooter({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled = false,
  destructive = true,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <View style={styles.buttons}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: c.background, borderColor: c.border }]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={cancelLabel}
      >
        <Text style={[styles.buttonText, { color: c.text, fontSize: fs(14) }]}>{cancelLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: destructive ? c.red : (confirmDisabled ? c.surface : c.primary) },
        ]}
        onPress={onConfirm}
        disabled={confirmDisabled}
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
      >
        <Text
          style={[
            styles.buttonText,
            { color: destructive ? WHITE : (confirmDisabled ? c.textSecondary : c.background), fontSize: fs(14) },
          ]}
        >
          {confirmLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
