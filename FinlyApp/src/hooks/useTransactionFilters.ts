import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Transaction, Account, Category, Tag } from '../database/types';
import { SORT_BY, SORT_DIRECTIONS, TYPE_FILTERS, RECURRING_VIEWS, TRANSACTION_SORT_SCOPES, UNTAGGED_ID, type SortBy, type SortDirection, type TransactionTypeFilter, type RecurringView, type TransactionSortScope } from '../constants/types';
import { useConfig } from '../context/ConfigContext';
import { nextSortPreference, toggleSortDirection } from '../utils/sortPreference';
import { transactionRepository } from '../database';
import { isTotalAccount } from '../database/helpers';
import { formatDateForDB } from '../utils/formatters';
import { buildTagsByTransactionMap, type TagsByTransaction } from '../utils/transactionTags';
import { matchesTransactionSearch } from '../utils/transactionSearch';
import { matchesTagFilter, toggleTagInArray } from '../utils/tagFilter';

export interface UseTransactionFiltersOptions {
  transactions: Transaction[];
  accounts: Account[];
  activeAccount: Account | null;
  categoriesById?: Map<number, Category>;
  recurringNames?: Map<number, string>;
  tags?: Tag[];
  tagsLoaded?: boolean;
  searchTerm?: string;
  initialTagIds?: number[];
  typeTab?: TransactionTypeFilter;
  selectedCategoryIds?: number[];
  periodDates?: { start: Date; end: Date } | null;
  onError?: () => void;
  /** Which transaction list owns the persisted sort preference. */
  sortScope: TransactionSortScope;
}

export function useTransactionFilters({
  transactions,
  accounts,
  activeAccount,
  categoriesById = new Map(),
  recurringNames = new Map(),
  tags,
  tagsLoaded = true,
  searchTerm = '',
  initialTagIds = [],
  typeTab,
  selectedCategoryIds = [],
  periodDates,
  onError,
  sortScope,
}: UseTransactionFiltersOptions) {
  const { config, updateConfig } = useConfig();
  const [selectedAccountId, setSelectedAccountId] = useState(
    () => activeAccount?.id ?? accounts.find(a => !isTotalAccount(a))?.id,
  );

  const activeAccountId = activeAccount?.id;
  useEffect(() => {
    if (activeAccountId !== undefined) {
      setSelectedAccountId(activeAccountId);
    }
  }, [activeAccountId]);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const usesOwnPreferences = sortScope === TRANSACTION_SORT_SCOPES.transactions;
  const sortBy = usesOwnPreferences ? config.transactionsSortBy : config.allTransactionsSortBy;
  const sortDirection = usesOwnPreferences ? config.transactionsSortDirection : config.allTransactionsSortDirection;
  const recurringView = usesOwnPreferences ? config.transactionsRecurringView : config.allTransactionsRecurringView;
  const setRecurringView = useCallback((value: RecurringView) => {
    updateConfig(usesOwnPreferences
      ? { transactionsRecurringView: value }
      : { allTransactionsRecurringView: value });
  }, [usesOwnPreferences, updateConfig]);
  const [tagsByTransaction, setTagsByTransaction] = useState<TagsByTransaction>(new Map());
  const [localTagIds, setLocalTagIds] = useState<number[]>(initialTagIds);

  // Re-navigating with a new tag selection (e.g. from the Home tag chips) must replace
  // the previous one: the params only seed the state, so keep them in sync by value.
  const initialTagKey = initialTagIds.join(',');
  useEffect(() => {
    setLocalTagIds(initialTagKey === '' ? [] : initialTagKey.split(',').map(Number));
  }, [initialTagKey]);

  // A deleted tag must not leave an invisible filter behind.
  useEffect(() => {
    if (!tags || !tagsLoaded) return;
    const validIds = new Set(tags.map(tag => tag.id));
    setLocalTagIds(prev => {
      const next = prev.filter(id => id === UNTAGGED_ID || validIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [tags, tagsLoaded]);

  const isTotal = useMemo(
    () => {
      const account = accounts.find(a => a.id === selectedAccountId);
      return account ? isTotalAccount(account) : false;
    },
    [accounts, selectedAccountId],
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
    })().catch(onError ?? (() => {}));
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onError is stable
  }, [transactions]);

  const handleToggleTag = useCallback((id: number) => {
    setLocalTagIds(prev => toggleTagInArray(prev, id));
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

    if (recurringView === RECURRING_VIEWS.recurring) {
      list = list.filter(t => t.recurring_rule_id != null);
    } else if (recurringView === RECURRING_VIEWS.oneTime) {
      list = list.filter(t => t.recurring_rule_id == null);
    }

    if (periodDates) {
      const startStr = formatDateForDB(periodDates.start);
      const endStr = formatDateForDB(periodDates.end);
      list = list.filter(t => t.date >= startStr && t.date <= endStr);
    }

    if (localTagIds.length > 0) {
      list = list.filter(tx => matchesTagFilter(localTagIds, (tagsByTransaction.get(tx.id) ?? []).map(t => t.tag_id)));
    }

    if (searchTerm.trim()) {
      const accountsById = new Map(accounts.map(acc => [acc.id, acc]));
      list = list.filter(tx =>
        matchesTransactionSearch(
          tx,
          {
            category: categoriesById.get(tx.category_id),
            tags: tagsByTransaction.get(tx.id),
            accountName: accountsById.get(tx.account_id)?.name,
            recurringName: tx.recurring_rule_id != null ? recurringNames.get(tx.recurring_rule_id) : undefined,
          },
          searchTerm,
        ),
      );
    }

    const sorted = [...list].sort((a, b) => {
      if (sortBy === SORT_BY.date) {
        // Fixed `YYYY-MM-DD HH:MM:SS` strings: lexicographic order is chronological.
        const diff = a.date.localeCompare(b.date);
        return sortDirection === SORT_DIRECTIONS.desc ? -diff : diff;
      }
      const diff = a.amount - b.amount;
      return sortDirection === SORT_DIRECTIONS.desc ? -diff : diff;
    });
    return sorted;
  }, [transactions, selectedAccountId, isTotal, typeTab, selectedCategoryIds, periodDates, recurringView, sortBy, sortDirection, localTagIds, tagsByTransaction, searchTerm, categoriesById, accounts, recurringNames]);

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

  const persistSort = useCallback((by: SortBy, direction: SortDirection) => {
    if (usesOwnPreferences) updateConfig({ transactionsSortBy: by, transactionsSortDirection: direction });
    else updateConfig({ allTransactionsSortBy: by, allTransactionsSortDirection: direction });
  }, [usesOwnPreferences, updateConfig]);

  const handleToggleSort = useCallback((field: SortBy) => {
    const next = nextSortPreference({ by: sortBy, direction: sortDirection }, field, () => SORT_DIRECTIONS.desc);
    persistSort(next.by, next.direction);
  }, [sortBy, sortDirection, persistSort]);

  const handleToggleDirection = useCallback(() => {
    persistSort(sortBy, toggleSortDirection(sortDirection));
  }, [sortBy, sortDirection, persistSort]);

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
    recurringView,
    setRecurringView,
    tagsByTransaction,
    localTagIds,
    handleToggleTag,
    handleClearTagFilter,
    filtered,
    sections,
  };
}
