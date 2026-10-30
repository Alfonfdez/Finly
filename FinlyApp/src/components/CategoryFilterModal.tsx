import { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useResetOnOpen } from '../hooks/useResetOnOpen';
import { t, getDisplayCategoryName } from '../i18n';
import SearchBar from './SearchBar';
import EmptyState from './EmptyState';
import HeaderCloseButton from './HeaderCloseButton';
import FullScreenModalHeader from './FullScreenModalHeader';
import FormHintSlot from './form/FormHintSlot';
import { CARD_BORDER_RADIUS, DISABLED_CONTROL_OPACITY } from './componentStyles';
import { TRANSACTION_TYPES, TYPE_FILTERS, type TransactionTypeFilter } from '../constants/types';
import { sortCategoriesWithOthersLast, categoriesOfType } from '../utils/categoryUtils';
import { CATEGORY_SELECTION_KINDS, classifyCategorySelection } from '../utils/categoryFilterSelection';
import { matchesAllTerms } from '../utils/search';
import type { Category } from '../database/types';
import { badgeShapeFor } from '../utils/badgeShape';
import CategoryTile from './CategoryTile';
import { TEST_IDS } from '../constants/testIds';

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

  const allIdsForType = useMemo(() => {
    if (type === TRANSACTION_TYPES.expense) {
      return categoriesOfType(categories, TRANSACTION_TYPES.expense).map(cat => cat.id);
    }
    if (type === TRANSACTION_TYPES.income) {
      return categoriesOfType(categories, TRANSACTION_TYPES.income).map(cat => cat.id);
    }
    return categories.map(cat => cat.id);
  }, [categories, type]);

  const [localSelectedIds, setLocalSelectedIds] = useState<number[]>(
    () => (selectedIds.length === 0 ? allIdsForType : selectedIds),
  );
  const [searchText, setSearchText] = useState('');

  const resetOnOpen = useCallback(() => {
    setLocalSelectedIds(selectedIds.length === 0 ? allIdsForType : selectedIds);
    setSearchText('');
  }, [selectedIds, allIdsForType]);
  useResetOnOpen(visible, resetOnOpen);

  const presets = useMemo(() => {
    const expenseIds = categoriesOfType(categories, TRANSACTION_TYPES.expense).map(cat => cat.id);
    const incomeIds = categoriesOfType(categories, TRANSACTION_TYPES.income).map(cat => cat.id);
    const list = type === TRANSACTION_TYPES.expense
      ? [{ key: 'expenses', label: labels.filter_all_expense_categories, ids: expenseIds }]
      : type === TRANSACTION_TYPES.income
        ? [{ key: 'income', label: labels.filter_all_income_categories, ids: incomeIds }]
        : [
          { key: 'all', label: labels.filter_all_categories, ids: categories.map(cat => cat.id) },
          { key: 'expenses', label: labels.filter_all_expense_categories, ids: expenseIds },
          { key: 'income', label: labels.filter_all_income_categories, ids: incomeIds },
        ];
    return list.filter(preset => preset.ids.length > 0);
  }, [categories, type, labels]);

  const isPresetActive = useCallback((ids: number[]) => {
    return ids.length === localSelectedIds.length && ids.every(id => localSelectedIds.includes(id));
  }, [localSelectedIds]);

  const handlePresetPress = useCallback((ids: number[]) => {
    setLocalSelectedIds(isPresetActive(ids) ? [] : [...ids]);
  }, [isPresetActive]);

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
      const label = type === TRANSACTION_TYPES.expense ? labels.filter_expenses : labels.filter_income;
      return [{ label, data: sortCategoriesWithOthersLast(displayedCategories) }];
    }
    const expenses = sortCategoriesWithOthersLast(categoriesOfType(displayedCategories, TRANSACTION_TYPES.expense));
    const income = sortCategoriesWithOthersLast(categoriesOfType(displayedCategories, TRANSACTION_TYPES.income));
    const result: { label: string | null; data: Category[] }[] = [];
    if (expenses.length > 0) result.push({ label: labels.filter_expenses, data: expenses });
    if (income.length > 0) result.push({ label: labels.filter_income, data: income });
    return result;
  }, [displayedCategories, type, labels.filter_expenses, labels.filter_income]);

  const noneSelected = localSelectedIds.length === 0;

  const applyLabel = useMemo(() => {
    if (noneSelected) return labels.filter_apply(0);
    const kind = classifyCategorySelection(localSelectedIds, categories);
    if (kind === CATEGORY_SELECTION_KINDS.all) return labels.filter_apply_all_categories;
    if (kind === CATEGORY_SELECTION_KINDS.allExpenses) return labels.filter_apply_all_expense;
    if (kind === CATEGORY_SELECTION_KINDS.allIncome) return labels.filter_apply_all_income;
    return labels.filter_apply(localSelectedIds.length);
  }, [noneSelected, localSelectedIds, categories, labels]);

  const renderPreset = (preset: (typeof presets)[number]) => {
    const active = isPresetActive(preset.ids);
    return (
      <TouchableOpacity
        key={preset.key}
        style={[
          styles.presetChip,
          {
            backgroundColor: active ? c.primary : c.surface,
            borderWidth: active ? 0 : 1,
            borderColor: c.border,
          },
        ]}
        onPress={() => handlePresetPress(preset.ids)}
        testID={`${TEST_IDS.categoryFilterPresetPrefix}-${preset.key}`}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        <Text
          style={{
            color: active ? c.background : c.text,
            fontSize: fs(14),
            fontWeight: '600',
          }}
        >
          {preset.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['top', 'bottom']}>
        <FullScreenModalHeader
          title={labels.filter_categories}
          icon="grid-outline"
          right={<HeaderCloseButton onPress={onClose} accessibilityLabel={labels.common_close} />}
        />

        <View style={styles.content}>
          <SearchBar
            placeholder={labels.add_cat_search}
            value={searchText}
            onChangeText={setSearchText}
            onClose={() => setSearchText('')}
          />

          <View style={styles.presetsContainer}>
            <View style={styles.presetsRow}>
              {presets[0] && renderPreset(presets[0])}
            </View>
            {presets.length > 1 && (
              <View style={styles.presetsRow}>
                {presets.slice(1).map(preset => renderPreset(preset))}
              </View>
            )}
          </View>

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

        <FormHintSlot message={noneSelected ? labels.filter_select_at_least_one : null} />

        <TouchableOpacity
          style={[
            styles.applyButton,
            {
              backgroundColor: c.primary,
              opacity: noneSelected ? DISABLED_CONTROL_OPACITY : 1,
            },
          ]}
          onPress={() => {
            if (!noneSelected) onApply(localSelectedIds);
          }}
          disabled={noneSelected}
          accessibilityRole="button"
          accessibilityState={{ disabled: noneSelected }}
          testID={TEST_IDS.categoryFilterApply}
        >
          <Text style={[styles.applyText, { color: c.background, fontSize: fs(16) }]}>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  presetsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
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
    borderRadius: CARD_BORDER_RADIUS,
    alignItems: 'center',
  },
  applyText: {
    fontWeight: '700',
  },
});
