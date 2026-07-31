import { useState, useCallback, useEffect, ComponentProps } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { formatCurrency, formatDateForDB, formatSignedCurrency, HIDDEN_BALANCE, getPeriodRange } from '../utils/formatters';
import { RootStackParamList, Period } from '../constants/types';
import { t, getDisplayAccountName } from '../i18n';
import { transactionRepository as transactionRepo } from '../database';
import AccountModal from '../components/AccountModal';
import EyeToggle from '../components/EyeToggle';
import TabBar from '../components/TabBar';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import CategoryList from '../components/CategoryList';
import TagFilterBar from '../components/TagFilterBar';
import Fab from '../components/Fab';

type ChartType = 'donut' | 'bar';
type Navigation = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Navigation>();
  const {
    activeAccount, activeType, activePeriod, selectedDate, customDate, accountsWithBalance, activeCategories,
    totalIncome, totalExpenses, totalIncomeAll, totalExpensesAll, selectAccount, changeType,
    changePeriod, setSelectedDate, setCustomDate, loading, tags, activeTagIds, toggleTagId, clearTagFilter,
  } = useApp();
  const { config, activeColors: c } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [modalVisible, setModalVisible] = useState(false);
  const [chartType, setChartType] = useState<ChartType>('donut');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<number>>(new Set());
  const [tagBreakdowns, setTagBreakdowns] = useState<Map<number, { tag_id: number; name: string; total: number }[]>>(new Map());
  const [isRevealed, setIsRevealed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsRevealed(false);
    }, [])
  );

  const isBalanceHidden = config.hideBalances !== isRevealed;

  const total = totalIncomeAll - totalExpensesAll;
  const activeTotal = activeType === 'expense' ? totalExpenses : totalIncome;
  const totalColor = total >= 0 ? c.green : c.red;

  useEffect(() => {
    if (!activeAccount || activeCategories.length === 0) {
      setTagBreakdowns(new Map());
      return;
    }
    const currentAccount = activeAccount;

    async function loadTagBreakdowns() {
      const dates = activePeriod === 'custom'
        ? customDate
        : getPeriodRange(activePeriod, selectedDate);

      const breakdowns = new Map<number, { tag_id: number; name: string; total: number }[]>();
      for (const cat of activeCategories) {
        const data = await transactionRepo.breakdownByCategoryAndTag(
          currentAccount.id,
          cat.id,
          activeType,
          formatDateForDB(dates.start),
          formatDateForDB(dates.end),
          activeTagIds.length > 0 ? activeTagIds : undefined
        );
        const filtered = tags.length > 0 ? data : data.filter(d => d.tag_id !== -1);
        if (filtered.length > 0) {
          breakdowns.set(cat.id, filtered);
        }
      }
      setTagBreakdowns(breakdowns);
    }

    loadTagBreakdowns();
  }, [activeAccount, activeCategories, activeType, activePeriod, selectedDate, customDate, activeTagIds, tags]);

  const handleCategoryPress = useCallback((category: { id: number }) => {
    const { start, end } = activePeriod === 'custom'
      ? customDate
      : getPeriodRange(activePeriod, selectedDate);
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
    if (period === 'custom') setCalendarVisible(true);
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
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    setCustomDate({ start: startDay, end: endDay });
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
        <View style={[styles.header, { backgroundColor: c.surface }]}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            accessibilityLabel={labels.home_open_menu}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="menu-outline" size={26} color={c.text} />
          </TouchableOpacity>

          <View style={styles.totalButton}>
            <TouchableOpacity style={styles.accountRow} onPress={() => setModalVisible(true)}>
               <View style={[styles.accountIcon, { backgroundColor: activeAccount.color + '30', borderRadius: config.accountIconShape === 'circle' ? 12 : 4 }]}>
                <Ionicons name={activeAccount.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={activeAccount.color} />
              </View>
              <Text style={[styles.accountLabel, { color: c.textSecondary, fontSize: fs(14) }]}>{getDisplayAccountName(activeAccount)}</Text>
              <Ionicons name="chevron-down-outline" size={14} color={c.textSecondary} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.totalText, { color: isBalanceHidden ? c.textSecondary : totalColor, fontSize: fs(28) }]}>
                {isBalanceHidden ? HIDDEN_BALANCE : formatSignedCurrency(total, config.currency, config.decimalSeparator)}
              </Text>
              <EyeToggle isHidden={isBalanceHidden} onToggle={() => setIsRevealed(prev => !prev)} color={c.textSecondary} />
            </View>
      <View style={styles.summaryRow}>
        {isBalanceHidden ? (
          <>
            <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
              <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{HIDDEN_BALANCE}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_income}</Text>
            </Text>
            <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
              <Text style={{ color: c.textSecondary, fontWeight: '700' }}>{HIDDEN_BALANCE}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_expenses}</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
              <Text style={{ color: c.green, fontWeight: '700' }}>+{formatCurrency(totalIncomeAll, config.currency, config.decimalSeparator)}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_income}</Text>
            </Text>
            <Text style={[styles.summaryItem, { fontSize: fs(14) }]}>
              <Text style={{ color: c.red, fontWeight: '700' }}>-{formatCurrency(totalExpensesAll, config.currency, config.decimalSeparator)}</Text>
              <Text style={[styles.summaryLabel, { color: c.textSecondary, fontSize: fs(12) }]}> {labels.home_expenses}</Text>
            </Text>
          </>
        )}
      </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('AllTransactions')}
            accessibilityLabel={labels.home_view_transactions}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="stats-chart-outline" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        <TabBar
          tabs={[
            { key: 'expense', label: labels.tab_expenses, accessibilityLabel: labels.a11y_show_expenses },
            { key: 'income', label: labels.tab_income, accessibilityLabel: labels.a11y_show_income },
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
          firstDay={config.firstDayOfWeek}
        />

        <TouchableOpacity
          style={styles.chartContainer}
          onPress={() => setChartType(chartType === 'donut' ? 'bar' : 'donut')}
          activeOpacity={0.7}
        >
          {chartType === 'donut' ? (
            <DonutChart data={activeCategories} total={activeTotal} currency={config.currency} separator={config.decimalSeparator} />
          ) : (
            <BarChart data={activeCategories} total={activeTotal} currency={config.currency} separator={config.decimalSeparator} />
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
          total={activeTotal}
          currency={config.currency}
          separator={config.decimalSeparator}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalButton: { alignItems: 'center', flex: 1 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accountIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountLabel: {},
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryItem: {},
  summaryLabel: {},
  totalText: { fontWeight: '700', marginVertical: 2 },
  chartContainer: { alignItems: 'center', marginVertical: 8 },
});
