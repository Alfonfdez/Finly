import type { ViewStyle } from 'react-native';

export const HEADER_ACTION_WIDTH = 44;
export const HEADER_SPACER_WIDTH = 56;
export const HEADER_SPACER_STYLE: ViewStyle = {
  width: HEADER_SPACER_WIDTH,
  height: HEADER_ACTION_WIDTH,
};
export const LIST_BOTTOM_FAB_PADDING: ViewStyle = { paddingBottom: 80 };

/** Gap between a list's header (or its select-all row) and the first item. The
 *  lists whose rows carry their own padding don't need it. */
export const LIST_TOP_GAP: ViewStyle = { paddingTop: 16 };
