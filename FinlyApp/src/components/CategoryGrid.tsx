import { useCallback, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Category } from '../database/types';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import { BADGE_SHAPES } from '../constants/types';
import { badgeShapeFor } from '../utils/badgeShape';
import CategoryTile from './CategoryTile';

interface Props {
  categories: Category[];
  selectedCategory: number | null;
  selectedIds?: ReadonlySet<number>;
  onSelect: (id: number) => void;
  onAddMore: () => void;
  showAddMore?: boolean;
  addMoreLabel?: string;
  hideTitle?: boolean;
}

function CategoryGridInner({ categories, selectedCategory, onSelect, onAddMore, showAddMore = true, addMoreLabel, hideTitle = false, selectedIds }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const renderCategory = useCallback((cat: Category) => {
    const categoryName = getDisplayCategoryName(cat);
    const multiSelected = selectedIds?.has(cat.id) ?? false;

    return (
      <CategoryTile
        key={cat.id}
        icon={cat.icon}
        color={cat.color}
        shape={badgeShapeFor(config, 'category')}
        label={categoryName}
        selected={selectedIds ? multiSelected : cat.id === selectedCategory}
        checkmark={!!selectedIds}
        onPress={() => onSelect(cat.id)}
        accessibilityLabel={`${labels.a11y_category} ${categoryName}`}
      />
    );
  }, [config, selectedCategory, onSelect, labels, selectedIds]);

  const label = addMoreLabel ?? labels.add_more;

  const renderAddMore = useCallback(() => (
    <CategoryTile
      icon="add"
      color={c.textSecondary}
      shape={BADGE_SHAPES.rounded}
      label={label}
      dashed
      onPress={onAddMore}
      accessibilityLabel={label}
    />
  ), [c.textSecondary, label, onAddMore]);

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
    justifyContent: 'center',
    gap: 8,
  },
});

const CategoryGrid = memo(CategoryGridInner);
export default CategoryGrid;
