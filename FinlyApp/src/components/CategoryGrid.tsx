import { ComponentProps } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../database/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';

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
  const round = config.categoryIconShape === 'circle';

  const renderCategory = (cat: Category) => {
    const isSelected = cat.id === selectedCategory;
    const categoryName = getDisplayCategoryName(cat);

    return (
      <TouchableOpacity
        key={cat.id}
        style={[
          styles.item,
          { backgroundColor: isSelected ? cat.color + '33' : c.surface, borderRadius: round ? 999 : 12 },
          isSelected && { borderWidth: 2, borderColor: cat.color },
        ]}
        onPress={() => onSelect(cat.id)}
        accessibilityLabel={`${labels.a11y_category} ${categoryName}`}
      >
        <View style={[styles.iconContainer, { backgroundColor: cat.color + '22', borderRadius: round ? 999 : 20 }]}>
          <Ionicons name={cat.icon as ComponentProps<typeof Ionicons>['name']} size={24} color={cat.color} />
        </View>
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
      style={[styles.item, styles.addMoreItem, { borderColor: c.border, borderRadius: round ? 999 : 12 }]}
      onPress={onAddMore}
      accessibilityLabel={label}
    >
      <View style={[styles.iconContainer, { backgroundColor: c.textSecondary + '22', borderRadius: round ? 999 : 20 }]}>
        <Ionicons name="add" size={24} color={c.textSecondary} />
      </View>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
