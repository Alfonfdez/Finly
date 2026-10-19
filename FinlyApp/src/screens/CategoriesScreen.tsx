import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { LIMIT_TEXT_STYLE } from '../components/componentStyles';
import CharCounter from '../components/form/CharCounter';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useApp } from '../context/AppContext';
import { t, getDisplayCategoryName } from '../i18n';
import { categoryRepository, recurringRepository, transactionRepository } from '../database';
import TabBar, { typeTabs } from '../components/TabBar';
import CategoryGrid from '../components/CategoryGrid';
import ScreenSearchBar from '../components/ScreenSearchBar';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import ListOrEmpty from '../components/ListOrEmpty';
import SelectionActionBar from '../components/SelectionActionBar';
import SelectAllRow from '../components/SelectAllRow';
import SortRow from '../components/SortRow';
import SortToggle, { categorySortFields } from '../components/SortToggle';
import ConfirmationModal from '../components/ConfirmationModal';
import BulkCategoryTransferModal, { type BulkCategoryItem } from '../components/BulkCategoryTransferModal';
import type { TransferTargetId } from '../components/CategoryTransferModal';
import { TRANSACTION_TYPES, MAX_CATEGORIES_PER_TYPE, CATEGORY_SORT_BY, SORT_DIRECTIONS, type TransactionType, type CategorySortBy, type SortDirection, type NavigationProp } from '../constants/types';
import { LIST_BOTTOM_FAB_PADDING, LIST_TOP_GAP } from '../constants/layout';
import { TEST_IDS } from '../constants/testIds';
import { categoriesOfType, countCategoriesOfType } from '../utils/categoryUtils';
import { defaultCategorySortDirection, sortCategories } from '../utils/categorySort';
import { countAtLimit } from '../utils/limits';
import { ERROR_PREFIXES, runWithErrorAlert } from '../utils/errors';
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
  const [deleteHasData, setDeleteHasData] = useState(false);
  const [decisions, setDecisions] = useState<Record<number, TransferTargetId | null>>({});

  const [sortBy, setSortBy] = useState<CategorySortBy>(CATEGORY_SORT_BY.name);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTIONS.asc);
  const [usage, setUsage] = useState<ReadonlyMap<number, number>>(() => new Map());

  // Lifetime usage per category, used by the "Usage" sort and the tile count.
  useEffect(() => {
    let active = true;
    transactionRepository.countByCategoryIdsMap(categories.map(category => category.id))
      .then((counts) => {
        if (!active) return;
        setUsage(new Map(Object.entries(counts).map(([id, count]) => [Number(id), Number(count)])));
      })
      .catch(() => { if (active) setUsage(new Map()); });
    return () => { active = false; };
  }, [categories]);

  const categoriesByType = useMemo(() => {
    return sortCategories(categoriesOfType(categories, activeType), sortBy, sortDirection, usage);
  }, [categories, activeType, sortBy, sortDirection, usage]);

  const handleToggleSort = useCallback((field: CategorySortBy) => {
    if (field === sortBy) {
      setSortDirection(d => (d === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc));
    } else {
      setSortBy(field);
      setSortDirection(defaultCategorySortDirection(field));
    }
  }, [sortBy]);

  const handleToggleDirection = useCallback(() => {
    setSortDirection(d => (d === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc));
  }, []);

  const select = useSelectAndSearch({ hasItems: categoriesByType.length > 1 });

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    deleteModalVisible, setDeleteModalVisible, toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = select;

  useSelectableScreen({
    navigation,
    showHeader: categoriesByType.length > 1,
    selectMode,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

  const filteredCategories = useSearchFilter(categoriesByType, searchText, (cat) => [getDisplayCategoryName(cat)]);

  const visibleIds = useMemo(() => filteredCategories.map((cat) => cat.id), [filteredCategories]);

  const transferTargets = useMemo(
    () => categoriesByType.filter((cat) => !selectedIds.has(cat.id)),
    [categoriesByType, selectedIds],
  );

  const typeCount = countCategoriesOfType(categories, activeType);
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  const handleDeletePress = async () => {
    if (selectedIds.size >= typeCount) {
      setGuardVisible(true);
      return;
    }
    try {
      const ids = [...selectedIds];
      const [txCounts, ruleCounts] = await Promise.all([
        transactionRepository.countByCategoryIdsMap(ids),
        recurringRepository.countByCategoryIds(ids),
      ]);
      // A category is "in use" when it has transactions or recurring rules: either way
      // the user must choose a target for it (or accept deleting its data).
      const inUse = categoriesByType
        .filter((cat) => selectedIds.has(cat.id) && ((txCounts[cat.id] ?? 0) > 0 || (ruleCounts[cat.id] ?? 0) > 0))
        .map((cat) => ({ category: cat, txCount: txCounts[cat.id] ?? 0, ruleCount: ruleCounts[cat.id] ?? 0 }));
      setInUseCategories(inUse);
      setDeleteHasData(inUse.length > 0);
    } catch {
      setInUseCategories(categoriesByType.filter((cat) => selectedIds.has(cat.id)).map((cat) => ({ category: cat, txCount: 0, ruleCount: 0 })));
      setDeleteHasData(true);
    }
    setDeleteModalVisible(true);
  };

  const handlePermanentDelete = async () => {
    setDeleteModalVisible(false);
    await runWithErrorAlert(async () => {
      await categoryRepository.deleteMany([...selectedIds]);
      await refreshCategories();
      await refresh();
    }, ERROR_PREFIXES.categoriesDelete);
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
    await runWithErrorAlert(async () => {
      await categoryRepository.bulkDeleteWithTargets(items);
      await refreshCategories();
      await refresh();
    }, ERROR_PREFIXES.categoriesDelete);
    exitSelectMode();
  };

  return (
    <ScreenShell>
      <View style={styles.content}>
        <TabBar
          tabs={typeTabs(labels)}
          active={activeType}
          onChange={(type) => {
            setActiveType(type);
            exitSelectMode();
          }}
        />

        <ScreenSearchBar
          visible={searchActive}
          placeholder={labels.add_cat_search}
          value={searchText}
          onChangeText={setSearchText}
          onClose={closeSearch}
          style={styles.searchBarWrap}
        />

        {!selectMode && (
          <CharCounter value={typeCount} maxLength={MAX_CATEGORIES_PER_TYPE} style={styles.counter}>
            {labels.categories_counter(typeCount, MAX_CATEGORIES_PER_TYPE)}
          </CharCounter>
        )}

        <SortRow bordered>
          <SortToggle
            fields={categorySortFields(labels)}
            sortBy={sortBy}
            direction={sortDirection}
            onToggleSort={handleToggleSort}
            onToggleDirection={handleToggleDirection}
          />
        </SortRow>

        {selectMode && visibleIds.length > 0 && (
          <SelectAllRow
            allSelected={select.allSelected(visibleIds)}
            countLabel={labels.items_count(visibleIds.length)}
            selectAllLabel={labels.select_all}
            deselectAllLabel={labels.deselect_all}
            onToggle={() => select.toggleSelectAll(visibleIds)}
          />
        )}

        <ListOrEmpty
          empty={filteredCategories.length === 0}
          emptyState={<EmptyState {...emptyStateProps(searchActive, 'grid-outline', labels.add_cat_no_results)} />}
        >
          <ScrollView
            testID={TEST_IDS.categoriesGrid}
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, selectMode && LIST_TOP_GAP]}
          >
            <CategoryGrid
              categories={filteredCategories}
              counts={usage}
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
              <Text style={[LIMIT_TEXT_STYLE, { color: c.textSecondary, fontSize: fs(13) }]}>
                {labels.create_cat_error_limit(MAX_CATEGORIES_PER_TYPE)}
              </Text>
            )}
          </ScrollView>
        </ListOrEmpty>
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
        message={deleteHasData
          ? labels.categories_bulk_delete_confirm_message_data(inUseCategories.length, selectedIds.size)
          : labels.categories_bulk_delete_confirm_message_empty}
        confirmLabel={labels.categories_bulk_delete_confirm_delete}
        cancelLabel={labels.modify_cat_delete_confirm_cancel}
        onConfirm={handlePermanentDelete}
        onCancel={() => setDeleteModalVisible(false)}
        moveLabel={deleteHasData ? labels.categories_bulk_delete_confirm_move : undefined}
        onMove={deleteHasData ? handleMoveTransactions : undefined}
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
  searchBarWrap: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    ...LIST_BOTTOM_FAB_PADDING,
  },
  counter: {
    fontWeight: '500',
    textAlign: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
});
