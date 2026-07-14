import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { Account, Category, Transaction } from '../database/types';
import { Period, TransactionType, CategoryWithTotal } from '../constants/types';
import { accountRepository as accountRepo } from '../database';
import { categoryRepository as categoryRepo } from '../database';
import { transactionRepository as transactionRepo } from '../database';
import { useConfig } from './ConfigContext';
import { getCategoryName } from '../i18n';

interface AppState {
  activeAccount: Account | null;
  activeType: TransactionType;
  activePeriod: Period;
  selectedDate: Date;
  customDate: { start: Date; end: Date };
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
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
  accountsWithBalance: (Account & { saldo: number })[];
  totalIncome: number;
  totalExpenses: number;
  totalIncomeAll: number;
  totalExpensesAll: number;
  refresh: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
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
    case 'custom': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }
}

function formatDateForDB(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { config } = useConfig();
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [activePeriod, setActivePeriod] = useState<Period>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDate, setCustomDateState] = useState<{ start: Date; end: Date }>(() => {
    const ahora = new Date();
    return { start: new Date(ahora.getFullYear(), 0, 1), end: ahora };
  });
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [accountsData, categoriesData] = await Promise.all([
        accountRepo.list(USER_ID),
        categoryRepo.list(USER_ID),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData);
      if (accountsData.length > 0) {
        setActiveAccount(accountsData[0]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!activeAccount) return;
    async function loadTransactions() {
      const dates = activePeriod === 'custom'
        ? customDate
        : calculateStartEnd(activePeriod, selectedDate);

      const data = await transactionRepo.list({
        account_id: activeAccount!.id,
        start_date: formatDateForDB(dates.start),
        end_date: formatDateForDB(dates.end),
      });
      setTransactions(data);
    }
    loadTransactions();
  }, [activeAccount, activePeriod, selectedDate, customDate]);

  const dates = useMemo(
    () => activePeriod === 'custom'
      ? customDate
      : calculateStartEnd(activePeriod, selectedDate),
    [activePeriod, customDate, selectedDate],
  );

  const filteredTransactions = useMemo(
    () => transactions.filter(t => {
      if (activeType && t.type !== activeType) return false;
      return true;
    }),
    [transactions, activeType],
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
      const [income, expenses] = await Promise.all([
        transactionRepo.totalByPeriod(activeAccount!.id, 'income', '1900-01-01', '2100-12-31'),
        transactionRepo.totalByPeriod(activeAccount!.id, 'expense', '1900-01-01', '2100-12-31'),
      ]);
      setTotalIncomeAll(income);
      setTotalExpensesAll(expenses);
    }
    loadAllTotals();
  }, [activeAccount, transactions]);

  const [accountsWithBalance, setAccountsWithBalance] = useState<(Account & { saldo: number })[]>([]);

  useEffect(() => {
    async function calculateBalances() {
      const results = await Promise.all(
        accounts.map(async (account) => {
          const saldo = await accountRepo.getCurrentBalance(account.id);
          return { ...account, saldo };
        })
      );
      setAccountsWithBalance(results);
    }
    if (accounts.length > 0) {
      calculateBalances();
    }
  }, [accounts, transactions]);

  const activeCategories = useMemo(() => {
    const categoriesByType = categories.filter(c => c.type === activeType);
    const totalByType = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    return categoriesByType.map(cat => {
      const total = filteredTransactions
        .filter(t => t.category_id === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        id: cat.id,
        name: getCategoryName(cat.id) || cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        total,
        percentage: totalByType > 0 ? (total / totalByType) * 100 : 0,
      };
    }).filter(cat => cat.total > 0);
  }, [categories, activeType, filteredTransactions, config.language]);

  const refresh = useCallback(async () => {
    if (!activeAccount) return;
    const dates = activePeriod === 'custom'
      ? customDate
      : calculateStartEnd(activePeriod, selectedDate);
    const data = await transactionRepo.list({
      account_id: activeAccount.id,
      start_date: formatDateForDB(dates.start),
      end_date: formatDateForDB(dates.end),
    });
    setTransactions(data);
  }, [activeAccount, activePeriod, selectedDate, customDate]);

  const refreshCategories = useCallback(async () => {
    const categoriesData = await categoryRepo.list(USER_ID);
    setCategories(categoriesData);
  }, []);

  const refreshAccounts = useCallback(async () => {
    const accountsData = await accountRepo.list(USER_ID);
    setAccounts(accountsData);
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
  }), [
    activeAccount, activeType, activePeriod, selectedDate, customDate,
    accounts, categories, transactions, loading,
    filteredTransactions, activeCategories, accountsWithBalance,
    totalIncome, totalExpenses, totalIncomeAll, totalExpensesAll,
    refresh, refreshAccounts, refreshCategories,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
