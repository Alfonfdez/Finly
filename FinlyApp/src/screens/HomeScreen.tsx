import { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useBalanceVisibility } from '../hooks/useBalanceVisibility';
import { formatDateForDB, resolvePeriodRange, endOfDay, startOfDay } from '../utils/formatters';
import { type NavigationProp, PERIODS, TRANSACTION_TYPES, type Period, CHART_TYPES, type ChartType } from '../constants/types';
import { t } from '../i18n';
import { transactionRepository as transactionRepo } from '../database';
import { UNTAGGED_ID, isTotalAccount } from '../database/helpers';
import AccountModal from '../components/AccountModal';
import TabBar from '../components/TabBar';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import CategoryList from '../components/CategoryList';
import TagFilterBar from '../components/TagFilterBar';
import Fab from '../components/Fab';
import HomeHeader from '../components/HomeHeader';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<'Home'>>();
  const {
    activeAccount, activeType, activePeriod, selectedDate, customDate, accountsWithBalance, activeCategories,
    totalIncome, totalExpenses, totalIncomeAll, totalExpensesAll, selectAccount, changeType,
    changePeriod, setSelectedDate, setCustomDate, loading, tags, activeTagIds, toggleTagId, clearTagFilter,
  } = useApp();
  const { config, activeColors: c } = useConfig();
  const labels = t();

  const [modalVisible, setModalVisible] = useState(false);
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.donut);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set());
  const [tagBreakdowns, setTagBreakdowns] = useState<Map<number, { tag_id: number; name: string; total: number }[]>>(new Map());
  const { isBalanceHidden, toggleReveal } = useBalanceVisibility(config.hideBalances);

  const total = totalIncomeAll - totalExpensesAll;
  const activeTotal = activeType === TRANSACTION_TYPES.expense ? totalExpenses : totalIncome;
  const totalColor = total >= 0 ? c.green : c.red;

  useEffect(() => {
    if (!activeAccount || activeCategories.length === 0) {
      setTagBreakdowns(new Map());
      return;
    }
    const currentAccount = activeAccount;
    let active = true;

    async function loadTagBreakdowns() {
      const dates = resolvePeriodRange(activePeriod, selectedDate, customDate);

      try {
        const data = await transactionRepo.breakdownByCategoriesAndTags(
          isTotalAccount(currentAccount) ? null : currentAccount.id,
          activeCategories.map(cat => cat.id),
          activeType,
          formatDateForDB(dates.start),
          formatDateForDB(dates.end),
          activeTagIds.length > 0 ? activeTagIds : undefined
        );

        if (!active) return;
        const breakdowns = new Map<number, { tag_id: number; name: string; total: number }[]>();
        for (const [catId, rows] of data) {
          const filtered = tags.length > 0 ? rows : rows.filter(d => d.tag_id !== UNTAGGED_ID);
          if (filtered.length > 0) breakdowns.set(catId, filtered);
        }
        setTagBreakdowns(breakdowns);
      } catch (error) {
        console.error('Failed to load tag breakdowns:', error);
        if (active) setTagBreakdowns(new Map());
      }
    }

    loadTagBreakdowns();
    return () => { active = false; };
  }, [activeAccount, activeCategories, activeType, activePeriod, selectedDate, customDate, activeTagIds, tags]);

  const handleCategoryPress = useCallback((category: { id: number }) => {
    const { start, end } = resolvePeriodRange(activePeriod, selectedDate, customDate);
    navigation.navigate('Transactions', {
      categoryId: category.id,
      type: activeType,
      period: activePeriod,
      startDate: formatDateForDB(start),
      endDate: formatDateForDB(end),
      tagIds: activeTagIds.length > 0 ? activeTagIds : undefined,
    });
  }, [navigation, activeType, activePeriod, customDate, selectedDate, activeTagIds]);

  const handleToggleExpand = useCallback((categoryId: number) => {
    setExpandedCategoryIds(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handlePeriodChange = useCallback((period: Period) => {
    changePeriod(period);
    if (period === PERIODS.custom) setCalendarVisible(true);
  }, [changePeriod]);

  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  }, [setSelectedDate]);

  const handleAccountSelect = useCallback((id: number) => {
    const account = accountsWithBalance.find(a => a.id === id);
    if (account) selectAccount(account);
    setModalVisible(false);
  }, [selectAccount, accountsWithBalance]);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setCustomDate({ start: startOfDay(start), end: endOfDay(end) });
  }, [setCustomDate]);

  if (loading || !activeAccount) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: c.background }]}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <HomeHeader
          activeAccount={activeAccount}
          isBalanceHidden={isBalanceHidden}
          onToggleReveal={toggleReveal}
          total={total}
          totalColor={totalColor}
          totalIncomeAll={totalIncomeAll}
          totalExpensesAll={totalExpensesAll}
          onOpenAccountModal={() => setModalVisible(true)}
          onViewTransactions={() => navigation.navigate('AllTransactions')}
        />

        <TabBar
          tabs={[
            { key: TRANSACTION_TYPES.expense, label: labels.tab_expenses, accessibilityLabel: labels.a11y_show_expenses },
            { key: TRANSACTION_TYPES.income, label: labels.tab_income, accessibilityLabel: labels.a11y_show_income },
          ]}
          active={activeType}
          onChange={changeType}
        />
        <PeriodTabs active={activePeriod} onChange={handlePeriodChange} />
        <CalendarPicker
          period={activePeriod}
          date={selectedDate}
          onDateChange={handleDateChange}
          onRangeChange={handleRangeChange}
          rangeStart={customDate.start}
          rangeEnd={customDate.end}
          visible={calendarVisible}
          onOpen={() => setCalendarVisible(true)}
          onClose={() => setCalendarVisible(false)}
        />

        <TouchableOpacity
          style={styles.chartContainer}
          onPress={() => setChartType(chartType === CHART_TYPES.donut ? CHART_TYPES.bar : CHART_TYPES.donut)}
          activeOpacity={0.7}
        >
          {chartType === CHART_TYPES.donut ? (
            <DonutChart data={activeCategories} total={activeTotal} />
          ) : (
            <BarChart data={activeCategories} total={activeTotal} />
          )}
        </TouchableOpacity>

        <TagFilterBar
          tags={tags}
          activeTagIds={activeTagIds}
          onToggle={toggleTagId}
          onClear={clearTagFilter}
        />

        <CategoryList
          categories={activeCategories}
          onPress={handleCategoryPress}
          tagBreakdowns={tagBreakdowns}
          expandedCategoryIds={expandedCategoryIds}
          onToggleExpand={handleToggleExpand}
        />

        <Fab
          onPress={() => navigation.navigate('AddTransaction')}
          accessibilityLabel={labels.home_add}
        />

        <AccountModal
          visible={modalVisible}
          accounts={accountsWithBalance}
          selectedId={activeAccount.id}
          onSelect={handleAccountSelect}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  chartContainer: { alignItems: 'center', marginVertical: 8 },
});
