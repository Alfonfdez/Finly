import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenShell from '../components/ScreenShell';
import { CONTROLS_GROUP_TOP_GAP } from '../components/componentStyles';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useConfig, type Config } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useRecurringRuleNames } from '../hooks/useRecurringRuleNames';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import { usePeriodNavigation } from '../hooks/usePeriodNavigation';
import { TRANSACTION_TYPES, TYPE_FILTERS, TRANSACTION_SORT_SCOPES, type NavigationProp, type TransactionTypeFilter } from '../constants/types';
import { TEST_IDS } from '../constants/testIds';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatSignedCurrency, HIDDEN_BALANCE, resolvePeriodRange } from '../utils/formatters';
import { netTransactionTotal } from '../utils/calculator';
import { showErrorAlert } from '../utils/errors';
import { isWeb } from '../utils/platform';
import { CATEGORY_SELECTION_KINDS, classifyCategorySelection, normalizeCategorySelectionForTab } from '../utils/categoryFilterSelection';
import { areIdListsEqual } from '../utils/arrays';
import { t } from '../i18n';
import AccountTrigger from '../components/AccountTrigger';
import EyeToggle from '../components/EyeToggle';
import SortToggle, { transactionSortFields } from '../components/SortToggle';
import SortRow from '../components/SortRow';
import TabBar, { typeTabs } from '../components/TabBar';
import RecurringViewChip from '../components/RecurringViewChip';
import Fab from '../components/Fab';
import CategoryFilterModal from '../components/CategoryFilterModal';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import SelectSearchHeader from '../components/SelectSearchHeader';
import TransactionListBody from '../components/TransactionListBody';
import LoadErrorState from '../components/LoadErrorState';

type CategoryIdsByTab = Record<TransactionTypeFilter, number[]>;

const CATEGORY_TABS: TransactionTypeFilter[] = [
  TYPE_FILTERS.all,
  TRANSACTION_TYPES.expense,
  TRANSACTION_TYPES.income,
];

const CATEGORY_IDS_CONFIG_KEYS = {
  [TYPE_FILTERS.all]: 'allTransactionsCategoryIds',
  [TRANSACTION_TYPES.expense]: 'allTransactionsExpenseCategoryIds',
  [TRANSACTION_TYPES.income]: 'allTransactionsIncomeCategoryIds',
} as const satisfies Record<TransactionTypeFilter, keyof Config>;

