import { useMemo, useCallback } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import ScreenShell from '../components/ScreenShell';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useConfig } from '../context/ConfigContext';
import { useFontSize } from '../hooks/useFontSize';
import { useFocusLoad } from '../hooks/useFocusLoad';
import { useSelectableScreen } from '../hooks/useSelectableScreen';
import { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import { PERIODS, type RootStackParamList, type NavigationProp, type IconName } from '../constants/types';
import { LIST_BOTTOM_FAB_PADDING } from '../constants/layout';
import type { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { formatSignedCurrency, formatDateLong, parseDbDate, getMonthName } from '../utils/formatters';
import { netTransactionTotal } from '../utils/calculator';
import { withAlpha } from '../utils/color';
import { showErrorAlert } from '../utils/errors';
import { getDisplayCategoryName, t } from '../i18n';
import AccountModal from '../components/AccountModal';
import AccountTrigger from '../components/AccountTrigger';
import SortToggle from '../components/SortToggle';
import TagFilterBar from '../components/TagFilterBar';
import { TransactionRow, TransactionDateHeader } from '../components/TransactionGroup';
import EmptyState from '../components/EmptyState';
import Fab from '../components/Fab';
import SelectionActionBar from '../components/SelectionActionBar';
import BulkDeleteConfirmationModal from '../components/BulkDeleteConfirmationModal';
import SelectSearchHeader from '../components/SelectSearchHeader';
import ScreenSearchBar from '../components/ScreenSearchBar';

type TransactionsRouteProp = RouteProp<RootStackParamList, 'Transactions'>;

export default function TransactionsScreen() {
  const navigation = useNavigation<NavigationProp<'Transactions'>>();
  const route = useRoute<TransactionsRouteProp>();
  const { categories, categoriesById, accounts, activeAccount, accountsWithBalance, tags, refresh } = useApp();
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

  const { data: allTransactions, setData, loading } = useFocusLoad(loadTransactions, [] as Transaction[]);

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
    setTransactions: setData,
    filters: {
      transactions: allTransactions,
      accounts,
      activeAccount,
      categoriesById,
      initialTagIds: tagIds ?? [],
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
            {formatSignedCurrency(categoryTotal, config.currency, config.decimalSeparator)}
          </Text>
          {periodLabel ? (
            <Text style={[styles.categoryPeriod, { color: c.textSecondary, fontSize: fs(13) }]}>
              {periodLabel}
            </Text>
          ) : null}
        </View>
      )}

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
        <View style={styles.emptyList}>
          <EmptyState
            icon={searchActive && !!searchText.trim() ? 'search-outline' : 'document-text-outline'}
            message={searchActive && !!searchText.trim() ? labels.filter_no_results : labels.transactions_empty}
          />
        </View>
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
          onPress={() => navigation.navigate('AddTransaction', { type: route.params?.type })}
          accessibilityLabel={labels.home_add}
        />
      )}

      <BulkDeleteConfirmationModal
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
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  listContent: { ...LIST_BOTTOM_FAB_PADDING },
  emptyList: { flex: 1 },
  tagFilter: { marginTop: 12 },
});
