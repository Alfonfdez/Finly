import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { TRANSACTION_TYPES, TYPE_FILTERS, type RootStackParamList, type TransactionTypeFilter } from '../constants/types';
import { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatCurrency, resolvePeriodRange, endOfDay, startOfDay } from '../utils/formatters';
import { t } from '../i18n';
import AccountModal from '../components/AccountModal';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import TransactionGroup from '../components/TransactionGroup';
import TabBar from '../components/TabBar';
import EmptyState from '../components/EmptyState';
import CategoryFilterModal from '../components/CategoryFilterModal';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllTransactions'>;

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { categories, accounts, activeAccount, accountsWithBalance, tags, activePeriod, selectedDate, customDate, changePeriod, setSelectedDate, setCustomDate } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [typeTab, setTypeTab] = useState<TransactionTypeFilter>(TYPE_FILTERS.all);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    setSelectedCategoryIds([]);
  }, [typeTab]);

  const periodDates = useMemo(() => resolvePeriodRange(activePeriod, selectedDate, customDate), [activePeriod, selectedDate, customDate]);

  const loadTransactions = useCallback(async () => {
    return await transactionRepository.list({});
  }, []);

  const { data: allTransactions, loading } = useFocusLoad(loadTransactions, [] as Transaction[]);

  const filters = useTransactionFilters({
    transactions: allTransactions,
    accounts,
    activeAccount,
    typeTab,
    selectedCategoryIds,
    periodDates,
  });

  const handleTransactionPress = useCallback((id: number) => {
    navigation.navigate('TransactionDetails', { transactionId: id });
  }, [navigation]);

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
    return labels.filter_apply(selectedCategoryIds.length);
  }, [selectedCategoryIds, typeTab, categories, labels]);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setCustomDate({ start: startOfDay(start), end: endOfDay(end) });
  }, [setCustomDate]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <TabBar
        tabs={[
          { key: TYPE_FILTERS.all, label: labels.tab_all },
          { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses },
          { key: TRANSACTION_TYPES.income, label: labels.tab_income },
        ]}
        active={typeTab}
        onChange={setTypeTab}
      />

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
        contentContainerStyle={styles.listContent}
        sections={filters.sections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <TransactionGroup
            date={section.date}
            transactions={section.data}
            categories={categories}
            tagsByTransaction={filters.tagsByTransaction}
            onTransactionPress={handleTransactionPress}
          />
        )}
        renderItem={({ item }) => null}
        ListEmptyComponent={
          <EmptyState message={labels.transactions_empty} />
        }
        stickySectionHeadersEnabled={false}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
