import { View, Text, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { BUTTON_BORDER_RADIUS } from './componentStyles';
import { WHITE } from '../constants/themes';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
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
  const { height: windowHeight } = useWindowDimensions();
  const hasMove = !!moveLabel && !!onMove;

  const headerBudget = Math.round(fs(16) * 1.6) * 3 + 12 + 8;
  const footerHeight = hasMove ? 56 + 12 + 56 : 56;
  const footerClearance = footerHeight + 12;
  const scrollMaxHeight = Math.max(
    0,
    Math.round(windowHeight * 0.7) - 24 - headerBudget - 4,
  );

  return (
    <ModalShell visible={visible} onClose={onCancel}>
      <ModalHeader title={title} size={16} />
      <ScrollView
        style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: footerClearance }]}
        showsVerticalScrollIndicator={false}
      >
        {message && (
          <Text style={[styles.message, { color: c.textSecondary, fontSize: fs(14) }]}>{message}</Text>
        )}
        {children}
      </ScrollView>
      <View style={[styles.buttons, hasMove && styles.buttonsStacked, styles.buttonsFooter]}>
        {cancelLabel && !hasMove ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: c.background, borderColor: c.border }]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={[styles.buttonText, { color: c.text, fontSize: fs(14) }]}>{cancelLabel}</Text>
          </TouchableOpacity>
        ) : null}
        {hasMove ? (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.stackedButton, { backgroundColor: c.primary }]}
              onPress={onMove}
              accessibilityRole="button"
              accessibilityLabel={moveLabel}
            >
              <Text numberOfLines={2} style={[styles.buttonText, { color: c.background, fontSize: fs(14) }]}>{moveLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.stackedButton, { backgroundColor: destructive ? c.red : c.primary }]}
              onPress={onConfirm}
              disabled={confirmDisabled}
            >
              <Text
                numberOfLines={2}
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
        )}
        {hasMove && cancelLabel ? (
          <TouchableOpacity
            style={[styles.button, styles.stackedButton, { alignSelf: 'stretch' }, { backgroundColor: c.background, borderColor: c.border }]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={[styles.buttonText, { color: c.text, fontSize: fs(14) }]}>{cancelLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  message: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 0,
  },
  buttonsFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  buttonsStacked: {
    flexDirection: 'column',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    height: 56,
  },
  stackedButton: {
    height: 56,
    minHeight: 56,
    paddingVertical: 0,
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
