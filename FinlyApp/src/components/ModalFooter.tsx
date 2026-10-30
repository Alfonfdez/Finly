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

interface FooterButtonProps {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  numberOfLines?: number;
}

function FooterButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  backgroundColor,
  textColor,
  fontSize,
  style,
  borderColor,
  numberOfLines,
}: FooterButtonProps) {
  return (
    <TouchableOpacity
      style={[style, { backgroundColor }, borderColor != null && { borderColor }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: loading }}
    >
      <View style={styles.confirmContent}>
        {loading ? <ActivityIndicator size="small" color={textColor} /> : null}
        <Text numberOfLines={numberOfLines} style={[styles.buttonText, { color: textColor, fontSize }]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
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

  if (layout === FOOTER_LAYOUTS.single) {
    return (
      <View style={[styles.column, { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom }]}>
        <FooterButton
          label={confirmLabel}
          onPress={onConfirm}
          disabled={confirmInactive}
          loading={confirmLoading}
          backgroundColor={confirmBg}
          textColor={confirmFg}
          fontSize={fs(textSize)}
          style={[
            styles.button,
            styles.stretchButton,
            { paddingVertical: verticalPadding, minHeight },
          ]}
        />
      </View>
    );
  }

  if (layout === FOOTER_LAYOUTS.stacked) {
    return (
      <View style={[styles.column, { paddingHorizontal: horizontalInset, paddingBottom: containerPaddingBottom }]}>
        <View style={styles.actionRow}>
          <FooterButton
            label={moveLabel ?? ''}
            onPress={onMove}
            backgroundColor={c.primary}
            textColor={c.background}
            fontSize={fs(textSize)}
            style={styles.stackedButton}
            numberOfLines={2}
          />
          <FooterButton
            label={confirmLabel}
            onPress={onConfirm}
            disabled={confirmInactive}
            loading={confirmLoading}
            backgroundColor={confirmBg}
            textColor={confirmFg}
            fontSize={fs(textSize)}
            style={styles.stackedButton}
            numberOfLines={2}
          />
        </View>
        {cancelLabel && onCancel ? (
          <FooterButton
            label={cancelLabel}
            onPress={onCancel}
            disabled={cancelDisabled}
            backgroundColor={c.background}
            textColor={c.text}
            fontSize={fs(textSize)}
            style={[styles.stackedButton, styles.stackedCancel]}
            borderColor={c.border}
            numberOfLines={2}
          />
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
          <FooterButton
            label={cancelLabel}
            onPress={onCancel}
            disabled={cancelDisabled}
            backgroundColor={c.background}
            textColor={c.text}
            fontSize={fs(textSize)}
            style={[
              styles.button,
              styles.compactButton,
              { paddingVertical: verticalPadding, minHeight },
            ]}
            borderColor={c.border}
            numberOfLines={1}
          />
        ) : null}
        <FooterButton
          label={confirmLabel}
          onPress={onConfirm}
          disabled={confirmInactive}
          loading={confirmLoading}
          backgroundColor={confirmBg}
          textColor={confirmFg}
          fontSize={fs(textSize)}
          style={[
            styles.button,
            styles.compactButton,
            { paddingVertical: verticalPadding, minHeight },
          ]}
          numberOfLines={1}
        />
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
        <FooterButton
          label={cancelLabel}
          onPress={onCancel}
          disabled={cancelDisabled}
          backgroundColor={c.background}
          textColor={c.text}
          fontSize={fs(textSize)}
          style={[
            styles.button,
            styles.stretchButton,
            { paddingVertical: verticalPadding, minHeight },
          ]}
          borderColor={c.border}
        />
      ) : null}
      <FooterButton
        label={confirmLabel}
        onPress={onConfirm}
        disabled={confirmInactive}
        loading={confirmLoading}
        backgroundColor={confirmBg}
        textColor={confirmFg}
        fontSize={fs(textSize)}
        style={[
          styles.button,
          styles.stretchButton,
          { paddingVertical: verticalPadding, minHeight },
        ]}
      />
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
