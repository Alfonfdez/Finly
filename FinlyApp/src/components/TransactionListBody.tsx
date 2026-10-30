import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { View, SectionList, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { t } from '../i18n';
import { LIST_BOTTOM_FAB_PADDING } from '../constants/layout';
import { TEST_IDS } from '../constants/testIds';
import { SORT_BY, type IconName } from '../constants/types';
import type { Account, Category, Tag, Transaction } from '../database/types';
import type { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import type { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import AccountModal from './AccountModal';
import SelectAllRow from './SelectAllRow';
import TagFilterBar from './TagFilterBar';
import ScreenSearchBar from './ScreenSearchBar';
import EmptyState, { emptyStateProps } from './EmptyState';
import ListOrEmpty from './ListOrEmpty';
import SelectionActionBar from './SelectionActionBar';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { TransactionRow, TransactionDateHeader } from './TransactionGroup';

type ListController = ReturnType<typeof useTransactionListScreen>;
type SelectController = ReturnType<typeof useSelectAndSearch<number>>;

interface Props {
  /** Result of `useTransactionListScreen` (filters, list, delete modal). */
  list: ListController;
  /** Result of `useSelectAndSearch` (search + selection state). */
  select: SelectController;
  categoriesById: Map<number, Category>;
  recurringNames: Map<number, string>;
  loading: boolean;
  tags: Tag[];
  accountsWithBalance: (Account & { balance: number })[];
  onSelectAccount: (id: number) => void;
  emptyIcon: IconName;
  emptyMessage: string;
  header?: ReactNode;
  controls: ReactNode;
  period?: ReactNode;
  extraModals?: ReactNode;
  fab: ReactNode;
}

/**
 * Shared chrome for the transaction list screens: search bar, controls/period
 * slots, tag filter, the sectioned list (or empty state), the account modal,
 * the selection bar / FAB and the bulk-delete confirmation.
 */
export default function TransactionListBody({
  list, select, categoriesById, recurringNames, loading, tags, accountsWithBalance,
  onSelectAccount, emptyIcon, emptyMessage, header, controls, period, extraModals, fab,
}: Props) {
  const { activeColors: c } = useConfig();
  const labels = t();

  const {
    filters, visibleIds, keyExtractor, handleTransactionPress,
    deleteModalVisible, busy, openDeleteModal, closeDeleteModal, confirmBulkDelete,
  } = list;
  const {
    searchActive, searchText, setSearchText, closeSearch,
    selectMode, selectedIds, exitSelectMode,
  } = select;
  const isSearching = searchActive && !!searchText.trim();

  const renderItem = useCallback(({ item }: { item: Transaction }) => (
    <TransactionRow
      tx={item}
      category={categoriesById.get(item.category_id)}
      tags={filters.tagsByTransaction.get(item.id)}
      recurringName={item.recurring_rule_id != null ? recurringNames.get(item.recurring_rule_id) : undefined}
      onPress={handleTransactionPress}
      selectMode={selectMode}
      selected={selectedIds.has(item.id)}
      showDate={filters.sortBy === SORT_BY.amount}
    />
  ), [categoriesById, filters.tagsByTransaction, filters.sortBy, recurringNames, handleTransactionPress, selectMode, selectedIds]);

  const renderSectionHeader = useCallback(({ section }: { section: { date: string } }) => (
    <TransactionDateHeader date={section.date} />
  ), []);

  return (
    <>
      {header}

      <ScreenSearchBar
        visible={searchActive}
        placeholder={labels.transactions_search}
        value={searchText}
        onChangeText={setSearchText}
        onClose={closeSearch}
      />

      <View style={[styles.controls, { borderBottomColor: c.border }]}>
        {controls}
      </View>

      {period}

      <TagFilterBar
        tags={tags}
        activeTagIds={filters.localTagIds}
        onToggle={filters.handleToggleTag}
        onClear={filters.handleClearTagFilter}
        style={styles.tagFilter}
      />

      {selectMode && visibleIds.length > 0 && (
        <SelectAllRow
          allSelected={select.allSelected(visibleIds)}
          countLabel={labels.items_count(visibleIds.length)}
          selectAllLabel={labels.select_all}
          deselectAllLabel={labels.deselect_all}
          onToggle={() => select.toggleSelectAll(visibleIds)}
        />
      )}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator testID={TEST_IDS.listLoading} color={c.primary} />
        </View>
      ) : (
        <ListOrEmpty
          empty={filters.sections.length === 0}
          emptyState={<EmptyState {...emptyStateProps(isSearching, emptyIcon, emptyMessage)} />}
        >
          {filters.sortBy === SORT_BY.amount ? (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={filters.filtered}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              initialNumToRender={12}
              windowSize={7}
            />
          ) : (
            <SectionList
              contentContainerStyle={styles.listContent}
              sections={filters.sections}
              keyExtractor={keyExtractor}
              renderSectionHeader={renderSectionHeader}
              renderItem={renderItem}
              stickySectionHeadersEnabled={false}
              initialNumToRender={12}
              windowSize={7}
            />
          )}
        </ListOrEmpty>
      )}

      <AccountModal
        visible={filters.accountModalVisible}
        accounts={accountsWithBalance}
        selectedId={filters.selectedAccountId}
        onSelect={onSelectAccount}
        onClose={filters.closeAccountModal}
      />

      {extraModals}

      {selectMode ? (
        <SelectionActionBar
          selectedCount={selectedIds.size}
          deleteLabel={labels.transactions_bulk_delete(selectedIds.size)}
          cancelLabel={labels.cancel}
          onDelete={openDeleteModal}
          onCancel={exitSelectMode}
        />
      ) : (
        fab
      )}

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        title={labels.transactions_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.transactions_bulk_delete_confirm_message}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
        busy={busy}
      />
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { ...LIST_BOTTOM_FAB_PADDING },
  tagFilter: { marginTop: 12 },
});
