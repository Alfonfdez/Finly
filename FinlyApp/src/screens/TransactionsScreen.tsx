import { useMemo, useCallback } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { type RootStackParamList, type NavigationProp, TRANSACTION_TYPES } from '../constants/types';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatCurrency } from '../utils/formatters';
import { withAlpha } from '../utils/color';
import { showErrorAlert } from '../utils/errors';
import { getDisplayCategoryName, t } from '../i18n';
import AccountModal from '../components/AccountModal';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import { TransactionRow, TransactionDateHeader } from '../components/TransactionGroup';
import EmptyState from '../components/EmptyState';
import type { IconName } from '../components/IconGrid';

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'Transactions'>>();
  const route = useRoute<TransactionsRouteProp>();
  const { categories, categoriesById, accounts, activeAccount, accountsWithBalance, tags } = useApp();
  const { activeColors: c, config } = useConfig();
  const fs = useFontSize();
  const labels = t();

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

  const { data: allTransactions, loading } = useFocusLoad(loadTransactions, [] as Transaction[]);

  const filters = useTransactionFilters({
    transactions: allTransactions,
    accounts,
    activeAccount,
    initialTagIds: tagIds ?? [],
    onError: () => showErrorAlert(labels),
  });

  const category = categories.find(ct => ct.id === categoryId);

  const categoryTotal = useMemo(() => {
    return filters.filtered
      .reduce((sum, t) => sum + (t.type === TRANSACTION_TYPES.expense ? -t.amount : t.amount), 0);
  }, [filters.filtered]);

  const handleTransactionPress = useCallback((id: number) => {
    navigation.navigate('TransactionDetails', { transactionId: id });
  }, [navigation]);

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
    />
  ), [categoriesById, filters.tagsByTransaction, handleTransactionPress]);

  return (
    <ScreenShell>
      {category && (
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
            {categoryTotal >= 0 ? '+' : ''}{formatCurrency(categoryTotal, config.currency, config.decimalSeparator)}
          </Text>
        </View>
      )}

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
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
      </View>

      <TagFilterBar
        tags={tags}
        activeTagIds={filters.localTagIds}
        onToggle={filters.handleToggleTag}
        onClear={filters.handleClearTagFilter}
        style={styles.tagFilter}
      />

      {!loading && filters.sections.length === 0 ? (
        <EmptyState message={labels.transactions_empty} />
      ) : (
      <SectionList
        contentContainerStyle={styles.listContent}
        sections={filters.sections}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState message={labels.transactions_empty} />
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
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  listContent: { paddingBottom: 80 },
  tagFilter: { marginTop: 12 },
});
