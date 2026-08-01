import { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Account } from '../database/types';
import { SORT_BY, SORT_DIRECTIONS, TYPE_FILTERS, type SortBy, type SortDirection, type TransactionTypeFilter } from '../constants/types';
import { transactionRepository } from '../database';
import { isTotalAccount, UNTAGGED_ID } from '../database/helpers';
import { formatDateForDB } from '../utils/formatters';
import { buildTagsByTransactionMap, TagsByTransaction } from '../utils/transactionTags';

interface UseTransactionFiltersOptions {
  transactions: Transaction[];
  accounts: Account[];
  activeAccount: Account | null;
  initialTagIds?: number[];
  typeTab?: TransactionTypeFilter;
  selectedCategoryIds?: number[];
  periodDates?: { start: Date; end: Date } | null;
}

export function useTransactionFilters({
  transactions,
  accounts,
  activeAccount,
  initialTagIds = [],
  typeTab,
  selectedCategoryIds = [],
  periodDates,
}: UseTransactionFiltersOptions) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    () => activeAccount?.id ?? accounts.find(a => !isTotalAccount(a))?.id ?? 1
  );

  const activeAccountId = activeAccount?.id;
  useEffect(() => {
    if (activeAccountId !== undefined) {
      setSelectedAccountId(activeAccountId);
    }
  }, [activeAccountId]);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>(SORT_BY.date);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SORT_DIRECTIONS.desc);
  const [tagsByTransaction, setTagsByTransaction] = useState<TagsByTransaction>(new Map());
  const [localTagIds, setLocalTagIds] = useState<number[]>(initialTagIds);

  const isTotal = useMemo(
    () => {
      const account = accounts.find(a => a.id === selectedAccountId);
      return account ? isTotalAccount(account) : false;
    },
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    if (transactions.length === 0) {
      setTagsByTransaction(new Map());
      return;
    }
    let active = true;
    (async () => {
      const txIds = transactions.map(t => t.id);
      const tagLinks = await transactionRepository.getTagsByTransactionIds(txIds);
      if (!active) return;
      setTagsByTransaction(buildTagsByTransactionMap(tagLinks));
    })();
    return () => { active = false; };
  }, [transactions]);

  const handleToggleTag = useCallback((id: number) => {
    setLocalTagIds(prev => {
      if (id === UNTAGGED_ID) {
        return prev.includes(UNTAGGED_ID) ? [] : [UNTAGGED_ID];
      }
      if (prev.includes(UNTAGGED_ID)) {
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

  const filtered = useMemo(() => {
    let list = isTotal
      ? [...transactions]
      : transactions.filter(t => t.account_id === selectedAccountId);

    if (typeTab && typeTab !== TYPE_FILTERS.all) {
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
      const hasUntagged = localTagIds.includes(UNTAGGED_ID);
      const regularIds = localTagIds.filter(id => id !== UNTAGGED_ID);
      list = list.filter(tx => {
        const txTags = tagsByTransaction.get(tx.id) ?? [];
        if (hasUntagged && txTags.length === 0) return true;
        if (regularIds.length > 0 && regularIds.some(id => txTags.some(t => t.tag_id === id))) return true;
        return false;
      });
    }

    const sorted = [...list].sort((a, b) => {
      if (sortBy === SORT_BY.date) {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDirection === SORT_DIRECTIONS.desc ? -diff : diff;
      }
      const diff = a.amount - b.amount;
      return sortDirection === SORT_DIRECTIONS.desc ? -diff : diff;
    });
    return sorted;
  }, [transactions, selectedAccountId, isTotal, typeTab, selectedCategoryIds, periodDates, sortBy, sortDirection, localTagIds, tagsByTransaction]);

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

  const handleToggleSort = useCallback((field: SortBy) => {
    if (field === sortBy) {
      setSortDirection(d => (d === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc));
    } else {
      setSortBy(field);
      setSortDirection(SORT_DIRECTIONS.desc);
    }
  }, [sortBy]);

  const handleToggleDirection = useCallback(() => {
    setSortDirection(d => (d === SORT_DIRECTIONS.desc ? SORT_DIRECTIONS.asc : SORT_DIRECTIONS.desc));
  }, []);

  const openAccountModal = useCallback(() => setAccountModalVisible(true), []);
  const closeAccountModal = useCallback(() => setAccountModalVisible(false), []);
  const selectAccount = useCallback((id: number) => {
    setSelectedAccountId(id);
    setAccountModalVisible(false);
  }, []);

  return {
    selectedAccountId,
    isTotal,
    accountModalVisible,
    openAccountModal,
    closeAccountModal,
    selectAccount,
    sortBy,
    sortDirection,
    handleToggleSort,
    handleToggleDirection,
    tagsByTransaction,
    localTagIds,
    handleToggleTag,
    handleClearTagFilter,
    filtered,
    sections,
  };
}
