import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { t, getDisplayCategoryName } from '../i18n';
import SearchBar from './SearchBar';
import EmptyState from './EmptyState';
import { TRANSACTION_TYPES, TYPE_FILTERS, type TransactionTypeFilter } from '../constants/types';
import { sortCategoriesWithOthersLast, categoriesOfType } from '../utils/categoryUtils';
import { matchesAllTerms } from '../utils/search';
import type { Category } from '../database/types';
import { badgeShapeFor } from '../utils/badgeShape';
import CategoryTile from './CategoryTile';

interface Props {
  visible: boolean;
  categories: Category[];
  selectedIds: number[];
  type: TransactionTypeFilter;
  onApply: (ids: number[]) => void;
  onClose: () => void;
}

export default function CategoryFilterModal({ visible, categories, selectedIds, type, onApply, onClose }: Props) {
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

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
    if (type === TYPE_FILTERS.all) return allCategoryIds;
    return categoriesOfType(categories, type).map(cat => cat.id);
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
    if (type !== TYPE_FILTERS.all) {
      filtered = categoriesOfType(categories, type);
    }
    if (searchText.trim()) {
      filtered = filtered.filter(cat => matchesAllTerms(searchText, getDisplayCategoryName(cat).toLowerCase()));
    }
    return filtered;
  }, [categories, type, searchText]);

  const sections = useMemo(() => {
    if (type !== TYPE_FILTERS.all) {
      return [{ label: null, data: sortCategoriesWithOthersLast(displayedCategories) }];
    }
  const expenses = sortCategoriesWithOthersLast(categoriesOfType(displayedCategories, TRANSACTION_TYPES.expense));
  const income = sortCategoriesWithOthersLast(categoriesOfType(displayedCategories, TRANSACTION_TYPES.income));
    const result: { label: string | null; data: Category[] }[] = [];
    if (expenses.length > 0) result.push({ label: labels.filter_expenses, data: expenses });
    if (income.length > 0) result.push({ label: labels.filter_income, data: income });
    return result;
  }, [displayedCategories, type, labels.filter_expenses, labels.filter_income]);

  const applyLabel = useMemo(() => {
    if (allSelected) {
      if (type === TRANSACTION_TYPES.expense) return labels.filter_apply_all_expense;
      if (type === TRANSACTION_TYPES.income) return labels.filter_apply_all_income;
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
          <TouchableOpacity onPress={onClose} accessibilityLabel={labels.common_close} style={styles.closeButton}>
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

          {sections.every(section => section.data.length === 0) ? (
            <EmptyState icon="search-outline" message={labels.filter_no_results} />
          ) : (
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {sections.map((section, sIdx) => (
                <View key={sIdx}>
                  {section.label && (
                    <Text style={[styles.sectionHeader, { color: c.textSecondary, fontSize: fs(13) }]}>
                      {section.label}
                    </Text>
                  )}
                  <View style={styles.grid}>
                    {section.data.map((cat) => (
                      <CategoryTile
                        key={cat.id}
                        icon={cat.icon}
                        color={cat.color}
                        shape={badgeShapeFor(config, 'category')}
                        label={getDisplayCategoryName(cat)}
                        selected={localSelectedIds.includes(cat.id)}
                        checkmark
                        onPress={() => handleToggleCategory(cat.id)}
                      />
                    ))}
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
    justifyContent: 'center',
    gap: 12,
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
