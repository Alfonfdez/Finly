import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import {
  BUTTON_BORDER_RADIUS,
  ACTION_BUTTON_HEIGHT,
  COMPACT_FOOTER_BUTTON_WIDTH,
  COMPACT_FOOTER_BUTTON_MAX_WIDTH,
} from './componentStyles';
import { WHITE } from '../constants/themes';
import { FOOTER_LAYOUTS, type FooterLayout } from '../constants/types';

interface Props {
  cancelLabel?: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  /** The action is running: show a spinner and block a second press. */
  confirmLoading?: boolean;
  /** Block cancelling while the action is in flight. */
  cancelDisabled?: boolean;
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
  containerStyle?: StyleProp<ViewStyle>;
  moveLabel?: string;
  onMove?: () => void;
}

export default function ModalFooter({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  cancelDisabled = false,
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
  containerStyle,
  moveLabel,
  onMove,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const confirmInactive = confirmDisabled || confirmLoading;
  const confirmBg = confirmInactive
    ? (disabledBg ?? c.surface)
    : destructive
      ? c.red
      : c.primary;
  const confirmFg = confirmInactive
    ? (disabledTextColor ?? c.textSecondary)
    : destructive
      ? WHITE
      : c.background;
  const buttonTextStyle = { fontSize: fs(textSize) };

  if (layout === FOOTER_LAYOUTS.single) {
    return (
      <View style={[styles.column, { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom }]}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.stretchButton,
            { backgroundColor: confirmBg, paddingVertical: verticalPadding, minHeight },
          ]}
          onPress={onConfirm}
          disabled={confirmInactive}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          accessibilityState={{ disabled: confirmInactive, busy: confirmLoading }}
        >
          <View style={styles.confirmContent}>
            {confirmLoading ? <ActivityIndicator size="small" color={confirmFg} /> : null}
            <Text style={[styles.buttonText, { color: confirmFg }, buttonTextStyle]}>{confirmLabel}</Text>
          </View>
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
            disabled={confirmInactive}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            accessibilityState={{ disabled: confirmInactive, busy: confirmLoading }}
          >
            <View style={styles.confirmContent}>
              {confirmLoading ? <ActivityIndicator size="small" color={confirmFg} /> : null}
              <Text numberOfLines={2} style={[styles.buttonText, { color: confirmFg }, buttonTextStyle]}>
                {confirmLabel}
              </Text>
            </View>
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
            disabled={cancelDisabled}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            accessibilityState={{ disabled: cancelDisabled }}
          >
            <Text style={[styles.buttonText, { color: c.text }, buttonTextStyle]} numberOfLines={2}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  if (layout === FOOTER_LAYOUTS.compact) {
    return (
      <View
        style={[
          styles.compactRow,
          borderTop && styles.borderTop,
          borderTop && { borderTopColor: c.border },
          { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom },
          containerStyle,
        ]}
      >
        {cancelLabel && onCancel ? (
          <TouchableOpacity
            style={[
              styles.button,
              styles.compactButton,
              { backgroundColor: c.background, borderColor: c.border, paddingVertical: verticalPadding, minHeight },
            ]}
            onPress={onCancel}
            disabled={cancelDisabled}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            accessibilityState={{ disabled: cancelDisabled }}
          >
            <Text numberOfLines={1} style={[styles.buttonText, { color: c.text, fontSize: fs(textSize) }]}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[
            styles.button,
            styles.compactButton,
            { backgroundColor: confirmBg, paddingVertical: verticalPadding, minHeight },
          ]}
          onPress={onConfirm}
          disabled={confirmInactive}
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          accessibilityState={{ disabled: confirmInactive, busy: confirmLoading }}
        >
          <View style={styles.confirmContent}>
            {confirmLoading ? <ActivityIndicator size="small" color={confirmFg} /> : null}
            <Text numberOfLines={1} style={[styles.buttonText, { color: confirmFg, fontSize: fs(textSize) }]}>
              {confirmLabel}
            </Text>
          </View>
        </TouchableOpacity>
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
          style={[styles.button, styles.stretchButton, { backgroundColor: c.background, borderColor: c.border, paddingVertical: verticalPadding, minHeight }]}
          onPress={onCancel}
          disabled={cancelDisabled}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          accessibilityState={{ disabled: cancelDisabled }}
        >
          <Text style={[styles.buttonText, { color: c.text, fontSize: fs(textSize) }]}>{cancelLabel}</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[
          styles.button,
          styles.stretchButton,
          { backgroundColor: confirmBg, paddingVertical: verticalPadding, minHeight },
        ]}
        onPress={onConfirm}
        disabled={confirmInactive}
        accessibilityRole="button"
        accessibilityLabel={confirmLabel}
        accessibilityState={{ disabled: confirmInactive, busy: confirmLoading }}
      >
        <View style={styles.confirmContent}>
          {confirmLoading ? <ActivityIndicator size="small" color={confirmFg} /> : null}
          <Text
            style={[
              styles.buttonText,
              { color: confirmFg, fontSize: fs(textSize) },
            ]}
          >
            {confirmLabel}
          </Text>
        </View>
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
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stretchButton: {
    flex: 1,
  },
  compactButton: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: COMPACT_FOOTER_BUTTON_WIDTH,
    maxWidth: COMPACT_FOOTER_BUTTON_MAX_WIDTH,
    paddingHorizontal: 0,
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
  confirmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
