import { useState, useMemo, useCallback, useEffect } from 'react';
import { Transaction, Account } from '../database/types';
import { TransactionType } from '../constants/types';
import { transactionRepository } from '../database';
import { formatDateForDB } from '../utils/formatters';
import { buildTagsByTransactionMap, TagsByTransaction } from '../utils/transactionTags';
import { SortBy, SortDirection } from '../components/SortToggle';

interface UseTransactionFiltersOptions {
  transactions: Transaction[];
  accounts: Account[];
  activeAccount: Account | null;
  initialTagIds?: number[];
  typeTab?: 'all' | TransactionType;
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
    () => activeAccount?.id ?? accounts.find(a => (a.is_total ?? 0) !== 1)?.id ?? 1
  );
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [tagsByTransaction, setTagsByTransaction] = useState<TagsByTransaction>(new Map());
  const [localTagIds, setLocalTagIds] = useState<number[]>(initialTagIds);

  const isTotal = useMemo(
    () => accounts.find(a => a.id === selectedAccountId)?.is_total === 1,
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

  const filtered = useMemo(() => {
    let list = isTotal
      ? [...transactions]
      : transactions.filter(t => t.account_id === selectedAccountId);

    if (typeTab && typeTab !== 'all') {
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
      setSortDirection(d => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  }, [sortBy]);

  const handleToggleDirection = useCallback(() => {
    setSortDirection(d => (d === 'desc' ? 'asc' : 'desc'));
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
