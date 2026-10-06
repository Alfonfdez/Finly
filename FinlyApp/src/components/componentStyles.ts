import { isWeb } from '../utils/platform';
import { withAlpha } from '../utils/color';
import type { ColorPalette } from '../constants/themes';

export const PRESSED_OPACITY = 0.7;
export const OVERLAY_BG = 'rgba(0,0,0,0.6)';
export const MODAL_BORDER_RADIUS = 16;
export const BUTTON_BORDER_RADIUS = 10;
export const CONTROL_BORDER_RADIUS = 8;
export const ACTION_BUTTON_HEIGHT = 56;
export const CARD_BORDER_RADIUS = 12;
export const PILL_RADIUS = 999;
export const CLEAR_ICON_SIZE = 20;
export const MODAL_CLOSE_ICON_SIZE = 24;
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
export const SECTION_GAP = 16;
export const SECTION_GAP_SM = 8;
export const SECTION_TITLE_STYLE = {
  fontWeight: '600' as const,
};

/** Standard colors for every RN `Switch` (dark + light), from theme tokens.
 *  `activeTrackColor`/`activeThumbColor` are react-native-web's ON-state props
 *  (harmless on native, where `thumbColor` already covers both states). */
export function switchColors(c: ColorPalette) {
  return {
    trackColor: { false: c.switchTrackOff, true: c.primary },
    thumbColor: c.switchThumb,
    ios_backgroundColor: c.switchTrackOff,
    activeTrackColor: c.primary,
    activeThumbColor: c.switchThumb,
  };
}

/** Primary-tinted card colors (background + border) shared by the recurring
 *  repeat-options, scope and notice cards so they stay visually in sync. */
export function recurringCardColors(c: ColorPalette) {
  return {
    backgroundColor: withAlpha(c.primary, 10),
    borderColor: withAlpha(c.primary, 30),
  };
}
