import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { CategoryWithTotal, MAX_VISIBLE_TAGS } from '../constants/types';
import { formatCurrency } from '../utils/formatters';
import { badgeShapeFor } from '../utils/badgeShape';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import IconBadge from './IconBadge';

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

export default function CategoryList({
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
            <View
              key={tag.tag_id}
              style={[styles.tagChip, { backgroundColor: c.surface }]}
            >
              <Text style={[styles.tagChipText, { color: c.textSecondary, fontSize: fs(11) }]}>
                {tag.name}
              </Text>
            </View>
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
        <TouchableOpacity
          style={styles.item}
          onPress={() => onPress?.(item)}
          accessibilityLabel={`${labels.a11y_category} ${displayName}, ${item.percentage.toFixed(1)}%`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconBadge
            icon={item.icon}
            color={item.color}
            shape={badgeShapeFor(config, 'category')}
            size={40}
            iconSize={20}
            roundedRadius={12}
            backgroundAlpha={19}
            style={styles.icon}
          />
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.text, fontSize: fs(14) }]}>{displayName}</Text>
            <View style={[styles.barBackground, { backgroundColor: c.surface }]}>
              <View style={[styles.barFill, { width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.color }]} />
            </View>
          </View>
          <View style={styles.amounts}>
            <Text style={[styles.total, { color: c.text, fontSize: fs(14) }]}>{formatCurrency(item.total, config.currency, config.decimalSeparator)}</Text>
            <Text style={[styles.percentage, { color: c.textSecondary, fontSize: fs(12) }]}>{item.percentage.toFixed(1)}%</Text>
          </View>
        </TouchableOpacity>
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  info: { flex: 1, marginRight: 12 },
  name: { fontWeight: '500', marginBottom: 6 },
  barBackground: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  amounts: { alignItems: 'flex-end' },
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
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagChipText: {
    fontWeight: '500',
  },
  viewAll: {
    marginTop: 6,
    fontWeight: '500',
  },
});
