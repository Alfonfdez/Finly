import { StyleSheet } from 'react-native';

export const OVERLAY_BG = 'rgba(0,0,0,0.6)';
export const MODAL_MAX_WIDTH = 360;
export const MODAL_BORDER_RADIUS = 16;
export const MODAL_PADDING = 24;
export const BUTTON_BORDER_RADIUS = 10;

export const componentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OVERLAY_BG,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 32,
  },
  modal: {
    width: '100%' as const,
    maxWidth: MODAL_MAX_WIDTH,
    borderRadius: MODAL_BORDER_RADIUS,
    padding: MODAL_PADDING,
  },
  buttons: {
    flexDirection: 'row' as const,
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center' as const,
  },
  buttonText: {
    fontWeight: '600' as const,
  },
});
