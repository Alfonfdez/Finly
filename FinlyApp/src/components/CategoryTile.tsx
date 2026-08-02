import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';
import type { BadgeShape } from '../constants/types';
import { BADGE_SHAPES } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { withAlpha } from '../utils/color';
import { TRANSPARENT } from '../constants/themes';
import IconBadge from './IconBadge';
import { PILL_RADIUS } from './componentStyles';

interface Props {
  icon: string;
  color: string;
  shape: BadgeShape;
  label: string;
  selected?: boolean;
  checkmark?: boolean;
  dashed?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CategoryTile({
  icon,
  color,
  shape,
  label,
  selected = false,
  checkmark = false,
  dashed = false,
  onPress,
  accessibilityLabel,
  style,
}: Props) {
  const { activeColors: c } = useConfig();
  const fs = useFontSize();
  const round = shape === BADGE_SHAPES.circle;

  return (
    <TouchableOpacity
      style={[
        styles.item,
        style,
        { borderRadius: round ? PILL_RADIUS : 12 },
        dashed
          ? [styles.dashedItem, { borderColor: c.border }]
          : {
              backgroundColor: selected ? withAlpha(color, 20) : c.surface,
              ...(selected && { borderWidth: 2, borderColor: color }),
            },
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View style={styles.iconWrap}>
        <IconBadge
          icon={icon}
          color={color}
          shape={shape}
          size={40}
          iconSize={24}
          roundedRadius={20}
          backgroundAlpha={13}
        />
        {checkmark && selected && (
          <View style={[styles.checkmark, { backgroundColor: color }]}>
            <Ionicons name="checkmark" size={12} color={c.background} />
          </View>
        )}
      </View>
      <Text
        style={[styles.name, { color: dashed ? c.textSecondary : c.text, fontSize: fs(11) }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  dashedItem: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: TRANSPARENT,
  },
  iconWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  checkmark: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
