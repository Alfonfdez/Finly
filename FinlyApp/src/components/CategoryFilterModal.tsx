import { useState, useMemo, useCallback, useEffect, ComponentProps } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import SearchBar from './SearchBar';
import { TransactionType } from '../constants/types';
import { sortCategoriesWithOthersLast } from '../utils/categoryUtils';
import { Category } from '../database/types';

interface Props {
  visible: boolean;
  categories: Category[];
  selectedIds: number[];
  type: 'all' | TransactionType;
  onApply: (ids: number[]) => void;
  onClose: () => void;
}

export default function CategoryFilterModal({ visible, categories, selectedIds, type, onApply, onClose }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const round = config.categoryIconShape === 'circle';

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(selectedIds);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (visible) {
      setLocalSelectedIds(selectedIds);
      setSearchText('');
    }
  }, [visible, selectedIds]);

  const allCategoryIds = useMemo(() => categories.map(cat => cat.id), [categories]);
  const visibleCategoryIds = useMemo(() => {
    if (type === 'all') return allCategoryIds;
    return categories.filter(cat => cat.type === type).map(cat => cat.id);
  }, [categories, type, allCategoryIds]);
  const allSelected = visibleCategoryIds.length > 0 && visibleCategoryIds.every(id => localSelectedIds.includes(id));

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds([...visibleCategoryIds]);
    }
  }, [allSelected, visibleCategoryIds]);

  const handleToggleCategory = useCallback((id: number) => {
    setLocalSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, []);

  const displayedCategories = useMemo(() => {
    let filtered = categories;
    if (type !== 'all') {
      filtered = categories.filter(cat => cat.type === type);
    }
    if (searchText.trim()) {
      const terms = searchText.toLowerCase().split(/\s+/).filter(Boolean);
      filtered = filtered.filter(cat => {
        const name = getDisplayCategoryName(cat).toLowerCase();
        return terms.every(term => name.includes(term));
      });
    }
    return filtered;
  }, [categories, type, searchText]);

  const sections = useMemo(() => {
    if (type !== 'all') {
      return [{ label: null, data: sortCategoriesWithOthersLast(displayedCategories) }];
    }
    const expenses = sortCategoriesWithOthersLast(displayedCategories.filter(c => c.type === 'expense'));
    const income = sortCategoriesWithOthersLast(displayedCategories.filter(c => c.type === 'income'));
    const result: { label: string | null; data: Category[] }[] = [];
    if (expenses.length > 0) result.push({ label: labels.filter_expenses, data: expenses });
    if (income.length > 0) result.push({ label: labels.filter_income, data: income });
    return result;
  }, [displayedCategories, type, labels.filter_expenses, labels.filter_income]);

  const applyLabel = useMemo(() => {
    if (allSelected) {
      if (type === 'expense') return labels.filter_apply_all_expense;
      if (type === 'income') return labels.filter_apply_all_income;
      return labels.filter_apply_all;
    }
    return labels.filter_apply(localSelectedIds.length);
  }, [allSelected, type, localSelectedIds.length, labels]);

  const applyDisabled = localSelectedIds.length === 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <Text style={[styles.title, { color: c.text, fontSize: fs(16) }]}>{labels.filter_categories}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <SearchBar
            placeholder={labels.add_cat_search}
            value={searchText}
            onChangeText={setSearchText}
            onClose={() => setSearchText('')}
          />

          <TouchableOpacity
            style={[
              styles.allChip,
              {
                backgroundColor: allSelected ? c.primary : c.surface,
                borderWidth: allSelected ? 0 : 1,
                borderColor: c.border,
              },
            ]}
            onPress={handleToggleAll}
          >
            <Text
              style={{
                color: allSelected ? c.background : c.text,
                fontSize: fs(14),
                fontWeight: '600',
              }}
            >
              {labels.home_tag_all}
            </Text>
          </TouchableOpacity>

          {sections.length === 0 || (sections.length === 1 && sections[0].data.length === 0) ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={c.textSecondary} />
              <Text style={[styles.emptyText, { color: c.textSecondary, fontSize: fs(16) }]}>
                {labels.filter_no_results}
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {sections.map((section, sIdx) => (
                <View key={sIdx}>
                  {section.label && (
                    <Text style={[styles.sectionHeader, { color: c.textSecondary, fontSize: fs(13) }]}>
                      {section.label}
                    </Text>
                  )}
                  <View style={styles.grid}>
                    {section.data.map((cat) => {
                      const isSelected = localSelectedIds.includes(cat.id);
                      const name = getDisplayCategoryName(cat);
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[
                            styles.item,
                            {
                              backgroundColor: isSelected ? cat.color + '33' : c.surface,
                              borderRadius: round ? 999 : 12,
                            },
                            isSelected && { borderWidth: 2, borderColor: cat.color },
                          ]}
                          onPress={() => handleToggleCategory(cat.id)}
                        >
                          <View style={[styles.iconContainer, { backgroundColor: cat.color + '22', borderRadius: round ? 999 : 20 }]}>
                            <Ionicons name={cat.icon as ComponentProps<typeof Ionicons>['name']} size={24} color={cat.color} />
                            {isSelected && (
                              <View style={[styles.checkmark, { backgroundColor: cat.color }]}>
                                <Ionicons name="checkmark" size={12} color={c.background} />
                              </View>
                            )}
                          </View>
                          <Text
                            style={[styles.name, { color: c.text, fontSize: fs(11) }]}
                            numberOfLines={1}
                          >
                            {name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: applyDisabled ? c.surface : c.primary }]}
          disabled={applyDisabled}
          onPress={() => onApply(localSelectedIds)}
        >
          <Text style={[styles.applyText, { color: applyDisabled ? c.textSecondary : c.background, fontSize: fs(16) }]}>
            {applyLabel}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  allChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionHeader: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontWeight: '500',
  },
  applyButton: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyText: {
    fontWeight: '700',
  },
});
