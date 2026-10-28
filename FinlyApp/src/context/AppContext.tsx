import { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { AppState as RNAppState } from 'react-native';
import type { Account, Category, Transaction, Tag } from '../database/types';
import { TRANSACTION_TYPES, UNTAGGED_ID, type FirstDay, type Period, type TransactionType, type CategoryWithTotal, DATE_MIN, DATE_MAX, USER_ID } from '../constants/types';
import { accountRepository as accountRepo, categoryRepository as categoryRepo, transactionRepository as transactionRepo, tagRepository as tagRepo } from '../database';
import { materializeDueRecurring } from '../database/recurringService';
import { isTotalAccount } from '../database/helpers';
import { matchesTagFilter, toggleTagInArray } from '../utils/tagFilter';
import { categoriesOfType } from '../utils/categoryUtils';
import { useConfig, type Config } from './ConfigContext';
import { formatDateForDB, resolvePeriodRange, endOfDay } from '../utils/formatters';
import { ERROR_PREFIXES, logError, showErrorAlert } from '../utils/errors';

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
  loadError: boolean;
  categoriesById: Map<number, Category>;
}

export interface ResetAllOptions {
  /** Show the generic reset-failure alert. Defaults to true. */
  notifyOnError?: boolean;
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
  refresh: () => void;
  retryInitialLoad: () => Promise<void>;
  refreshAccounts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshTags: () => Promise<void>;
  resetAll: (options?: ResetAllOptions) => Promise<boolean>;
  dataRefreshing: boolean;
  setDataRefreshing: (refreshing: boolean) => void;
  activeTagIds: number[];
  toggleTagId: (id: number) => void;
  clearTagFilter: () => void;
  tagsByTransaction: Map<number, number[]>;
}

const AppContext = createContext<AppContextType | null>(null);

function defaultCustomDate(): { start: Date; end: Date } {
  const now = new Date();
  // The whole of today belongs to the range: an end at "now" would hide transactions
  // recorded later today (the built-in periods already use end-of-day).
  return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(now) };
}

