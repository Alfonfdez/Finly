import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Account, Category, Transaction, Tag } from '../database/types';
import { PERIODS, TRANSACTION_TYPES, type Period, type TransactionType, type CategoryWithTotal, DATE_MIN, DATE_MAX, USER_ID } from '../constants/types';
import { accountRepository as accountRepo, categoryRepository as categoryRepo, transactionRepository as transactionRepo, tagRepository as tagRepo } from '../database';
import { isTotalAccount, UNTAGGED_ID } from '../database/helpers';
import { useConfig } from './ConfigContext';
import { formatDateForDB, getPeriodRange } from '../utils/formatters';

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

async function fetchTransactionsAndTags(
  account: Account,
  period: Period,
  date: Date,
  customDateRange: { start: Date; end: Date },
): Promise<{ data: Transaction[]; tagMap: Map<number, number[]> }> {
  const dates = period === PERIODS.custom
    ? customDateRange
    : getPeriodRange(period, date);
  const isTotal = isTotalAccount(account);
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
  const [activeType, setActiveType] = useState<TransactionType>(TRANSACTION_TYPES.expense);
  const [activePeriod, setActivePeriod] = useState<Period>(PERIODS.day);
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
    const account = activeAccount;
    async function loadTransactions() {
      const { data, tagMap } = await fetchTransactionsAndTags(
        account, activePeriod, selectedDate, customDate,
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
        const hasUntagged = activeTagIds.includes(UNTAGGED_ID);
        const regularIds = activeTagIds.filter(id => id !== UNTAGGED_ID);
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
      .filter(t => t.type === TRANSACTION_TYPES.income)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions],
  );

  const totalExpenses = useMemo(
    () => filteredTransactions
      .filter(t => t.type === TRANSACTION_TYPES.expense)
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions],
  );

  const [totalIncomeAll, setTotalIncomeAll] = useState(0);
  const [totalExpensesAll, setTotalExpensesAll] = useState(0);

  useEffect(() => {
    if (!activeAccount) return;
    const account = activeAccount;
    async function loadAllTotals() {
      const isTotal = isTotalAccount(account);
      const accountId = isTotal ? null : account.id;
      const [income, expenses] = await Promise.all([
        transactionRepo.totalByPeriod(accountId, TRANSACTION_TYPES.income, DATE_MIN, DATE_MAX),
        transactionRepo.totalByPeriod(accountId, TRANSACTION_TYPES.expense, DATE_MIN, DATE_MAX),
      ]);
      setTotalIncomeAll(income);
      setTotalExpensesAll(expenses);
    }
    loadAllTotals();
  }, [activeAccount, transactions]);

  const [accountsWithBalance, setAccountsWithBalance] = useState<(Account & { balance: number })[]>([]);

  useEffect(() => {
    async function calculateBalances() {
      const nonTotal = accounts.filter(a => !isTotalAccount(a));
      const nonTotalBalances = await Promise.all(
        nonTotal.map(async (account) => {
          const balance = await accountRepo.getCurrentBalance(account.id);
          return { account, balance };
        })
      );
      const totalBalance = nonTotalBalances.reduce((sum, { balance }) => sum + balance, 0);

      const results = accounts.map((account) => {
        if (isTotalAccount(account)) {
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
        name: cat.name,
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
