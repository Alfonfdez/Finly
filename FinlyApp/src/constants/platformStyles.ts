import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

export const scrollbarFlatList: ViewStyle = Platform.select({
  web: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${colors.primary}40 ${colors.surface}`,
  } as ViewStyle,
  default: {},
}) ?? {};
