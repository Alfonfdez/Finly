import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Account, Category, Transaction, Tag } from '../database/types';
import { Period, TransactionType, CategoryWithTotal, DATE_MIN, DATE_MAX } from '../constants/types';
import { accountRepository as accountRepo, categoryRepository as categoryRepo, transactionRepository as transactionRepo, tagRepository as tagRepo } from '../database';
import { useConfig } from './ConfigContext';
import { getDisplayCategoryName } from '../i18n';
import { formatDateForDB } from '../utils/formatters';

interface AppState {
  activeAccount: Account | null;
  activeType: TransactionType;
  activePeriod: Period;
  selectedDate: Date;
  customDate: { start: Date; end: Date };
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  tags: Tag[];
  loading: boolean;
}

interface AppContextType extends AppState {
  selectAccount: (account: Account) => void;
  changeType: (type: TransactionType) => void;
  changePeriod: (period: Period) => void;
  setSelectedDate: (date: Date) => void;
  setCustomDate: (dates: { start: Date; end: Date }) => void;
  filteredTransactions: Transaction[];
  activeCategories: CategoryWithTotal[];
  accountsWithBalance: (Account & { balance: number })[];
  totalIncome: number;
  totalExpenses: number;
  totalIncomeAll: number;
  totalExpensesAll: number;
  refresh: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshTags: () => Promise<void>;
  resetAll: () => Promise<void>;
  activeTagIds: number[];
  toggleTagId: (id: number) => void;
  clearTagFilter: () => void;
  tagsByTransaction: Map<number, number[]>;
}

const AppContext = createContext<AppContextType | null>(null);

const USER_ID = 1;

