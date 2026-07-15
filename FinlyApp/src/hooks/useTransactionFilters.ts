import { useState, useMemo, useEffect } from 'react';
import { Transaction } from '../database/types';
import { transactionRepository } from '../database';
import { SortBy, SortDirection } from '../components/SortToggle';

interface UseTransactionFiltersOptions {
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  selectedAccountId: number;
  sortBy: SortBy;
  sortDirection: SortDirection;
  refreshTrigger?: number;
}

interface UseTransactionFiltersResult {
  allTransactions: Transaction[];
  filtered: Transaction[];
  sections: { date: string; data: Transaction[] }[];
}

export function useTransactionFilters({
  categoryId,
  startDate,
  endDate,
  selectedAccountId,
  sortBy,
  sortDirection,
  refreshTrigger,
}: UseTransactionFiltersOptions): UseTransactionFiltersResult {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const filters: { category_id?: number; start_date?: string; end_date?: string } = {};
      if (categoryId) filters.category_id = categoryId;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      const data = await transactionRepository.list(filters);
      if (!cancelled) setAllTransactions(data);
    }
    load();
    return () => { cancelled = true; };
  }, [categoryId, startDate, endDate, refreshTrigger]);

  const filtered = useMemo(() => {
    let list = allTransactions.filter(t => t.account_id === selectedAccountId);
    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDirection === 'desc' ? -diff : diff;
      }
      const diff = a.amount - b.amount;
      return sortDirection === 'desc' ? -diff : diff;
    });
    return sorted;
  }, [allTransactions, selectedAccountId, sortBy, sortDirection]);

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

  return { allTransactions, filtered, sections };
}
