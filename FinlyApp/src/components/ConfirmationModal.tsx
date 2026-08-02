import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import { WHITE } from '../constants/themes';
import ModalShell from './ModalShell';

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
  moveLabel?: string;
  onMove?: () => void;
}

export default function ConfirmationModal({
  visible, title, message, confirmLabel, cancelLabel,
  onConfirm, onCancel, confirmDisabled = false, destructive = true, children,
  moveLabel, onMove,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const hasMove = !!moveLabel && !!onMove;

  return (
    <ModalShell visible={visible} onClose={onCancel}>
      <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: c.textSecondary, fontSize: fs(14) }]}>{message}</Text>
      )}
      {children}
      <View style={[styles.buttons, hasMove && styles.buttonsStacked]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: c.text, fontSize: fs(14) }]}>{cancelLabel}</Text>
        </TouchableOpacity>
        {hasMove ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: c.primary }]}
              onPress={onMove}
            >
              <Text style={[styles.buttonText, { color: c.background, fontSize: fs(14) }]}>{moveLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: destructive ? c.red : c.primary }]}
              onPress={onConfirm}
              disabled={confirmDisabled}
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
        ) : (
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
                { color: destructive ? WHITE : (confirmDisabled ? c.textSecondary : c.background), fontSize: fs(14) },
              ]}
            >
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
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
  buttonsStacked: {
    flexDirection: 'column',
  },
  actionRow: {
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
