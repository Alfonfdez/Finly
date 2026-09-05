import { useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { type CategoryWithTotal, MAX_VISIBLE_TAGS } from '../constants/types';
import { UNTAGGED_ID } from '../database/helpers';
import { formatAmount } from '../utils/formatters';
import { badgeShapeFor } from '../utils/badgeShape';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import ListItemRow from './ListItemRow';
import TagChip from './TagChip';

interface TagBreakdown {
  tag_id: number;
  name: string;
  total: number;
}

interface Props {
  categories: CategoryWithTotal[];
  onPress?: (category: CategoryWithTotal) => void;
  tagBreakdowns?: Map<number, TagBreakdown[]>;
  expandedCategoryIds?: Set<number>;
  onToggleExpand?: (id: number) => void;
}

function CategoryListInner({
  categories, onPress,
  tagBreakdowns, expandedCategoryIds, onToggleExpand,
}: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const renderTagChips = useCallback((categoryId: number) => {
    if (!tagBreakdowns || !expandedCategoryIds || !onToggleExpand) return null;
    const tags = tagBreakdowns.get(categoryId);
    if (!tags || tags.length === 0) return null;

    const isExpanded = expandedCategoryIds.has(categoryId);
    const visibleTags = isExpanded ? tags : tags.slice(0, MAX_VISIBLE_TAGS);
    const hasMore = tags.length > MAX_VISIBLE_TAGS;

    return (
      <View style={styles.tagSection}>
        <View style={styles.tagChips}>
          {visibleTags.map((tag) => (
            <TagChip
              key={tag.tag_id}
              label={tag.tag_id === UNTAGGED_ID ? labels.home_tag_untagged : tag.name}
              variant="neutral"
            />
          ))}
        </View>
        {hasMore && (
          <TouchableOpacity onPress={() => onToggleExpand(categoryId)}>
            <Text style={[styles.viewAll, { color: c.primary, fontSize: fs(11) }]}>
              {isExpanded ? labels.home_tag_show_less : labels.home_tag_view_all(tags.length)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [tagBreakdowns, expandedCategoryIds, onToggleExpand, c, fs, labels]);

  const keyExtractor = useCallback((item: CategoryWithTotal) => item.id.toString(), []);

  const renderItem = useCallback(({ item }: { item: CategoryWithTotal }) => {
    const displayName = getDisplayCategoryName(item);
    return (
      <View style={[styles.itemWrapper, { borderBottomColor: c.border }]}>
        <ListItemRow
          title={displayName}
          icon={item.icon}
          color={item.color}
          shape={badgeShapeFor(config, 'category')}
          badgeSize={40}
          badgeIconSize={20}
          badgeRadius={12}
          middle={
            <View style={[styles.barBackground, { backgroundColor: c.surface }]}>
              <View style={[styles.barFill, { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }]} />
            </View>
          }
          right={
            <View style={styles.amounts}>
              <Text style={[styles.total, { color: c.text, fontSize: fs(14) }]}>{formatAmount(item.total, config)}</Text>
              <Text style={[styles.percentage, { color: c.textSecondary, fontSize: fs(12) }]}>{item.percentage.toFixed(1)}%</Text>
            </View>
          }
          onPress={() => onPress?.(item)}
          accessibilityLabel={`${labels.a11y_category} ${displayName}, ${item.percentage.toFixed(1)}%`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        />
        {renderTagChips(item.id)}
      </View>
    );
  }, [c, labels, fs, config, onPress, renderTagChips]);

  return (
    <FlatList
      data={categories}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
}

const styles = StyleSheet.create({
  itemWrapper: {
    borderBottomWidth: 1,
  },
  barBackground: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  barFill: { height: '100%', borderRadius: 2 },
  amounts: { alignItems: 'flex-end', marginLeft: 12 },
  total: { fontWeight: '600' },
  percentage: { marginTop: 2 },
  tagSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tagChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  viewAll: {
    marginTop: 6,
    fontWeight: '500',
  },
});

const CategoryList = memo(CategoryListInner);
export default CategoryList;