async function fetchTransactionsAndTags(
  account: Account,
  period: Period,
  date: Date,
  customDateRange: { start: Date; end: Date },
  firstDay: FirstDay,
): Promise<{ data: Transaction[]; tagMap: Map<number, number[]> }> {
  const dates = resolvePeriodRange(period, date, customDateRange, firstDay);
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
  const { config: appConfig, loading: configLoading } = useConfig();
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [activeType, setActiveType] = useState<TransactionType>(TRANSACTION_TYPES.expense);
  const [activePeriod, setActivePeriod] = useState<Period>(appConfig.homeDefaultPeriod);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [customDate, setCustomDateState] = useState<{ start: Date; end: Date }>(defaultCustomDate);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeTagIds, setActiveTagIds] = useState<number[]>([]);
  const [tagsByTransaction, setTagsByTransaction] = useState<Map<number, number[]>>(new Map());
  const [transactionsVersion, setTransactionsVersion] = useState(0);
  const [dataRefreshing, setDataRefreshing] = useState(false);

  const categoriesById = useMemo(
    () => new Map(categories.map(cat => [cat.id, cat])),
    [categories],
  );

  const configRef = useRef(appConfig);
  configRef.current = appConfig;
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;
  const activeAccountRef = useRef(activeAccount);
  activeAccountRef.current = activeAccount;
  const defaultsRef = useRef({
    id: appConfig.homeDefaultAccountId,
    period: appConfig.homeDefaultPeriod,
  });
  const bootstrapDone = useRef(false);
  const loadRequestId = useRef(0);

  const applyHomeDefaults = useCallback((
    accountsData: Account[],
    cfg: Config = configRef.current,
    { preservePeriod = false }: { preservePeriod?: boolean } = {},
  ) => {
    if (accountsData.length === 0) return;
    if (cfg.homeDefaultAccountId !== null) {
      const found = accountsData.find(a => a.id === cfg.homeDefaultAccountId);
      setActiveAccount(found ?? accountsData[0]);
    } else {
      setActiveAccount(accountsData[0]);
    }
    if (!preservePeriod) setActivePeriod(cfg.homeDefaultPeriod);
  }, []);

  // One startup pass: materialize recurring rules and load the reference data.
  // Home-default changes must not repeat this work (and must not re-materialize).
  const loadInitialData = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setLoading(true);
    setLoadError(false);
    try {
      try {
        await materializeDueRecurring();
      } catch (error) {
        logError(ERROR_PREFIXES.recurringMaterialize, error);
      }
      const [accountsData, categoriesData, tagsData] = await Promise.all([
        accountRepo.list(USER_ID),
        categoryRepo.list(USER_ID),
        tagRepo.list(USER_ID),
      ]);
      if (requestId !== loadRequestId.current) return;
      const cfg = configRef.current;
      setAccounts(accountsData);
      setCategories(categoriesData);
      setTags(tagsData);
      applyHomeDefaults(accountsData, cfg);
      defaultsRef.current = { id: cfg.homeDefaultAccountId, period: cfg.homeDefaultPeriod };
      bootstrapDone.current = true;
    } catch (error) {
      if (requestId !== loadRequestId.current) return;
      logError(ERROR_PREFIXES.initialDataLoad, error);
      setLoadError(true);
      showErrorAlert();
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [applyHomeDefaults]);

  useEffect(() => {
    if (configLoading) return;
    loadInitialData();
    return () => { loadRequestId.current += 1; };
  }, [configLoading, loadInitialData]);

  // Apply a later Home-default change without reloading reference data.
  useEffect(() => {
    if (configLoading || !bootstrapDone.current) return;
    const previous = defaultsRef.current;
    if (
      previous.id === appConfig.homeDefaultAccountId
      && previous.period === appConfig.homeDefaultPeriod
    ) return;
    defaultsRef.current = { id: appConfig.homeDefaultAccountId, period: appConfig.homeDefaultPeriod };
    applyHomeDefaults(accountsRef.current, configRef.current);
  }, [appConfig.homeDefaultAccountId, appConfig.homeDefaultPeriod, configLoading, applyHomeDefaults]);

  // Keep the active account valid after an account is deleted or data is reloaded.
  useEffect(() => {
    const current = activeAccountRef.current;
    if (!current) return;
    if (accounts.some(account => account.id === current.id)) return;
    applyHomeDefaults(accounts, configRef.current, { preservePeriod: true });
  }, [accounts, applyHomeDefaults]);

  useEffect(() => {
    if (!activeAccount) return;
    const account = activeAccount;
    let active = true;
    async function refreshAll() {
      try {
        const isTotal = isTotalAccount(account);
        const accountId = isTotal ? null : account.id;
        const nonTotal = accounts.filter(a => !isTotalAccount(a));

        const [{ data, tagMap }, [income, expenses], balancesResult] = await Promise.all([
          fetchTransactionsAndTags(account, activePeriod, selectedDate, customDate, appConfig.firstDayOfWeek),
          Promise.all([
            transactionRepo.totalByPeriod(accountId, TRANSACTION_TYPES.income, DATE_MIN, DATE_MAX),
            transactionRepo.totalByPeriod(accountId, TRANSACTION_TYPES.expense, DATE_MIN, DATE_MAX),
          ]),
          accountRepo.getBalances(),
        ]);
        if (!active) return;

        setTransactions(data);
        setTagsByTransaction(tagMap);
        setTotalIncomeAll(income);
        setTotalExpensesAll(expenses);

        const balanceById = new Map(balancesResult.map(b => [b.account_id, b.balance]));
        const totalBalance = nonTotal.reduce((sum, a) => sum + (balanceById.get(a.id) ?? 0), 0);
        setAccountsWithBalance(
          accounts.map((a) =>
            isTotalAccount(a)
              ? { ...a, balance: totalBalance }
              : { ...a, balance: balanceById.get(a.id) ?? 0 },
          ),
        );
      } catch (error) {
        logError(ERROR_PREFIXES.dataRefresh, error);
      }
    }
    refreshAll();
    return () => { active = false; };
  }, [activeAccount, activePeriod, selectedDate, customDate, accounts, transactionsVersion, appConfig.firstDayOfWeek]);
  const filteredTransactions = useMemo(
    () => {
      let result = transactions.filter(t => {
        if (activeType && t.type !== activeType) return false;
        return true;
      });
      if (activeTagIds.length > 0) {
        result = result.filter(t => matchesTagFilter(activeTagIds, tagsByTransaction.get(t.id) ?? []));
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

  const [accountsWithBalance, setAccountsWithBalance] = useState<(Account & { balance: number })[]>([]);

  const activeCategories = useMemo(() => {
    const categoriesByType = categoriesOfType(categories, activeType);
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

  const refresh = useCallback(() => {
    setTransactionsVersion(v => v + 1);
  }, []);

  // Materialize recurring occurrences when the app returns to the foreground.
  useEffect(() => {
    const subscription = RNAppState.addEventListener('change', state => {
      if (state !== 'active') return;
      materializeDueRecurring()
        .then(() => setTransactionsVersion(v => v + 1))
        .catch(error => logError(ERROR_PREFIXES.recurringMaterialize, error));
    });
    return () => subscription.remove();
  }, []);

  // Materialize recurring occurrences when the app stays open across midnight.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1, 0);
      timer = setTimeout(() => {
        materializeDueRecurring()
          .then(() => setTransactionsVersion(v => v + 1))
          .catch(error => logError(ERROR_PREFIXES.recurringMaterialize, error))
          .finally(schedule);
      }, nextMidnight.getTime() - now.getTime());
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const categoriesData = await categoryRepo.list(USER_ID);
      setCategories(categoriesData);
    } catch (error) {
      logError(ERROR_PREFIXES.categoriesRefresh, error);
      showErrorAlert();
    }
  }, []);

  const refreshAccounts = useCallback(async () => {
    try {
      const accountsData = await accountRepo.list(USER_ID);
      setAccounts(accountsData);
      setActiveAccount(prev => {
        if (prev) {
          const fresh = accountsData.find(a => a.id === prev.id);
          if (fresh) return fresh;
        }
        if (accountsData.length === 0) return null;
        if (appConfig.homeDefaultAccountId !== null) {
          const found = accountsData.find(a => a.id === appConfig.homeDefaultAccountId);
          if (found) return found;
        }
        return accountsData[0];
      });
      setTransactionsVersion(v => v + 1);
    } catch (error) {
      logError(ERROR_PREFIXES.accountsRefresh, error);
      showErrorAlert();
    }
  }, [appConfig.homeDefaultAccountId]);

  const refreshTags = useCallback(async () => {
    try {
      const tagsData = await tagRepo.list(USER_ID);
      setTags(tagsData);
      setActiveTagIds(prev => {
        const next = prev.filter(id => id === UNTAGGED_ID || tagsData.some(tag => tag.id === id));
        return next.length === prev.length ? prev : next;
      });
    } catch (error) {
      logError(ERROR_PREFIXES.tagsRefresh, error);
      showErrorAlert();
    }
  }, []);

  const resetAll = useCallback(async (options: ResetAllOptions = {}) => {
    const notifyOnError = options.notifyOnError ?? true;
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
      setCustomDateState(defaultCustomDate());
      setTransactionsVersion(v => v + 1);
      return true;
    } catch (error) {
      logError(ERROR_PREFIXES.dataReset, error);
      if (notifyOnError) showErrorAlert();
      return false;
    }
  }, [applyHomeDefaults]);

  const toggleTagId = useCallback((id: number) => {
    setActiveTagIds(prev => toggleTagInArray(prev, id));
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
    loadError,
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
    retryInitialLoad: loadInitialData,
    refreshAccounts,
    refreshCategories,
    refreshTags,
    resetAll,
    dataRefreshing,
    setDataRefreshing,
    activeTagIds,
    toggleTagId,
    clearTagFilter,
    tagsByTransaction,
    categoriesById,
  }), [
    activeAccount, activeType, activePeriod, selectedDate, customDate,
    accounts, categories, transactions, tags, loading, dataRefreshing, categoriesById,
    loadError,
    filteredTransactions, activeCategories, accountsWithBalance,
    totalIncome, totalExpenses, totalIncomeAll, totalExpensesAll,
    refresh, loadInitialData, refreshAccounts, refreshCategories, refreshTags, resetAll,
    activeTagIds, toggleTagId, clearTagFilter, tagsByTransaction,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
