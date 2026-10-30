import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { COUNTER_STYLE, LIMIT_TEXT_STYLE } from '../components/componentStyles';
import CharCounter from '../components/form/CharCounter';
import { useNavigation } from '@react-navigation/native';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useCategoryUsage } from '../hooks/useCategoryUsage';
import { useSortPreference } from '../hooks/useSortPreference';
import { useApp } from '../context/AppContext';
import { t, getDisplayCategoryName } from '../i18n';
import TabBar, { typeTabs } from '../components/TabBar';
import CategoryGrid from '../components/CategoryGrid';
import ScreenSearchBar from '../components/ScreenSearchBar';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import ListOrEmpty from '../components/ListOrEmpty';
import SelectionActionBar from '../components/SelectionActionBar';
import SelectAllRow from '../components/SelectAllRow';
import SortRow from '../components/SortRow';
import SortToggle, { categorySortFields } from '../components/SortToggle';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import BulkCategoryTransferModal from '../components/BulkCategoryTransferModal';
import { TRANSACTION_TYPES, MAX_CATEGORIES_PER_TYPE, type TransactionType, type NavigationProp } from '../constants/types';
import { LIST_BOTTOM_FAB_PADDING, LIST_TOP_GAP } from '../constants/layout';
import { TEST_IDS } from '../constants/testIds';
import { categoriesOfType, countCategoriesOfType } from '../utils/categoryUtils';
import { defaultCategorySortDirection, sortCategories } from '../utils/categorySort';
import { countAtLimit } from '../utils/limits';
import { useCategoryBulkDelete } from '../hooks/useCategoryBulkDelete';
import SelectSearchHeader from '../components/SelectSearchHeader';
import GuardModal from '../components/GuardModal';

export default function CategoriesScreen() {
  const { activeColors: c, config, updateConfig } = useConfig();
  const { categories, refreshCategories, refresh } = useApp();
  const labels = t();
  const fs = useFontSize();
  const navigation = useNavigation<NavigationProp<'Categories'>>();

  const [activeType, setActiveType] = useState<TransactionType>(TRANSACTION_TYPES.expense);

  const sortBy = config.categoriesSortBy;
  const sortDirection = config.categoriesSortDirection;
  // Lifetime usage per category, used by the "Usage" sort and the tile count.
  const usage = useCategoryUsage(categories);

  // No memo: display names are localized, so the order must refresh with the language.
  const categoriesByType = sortCategories(categoriesOfType(categories, activeType), sortBy, sortDirection, usage);

  const { handleToggleSort, handleToggleDirection } = useSortPreference({
    sortBy,
    sortDirection,
    defaultDirection: defaultCategorySortDirection,
    onChange: next => updateConfig({ categoriesSortBy: next.by, categoriesSortDirection: next.direction }),
  });

  const select = useSelectAndSearch({ hasItems: categoriesByType.length > 1 });

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    toggleItem, reconcileSelection, exitSelectMode,
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

  useEffect(() => {
    reconcileSelection(visibleIds);
  }, [visibleIds, reconcileSelection]);

  const typeCount = countCategoriesOfType(categories, activeType);
  const atCategoryLimit = countAtLimit(typeCount, MAX_CATEGORIES_PER_TYPE);

  const afterCategoriesChanged = useCallback(async () => {
    await refreshCategories();
    await refresh();
  }, [refreshCategories, refresh]);

  const {
    deleteModalVisible,
    deleteBusy,
    guardVisible,
    inUseCategories,
    deleteHasData,
    resolutionVisible,
    decisions,
    transferTargets,
    handleDeletePress,
    handlePermanentDelete,
    handleMoveTransactions,
    handleDecide,
    handleConfirmResolution,
    closeDeleteModal,
    closeGuard,
    closeResolution,
  } = useCategoryBulkDelete({
    categoriesByType,
    visibleIds,
    selectedIds,
    typeCount,
    exitSelectMode,
    onChanged: afterCategoriesChanged,
  });

  return (
    <ScreenShell>
      <View style={styles.header}>
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
          <CharCounter value={typeCount} maxLength={MAX_CATEGORIES_PER_TYPE} style={COUNTER_STYLE}>
            {labels.categories_counter(typeCount, MAX_CATEGORIES_PER_TYPE)}
          </CharCounter>
        )}
      </View>

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

      <View style={styles.listArea}>
        <ListOrEmpty
          empty={filteredCategories.length === 0}
          emptyState={<EmptyState {...emptyStateProps(searchActive, 'grid-outline', labels.add_cat_no_results)} />}
        >
          <ScrollView
            testID={TEST_IDS.categoriesGrid}
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, LIST_TOP_GAP]}
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
          cancelLabel={labels.cancel}
          onDelete={handleDeletePress}
          onCancel={exitSelectMode}
        />
      )}

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        title={labels.categories_bulk_delete_confirm_title(selectedIds.size)}
        message={deleteHasData
          ? labels.categories_bulk_delete_confirm_message_data(inUseCategories.length, selectedIds.size)
          : labels.categories_bulk_delete_confirm_message_empty}
        confirmLabel={labels.categories_bulk_delete_confirm_delete}
        onConfirm={handlePermanentDelete}
        onCancel={closeDeleteModal}
        moveLabel={deleteHasData ? labels.categories_bulk_delete_confirm_move : undefined}
        onMove={deleteHasData ? handleMoveTransactions : undefined}
        busy={deleteBusy}
      />

      <GuardModal
        visible={guardVisible}
        title={labels.categories_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.categories_bulk_delete_min_one}
        onClose={closeGuard}
      />

      <BulkCategoryTransferModal
        visible={resolutionVisible}
        categories={inUseCategories}
        targets={transferTargets}
        decisions={decisions}
        onDecide={handleDecide}
        onConfirm={handleConfirmResolution}
        onCancel={closeResolution}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
  },
  listArea: {
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
});
