import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { AccessibilityState, StyleProp, ViewStyle } from 'react-native';
import type { BadgeShape } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import IconBadge from './IconBadge';

interface HitSlopLike {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface Props {
  title: string;
  icon?: string;
  color?: string;
  shape?: BadgeShape;
  badgeSize?: number;
  badgeIconSize?: number;
  badgeRadius?: number;
  badgeAlpha?: number;
  titleSize?: number;
  subtitle?: string;
  subtitleSize?: number;
  leading?: ReactNode;
  middle?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  activeOpacity?: number;
  hitSlop?: HitSlopLike;
  divider?: boolean;
  badgeGap?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}

function ListItemRow({
  title,
  icon,
  color,
  shape,
  badgeSize = 36,
  badgeIconSize = 20,
  badgeRadius,
  badgeAlpha,
  titleSize = 14,
  subtitle,
  subtitleSize = 12,
  leading,
  middle,
  right,
  onPress,
  activeOpacity,
  hitSlop,
  divider = false,
  badgeGap = 12,
  style,
  accessibilityLabel,
  accessibilityState,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();

  const content = (
    <>
      {leading != null && <View style={[styles.leading, { marginRight: badgeGap }]}>{leading}</View>}
      {icon && color && shape && (
        <IconBadge
          icon={icon}
          color={color}
          shape={shape}
          size={badgeSize}
          iconSize={badgeIconSize}
          roundedRadius={badgeRadius}
          backgroundAlpha={badgeAlpha}
          style={[styles.leading, { marginRight: badgeGap }]}
        />
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: c.text, fontSize: fs(titleSize) }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: c.textSecondary, fontSize: fs(subtitleSize) }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {middle}
      </View>
      {right != null && <View style={styles.right}>{right}</View>}
    </>
  );

  const rowStyle = [styles.row, divider && { borderBottomWidth: 1, borderBottomColor: c.border }, style];

  if (!onPress) {
    return <View style={rowStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={rowStyle}
      onPress={onPress}
      activeOpacity={activeOpacity}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      {content}
    </TouchableOpacity>
  );
}

export default memo(ListItemRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leading: {
    alignSelf: 'center',
  },
  info: { flex: 1 },
  title: { fontWeight: '500' },
  subtitle: { marginTop: 2 },
  right: {},
});
