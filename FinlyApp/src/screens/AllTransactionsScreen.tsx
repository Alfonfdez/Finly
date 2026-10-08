import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useRecurringRuleNames } from '../hooks/useRecurringRuleNames';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import { usePeriodNavigation } from '../hooks/usePeriodNavigation';
import { TRANSACTION_TYPES, TYPE_FILTERS, type NavigationProp, type TransactionTypeFilter } from '../constants/types';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatSignedCurrency, resolvePeriodRange } from '../utils/formatters';
import { netTransactionTotal } from '../utils/calculator';
import { showErrorAlert } from '../utils/errors';
import { categoriesOfType } from '../utils/categoryUtils';
import { t } from '../i18n';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import TabBar, { typeTabs } from '../components/TabBar';
import Fab from '../components/Fab';
import CategoryFilterModal from '../components/CategoryFilterModal';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import SelectSearchHeader from '../components/SelectSearchHeader';
import TransactionListBody from '../components/TransactionListBody';

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'AllTransactions'>>();
  const { categories, categoriesById, accounts, activeAccount, activeType, accountsWithBalance, tags, activePeriod, selectedDate, customDate, setSelectedDate, refresh, selectAccount } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const recurringNames = useRecurringRuleNames();

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

  const select = useSelectAndSearch<number>({ hasItems: allTransactions.length > 0 });

  const {
    searchText,
    selectMode, selectedIds,
    toggleItem, exitSelectMode,
    toggleSelectMode, toggleSearch,
  } = select;

  const list = useTransactionListScreen({
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
      recurringNames,
      typeTab,
      selectedCategoryIds,
      periodDates,
      onError: () => showErrorAlert(),
    },
    deleteFn: (ids) => transactionRepository.deleteMany(ids),
    onAfterDelete: refresh,
  });
  const { filters } = list;

  useSelectableScreen({
    navigation,
    showHeader: !loading && filters.sections.length > 0,
    selectMode,
    headerRight: () => (
      <SelectSearchHeader
        selectMode={selectMode}
        onToggleSelect={toggleSelectMode}
        onToggleSearch={toggleSearch}
      />
    ),
  });

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
      <TransactionListBody
        list={list}
        select={select}
        categoriesById={categoriesById}
        recurringNames={recurringNames}
        loading={loading}
        tags={tags}
        accountsWithBalance={accountsWithBalance}
        onSelectAccount={(id) => {
          filters.selectAccount(id);
          const account = accountsWithBalance.find(a => a.id === id);
          if (account) selectAccount(account);
        }}
        emptyIcon="receipt-outline"
        emptyMessage={labels.transactions_empty}
        header={
          <TabBar
            tabs={[
              { key: TYPE_FILTERS.all, label: labels.tab_all },
              ...typeTabs(labels),
            ]}
            active={typeTab}
            onChange={setTypeTab}
          />
        }
        controls={
          <>
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
          </>
        }
        period={
          <>
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
          </>
        }
        extraModals={
          <CategoryFilterModal
            visible={categoryModalVisible}
            categories={categories}
            selectedIds={selectedCategoryIds}
            type={typeTab}
            onApply={(ids) => { setSelectedCategoryIds(ids); setCategoryModalVisible(false); }}
            onClose={() => setCategoryModalVisible(false)}
          />
        }
        fab={
          <Fab
            onPress={() => navigation.navigate('AddTransaction', { type: typeTab === TYPE_FILTERS.all ? TRANSACTION_TYPES.expense : typeTab })}
            accessibilityLabel={labels.home_add}
          />
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
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
});
