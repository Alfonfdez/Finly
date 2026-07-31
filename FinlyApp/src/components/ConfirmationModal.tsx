import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { OVERLAY_BG, MODAL_MAX_WIDTH, MODAL_BORDER_RADIUS, MODAL_PADDING, BUTTON_BORDER_RADIUS } from './componentStyles';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
  children?: ReactNode;
}

export default function ConfirmationModal({
  visible, title, message, confirmLabel, cancelLabel,
  onConfirm, onCancel, confirmDisabled = false, destructive = true, children,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: c.surface }]}>
          <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>{title}</Text>
          {message && (
            <Text style={[styles.message, { color: c.textSecondary, fontSize: fs(14) }]}>{message}</Text>
          )}
          {children}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={onCancel}
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
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: destructive ? '#FFFFFF' : (confirmDisabled ? c.textSecondary : c.background), fontSize: fs(14) },
                ]}
              >
                {confirmLabel}
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
    backgroundColor: OVERLAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    borderRadius: MODAL_BORDER_RADIUS,
    padding: MODAL_PADDING,
  },
  title: {
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});
