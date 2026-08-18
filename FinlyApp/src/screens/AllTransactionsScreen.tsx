import { useState, useMemo, useCallback, useEffect, useLayoutEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { Ionicons } from '@expo/vector-icons';
import { HEADER_BUTTONS } from '../components/componentStyles';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { TRANSACTION_TYPES, TYPE_FILTERS, type NavigationProp, type TransactionTypeFilter } from '../constants/types';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatCurrency, resolvePeriodRange, endOfDay, startOfDay } from '../utils/formatters';
import { t } from '../i18n';
import AccountModal from '../components/AccountModal';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import { TransactionRow, TransactionDateHeader } from '../components/TransactionGroup';
import TabBar from '../components/TabBar';
import EmptyState from '../components/EmptyState';
import Fab from '../components/Fab';
import CategoryFilterModal from '../components/CategoryFilterModal';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import SearchBar from '../components/SearchBar';
import SelectionActionBar from '../components/SelectionActionBar';
import ConfirmationModal from '../components/ConfirmationModal';
import SelectToggleButton from '../components/SelectToggleButton';

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'AllTransactions'>>();
  const { categories, categoriesById, accounts, activeAccount, accountsWithBalance, tags, activePeriod, selectedDate, customDate, changePeriod, setSelectedDate, setCustomDate } = useApp();
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

  const {
    searchActive, searchText, setSearchText,
    selectMode, selectedIds,
    deleteModalVisible, setDeleteModalVisible, toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch, closeSearch,
  } = useSelectAndSearch({ hasItems: true });

  const filters = useTransactionFilters({
    transactions: allTransactions,
    accounts,
    activeAccount,
    categoriesById,
    searchTerm: searchText,
    typeTab,
    selectedCategoryIds,
    periodDates,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        filters.sections.length > 0 ? (
          <View style={HEADER_BUTTONS}>
            <SelectToggleButton
              active={selectMode}
              onToggle={toggleSelectMode}
              color={c.primary}
            />
            <TouchableOpacity
              onPress={toggleSearch}
              style={HEADER_BUTTONS}
            >
              <Ionicons name="search-outline" size={22} color={c.text} />
            </TouchableOpacity>
          </View>
        ) : null,
    });
  }, [navigation, selectMode, filters.sections, c.text, c.primary, toggleSelectMode, toggleSearch]);

  const handleTransactionPress = useCallback((id: number) => {
    if (selectMode) { toggleItem(id); return; }
    navigation.navigate('TransactionDetails', { transactionId: id });
  }, [navigation, selectMode, toggleItem]);

  const handleBulkDelete = useCallback(async () => {
    setDeleteModalVisible(false);
    await transactionRepository.deleteMany([...selectedIds]);
    exitSelectMode();
    const updated = await transactionRepository.list({});
    setAllTransactions(updated);
  }, [selectedIds, setAllTransactions, exitSelectMode]);

  const keyExtractor = useCallback((item: Transaction) => item.id.toString(), []);

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
    return filters.filtered
      .reduce(
        (sum, t) => sum + (t.type === TRANSACTION_TYPES.expense ? -t.amount : t.amount), 0
      );
  }, [filters.filtered]);

  const categoryButtonLabel = useMemo(() => {
    const visibleCategories = typeTab === TYPE_FILTERS.all
      ? categories
      : categories.filter(cat => cat.type === typeTab);
    const allVisibleSelected = visibleCategories.length > 0 && visibleCategories.every(cat => selectedCategoryIds.includes(cat.id));
    if (selectedCategoryIds.length === 0 || allVisibleSelected) {
      if (typeTab === TRANSACTION_TYPES.expense) return labels.filter_all_expense_categories;
      if (typeTab === TRANSACTION_TYPES.income) return labels.filter_all_income_categories;
      return labels.filter_all_categories;
    }
    return labels.filter_categories_count(selectedCategoryIds.length);
  }, [selectedCategoryIds, typeTab, categories, labels]);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setCustomDate({ start: startOfDay(start), end: endOfDay(end) });
  }, [setCustomDate]);

  return (
    <ScreenShell>
      <TabBar
        tabs={[
          { key: TYPE_FILTERS.all, label: labels.tab_all },
          { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses },
          { key: TRANSACTION_TYPES.income, label: labels.tab_income },
        ]}
        active={typeTab}
        onChange={setTypeTab}
      />

      {searchActive && (
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder={labels.transactions_search}
            value={searchText}
            onChangeText={setSearchText}
            onClose={closeSearch}
            autoFocus
          />
        </View>
      )}

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <AccountTrigger
          accountId={filters.selectedAccountId}
          accounts={accountsWithBalance}
          onPress={filters.openAccountModal}
        />
        <Text style={[styles.accountBalance, { color: accountBalance >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
          {accountBalance >= 0 ? '+' : ''}{formatCurrency(accountBalance, config.currency, config.decimalSeparator)}
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

      <PeriodTabs active={activePeriod} onChange={changePeriod} />
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
        style={{ marginTop: 12 }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
      <SectionList
        contentContainerStyle={filters.sections.length === 0 ? styles.emptyList : styles.listContent}
        sections={filters.sections}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListEmptyComponent={
          searchActive && searchText.trim()
            ? <EmptyState icon="search-outline" message={labels.filter_no_results} />
            : <EmptyState icon="receipt-outline" message={labels.transactions_empty} />
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
        onSelect={filters.selectAccount}
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
          onDelete={() => setDeleteModalVisible(true)}
          onCancel={exitSelectMode}
        />
      ) : (
        <Fab
          onPress={() => navigation.navigate('AddTransaction')}
          accessibilityLabel={labels.home_add}
        />
      )}

      <ConfirmationModal
        visible={deleteModalVisible}
        title={labels.transactions_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.transactions_bulk_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={handleBulkDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
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
  listContent: { paddingBottom: 80 },
  emptyList: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
