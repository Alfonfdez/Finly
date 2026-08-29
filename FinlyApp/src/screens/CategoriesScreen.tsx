import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useApp } from '../context/AppContext';
import { t, getDisplayCategoryName } from '../i18n';
import { categoryRepository, transactionRepository } from '../database';
import TabBar from '../components/TabBar';
import CategoryGrid from '../components/CategoryGrid';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import BulkCategoryTransferModal, { type BulkCategoryItem } from '../components/BulkCategoryTransferModal';
import type { TransferTargetId } from '../components/CategoryTransferModal';
import { TRANSACTION_TYPES, MAX_CATEGORIES_PER_TYPE, type TransactionType, type NavigationProp } from '../constants/types';
import { sortCategoriesWithOthersLast, categoriesOfType, countCategoriesOfType } from '../utils/categoryUtils';
import { countAtLimit } from '../utils/limits';
import { showErrorAlert } from '../utils/errors';
import SelectSearchHeader from '../components/SelectSearchHeader';
import GuardModal from '../components/GuardModal';

export default function CategoriesScreen() {
  const { activeColors: c } = useConfig();
  const { categories, refreshCategories, refresh } = useApp();
  const labels = t();
  const fs = useFontSize();
  const navigation = useNavigation<NavigationProp<'Categories'>>();

  const [activeType, setActiveType] = useState<TransactionType>(TRANSACTION_TYPES.expense);
  const [resolutionVisible, setResolutionVisible] = useState(false);
  const [guardVisible, setGuardVisible] = useState(false);
  const [inUseCategories, setInUseCategories] = useState<BulkCategoryItem[]>([]);
  const [withTxCount, setWithTxCount] = useState(0);
  const [deleteHasTransactions, setDeleteHasTransactions] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, TransferTargetId | null>>({});

  const categoriesByType = useMemo(() => {
    return sortCategoriesWithOthersLast(categoriesOfType(categories, activeType));
  }, [categories, activeType]);

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    deleteModalVisible, setDeleteModalVisible, toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = useSelectableScreen({ navigation, hasItems: categoriesByType.length > 1, showHeader: categoriesByType.length > 1, headerRight: () => (
    <SelectSearchHeader
      selectMode={selectMode}
      onToggleSelect={toggleSelectMode}
      onToggleSearch={toggleSearch}
    />
  )});

  const filteredCategories = useSearchFilter(categoriesByType, searchText, (cat) => [getDisplayCategoryName(cat)]);

  const transferTargets = useMemo(
    () => categoriesByType.filter((cat) => !selectedIds.has(cat.id)),
    [categoriesByType, selectedIds]
  );

  const typeCount = countCategoriesOfType(categories, activeType);
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  const handleDeletePress = async () => {
    if (selectedIds.size >= typeCount) {
      setGuardVisible(true);
      return;
    }
    try {
      const counts = await transactionRepository.countByCategoryIdsMap([...selectedIds]);
      const inUse = categoriesByType
        .filter((cat) => selectedIds.has(cat.id) && (counts[cat.id] ?? 0) > 0)
        .map((cat) => ({ category: cat, count: counts[cat.id] ?? 0 }));
      setInUseCategories(inUse);
      setWithTxCount(inUse.length);
      setDeleteHasTransactions(inUse.length > 0);
    } catch {
      setInUseCategories(categoriesByType.filter((cat) => selectedIds.has(cat.id)).map((cat) => ({ category: cat, count: 0 })));
      setWithTxCount(selectedIds.size);
      setDeleteHasTransactions(true);
    }
    setDeleteModalVisible(true);
  };

  const handlePermanentDelete = async () => {
    setDeleteModalVisible(false);
    try {
      await categoryRepository.deleteMany([...selectedIds]);
      await refreshCategories();
      await refresh();
    } catch (err) {
      console.error('Failed to delete categories:', err);
      showErrorAlert(labels);
    }
    exitSelectMode();
  };

  const handleMoveTransactions = () => {
    setDeleteModalVisible(false);
    setDecisions({});
    setResolutionVisible(true);
  };

  const handleDecide = (categoryId: number, decision: TransferTargetId | null) => {
    setDecisions((prev) => ({ ...prev, [categoryId]: decision }));
  };

  const handleConfirmResolution = async () => {
    if (inUseCategories.length === 0) return;
    setResolutionVisible(false);
    const items = [...selectedIds].map((id) => {
      const decision = decisions[id];
      const targetId =
        decision === undefined || decision === null || decision === 'delete' ? null : decision;
      return { id, targetId };
    });
    try {
      await categoryRepository.bulkDeleteWithTargets(items);
      await refreshCategories();
      await refresh();
    } catch (err) {
      console.error('Failed to delete categories:', err);
      showErrorAlert(labels);
    }
    exitSelectMode();
  };

  return (
    <ScreenShell>
      <View style={styles.content}>
        <TabBar
          tabs={[
            { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses },
            { key: TRANSACTION_TYPES.income, label: labels.tab_income },
          ]}
          active={activeType}
          onChange={(type) => {
            setActiveType(type);
            exitSelectMode();
          }}
        />

        {searchActive && (
          <SearchBar
            placeholder={labels.add_cat_search}
            value={searchText}
            onChangeText={setSearchText}
            onClose={closeSearch}
            autoFocus
          />
        )}

        {!selectMode && (
          <Text style={[styles.counter, { color: c.textSecondary, fontSize: fs(13) }]}>
            {labels.categories_counter(typeCount, MAX_CATEGORIES_PER_TYPE)}
          </Text>
        )}

        {filteredCategories.length === 0 ? (
          <EmptyState
            icon={searchActive ? 'search-outline' : 'grid-outline'}
            message={labels.add_cat_no_results}
          />
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <CategoryGrid
              categories={filteredCategories}
              selectedCategory={null}
              selectedIds={selectMode ? selectedIds : undefined}
              onSelect={(id) => {
                if (selectMode) toggleItem(id);
                else navigation.navigate('ModifyCategory', { categoryId: id });
              }}
              onAddMore={() => navigation.navigate('CreateCategory', { type: activeType })}
              showAddMore={!selectMode && !atCategoryLimit}
              addMoreLabel={labels.add_cat_create}
              hideTitle
            />
            {atCategoryLimit && !selectMode && (
              <Text style={[styles.limitText, { color: c.textSecondary, fontSize: fs(13) }]}>
                {labels.create_cat_error_limit(MAX_CATEGORIES_PER_TYPE)}
              </Text>
            )}
          </ScrollView>
        )}
      </View>

      {selectMode && (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.categories_bulk_delete(selectedIds.size)}
          cancelLabel={labels.modify_cat_delete_confirm_cancel}
          onDelete={handleDeletePress}
          onCancel={exitSelectMode}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.categories_bulk_delete_confirm_title(selectedIds.size)}
        message={deleteHasTransactions
          ? labels.categories_bulk_delete_confirm_message_tx(withTxCount, selectedIds.size)
          : labels.categories_bulk_delete_confirm_message_empty}
        confirmLabel={labels.categories_bulk_delete_confirm_delete}
        cancelLabel={labels.modify_cat_delete_confirm_cancel}
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteModalVisible(false)}
        moveLabel={deleteHasTransactions ? labels.categories_bulk_delete_confirm_move : undefined}
        onMove={deleteHasTransactions ? handleMoveTransactions : undefined}
      />

      <GuardModal
        visible={guardVisible}
        title={labels.categories_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.categories_bulk_delete_min_one}
        onClose={() => setGuardVisible(false)}
      />

      <BulkCategoryTransferModal
        visible={resolutionVisible}
        categories={inUseCategories}
        targets={transferTargets}
        decisions={decisions}
        onDecide={handleDecide}
        onConfirm={handleConfirmResolution}
        onCancel={() => setResolutionVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  counter: {
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  limitText: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
