import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import { usePeriodNavigation } from '../hooks/usePeriodNavigation';
import { TRANSACTION_TYPES, TYPE_FILTERS, type NavigationProp, type TransactionTypeFilter } from '../constants/types';
import { LIST_BOTTOM_FAB_PADDING } from '../constants/layout';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatSignedCurrency, resolvePeriodRange } from '../utils/formatters';
import { netTransactionTotal } from '../utils/calculator';
import { showErrorAlert } from '../utils/errors';
import { categoriesOfType } from '../utils/categoryUtils';
import { t } from '../i18n';
import AccountModal from '../components/AccountModal';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import { TransactionRow, TransactionDateHeader } from '../components/TransactionGroup';
import TabBar, { typeTabs } from '../components/TabBar';
import EmptyState, { emptyStateProps } from '../components/EmptyState';
import Fab from '../components/Fab';
import CategoryFilterModal from '../components/CategoryFilterModal';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'AllTransactions'>>();
  const { categories, categoriesById, accounts, activeAccount, activeType, accountsWithBalance, tags, activePeriod, selectedDate, customDate, setSelectedDate, refresh, selectAccount } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [typeTab, setTypeTab] = useState<TransactionTypeFilter>(TYPE_FILTERS.all);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const periodDates = useMemo(() => resolvePeriodRange(activePeriod, selectedDate, customDate), [activePeriod, selectedDate, customDate]);

  const loadTransactions = useCallback(async () => {
    return await transactionRepository.list({});
  }, []);

  const { data: allTransactions, setData: setAllTransactions, loading } = useFocusLoad(loadTransactions, [] as Transaction[]);

  useEffect(() => {
    setSelectedCategoryIds([]);
  }, [typeTab]);

  /* eslint-disable react-hooks/exhaustive-deps -- typeTab intentionally excluded: including it causes infinite loop since this effect sets typeTab */
  useEffect(() => {
    if (typeTab !== TYPE_FILTERS.all) {
      setTypeTab(activeType);
    }
  }, [activeType]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = useSelectableScreen({
    navigation,
    hasItems: allTransactions.length > 0,
    showHeader: allTransactions.length > 0,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

  const {
    deleteModalVisible, openDeleteModal, closeDeleteModal, confirmBulkDelete,
    filters,
    handleTransactionPress,
    keyExtractor,
  } = useTransactionListScreen({
    navigation,
    selectMode,
    toggleItem,
    selectedIds,
    exitSelectMode,
    searchText,
    loadTransactions,
    setTransactions: setAllTransactions,
    filters: {
      transactions: allTransactions,
      accounts,
      activeAccount,
      categoriesById,
      typeTab,
      selectedCategoryIds,
      periodDates,
      onError: () => showErrorAlert(),
    },
    deleteFn: (ids) => transactionRepository.deleteMany(ids),
    onAfterDelete: refresh,
  });

  const renderSectionHeader = useCallback(({ section }: { section: { date: string } }) => (
    <TransactionDateHeader date={section.date} />
  ), []);

  const renderItem = useCallback(({ item }: { item: Transaction }) => (
    <TransactionRow
      tx={item}
      category={categoriesById.get(item.category_id)}
      tags={filters.tagsByTransaction.get(item.id)}
      onPress={handleTransactionPress}
      selectMode={selectMode}
      selected={selectedIds.has(item.id)}
    />
  ), [categoriesById, filters.tagsByTransaction, handleTransactionPress, selectMode, selectedIds]);

  const accountBalance = useMemo(() => {
    return netTransactionTotal(filters.filtered);
  }, [filters.filtered]);

  const categoryButtonLabel = useMemo(() => {
    const visibleCategories = typeTab === TYPE_FILTERS.all
      ? categories
      : categoriesOfType(categories, typeTab);
    const allVisibleSelected = visibleCategories.length > 0 && visibleCategories.every(cat => selectedCategoryIds.includes(cat.id));
    if (selectedCategoryIds.length === 0 || allVisibleSelected) {
      if (typeTab === TRANSACTION_TYPES.expense) return labels.filter_all_expense_categories;
      if (typeTab === TRANSACTION_TYPES.income) return labels.filter_all_income_categories;
      return labels.filter_all_categories;
    }
    return labels.filter_categories_count(selectedCategoryIds.length);
  }, [selectedCategoryIds, typeTab, categories, labels]);

  const { handlePeriodChange, handleRangeChange } = usePeriodNavigation(() => setCalendarVisible(true));

  return (
    <ScreenShell>
      <TabBar
        tabs={[
          { key: TYPE_FILTERS.all, label: labels.tab_all },
          ...typeTabs(labels),
        ]}
        active={typeTab}
        onChange={setTypeTab}
      />

      <ScreenSearchBar
        visible={searchActive}
        placeholder={labels.transactions_search}
        value={searchText}
        onChangeText={setSearchText}
        onClose={closeSearch}
      />

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <AccountTrigger
          accountId={filters.selectedAccountId}
          accounts={accountsWithBalance}
          onPress={filters.openAccountModal}
        />
        <Text style={[styles.accountBalance, { color: accountBalance >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
          {formatSignedCurrency(accountBalance, config.currency, config.decimalSeparator)}
        </Text>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.categoryButton, { backgroundColor: c.surface }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Ionicons name="grid-outline" size={14} color={c.primary} />
            <Text style={[styles.categoryButtonText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
              {categoryButtonLabel}
            </Text>
          </TouchableOpacity>
          <SortToggle
            sortBy={filters.sortBy}
            direction={filters.sortDirection}
            onToggleSort={filters.handleToggleSort}
            onToggleDirection={filters.handleToggleDirection}
          />
        </View>
      </View>

      <PeriodTabs active={activePeriod} onChange={handlePeriodChange} />
      <CalendarPicker
        period={activePeriod}
        date={selectedDate}
        onDateChange={setSelectedDate}
        onRangeChange={handleRangeChange}
        rangeStart={customDate.start}
        rangeEnd={customDate.end}
        visible={calendarVisible}
        onOpen={() => setCalendarVisible(true)}
        onClose={() => setCalendarVisible(false)}
      />

      <TagFilterBar
        tags={tags}
        activeTagIds={filters.localTagIds}
        onToggle={filters.handleToggleTag}
        onClear={filters.handleClearTagFilter}
        style={styles.tagFilter}
      />

      {!loading && filters.sections.length === 0 ? (
        <View style={styles.emptyList}>
          <EmptyState {...emptyStateProps(searchActive && !!searchText.trim(), 'receipt-outline', labels.transactions_empty)} />
        </View>
      ) : (
      <SectionList
        contentContainerStyle={styles.listContent}
        sections={filters.sections}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" message={labels.transactions_empty} />
        }
        stickySectionHeadersEnabled={false}
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
      />
      )}

      <AccountModal
        visible={filters.accountModalVisible}
        accounts={accountsWithBalance}
        selectedId={filters.selectedAccountId}
        onSelect={(id) => {
          filters.selectAccount(id);
          const account = accountsWithBalance.find(a => a.id === id);
          if (account) selectAccount(account);
        }}
        onClose={filters.closeAccountModal}
      />

      <CategoryFilterModal
        visible={categoryModalVisible}
        categories={categories}
        selectedIds={selectedCategoryIds}
        type={typeTab}
        onApply={(ids) => { setSelectedCategoryIds(ids); setCategoryModalVisible(false); }}
        onClose={() => setCategoryModalVisible(false)}
      />

      {selectMode ? (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.transactions_bulk_delete(selectedIds.size)}
          cancelLabel={labels.cancel}
          onDelete={openDeleteModal}
          onCancel={exitSelectMode}
        />
      ) : (
        <Fab
          onPress={() => navigation.navigate('AddTransaction', { type: typeTab === TYPE_FILTERS.all ? TRANSACTION_TYPES.expense : typeTab })}
          accessibilityLabel={labels.home_add}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.transactions_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.transactions_bulk_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  accountBalance: { fontWeight: '700' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryButtonText: {
    fontWeight: '500',
    maxWidth: 120,
  },
  listContent: { ...LIST_BOTTOM_FAB_PADDING },
  emptyList: { flex: 1 },
  tagFilter: { marginTop: 12 },
});