function calculateStartEnd(period: Period, date: Date): { start: Date; end: Date } {
  switch (period) {
    case 'day': {
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'week': {
      const weekDay = date.getDay();
      const diff = weekDay === 0 ? 6 : weekDay - 1;
      const start = new Date(date);
      start.setDate(date.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'month': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case 'year': {
      const start = new Date(date.getFullYear(), 0, 1);
      const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    default: {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }
}

async function fetchTransactionsAndTags(
  account: Account,
  period: Period,
  date: Date,
  customDateRange: { start: Date; end: Date },
): Promise<{ data: Transaction[]; tagMap: Map<number, number[]> }> {
  const dates = period === 'custom'
    ? customDateRange
    : calculateStartEnd(period, date);
  const isTotal = (account.is_total ?? 0) === 1;
  const data = await transactionRepo.list({
    account_id: isTotal ? undefined : account.id,
    start_date: formatDateForDB(dates.start),
    end_date: formatDateForDB(dates.end),
  });

  const txnIds = data.map(t => t.id);
  const tagLinks = await transactionRepo.getTagsByTransactionIds(txnIds);
  const tagMap = new Map<number, number[]>();
  for (const t of data) {
    tagMap.set(t.id, []);
  }
  for (const link of tagLinks) {
    const existing = tagMap.get(link.transaction_id) ?? [];
    existing.push(link.tag_id);
    tagMap.set(link.transaction_id, existing);
  }
  return { data, tagMap };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { config: appConfig } = useConfig();
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [activePeriod, setActivePeriod] = useState<Period>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDate, setCustomDateState] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    return { start: new Date(now.getFullYear(), 0, 1), end: now };
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTagIds, setActiveTagIds] = useState<number[]>([]);
  const [tagsByTransaction, setTagsByTransaction] = useState<Map<number, number[]>>(new Map());

  const applyHomeDefaults = useCallback((accountsData: Account[]) => {
    if (accountsData.length > 0) {
      if (appConfig.homeDefaultAccountId !== null) {
        const found = accountsData.find(a => a.id === appConfig.homeDefaultAccountId);
        if (found) setActiveAccount(found);
        else setActiveAccount(accountsData[0]);
      } else {
        setActiveAccount(accountsData[0]);
      }
      if (appConfig.homeDefaultPeriod) {
        setActivePeriod(appConfig.homeDefaultPeriod);
      }
    }
  }, [appConfig.homeDefaultAccountId, appConfig.homeDefaultPeriod]);

  useEffect(() => {
    async function loadData() {
      try {
        const [accountsData, categoriesData, tagsData] = await Promise.all([
          accountRepo.list(USER_ID),
          categoryRepo.list(USER_ID),
          tagRepo.list(USER_ID),
        ]);
        setAccounts(accountsData);
        setCategories(categoriesData);
        setTags(tagsData);
        applyHomeDefaults(accountsData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [appConfig.homeDefaultAccountId, appConfig.homeDefaultPeriod, applyHomeDefaults]);

  useEffect(() => {
    if (!activeAccount) return;
    async function loadTransactions() {
      const { data, tagMap } = await fetchTransactionsAndTags(
        activeAccount, activePeriod, selectedDate, customDate,
      );
      setTransactions(data);
      setTagsByTransaction(tagMap);
    }
    loadTransactions();
  }, [activeAccount, activePeriod, selectedDate, customDate]);
  const filteredTransactions = useMemo(
    () => {
      let result = transactions.filter(t => {
        if (activeType && t.type !== activeType) return false;
        return true;
      });
      if (activeTagIds.length > 0) {
        const hasUntagged = activeTagIds.includes(-1);
        const regularIds = activeTagIds.filter(id => id !== -1);
        result = result.filter(t => {
          const txnTagIds = tagsByTransaction.get(t.id) ?? [];
          if (hasUntagged && txnTagIds.length === 0) return true;
          if (regularIds.length > 0 && regularIds.some(id => txnTagIds.includes(id))) return true;
          return false;
        });
      }
      return result;
    },
    [transactions, activeType, activeTagIds, tagsByTransaction],
  );

  const totalIncome = useMemo(
    () => filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions],
  );

  const totalExpenses = useMemo(
    () => filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions],
  );

  const [totalIncomeAll, setTotalIncomeAll] = useState(0);
  const [totalExpensesAll, setTotalExpensesAll] = useState(0);

  useEffect(() => {
    if (!activeAccount) return;
    async function loadAllTotals() {
      const isTotal = (activeAccount!.is_total ?? 0) === 1;
      const accountId = isTotal ? null : activeAccount!.id;
      const [income, expenses] = await Promise.all([
        transactionRepo.totalByPeriod(accountId, 'income', DATE_MIN, DATE_MAX),
        transactionRepo.totalByPeriod(accountId, 'expense', DATE_MIN, DATE_MAX),
      ]);
      setTotalIncomeAll(income);
      setTotalExpensesAll(expenses);
    }
    loadAllTotals();
  }, [activeAccount, transactions]);

  const [accountsWithBalance, setAccountsWithBalance] = useState<(Account & { balance: number })[]>([]);

  useEffect(() => {
    async function calculateBalances() {
      const nonTotal = accounts.filter(a => (a.is_total ?? 0) !== 1);
      const nonTotalBalances = await Promise.all(
        nonTotal.map(async (account) => {
          const balance = await accountRepo.getCurrentBalance(account.id);
          return { account, balance };
        })
      );
      const totalBalance = nonTotalBalances.reduce((sum, { balance }) => sum + balance, 0);

      const results = accounts.map((account) => {
        if ((account.is_total ?? 0) === 1) {
          return { ...account, balance: totalBalance };
        }
        const found = nonTotalBalances.find(b => b.account.id === account.id);
        return { ...account, balance: found?.balance ?? 0 };
      });
      setAccountsWithBalance(results);
    }
    if (accounts.length > 0) {
      calculateBalances();
    }
  }, [accounts, transactions]);

  const activeCategories = useMemo(() => {
    const categoriesByType = categories.filter(c => c.type === activeType);
    const totalByType = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const categoryTotals: Record<number, number> = {};
    for (const t of filteredTransactions) {
      categoryTotals[t.category_id] = (categoryTotals[t.category_id] ?? 0) + t.amount;
    }
    return categoriesByType
      .filter(cat => categoryTotals[cat.id] > 0)
      .map(cat => ({
        id: cat.id,
        name: getDisplayCategoryName(cat),
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        total: categoryTotals[cat.id],
        percentage: totalByType > 0 ? (categoryTotals[cat.id] / totalByType) * 100 : 0,
      }));
  }, [categories, activeType, filteredTransactions]);

  const refresh = useCallback(async () => {
    if (!activeAccount) return;
    const { data, tagMap } = await fetchTransactionsAndTags(
      activeAccount, activePeriod, selectedDate, customDate,
    );
    setTransactions(data);
    setTagsByTransaction(tagMap);
  }, [activeAccount, activePeriod, selectedDate, customDate]);

  const refreshCategories = useCallback(async () => {
    const categoriesData = await categoryRepo.list(USER_ID);
    setCategories(categoriesData);
  }, []);

  const refreshAccounts = useCallback(async () => {
    const accountsData = await accountRepo.list(USER_ID);
    setAccounts(accountsData);
  }, []);

  const refreshTags = useCallback(async () => {
    const tagsData = await tagRepo.list(USER_ID);
    setTags(tagsData);
  }, []);

  const resetAll = useCallback(async () => {
    try {
      const [accountsData, categoriesData, tagsData] = await Promise.all([
        accountRepo.list(USER_ID),
        categoryRepo.list(USER_ID),
        tagRepo.list(USER_ID),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setTags(tagsData);
      applyHomeDefaults(accountsData);
      setActiveTagIds([]);
      setTagsByTransaction(new Map());
      setSelectedDate(new Date());
      setCustomDateState({ start: new Date(new Date().getFullYear(), 0, 1), end: new Date() });
    } catch (error) {
      console.error('Failed to reset all data:', error);
    }
  }, [applyHomeDefaults]);

  const toggleTagId = useCallback((id: number) => {
    setActiveTagIds(prev => {
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

  const clearTagFilter = useCallback(() => {
    setActiveTagIds([]);
  }, []);

  const value: AppContextType = useMemo(() => ({
    activeAccount,
    activeType,
    activePeriod,
    selectedDate,
    customDate,
    accounts,
    categories,
    transactions,
    tags,
    loading,
    selectAccount: setActiveAccount,
    changeType: setActiveType,
    changePeriod: setActivePeriod,
    setSelectedDate,
    setCustomDate: setCustomDateState,
    filteredTransactions,
    activeCategories,
    accountsWithBalance,
    totalIncome,
    totalExpenses,
    totalIncomeAll,
    totalExpensesAll,
    refresh,
    refreshAccounts,
    refreshCategories,
    refreshTags,
    resetAll,
    activeTagIds,
    toggleTagId,
    clearTagFilter,
    tagsByTransaction,
  }), [
    activeAccount, activeType, activePeriod, selectedDate, customDate,
    accounts, categories, transactions, tags, loading,
    filteredTransactions, activeCategories, accountsWithBalance,
    totalIncome, totalExpenses, totalIncomeAll, totalExpensesAll,
    refresh, refreshAccounts, refreshCategories, refreshTags, resetAll,
    activeTagIds, toggleTagId, clearTagFilter, tagsByTransaction,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
