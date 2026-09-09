import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import type { ReactNode } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { ACTION_BUTTON_HEIGHT } from './componentStyles';
import ModalShell from './ModalShell';
import ModalHeader from './ModalHeader';
import ModalFooter from './ModalFooter';
import { FOOTER_LAYOUTS } from '../constants/types';

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
  const footerHeight = hasMove
    ? ACTION_BUTTON_HEIGHT + 12 + ACTION_BUTTON_HEIGHT
    : ACTION_BUTTON_HEIGHT;
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
      <View style={styles.buttonsFooter}>
        <ModalFooter
          layout={
            hasMove
              ? FOOTER_LAYOUTS.stacked
              : cancelLabel
                ? FOOTER_LAYOUTS.row
                : FOOTER_LAYOUTS.single
          }
          cancelLabel={cancelLabel}
          confirmLabel={confirmLabel}
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmDisabled={confirmDisabled}
          destructive={destructive}
          moveLabel={moveLabel}
          onMove={onMove}
        />
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
  buttonsFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
