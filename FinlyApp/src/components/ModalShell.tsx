import { type ReactNode, useEffect } from 'react';
import { Keyboard, Modal, View, StyleSheet, useWindowDimensions, type DimensionValue } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { useKeyboardLift } from '../hooks/useKeyboardInset';
import { isWeb } from '../utils/platform';
import { OVERLAY_BG, MODAL_BORDER_RADIUS } from './componentStyles';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  padding?: number;
  overlayPadding?: number;
  maxHeight?: DimensionValue;
  backgroundColor?: string;
  shadow?: boolean;
}

export default function ModalShell({
  visible,
  onClose,
  children,
  maxWidth = 360,
  padding = 24,
  overlayPadding = 32,
  maxHeight = '70%',
  backgroundColor,
  shadow = false,
}: Props) {
  const { activeColors: c } = useConfig();
  const { height: windowHeight } = useWindowDimensions();
  // A native Modal window does not always resize with the keyboard, so lift the (centred)
  // box above the keyboard ourselves. The lift is *held* while the modal is open: tapping a
  // button blurs the input and hides the keyboard, and letting the box drop then would move
  // the button out from under the finger and swallow the tap (see `useKeyboardLift`).
  const liftedInset = useKeyboardLift(visible);
  // Opening a modal is a context switch: blur the form input first, otherwise its
  // reveal hook can scroll the form behind the modal when the modal's input opens.
  useEffect(() => {
    if (visible) Keyboard.dismiss();
  }, [visible]);
  const boundedMaxHeight =
    typeof maxHeight === 'number'
      ? maxHeight
      : Math.round(windowHeight * (parseFloat(String(maxHeight)) / 100));
  const availableHeight = Math.max(0, windowHeight - liftedInset - overlayPadding * 2);
  const effectiveMaxHeight = liftedInset > 0
    ? Math.min(boundedMaxHeight, availableHeight)
    : boundedMaxHeight;
  const shadowStyle = isWeb
    ? { boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }
    : { elevation: 10 };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { padding: overlayPadding, paddingBottom: overlayPadding + liftedInset }]}>
        <View
          style={[
            styles.modal,
            { backgroundColor: backgroundColor ?? c.surface, maxWidth, padding, maxHeight: effectiveMaxHeight },
            shadow && shadowStyle,
          ]}
        >
          {children}
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
  },
  modal: {
    width: '100%',
    borderRadius: MODAL_BORDER_RADIUS,
  },
});
