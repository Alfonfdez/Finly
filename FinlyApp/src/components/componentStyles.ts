import { Platform } from 'react-native';

export const OVERLAY_BG = 'rgba(0,0,0,0.6)';
export const MODAL_BORDER_RADIUS = 16;
export const BUTTON_BORDER_RADIUS = 10;
export const CONTROL_BORDER_RADIUS = 8;
export const CARD_BORDER_RADIUS = 12;
export const PILL_RADIUS = 999;
export const HEADER_BUTTONS = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 8,
  paddingRight: Platform.OS === 'web' ? 16 : 0,
};
