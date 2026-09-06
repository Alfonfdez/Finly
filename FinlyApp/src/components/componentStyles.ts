import { isWeb } from '../utils/platform';

export const OVERLAY_BG = 'rgba(0,0,0,0.6)';
export const MODAL_BORDER_RADIUS = 16;
export const BUTTON_BORDER_RADIUS = 10;
export const CONTROL_BORDER_RADIUS = 8;
export const CARD_BORDER_RADIUS = 12;
export const PILL_RADIUS = 999;
export const LIMIT_TEXT_STYLE = {
  fontWeight: '500' as const,
  textAlign: 'center' as const,
  marginTop: 16,
  paddingHorizontal: 16,
};
export const COUNTER_STYLE = {
  fontWeight: '500' as const,
  textAlign: 'center' as const,
  paddingTop: 12,
};
export const HEADER_BUTTONS = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 8,
  paddingRight: isWeb ? 16 : 0,
};
