import { useState, useMemo, useCallback, useEffect, ComponentProps } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect, DrawerActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { scrollbarFlatList } from '../constants/platformStyles';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { RootStackParamList, Period, TransactionType } from '../constants/types';
import { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatCurrency, formatDateForDB } from '../utils/formatters';
import { t, getDisplayAccountName } from '../i18n';
import AccountModal from '../components/AccountModal';
import SortToggle, { SortBy, SortDirection } from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import TransactionGroup from '../components/TransactionGroup';
import AllTypeTabs from '../components/AllTypeTabs';
import CategoryFilterModal from '../components/CategoryFilterModal';
import PeriodTabs from '../components/PeriodTabs';
import CalendarPicker from '../components/CalendarPicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AllTransactions'>;

function computePeriodDates(period: Period, selectedDate: Date, customRange: { start: Date; end: Date }): { start: Date; end: Date } | null {
  if (period === 'custom') return customRange;
  const now = selectedDate;
  switch (period) {
    case 'day': {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const e = new Date(s); e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case 'week': {
      const wd = now.getDay();
      const diff = wd === 0 ? 6 : wd - 1;
      const s = new Date(now); s.setDate(now.getDate() - diff); s.setHours(0, 0, 0, 0);
      const e = new Date(s); e.setDate(e.getDate() + 6); e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case 'month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start: s, end: e };
    }
    case 'year': {
      const s = new Date(now.getFullYear(), 0, 1);
      const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start: s, end: e };
    }
  }
}

