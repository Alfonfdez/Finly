import { ComponentProps, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const CATEGORY_ICONS: IconName[] = [
  'wallet-outline', 'cart-outline', 'bus-outline', 'home-outline',
  'musical-notes-outline', 'game-controller-outline', 'bag-outline', 'film-outline',
  'restaurant-outline', 'heart-outline', 'fitness-outline', 'school-outline',
  'airplane-outline', 'shirt-outline', 'gift-outline', 'briefcase-outline',
  'code-slash-outline', 'trending-up-outline', 'dice-outline', 'people-outline',
  'cash-outline', 'card-outline', 'pricetag-outline', 'storefront-outline',
  'cafe-outline', 'car-outline', 'bicycle-outline', 'train-outline',
  'key-outline', 'book-outline', 'barbell-outline', 'globe-outline',
  'compass-outline', 'map-outline', 'star-outline', 'notifications-outline',
  'football-outline', 'wine-outline', 'ellipsis-horizontal-outline', 'phone-portrait-outline',
];

const GRID_COLS = 4;
const GRID_GAP = 12;

interface Props {
  icons: readonly IconName[];
  selectedIcon: string | null;
  selectedColor?: string | null;
  shape: 'circle' | 'square';
  onSelect: (icon: string) => void;
}

export default function IconGrid({ icons, selectedIcon, selectedColor = null, shape, onSelect }: Props) {
  const { activeColors: c } = useConfig();
  const [cellSize, setCellSize] = useState(0);
  const round = shape === 'circle';

  const onGridLayout = (e: LayoutChangeEvent) => {
    const gridWidth = e.nativeEvent.layout.width;
    setCellSize(Math.floor((gridWidth - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS));
  };

  return (
    <View style={styles.grid} onLayout={onGridLayout}>
      {cellSize > 0 && icons.map((icon) => {
        const isSelected = selectedIcon === icon;
        const iconColor = isSelected && selectedColor ? selectedColor : (isSelected ? c.primary : c.textSecondary);
        const bgColor = isSelected && selectedColor ? selectedColor + '33' : (isSelected ? c.primary + '33' : c.surface);
        const borderColor = isSelected ? (selectedColor || c.primary) : 'transparent';
        return (
          <TouchableOpacity
            key={icon}
            style={[
              styles.item,
              { width: cellSize, height: cellSize, borderRadius: round ? 999 : 12 },
              { backgroundColor: bgColor },
              isSelected && { borderWidth: 2, borderColor },
            ]}
            onPress={() => onSelect(icon)}
            accessibilityLabel={icon}
            accessibilityState={{ selected: isSelected }}
          >
            <Ionicons name={icon} size={24} color={iconColor} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
