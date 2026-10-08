import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useRecurringRuleNames } from '../hooks/useRecurringRuleNames';
import { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import { PERIODS, type RootStackParamList, type NavigationProp, type IconName } from '../constants/types';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatSignedCurrency, formatDateLong, parseDbDate, getMonthName } from '../utils/formatters';
import { netTransactionTotal } from '../utils/calculator';
import { withAlpha } from '../utils/color';
import { showErrorAlert } from '../utils/errors';
import { getDisplayCategoryName, t } from '../i18n';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import Fab from '../components/Fab';
import SelectSearchHeader from '../components/SelectSearchHeader';
import TransactionListBody from '../components/TransactionListBody';

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'Transactions'>>();
  const route = useRoute<TransactionsRouteProp>();
  const { categories, categoriesById, accounts, activeAccount, accountsWithBalance, tags, refresh } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();
  const recurringNames = useRecurringRuleNames();

  const categoryId = route.params?.categoryId;
  const startDate = route.params?.startDate;
  const endDate = route.params?.endDate;
  const tagIds = route.params?.tagIds;

  const loadTransactions = useCallback(async () => {
    const query: { category_id?: number; start_date?: string; end_date?: string } = {};
    if (categoryId) query.category_id = categoryId;
    if (startDate) query.start_date = startDate;
    if (endDate) query.end_date = endDate;
    return await transactionRepository.list(query);
  }, [categoryId, startDate, endDate]);

  const { data: allTransactions, setData, loading } = useFocusLoad(loadTransactions, [] as Transaction[]);

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
    setTransactions: setData,
    filters: {
      transactions: allTransactions,
      accounts,
      activeAccount,
      categoriesById,
      recurringNames,
      initialTagIds: tagIds ?? [],
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

  const category = categories.find(ct => ct.id === categoryId);

  const categoryTotal = useMemo(() => {
    return netTransactionTotal(filters.filtered);
  }, [filters.filtered]);

  const periodLabel = useMemo(() => {
    const period = route.params?.period ?? PERIODS.day;
    const lang = config.language;
    const start = startDate ? parseDbDate(startDate) : null;
    const end = endDate ? parseDbDate(endDate) : null;
    if (!start) return null;
    const typeLabel = period === PERIODS.custom ? labels.period_period : labels[`period_${period}`];

    if (period === PERIODS.year) {
      return `${typeLabel} · ${start.getFullYear()}`;
    }
    if (period === PERIODS.month) {
      return `${typeLabel} · ${getMonthName(start.getMonth() + 1)} ${start.getFullYear()}`;
    }
    if (period === PERIODS.custom && end) {
      return `${typeLabel} · ${formatDateLong(start, lang)} – ${formatDateLong(end, lang)}`;
    }
    if (period === PERIODS.week && end) {
      return `${typeLabel} · ${formatDateLong(start, lang)} – ${formatDateLong(end, lang)}`;
    }
    return `${typeLabel} · ${formatDateLong(start, lang)}`;
  }, [route.params?.period, startDate, endDate, config.language, labels]);

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
        onSelectAccount={filters.selectAccount}
        emptyIcon="document-text-outline"
        emptyMessage={labels.transactions_empty}
        header={category ? (
          <View style={[styles.categoryInfo, { borderBottomColor: c.border }]}>
            <View style={styles.categoryRow}>
              <View style={[styles.categoryIcon, { backgroundColor: withAlpha(category.color, 19) }]}>
                <Ionicons name={category.icon as IconName} size={22} color={category.color} />
              </View>
              <Text style={[styles.categoryName, { color: c.text, fontSize: fs(16) }]} numberOfLines={1}>
                {getDisplayCategoryName(category)}
              </Text>
            </View>
            <Text style={[styles.categoryTotal, { color: categoryTotal >= 0 ? c.green : c.red, fontSize: fs(22) }]}>
              {formatSignedCurrency(categoryTotal, config.currency, config.decimalSeparator)}
            </Text>
            {periodLabel ? (
              <Text style={[styles.categoryPeriod, { color: c.textSecondary, fontSize: fs(13) }]}>
                {periodLabel}
              </Text>
            ) : null}
          </View>
        ) : undefined}
        controls={
          <>
            <AccountTrigger
              accountId={filters.selectedAccountId}
              accounts={accountsWithBalance}
              onPress={filters.openAccountModal}
            />
            <SortToggle
              sortBy={filters.sortBy}
              direction={filters.sortDirection}
              onToggleSort={filters.handleToggleSort}
              onToggleDirection={filters.handleToggleDirection}
            />
          </>
        }
        fab={
          <Fab
            onPress={() => navigation.navigate('AddTransaction', { type: route.params?.type })}
            accessibilityLabel={labels.home_add}
          />
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  categoryInfo: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryName: { fontWeight: '600' },
  categoryTotal: { fontWeight: '700' },
  categoryPeriod: { marginTop: 2, textAlign: 'center' },
});