export default function AllTransactionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { categories, accounts, activeAccount, accountsWithBalance, tags, activePeriod, selectedDate, customDate, changePeriod, setSelectedDate, setCustomDate } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

  const [selectedAccountId, setSelectedAccountId] = useState(activeAccount?.id ?? accounts[0]?.id ?? 1);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagsByTransaction, setTagsByTransaction] = useState<Map<number, { tag_id: number; name: string }[]>>(new Map());
  const [localTagIds, setLocalTagIds] = useState<number[]>([]);

  const [typeTab, setTypeTab] = useState<'all' | TransactionType>('all');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => {
    setSelectedCategoryIds([]);
  }, [typeTab]);

  const handleToggleTag = useCallback((id: number) => {
    setLocalTagIds(prev => {
      if (id === -1) {
        return prev.includes(-1) ? [] : [-1];
      }
      if (prev.includes(-1)) {
        return [id];
      }
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handleClearTagFilter = useCallback(() => {
    setLocalTagIds([]);
  }, []);

  const periodDates = useMemo(() => computePeriodDates(activePeriod, selectedDate, customDate), [activePeriod, selectedDate, customDate]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const data = await transactionRepository.list({});
        if (active) {
          setAllTransactions(data);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  useEffect(() => {
    if (allTransactions.length === 0) {
      setTagsByTransaction(new Map());
      return;
    }
    let active = true;
    (async () => {
      const txIds = allTransactions.map(t => t.id);
      const tagLinks = await transactionRepository.getTagsByTransactionIds(txIds);
      if (!active) return;
      const map = new Map<number, { tag_id: number; name: string }[]>();
      for (const link of tagLinks) {
        if (!map.has(link.transaction_id)) map.set(link.transaction_id, []);
        map.get(link.transaction_id)!.push(link);
      }
      setTagsByTransaction(map);
    })();
    return () => { active = false; };
  }, [allTransactions]);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={{ marginLeft: 8, padding: 4 }}
            accessibilityLabel={labels.home_open_menu}
          >
            <Ionicons name="menu-outline" size={24} color={c.text} />
          </TouchableOpacity>
        ),
      });
    }, [navigation, c.text, labels.home_open_menu])
  );

  const filtered = useMemo(() => {
    let list = allTransactions.filter(t => t.account_id === selectedAccountId);

    if (typeTab !== 'all') {
      list = list.filter(t => t.type === typeTab);
    }

    if (selectedCategoryIds.length > 0) {
      const catSet = new Set(selectedCategoryIds);
      list = list.filter(t => catSet.has(t.category_id));
    }

    if (periodDates) {
      const startStr = formatDateForDB(periodDates.start);
      const endStr = formatDateForDB(periodDates.end);
      list = list.filter(t => t.date >= startStr && t.date <= endStr);
    }

    if (localTagIds.length > 0) {
      const hasUntagged = localTagIds.includes(-1);
      const regularIds = localTagIds.filter(id => id !== -1);
      list = list.filter(tx => {
        const txTags = tagsByTransaction.get(tx.id) ?? [];
        if (hasUntagged && txTags.length === 0) return true;
        if (regularIds.length > 0 && regularIds.some(id => txTags.some(t => t.tag_id === id))) return true;
        return false;
      });
    }

    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDirection === 'desc' ? -diff : diff;
      }
      const diff = a.amount - b.amount;
      return sortDirection === 'desc' ? -diff : diff;
    });
    return sorted;
  }, [allTransactions, selectedAccountId, typeTab, selectedCategoryIds, periodDates, sortBy, sortDirection, localTagIds, tagsByTransaction]);

  const sections = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const dateKey = tx.date.split(' ')[0];
      const existing = grouped.get(dateKey);
      if (existing) {
        existing.push(tx);
      } else {
        grouped.set(dateKey, [tx]);
      }
    }
    return Array.from(grouped.entries()).map(([date, data]) => ({ date, data }));
  }, [filtered]);

  const accountBalance = useMemo(() => {
    return filtered
      .reduce(
        (sum, t) => sum + (t.type === 'expense' ? -t.amount : t.amount), 0
      );
  }, [filtered]);

  const handleToggleSort = (field: SortBy) => {
    if (field === sortBy) {
      setSortDirection(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const categoryButtonLabel = useMemo(() => {
    const visibleCategories = typeTab === 'all'
      ? categories
      : categories.filter(cat => cat.type === typeTab);
    const allVisibleSelected = visibleCategories.length > 0 && visibleCategories.every(cat => selectedCategoryIds.includes(cat.id));
    if (selectedCategoryIds.length === 0 || allVisibleSelected) {
      if (typeTab === 'expense') return labels.filter_all_expense_categories;
      if (typeTab === 'income') return labels.filter_all_income_categories;
      return labels.filter_all_categories;
    }
    return labels.filter_apply(selectedCategoryIds.length);
  }, [selectedCategoryIds, typeTab, categories, labels]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={['bottom']}>
      <AllTypeTabs active={typeTab} onChange={setTypeTab} />

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.accountTrigger} onPress={() => setAccountModalVisible(true)}>
          {(() => { const a = accountsWithBalance.find(x => x.id === selectedAccountId); return a ? (
            <View style={[styles.accountTriggerIcon, { backgroundColor: a.color + '30', borderRadius: config.accountIconShape === 'circle' ? 14 : 6 }]}>
              <Ionicons name={a.icon as ComponentProps<typeof Ionicons>['name']} size={18} color={a.color} />
            </View>
          ) : null; })()}
          <Text style={[styles.accountTriggerName, { color: c.text, fontSize: fs(14) }]} numberOfLines={1}>
            {accountsWithBalance.find(x => x.id === selectedAccountId) ? getDisplayAccountName(accountsWithBalance.find(x => x.id === selectedAccountId)!) : ''}
          </Text>
          <Ionicons name="chevron-down" size={16} color={c.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.accountBalance, { color: accountBalance >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
          {accountBalance >= 0 ? '+' : ''}{formatCurrency(accountBalance, config.currency, config.decimalSeparator)}
        </Text>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.categoryButton, { backgroundColor: c.surface }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Ionicons name="pricetag-outline" size={14} color={c.primary} />
            <Text style={[styles.categoryButtonText, { color: c.text, fontSize: fs(13) }]} numberOfLines={1}>
              {categoryButtonLabel}
            </Text>
          </TouchableOpacity>
          <SortToggle
            sortBy={sortBy}
            direction={sortDirection}
            onToggleSort={handleToggleSort}
            onToggleDirection={() => setSortDirection(d => d === 'desc' ? 'asc' : 'desc')}
          />
        </View>
      </View>

      <PeriodTabs active={activePeriod} onChange={changePeriod} />
      <CalendarPicker
        period={activePeriod}
        date={selectedDate}
        onDateChange={setSelectedDate}
        onRangeChange={(start, end) => setCustomDate({ start, end })}
        rangeStart={customDate.start}
        rangeEnd={customDate.end}
        visible={calendarVisible}
        onOpen={() => setCalendarVisible(true)}
        onClose={() => setCalendarVisible(false)}
        firstDay={config.firstDayOfWeek === 'monday' ? 1 : 0}
      />

      <TagFilterBar
        tags={tags}
        activeTagIds={localTagIds}
        onToggle={handleToggleTag}
        onClear={handleClearTagFilter}
        style={{ marginTop: 12 }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      ) : (
      <SectionList
        style={scrollbarFlatList}
        contentContainerStyle={styles.listContent}
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section }) => (
          <TransactionGroup
            date={section.date}
            transactions={section.data}
            categories={categories}
            tagsByTransaction={tagsByTransaction}
            onTransactionPress={(id) => navigation.navigate('TransactionDetails', { transactionId: id })}
          />
        )}
        renderItem={({ item }) => null}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: c.textSecondary, fontSize: fs(14) }]}>{labels.transactions_empty}</Text>
        }
        stickySectionHeadersEnabled={false}
      />
      )}

      <AccountModal
        visible={accountModalVisible}
        accounts={accountsWithBalance}
        selectedId={selectedAccountId}
        onSelect={(id) => { setSelectedAccountId(id); setAccountModalVisible(false); }}
        onClose={() => setAccountModalVisible(false)}
      />

      <CategoryFilterModal
        visible={categoryModalVisible}
        categories={categories}
        selectedIds={selectedCategoryIds}
        type={typeTab}
        onApply={(ids) => { setSelectedCategoryIds(ids); setCategoryModalVisible(false); }}
        onClose={() => setCategoryModalVisible(false)}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('AddTransaction', undefined)}
        accessibilityLabel="+"
      >
        <Ionicons name="add" size={28} color={c.background} />
      </TouchableOpacity>
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
  accountTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountTriggerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTriggerName: { fontWeight: '600', maxWidth: 100 },
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
  empty: { textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
