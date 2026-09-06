import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { BUTTON_BORDER_RADIUS, ACTION_BUTTON_HEIGHT } from './componentStyles';
import { WHITE } from '../constants/themes';
import { FOOTER_LAYOUTS, type FooterLayout } from '../constants/types';

interface Props {
  cancelLabel?: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  destructive?: boolean;
  layout?: FooterLayout;
  borderTop?: boolean;
  verticalPadding?: number;
  minHeight?: number;
  textSize?: number;
  disabledBg?: string;
  disabledTextColor?: string;
  horizontalInset?: number;
  containerPaddingBottom?: number;
  moveLabel?: string;
  onMove?: () => void;
}

export default function ModalFooter({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled = false,
  destructive = false,
  layout = FOOTER_LAYOUTS.row,
  borderTop = false,
  verticalPadding = 12,
  minHeight,
  textSize = 14,
  disabledBg,
  disabledTextColor,
  horizontalInset = 0,
  containerPaddingBottom = 0,
  moveLabel,
  onMove,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const confirmBg = destructive
    ? c.red
    : confirmDisabled
      ? (disabledBg ?? c.surface)
      : c.primary;
  const confirmFg = destructive
    ? WHITE
    : confirmDisabled
      ? (disabledTextColor ?? c.textSecondary)
      : c.background;
  const buttonTextStyle = { fontSize: fs(textSize) };

  if (layout === FOOTER_LAYOUTS.single) {
    return (
      <View style={[styles.column, { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: confirmBg, paddingVertical: verticalPadding, minHeight },
          ]}
          onPress={onConfirm}
          disabled={confirmDisabled}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
        >
          <Text style={[styles.buttonText, { color: confirmFg }, buttonTextStyle]}>{confirmLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (layout === FOOTER_LAYOUTS.stacked) {
    return (
      <View style={[styles.column, { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom }]}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.stackedButton, { backgroundColor: c.primary }]}
            onPress={onMove}
            accessibilityRole="button"
            accessibilityLabel={moveLabel}
          >
            <Text numberOfLines={2} style={[styles.buttonText, { color: c.background }, buttonTextStyle]}>
              {moveLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stackedButton, { backgroundColor: confirmBg }]}
            onPress={onConfirm}
            disabled={confirmDisabled}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
          >
            <Text numberOfLines={2} style={[styles.buttonText, { color: confirmFg }, buttonTextStyle]}>
              {confirmLabel}
            </Text>
          </TouchableOpacity>
        </View>
        {cancelLabel && onCancel ? (
          <TouchableOpacity
            style={[
              styles.stackedButton,
              styles.stackedCancel,
              { backgroundColor: c.background, borderColor: c.border },
            ]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text style={[styles.buttonText, { color: c.text }, buttonTextStyle]} numberOfLines={2}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  return (
<View
        style={[
          styles.row,
          borderTop && styles.borderTop,
          borderTop && { borderTopColor: c.border },
          { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom },
        ]}
      >
      {cancelLabel && onCancel ? (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: c.background, borderColor: c.border, paddingVertical: verticalPadding, minHeight }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        >
          <Text style={[styles.buttonText, { color: c.text, fontSize: fs(textSize) }]}>{cancelLabel}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: confirmBg, paddingVertical: verticalPadding, minHeight },
        ]}
        onPress={onConfirm}
        disabled={confirmDisabled}
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
      >
        <Text
          style={[
            styles.buttonText,
            { color: confirmFg, fontSize: fs(textSize) },
          ]}
        >
          {confirmLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  column: {
    gap: 12,
  },
  borderTop: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 0,
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
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    height: ACTION_BUTTON_HEIGHT,
  },
  stackedButton: {
    flex: 1,
    height: ACTION_BUTTON_HEIGHT,
    minHeight: ACTION_BUTTON_HEIGHT,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stackedCancel: {
    alignSelf: 'stretch',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});