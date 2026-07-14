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

function removeStore(key: string): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function now(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Migrate old Spanish localStorage keys to English
function migrateWebStorage(): void {
  const oldKeys = ['@Finly/usuarios', '@Finly/cuentas', '@Finly/categorias', '@Finly/transacciones', '@Finly/configuracion'];
  const newKeys = ['@Finly/users', '@Finly/accounts', '@Finly/categories', '@Finly/transactions', '@Finly/config'];
  const hasOldData = oldKeys.some(k => localStorage.getItem(k) !== null);

  if (!hasOldData) return;

  // Migrate users
  const oldUsers = JSON.parse(localStorage.getItem('@Finly/usuarios') || '[]');
  const users: User[] = oldUsers.map((u: any) => ({
    id: u.id, name: u.nombre, email: u.email, avatar: u.avatar, currency: u.moneda, created_at: u.created_at
  }));
  setStore('users', users);
  removeStore('usuarios');

  // Migrate accounts
  const oldAccounts = JSON.parse(localStorage.getItem('@Finly/cuentas') || '[]');
  const accounts: Account[] = oldAccounts.map((a: any) => ({
    id: a.id, user_id: a.usuario_id, name: a.nombre, initial_balance: a.saldo_inicial,
    icon: a.icono, color: a.color, created_at: a.created_at
  }));
  setStore('accounts', accounts);
  removeStore('cuentas');

  // Migrate categories
  const oldCategories = JSON.parse(localStorage.getItem('@Finly/categorias') || '[]');
  const categories: Category[] = oldCategories.map((c: any) => ({
    id: c.id, user_id: c.usuario_id, name: c.nombre, icon: c.icono, color: c.color,
    type: c.tipo === 'gasto' ? 'expense' : 'income', created_at: c.created_at
  }));
  setStore('categories', categories);
  removeStore('categorias');

  // Migrate transactions
  const oldTransactions = JSON.parse(localStorage.getItem('@Finly/transacciones') || '[]');
  const transactions: Transaction[] = oldTransactions.map((t: any) => ({
    id: t.id, account_id: t.cuenta_id, category_id: t.categoria_id,
    type: t.tipo === 'gasto' ? 'expense' : 'income',
    amount: t.cantidad, description: t.descripcion, date: t.fecha, created_at: t.created_at
  }));
  setStore('transactions', transactions);
  removeStore('transacciones');

  // Migrate config
  const oldConfig = localStorage.getItem('@Finly/configuracion');
  if (oldConfig) {
    const parsed = JSON.parse(oldConfig);
    const newConfig: Record<string, string> = {};
    const keyMap: Record<string, string> = {
      tema: 'theme', primerDiaSemana: 'first_day_of_week', divisa: 'currency',
      separadorDecimal: 'decimal_separator', idioma: 'language', tamanoTexto: 'text_size'
    };
    const valueMaps: Record<string, Record<string, string>> = {
      theme: { oscuro: 'dark', claro: 'light', sistema: 'system' },
      text_size: { pequeño: 'small', mediano: 'medium', grande: 'large' },
    };
    for (const [oldKey, val] of Object.entries(parsed)) {
      const newKey = keyMap[oldKey] ?? oldKey;
      const valueMap = valueMaps[newKey];
      newConfig[newKey] = valueMap?.[val as string] ?? val;
    }
    localStorage.setItem('@Finly/config', JSON.stringify(newConfig));
    removeStore('configuracion');
  }
}

// --- Initialization ---
export async function initWebStorage(): Promise<void> {
  migrateWebStorage();
  const users = getStore<User>('users');
  if (users.length === 0) {
    seedWebData();
  } else {
    migrateWebCategories();
  }
}

function migrateWebCategories(): void {
  const categories = getStore<Category>('categories');
  const existingIds = new Set(categories.map(c => c.id));

  const invalidIcons: Record<string, string> = {
    'gamepad-outline': 'game-controller-outline',
  };

  const iconById: Record<number, string> = {
    5: 'musical-notes-outline',
    10: 'game-controller-outline',
    23: 'wallet-outline',
  };

  let changed = false;
  const updated = categories.map(c => {
    let icon = c.icon;
    if (iconById[c.id]) icon = iconById[c.id];
    if (invalidIcons[icon]) icon = invalidIcons[icon];
    if (icon !== c.icon) changed = true;
    return { ...c, icon };
  });

  if (changed) {
    setStore('categories', updated);
  }

  const newCategories: Category[] = [
    { id: 9, user_id: 1, name: 'Travel', icon: 'airplane-outline', color: '#38BDF8', type: 'expense', created_at: now() },
    { id: 10, user_id: 1, name: 'Videogame', icon: 'game-controller-outline', color: '#A78BFA', type: 'expense', created_at: now() },
    { id: 11, user_id: 1, name: 'Game', icon: 'dice-outline', color: '#FB923C', type: 'expense', created_at: now() },
    { id: 12, user_id: 1, name: 'Restaurant', icon: 'restaurant-outline', color: '#F87171', type: 'expense', created_at: now() },
    { id: 13, user_id: 1, name: 'Education', icon: 'school-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 14, user_id: 1, name: 'Family', icon: 'people-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 15, user_id: 1, name: 'Shopping', icon: 'bag-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 16, user_id: 1, name: 'Clothing', icon: 'shirt-outline', color: '#C084FC', type: 'expense', created_at: now() },
    { id: 17, user_id: 1, name: 'Exercise', icon: 'fitness-outline', color: '#22D3EE', type: 'expense', created_at: now() },
    { id: 18, user_id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'expense', created_at: now() },
    { id: 19, user_id: 1, name: 'Entertainment', icon: 'film-outline', color: '#E879F9', type: 'expense', created_at: now() },
    { id: 20, user_id: 1, name: 'Gifts', icon: 'gift-outline', color: '#FB7185', type: 'expense', created_at: now() },
    { id: 21, user_id: 1, name: 'Gift', icon: 'gift-outline', color: '#FB7185', type: 'income', created_at: now() },
    { id: 22, user_id: 1, name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'income', created_at: now() },
    { id: 23, user_id: 1, name: 'Interests', icon: 'wallet-outline', color: '#4ADE80', type: 'income', created_at: now() },
  ];

  const toAdd = newCategories.filter(c => !existingIds.has(c.id));
  if (toAdd.length > 0) {
    const current = getStore<Category>('categories');
    setStore('categories', [...current, ...toAdd]);
  }
}

function seedWebData(): void {
  const users: User[] = [{ id: 1, name: 'Demo User', email: null, avatar: null, currency: '€', created_at: now() }];
  const accounts: Account[] = [
    { id: 1, user_id: 1, name: 'Cash', initial_balance: 0, icon: 'wallet-outline', color: '#22D3EE', created_at: now() },
    { id: 2, user_id: 1, name: 'Bank', initial_balance: 0, icon: 'business-outline', color: '#A78BFA', created_at: now() },
    { id: 3, user_id: 1, name: 'Savings', initial_balance: 0, icon: 'cash-outline', color: '#34D399', created_at: now() },
  ];
  const categories: Category[] = [
    { id: 1, user_id: 1, name: 'Salary', icon: 'briefcase-outline', color: '#22D3EE', type: 'income', created_at: now() },
    { id: 2, user_id: 1, name: 'Freelance', icon: 'code-slash-outline', color: '#A78BFA', type: 'income', created_at: now() },
    { id: 3, user_id: 1, name: 'Food', icon: 'cart-outline', color: '#F87171', type: 'expense', created_at: now() },
    { id: 4, user_id: 1, name: 'Transport', icon: 'bus-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 5, user_id: 1, name: 'Leisure', icon: 'musical-notes-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 6, user_id: 1, name: 'Housing', icon: 'home-outline', color: '#60A5FA', type: 'expense', created_at: now() },
    { id: 7, user_id: 1, name: 'Health', icon: 'heart-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 8, user_id: 1, name: 'Investments', icon: 'trending-up-outline', color: '#A78BFA', type: 'income', created_at: now() },
    { id: 9, user_id: 1, name: 'Travel', icon: 'airplane-outline', color: '#38BDF8', type: 'expense', created_at: now() },
    { id: 10, user_id: 1, name: 'Videogame', icon: 'game-controller-outline', color: '#A78BFA', type: 'expense', created_at: now() },
    { id: 11, user_id: 1, name: 'Game', icon: 'dice-outline', color: '#FB923C', type: 'expense', created_at: now() },
    { id: 12, user_id: 1, name: 'Restaurant', icon: 'restaurant-outline', color: '#F87171', type: 'expense', created_at: now() },
    { id: 13, user_id: 1, name: 'Education', icon: 'school-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 14, user_id: 1, name: 'Family', icon: 'people-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 15, user_id: 1, name: 'Shopping', icon: 'bag-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 16, user_id: 1, name: 'Clothing', icon: 'shirt-outline', color: '#C084FC', type: 'expense', created_at: now() },
    { id: 17, user_id: 1, name: 'Exercise', icon: 'fitness-outline', color: '#22D3EE', type: 'expense', created_at: now() },
    { id: 18, user_id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'expense', created_at: now() },
    { id: 19, user_id: 1, name: 'Entertainment', icon: 'film-outline', color: '#E879F9', type: 'expense', created_at: now() },
    { id: 20, user_id: 1, name: 'Gifts', icon: 'gift-outline', color: '#FB7185', type: 'expense', created_at: now() },
    { id: 21, user_id: 1, name: 'Gift', icon: 'gift-outline', color: '#FB7185', type: 'income', created_at: now() },
    { id: 22, user_id: 1, name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'income', created_at: now() },
    { id: 23, user_id: 1, name: 'Interests', icon: 'wallet-outline', color: '#4ADE80', type: 'income', created_at: now() },
  ];
  const transactions: Transaction[] = [
    { id: 1, account_id: 1, category_id: 1, type: 'income', amount: 2100.00, description: 'July Salary', date: '2026-07-01 00:00:00', created_at: now() },
    { id: 2, account_id: 1, category_id: 2, type: 'income', amount: 500.00, description: 'Web project', date: '2026-07-05 00:00:00', created_at: now() },
    { id: 3, account_id: 2, category_id: 3, type: 'expense', amount: 85.50, description: 'Weekly groceries', date: '2026-07-03 00:00:00', created_at: now() },
    { id: 4, account_id: 2, category_id: 4, type: 'expense', amount: 30.00, description: 'Gasoline', date: '2026-07-04 00:00:00', created_at: now() },
    { id: 5, account_id: 1, category_id: 5, type: 'expense', amount: 45.00, description: 'Cinema', date: '2026-07-06 00:00:00', created_at: now() },
    { id: 6, account_id: 2, category_id: 6, type: 'expense', amount: 650.00, description: 'July Rent', date: '2026-07-01 00:00:00', created_at: now() },
    { id: 7, account_id: 1, category_id: 3, type: 'expense', amount: 42.30, description: 'Restaurant', date: '2026-07-07 00:00:00', created_at: now() },
    { id: 8, account_id: 2, category_id: 7, type: 'expense', amount: 25.00, description: 'Pharmacy', date: '2026-07-08 00:00:00', created_at: now() },
    { id: 9, account_id: 3, category_id: 8, type: 'income', amount: 200.00, description: 'Dividends', date: '2026-07-10 00:00:00', created_at: now() },
    { id: 10, account_id: 1, category_id: 5, type: 'expense', amount: 12.50, description: 'Coffee shop', date: '2026-07-10 00:00:00', created_at: now() },
  ];
  setStore('users', users);
  setStore('accounts', accounts);
  setStore('categories', categories);
  setStore('transactions', transactions);
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
  language: 'es',
  textSize: 'medium',
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
    const actual = await this.get();
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...actual, ...partial }));
  },
};
