import { Platform, ViewStyle } from 'react-native';
import { colores } from './colors';

export const scrollbarFlatList: ViewStyle = Platform.select({
  web: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${colores.primario}40 ${colores.fondoAlto}`,
  } as ViewStyle,
  default: {},
}) ?? {};
