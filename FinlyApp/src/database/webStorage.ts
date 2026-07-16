import { User, Account, Category, Transaction } from './types';
import { TransactionType } from '../constants/types';
import { Config } from '../context/ConfigContext';

const STORAGE_PREFIX = '@Finly/';

function getStore<T>(key: string): T[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  return raw ? JSON.parse(raw) : [];
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function now(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// --- Initialization ---
export async function initWebStorage(): Promise<void> {
  const users = getStore<User>('users');
  if (users.length === 0) {
    seedWebData();
  }
}

function seedWebData(): void {
  const users: User[] = [{ id: 1, name: 'User', email: null, avatar: null, currency: '€', created_at: now() }];
  const accounts: Account[] = [
    { id: 1, user_id: 1, name: 'My Wallet', initial_balance: 0, icon: 'wallet-outline', color: '#22D3EE', created_at: now() },
  ];
  const categories: Category[] = [
    { id: 1, user_id: 1, name: 'Salary', icon: 'briefcase-outline', color: '#22D3EE', type: 'income', created_at: now() },
    { id: 2, user_id: 1, name: 'Freelance', icon: 'code-slash-outline', color: '#A78BFA', type: 'income', created_at: now() },
    { id: 3, user_id: 1, name: 'Investments', icon: 'trending-up-outline', color: '#34D399', type: 'income', created_at: now() },
    { id: 4, user_id: 1, name: 'Gift', icon: 'gift-outline', color: '#FB7185', type: 'income', created_at: now() },
    { id: 5, user_id: 1, name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'income', created_at: now() },
    { id: 6, user_id: 1, name: 'Food', icon: 'cart-outline', color: '#F87171', type: 'expense', created_at: now() },
    { id: 7, user_id: 1, name: 'Transport', icon: 'bus-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 8, user_id: 1, name: 'Leisure', icon: 'musical-notes-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 9, user_id: 1, name: 'Housing', icon: 'home-outline', color: '#60A5FA', type: 'expense', created_at: now() },
    { id: 10, user_id: 1, name: 'Health', icon: 'heart-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 11, user_id: 1, name: 'Travel', icon: 'airplane-outline', color: '#38BDF8', type: 'expense', created_at: now() },
    { id: 12, user_id: 1, name: 'Education', icon: 'school-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 13, user_id: 1, name: 'Family', icon: 'people-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 14, user_id: 1, name: 'Shopping', icon: 'bag-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 15, user_id: 1, name: 'Clothing', icon: 'shirt-outline', color: '#C084FC', type: 'expense', created_at: now() },
    { id: 16, user_id: 1, name: 'Exercise', icon: 'fitness-outline', color: '#22D3EE', type: 'expense', created_at: now() },
    { id: 17, user_id: 1, name: 'Entertainment', icon: 'film-outline', color: '#E879F9', type: 'expense', created_at: now() },
    { id: 18, user_id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'expense', created_at: now() },
  ];
  setStore('users', users);
  setStore('accounts', accounts);
  setStore('categories', categories);
  setStore('transactions', []);
}

// --- Repositories (web) ---

export const webUserRepo = {
  async create(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const items = getStore<User>('users');
    const item: User = { ...data, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('users', items);
    return item;
  },
  async getById(id: number): Promise<User | null> {
    return getStore<User>('users').find(u => u.id === id) ?? null;
  },
  async update(id: number, data: Partial<Omit<User, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<User>('users');
    const idx = items.findIndex(u => u.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('users', items);
  },
};

export const webAccountRepo = {
  async list(userId: number): Promise<Account[]> {
    return getStore<Account>('accounts')
      .filter(c => c.user_id === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
  async create(data: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
    const items = getStore<Account>('accounts');
    const item: Account = { ...data, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('accounts', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Account>('accounts');
    const idx = items.findIndex(c => c.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('accounts', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Account>('accounts');
    setStore('accounts', items.filter(c => c.id !== id));
    const transactions = getStore<Transaction>('transactions');
    setStore('transactions', transactions.filter(t => t.account_id !== id));
  },
  async getCurrentBalance(id: number): Promise<number> {
    const accounts = getStore<Account>('accounts');
    const transactions = getStore<Transaction>('transactions');
    const account = accounts.find(c => c.id === id);
    if (!account) return 0;
    const transactionBalance = transactions
      .filter(t => t.account_id === id)
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    return account.initial_balance + transactionBalance;
  },
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const items = getStore<Account>('accounts');
    const lower = name.toLowerCase();
    return items.some(a => {
      if (a.name.toLowerCase() !== lower) return false;
      if (excludeId !== undefined && a.id === excludeId) return false;
      return true;
    });
  },
};

export const webCategoryRepo = {
  async list(userId: number, type?: TransactionType): Promise<Category[]> {
    let items = getStore<Category>('categories').filter(c => c.user_id === userId);
    if (type) items = items.filter(c => c.type === type);
    return items.sort((a, b) => a.name.localeCompare(b.name));
  },
  async create(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const items = getStore<Category>('categories');
    const item: Category = { ...data, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('categories', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Category>('categories');
    const idx = items.findIndex(c => c.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('categories', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Category>('categories');
    setStore('categories', items.filter(c => c.id !== id));
    const transactions = getStore<Transaction>('transactions');
    setStore('transactions', transactions.filter(t => t.category_id !== id));
  },
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const items = getStore<Category>('categories');
    return items.some(c => {
      if (c.name !== name) return false;
      if (excludeId !== undefined && c.id === excludeId) return false;
      return true;
    });
  },
};

export const webTransactionRepo = {
  async list(filters: { account_id?: number; category_id?: number; type?: TransactionType; start_date?: string; end_date?: string } = {}): Promise<Transaction[]> {
    let items = getStore<Transaction>('transactions');
    if (filters.account_id !== undefined) items = items.filter(t => t.account_id === filters.account_id);
    if (filters.category_id !== undefined) items = items.filter(t => t.category_id === filters.category_id);
    if (filters.type !== undefined) items = items.filter(t => t.type === filters.type);
    if (filters.start_date !== undefined) items = items.filter(t => t.date >= filters.start_date!);
    if (filters.end_date !== undefined) items = items.filter(t => t.date <= filters.end_date!);
    return items.sort((a, b) => b.date.localeCompare(a.date));
  },
  async create(data: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const items = getStore<Transaction>('transactions');
    const item: Transaction = { ...data, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('transactions', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Transaction>('transactions');
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('transactions', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Transaction>('transactions');
    setStore('transactions', items.filter(t => t.id !== id));
  },
  async deleteByAccountId(accountId: number): Promise<void> {
    const items = getStore<Transaction>('transactions');
    setStore('transactions', items.filter(t => t.account_id !== accountId));
  },
  async totalByPeriod(accountId: number, type: TransactionType, startDate: string, endDate: string): Promise<number> {
    return getStore<Transaction>('transactions')
      .filter(t => t.account_id === accountId && t.type === type && t.date >= startDate && t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);
  },
  async breakdownByCategories(accountId: number, type: TransactionType, startDate: string, endDate: string): Promise<{ category_id: number; name: string; icon: string; color: string; total: number }[]> {
    const transactions = getStore<Transaction>('transactions')
      .filter(t => t.account_id === accountId && t.type === type && t.date >= startDate && t.date <= endDate);
    const categories = getStore<Category>('categories');
    const grouped = new Map<number, number>();
    for (const t of transactions) {
      grouped.set(t.category_id, (grouped.get(t.category_id) ?? 0) + t.amount);
    }
    return Array.from(grouped.entries())
      .map(([catId, total]) => {
        const cat = categories.find(c => c.id === catId);
        return { category_id: catId, name: cat?.name ?? '', icon: cat?.icon ?? '', color: cat?.color ?? '', total };
      })
      .sort((a, b) => b.total - a.total);
  },
  async reassignCategory(oldCategoryId: number, newCategoryId: number): Promise<void> {
    const items = getStore<Transaction>('transactions');
    const updated = items.map(t =>
      t.category_id === oldCategoryId ? { ...t, category_id: newCategoryId } : t
    );
    setStore('transactions', updated);
  },

  async searchComments(search: string): Promise<string[]> {
    const items = getStore<Transaction>('transactions');
    const lower = search.toLowerCase();
    return [...new Set(
      items
        .filter(t => t.description && t.description.toLowerCase().includes(lower))
        .map(t => t.description!)
    )].slice(0, 5);
  },
};

const CONFIG_DEFAULTS: Config = {
  theme: 'dark',
  firstDayOfWeek: 1,
  currency: '€',
  decimalSeparator: ',',
  language: 'en',
  textSize: 'medium',
  categoryIconShape: 'square',
  accountIconShape: 'square',
};

const CONFIG_KEY = '@Finly/config';

export const webConfigRepo = {
  async get(): Promise<Config> {
    if (typeof localStorage === 'undefined') return CONFIG_DEFAULTS;
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...CONFIG_DEFAULTS, ...JSON.parse(raw) } : CONFIG_DEFAULTS;
  },
  async save(partial: Partial<Config>): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const current = await this.get();
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...current, ...partial }));
  },
};
