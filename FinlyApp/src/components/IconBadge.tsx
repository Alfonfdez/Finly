import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';
import type { IconName } from './IconGrid';
import { BADGE_SHAPES, type BadgeShape } from '../constants/types';
import { withAlpha } from '../utils/color';

interface Props {
  icon: string;
  color: string;
  shape: BadgeShape;
  size: number;
  iconSize: number;
  roundedRadius?: number;
  backgroundAlpha?: number;
  style?: StyleProp<ViewStyle>;
}

export function iconRadius(
  size: number,
  shape: BadgeShape,
  roundedRadius = Math.max(4, Math.round(size / 4))
): number {
  return shape === BADGE_SHAPES.circle ? size / 2 : roundedRadius;
}

export default function IconBadge({
  icon,
  color,
  shape,
  size,
  iconSize,
  roundedRadius,
  backgroundAlpha = 19,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.badge,
        style,
        {
          width: size,
          height: size,
          backgroundColor: withAlpha(color, backgroundAlpha),
          borderRadius: iconRadius(size, shape, roundedRadius),
        },
      ]}
    >
      <Ionicons name={icon as IconName} size={iconSize} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
