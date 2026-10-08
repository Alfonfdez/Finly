import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { useConfig } from '../context/ConfigContext';
import { t } from '../i18n';
import { LIST_BOTTOM_FAB_PADDING } from '../constants/layout';
import type { IconName } from '../constants/types';
import type { Account, Category, Tag, Transaction } from '../database/types';
import type { useTransactionListScreen } from '../hooks/useTransactionListScreen';
import type { useSelectAndSearch } from '../hooks/useSelectAndSearch';
import AccountModal from './AccountModal';
import TagFilterBar from './TagFilterBar';
import ScreenSearchBar from './ScreenSearchBar';
import EmptyState, { emptyStateProps } from './EmptyState';
import SelectionActionBar from './SelectionActionBar';
import BulkDeleteConfirmationModal from './BulkDeleteConfirmationModal';
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
    filters, keyExtractor, handleTransactionPress,
    deleteModalVisible, openDeleteModal, closeDeleteModal, confirmBulkDelete,
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
    />
  ), [categoriesById, filters.tagsByTransaction, recurringNames, handleTransactionPress, selectMode, selectedIds]);

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

      {!loading && filters.sections.length === 0 ? (
        <View style={styles.emptyList}>
          <EmptyState {...emptyStateProps(isSearching, emptyIcon, emptyMessage)} />
        </View>
      ) : (
        <SectionList
          contentContainerStyle={styles.listContent}
          sections={filters.sections}
          keyExtractor={keyExtractor}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyState icon={emptyIcon} message={emptyMessage} />}
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

      <BulkDeleteConfirmationModal
        visible={deleteModalVisible}
        title={labels.transactions_bulk_delete_confirm_title(selectedIds.size)}
        message={labels.transactions_bulk_delete_confirm_message}
        confirmLabel={labels.delete}
        cancelLabel={labels.cancel}
        onConfirm={confirmBulkDelete}
        onCancel={closeDeleteModal}
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
  listContent: { ...LIST_BOTTOM_FAB_PADDING },
  emptyList: { flex: 1 },
  tagFilter: { marginTop: 12 },
});
