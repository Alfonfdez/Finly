import { useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigationProp } from '../constants/types';
import type { Transaction } from '../database/types';
import { useBulkDelete } from './useBulkDelete';
import { useTransactionFilters, type UseTransactionFiltersOptions } from './useTransactionFilters';
import { ERROR_PREFIXES } from '../utils/errors';

interface UseTransactionListScreenOptions {
  navigation: NavigationProp<'Transactions'> | NavigationProp<'AllTransactions'>;
  selectMode: boolean;
  toggleItem: (id: number) => void;
  selectedIds: ReadonlySet<number>;
  exitSelectMode: () => void;
  searchText: string;
  loadTransactions: () => Promise<Transaction[]>;
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  filters: UseTransactionFiltersOptions;
  deleteFn: (ids: number[]) => Promise<unknown>;
  onAfterDelete?: () => void | Promise<void>;
}

export function useTransactionListScreen({
  navigation,
  selectMode,
  toggleItem,
  selectedIds,
  exitSelectMode,
  searchText,
  loadTransactions,
  setTransactions,
  filters: filtersOptions,
  deleteFn,
  onAfterDelete,
}: UseTransactionListScreenOptions) {
  const filters = useTransactionFilters({ ...filtersOptions, searchTerm: searchText });
  const visibleIds = useMemo(() => filters.filtered.map(transaction => transaction.id), [filters.filtered]);

  const afterDelete = useCallback(async () => {
    const updated = await loadTransactions();
    setTransactions(updated);
    await onAfterDelete?.();
  }, [loadTransactions, setTransactions, onAfterDelete]);

  const {
    deleteModalVisible, busy, openDeleteModal, closeDeleteModal, confirmBulkDelete,
  } = useBulkDelete({
    selectedIds,
    visibleIds,
    exitSelectMode,
    deleteFn,
    afterDelete,
    errorPrefix: ERROR_PREFIXES.transactionsDelete,
  });

  const handleTransactionPress = useCallback((id: number) => {
    if (selectMode) { toggleItem(id); return; }
    navigation.navigate('TransactionDetails', { transactionId: id });
  }, [navigation, selectMode, toggleItem]);

  const keyExtractor = useCallback((item: Transaction) => item.id.toString(), []);

  return {
    filters,
    deleteModalVisible, busy, openDeleteModal, closeDeleteModal, confirmBulkDelete,
    handleTransactionPress,
    keyExtractor,
  };
}
