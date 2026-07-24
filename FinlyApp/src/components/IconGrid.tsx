import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { colors } from '../constants/colors';

export const CATEGORY_ICONS = [
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

interface Props {
  selectedIcon: string | null;
  onSelect: (icon: string) => void;
}

export default function IconGrid({ selectedIcon, onSelect }: Props) {
  const { activeColors: c, config } = useConfig();
  const round = config.categoryIconShape === 'circle';

  return (
    <View style={styles.grid}>
      {CATEGORY_ICONS.map((icon) => {
        const isSelected = selectedIcon === icon;
        return (
          <TouchableOpacity
            key={icon}
            style={[
              styles.item,
              {
                backgroundColor: isSelected ? c.primary + '33' : '#334155',
                borderRadius: round ? 999 : 12,
              },
              isSelected && { borderWidth: 2, borderColor: c.primary },
            ]}
            onPress={() => onSelect(icon)}
            accessibilityLabel={icon}
            accessibilityState={{ selected: isSelected }}
          >
            <View style={[styles.iconContainer, { backgroundColor: (isSelected ? c.primary : '#334155') + '22' }]}>
              <Ionicons name={icon as any} size={24} color={isSelected ? c.primary : colors.textSecondary} />
            </View>
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
    gap: 8,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