function categoryIdsPatch(tab: TransactionTypeFilter, ids: number[]): Partial<Config> {
  switch (tab) {
    case TRANSACTION_TYPES.expense:
      return { allTransactionsExpenseCategoryIds: ids };
    case TRANSACTION_TYPES.income:
      return { allTransactionsIncomeCategoryIds: ids };
    default:
      return { allTransactionsCategoryIds: ids };
  }
}

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'AllTransactions'>>();
  const { categories, categoriesById, accounts, activeAccount, accountsWithBalance, tags, loading: appLoading, dataRefreshing, activePeriod, selectedDate, customDate, setSelectedDate, refresh, selectAccount } = useApp();
  const { activeColors: c, config, loading: configLoading, updateConfig } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const recurringNames = useRecurringRuleNames();
  const { isBalanceHidden, toggleReveal } = useBalanceVisibility(config.hideBalances);

  const [typeTab, setTypeTab] = useState<TransactionTypeFilter>(TYPE_FILTERS.all);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const categoryIdsByTab = useMemo<CategoryIdsByTab>(() => ({
    [TYPE_FILTERS.all]: config[CATEGORY_IDS_CONFIG_KEYS[TYPE_FILTERS.all]],
    [TRANSACTION_TYPES.expense]: config[CATEGORY_IDS_CONFIG_KEYS[TRANSACTION_TYPES.expense]],
    [TRANSACTION_TYPES.income]: config[CATEGORY_IDS_CONFIG_KEYS[TRANSACTION_TYPES.income]],
  }), [config]);

  const periodDates = useMemo(
    () => resolvePeriodRange(activePeriod, selectedDate, customDate, config.firstDayOfWeek),
    [activePeriod, selectedDate, customDate, config.firstDayOfWeek],
  );

  const loadTransactions = useCallback(async () => {
    return await transactionRepository.list({});
  }, []);

  const {
    data: allTransactions, setData: setAllTransactions, loading, error, retry,
  } = useFocusLoad(loadTransactions, [] as Transaction[]);

  useEffect(() => {
    if (configLoading || appLoading || dataRefreshing || categories.length === 0) return;
    const updates: Partial<Config> = {};
    for (const tab of CATEGORY_TABS) {
      const current = categoryIdsByTab[tab];
      const valid = current.filter(id => {
        const category = categoriesById.get(id);
        return category != null && (tab === TYPE_FILTERS.all || category.type === tab);
      });
      const normalized = normalizeCategorySelectionForTab(valid, categories, tab);
      if (areIdListsEqual(normalized, current)) continue;
      Object.assign(updates, categoryIdsPatch(tab, normalized));
    }
    if (Object.keys(updates).length > 0) updateConfig(updates);
  }, [appLoading, categories, categoriesById, categoryIdsByTab, configLoading, dataRefreshing, updateConfig]);

  const selectedCategoryIds = categoryIdsByTab[typeTab];

  const select = useSelectAndSearch<number>({ hasItems: allTransactions.length > 0 });

  const {
    searchText,
    selectMode, selectedIds,
    toggleItem, reconcileSelection, exitSelectMode,
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
      tags,
      tagsLoaded: !appLoading,
      typeTab,
      selectedCategoryIds,
      periodDates,
      sortScope: TRANSACTION_SORT_SCOPES.allTransactions,
      onError: () => showErrorAlert(),
    },
    deleteFn: (ids) => transactionRepository.deleteMany(ids),
    onAfterDelete: refresh,
  });
  const { filters } = list;
  const visibleIds = useMemo(() => filters.filtered.map(transaction => transaction.id), [filters.filtered]);

  useEffect(() => {
    if (loading || appLoading) return;
    reconcileSelection(visibleIds);
  }, [visibleIds, loading, appLoading, reconcileSelection]);

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
    // The pill names the applied filter: a full type set reads as "All expenses/income"
    // even on the All tab, instead of a plain count.
    if (selectedCategoryIds.length === 0) {
      if (typeTab === TRANSACTION_TYPES.expense) return labels.filter_all_expense_categories;
      if (typeTab === TRANSACTION_TYPES.income) return labels.filter_all_income_categories;
      return labels.filter_all_categories;
    }
    const kind = classifyCategorySelection(selectedCategoryIds, categories);
    if (kind === CATEGORY_SELECTION_KINDS.all) return labels.filter_all_categories;
    if (kind === CATEGORY_SELECTION_KINDS.allExpenses) return labels.filter_all_expense_categories;
    if (kind === CATEGORY_SELECTION_KINDS.allIncome) return labels.filter_all_income_categories;
    return labels.filter_categories_count(selectedCategoryIds.length);
  }, [selectedCategoryIds, typeTab, categories, labels]);

  const handleApplyCategoryFilter = useCallback((ids: number[]) => {
    const normalized = normalizeCategorySelectionForTab(ids, categories, typeTab);
    updateConfig(categoryIdsPatch(typeTab, normalized));
    setCategoryModalVisible(false);
  }, [categories, typeTab, updateConfig]);

  const { handlePeriodChange, handleRangeChange } = usePeriodNavigation(() => setCalendarVisible(true));

  if (error && !loading) {
    return (
      <ScreenShell>
        <LoadErrorState onRetry={retry} />
      </ScreenShell>
    );
  }

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
            <View style={styles.balanceRow}>
              <Text style={[styles.accountBalance, { color: isBalanceHidden ? c.textSecondary : accountBalance >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
                {isBalanceHidden ? HIDDEN_BALANCE : formatSignedCurrency(accountBalance, config.currency, config.decimalSeparator)}
              </Text>
              <EyeToggle isHidden={isBalanceHidden} onToggle={toggleReveal} color={c.textSecondary} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={isWeb}
              style={[styles.controlsRow, CONTROLS_GROUP_TOP_GAP]}
              contentContainerStyle={[styles.controlsRowContent, isWeb && styles.controlsRowWebContent]}
            >
              <RecurringViewChip value={filters.recurringView} onChange={filters.setRecurringView} />
              <TouchableOpacity
                style={[styles.categoryButton, { backgroundColor: c.surface }]}
                onPress={() => setCategoryModalVisible(true)}
                testID={TEST_IDS.allTransactionsCategoryFilter}
              >
                <Ionicons name="grid-outline" size={14} color={c.primary} />
                <Text style={[styles.categoryButtonText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
                  {categoryButtonLabel}
                </Text>
                <Ionicons name="chevron-down" size={14} color={c.textSecondary} />
              </TouchableOpacity>
            </ScrollView>
            <SortRow>
              <SortToggle
                fields={transactionSortFields(labels)}
                sortBy={filters.sortBy}
                direction={filters.sortDirection}
                onToggleSort={filters.handleToggleSort}
                onToggleDirection={filters.handleToggleDirection}
              />
            </SortRow>
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
            onApply={handleApplyCategoryFilter}
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
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  accountBalance: { fontWeight: '700' },
  controlsRow: {
    alignSelf: 'stretch',
  },
  controlsRowContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  controlsRowWebContent: {
    paddingBottom: 8,
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
    maxWidth: 160,
  },
});
