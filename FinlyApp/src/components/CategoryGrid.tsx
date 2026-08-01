import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Category } from '../database/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import { BADGE_SHAPES, CONFIG_ICON_SHAPES } from '../constants/types';
import { withAlpha } from '../utils/color';
import IconBadge from './IconBadge';
import { PILL_RADIUS } from './componentStyles';

interface Props {
  categories: Category[];
  selectedCategory: number | null;
  onSelect: (id: number) => void;
  onAddMore: () => void;
  showAddMore?: boolean;
  addMoreLabel?: string;
  hideTitle?: boolean;
}

export default function CategoryGrid({ categories, selectedCategory, onSelect, onAddMore, showAddMore = true, addMoreLabel, hideTitle = false }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const round = config.categoryIconShape === CONFIG_ICON_SHAPES.circle;

  const renderCategory = (cat: Category) => {
    const isSelected = cat.id === selectedCategory;
    const categoryName = getDisplayCategoryName(cat);

    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.item,
          { backgroundColor: isSelected ? withAlpha(cat.color, 20) : c.surface, borderRadius: round ? PILL_RADIUS : 12 },
          isSelected && { borderWidth: 2, borderColor: cat.color },
        ]}
        onPress={() => onSelect(cat.id)}
        accessibilityLabel={`${labels.a11y_category} ${categoryName}`}
      >
        <IconBadge
          icon={cat.icon}
          color={cat.color}
          shape={round ? BADGE_SHAPES.circle : BADGE_SHAPES.rounded}
          size={40}
          iconSize={24}
          roundedRadius={20}
          backgroundAlpha={13}
          style={styles.iconContainer}
        />
        <Text
          style={[styles.name, { color: c.text, fontSize: fs(11) }]}
          numberOfLines={1}
        >
          {categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  const label = addMoreLabel ?? labels.add_more;

  const renderAddMore = () => (
    <TouchableOpacity
      style={[styles.item, styles.addMoreItem, { borderColor: c.border, borderRadius: round ? PILL_RADIUS : 12 }]}
      onPress={onAddMore}
      accessibilityLabel={label}
    >
      <IconBadge
        icon="add"
        color={c.textSecondary}
        shape={BADGE_SHAPES.rounded}
        size={40}
        iconSize={24}
        roundedRadius={20}
        backgroundAlpha={13}
        style={styles.iconContainer}
      />
      <Text
        style={[styles.name, { color: c.textSecondary, fontSize: fs(11) }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!hideTitle && (
        <Text style={[styles.title, { color: c.text, fontSize: fs(15) }]}>
          {labels.add_categories}
        </Text>
      )}
      <View style={styles.grid}>
        {categories.map((cat) => renderCategory(cat))}
        {showAddMore && renderAddMore()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  addMoreItem: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginBottom: 4,
  },
  name: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
