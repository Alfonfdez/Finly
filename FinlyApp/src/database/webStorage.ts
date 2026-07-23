import { User, Account, Category, Transaction, Tag, TransactionTag } from './types';
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
  } else {
    // Clean up orphaned transaction_tags entries (from pre-fix data)
    const transactions = getStore<Transaction>('transactions');
    const txnIds = new Set(transactions.map(t => t.id));
    const tags = getStore<TransactionTag>('transaction_tags');
    const cleaned = tags.filter(t => txnIds.has(t.transaction_id));
    if (cleaned.length !== tags.length) {
      setStore('transaction_tags', cleaned);
    }
  }
}

function seedWebData(): void {
  const users: User[] = [{ id: 1, name: 'User', email: null, avatar: null, currency: '€', created_at: now() }];
  const accounts: Account[] = [
    { id: 1, user_id: 1, name: 'My Wallet', initial_balance: 0, icon: 'wallet-outline', color: '#22D3EE', description: 'Your default account for everyday transactions', is_total: 0, created_at: now() },
    { id: 2, user_id: 1, name: 'Total', initial_balance: 0, icon: 'layers-outline', color: '#475569', description: 'Combined balance and transactions from all your accounts', is_total: 1, created_at: now() },
  ];
  const categories: Category[] = [
    { id: 1, user_id: 1, name: 'Salary', icon: 'briefcase-outline', color: '#22D3EE', type: 'income', created_at: now() },
    { id: 2, user_id: 1, name: 'Freelance', icon: 'code-slash-outline', color: '#A78BFA', type: 'income', created_at: now() },
    { id: 3, user_id: 1, name: 'Groceries', icon: 'basket-outline', color: '#F87171', type: 'expense', created_at: now() },
    { id: 4, user_id: 1, name: 'Transport', icon: 'bus-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 5, user_id: 1, name: 'Leisure', icon: 'musical-notes-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 6, user_id: 1, name: 'Housing', icon: 'home-outline', color: '#60A5FA', type: 'expense', created_at: now() },
    { id: 7, user_id: 1, name: 'Health', icon: 'heart-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 8, user_id: 1, name: 'Investments', icon: 'trending-up-outline', color: '#34D399', type: 'income', created_at: now() },
    { id: 9, user_id: 1, name: 'Travel', icon: 'airplane-outline', color: '#38BDF8', type: 'expense', created_at: now() },
    { id: 10, user_id: 1, name: 'Education', icon: 'school-outline', color: '#34D399', type: 'expense', created_at: now() },
    { id: 11, user_id: 1, name: 'Family', icon: 'people-outline', color: '#F472B6', type: 'expense', created_at: now() },
    { id: 12, user_id: 1, name: 'Shopping', icon: 'bag-outline', color: '#FBBF24', type: 'expense', created_at: now() },
    { id: 13, user_id: 1, name: 'Clothing', icon: 'shirt-outline', color: '#C084FC', type: 'expense', created_at: now() },
    { id: 14, user_id: 1, name: 'Workout', icon: 'barbell-outline', color: '#22D3EE', type: 'expense', created_at: now() },
    { id: 15, user_id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'expense', created_at: now() },
    { id: 16, user_id: 1, name: 'Entertainment', icon: 'film-outline', color: '#E879F9', type: 'expense', created_at: now() },
    { id: 17, user_id: 1, name: 'Gift', icon: 'gift-outline', color: '#FB7185', type: 'income', created_at: now() },
    { id: 18, user_id: 1, name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'income', created_at: now() },
    { id: 19, user_id: 1, name: 'Restaurants', icon: 'restaurant-outline', color: '#FB923C', type: 'expense', created_at: now() },
    { id: 20, user_id: 1, name: 'Rent', icon: 'key-outline', color: '#818CF8', type: 'expense', created_at: now() },
    { id: 21, user_id: 1, name: 'Games', icon: 'game-controller-outline', color: '#2DD4BF', type: 'expense', created_at: now() },
    { id: 22, user_id: 1, name: 'Gifts', icon: 'gift-outline', color: '#EC4899', type: 'expense', created_at: now() },
    { id: 23, user_id: 1, name: 'Subscriptions', icon: 'card-outline', color: '#10B981', type: 'expense', created_at: now() },
    { id: 24, user_id: 1, name: 'Pets', icon: 'paw-outline', color: '#F59E0B', type: 'expense', created_at: now() },
    { id: 25, user_id: 1, name: 'Insurance', icon: 'shield-checkmark-outline', color: '#6366F1', type: 'expense', created_at: now() },
    { id: 26, user_id: 1, name: 'Utilities', icon: 'flash-outline', color: '#EF4444', type: 'expense', created_at: now() },
    { id: 27, user_id: 1, name: 'Interest', icon: 'pulse-outline', color: '#0EA5E9', type: 'income', created_at: now() },
    { id: 28, user_id: 1, name: 'Sales', icon: 'cash-outline', color: '#EAB308', type: 'income', created_at: now() },
    { id: 29, user_id: 1, name: 'Refund', icon: 'return-down-back-outline', color: '#8B5CF6', type: 'income', created_at: now() },
    { id: 30, user_id: 1, name: 'Bonus', icon: 'trophy-outline', color: '#D946EF', type: 'income', created_at: now() },
    { id: 31, user_id: 1, name: 'Allowance', icon: 'wallet-outline', color: '#22C55E', type: 'income', created_at: now() },
  ];
  setStore('users', users);
  setStore('accounts', accounts);
  setStore('categories', categories);
  setStore('transactions', []);
  setStore<Tag>('tags', []);
  setStore<TransactionTag>('transaction_tags', []);
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
      .sort((a, b) => {
        if ((a.is_total ?? 0) !== (b.is_total ?? 0)) return (b.is_total ?? 0) - (a.is_total ?? 0);
        return a.name.localeCompare(b.name);
      });
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
    const target = items.find(c => c.id === id);
    if (target?.is_total === 1) return;
    setStore('accounts', items.filter(c => c.id !== id));
    const transactions = getStore<Transaction>('transactions');
    const deletedIds = new Set(transactions.filter(t => t.account_id === id).map(t => t.id));
    setStore('transactions', transactions.filter(t => t.account_id !== id));
    if (deletedIds.size > 0) {
      const tags = getStore<TransactionTag>('transaction_tags');
      setStore('transaction_tags', tags.filter(t => !deletedIds.has(t.transaction_id)));
    }
  },
  async deleteAll(): Promise<void> {
    setStore('accounts', []);
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
  async deleteAll(): Promise<void> {
    setStore('categories', []);
  },
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    const items = getStore<Category>('categories');
    const lower = name.toLowerCase();
    return items.some(c => {
      if (c.name.toLowerCase() !== lower) return false;
      if (excludeId !== undefined && c.id === excludeId) return false;
      return true;
    });
  },
};

export const webTransactionRepo = {
  async list(filters: { account_id?: number; category_id?: number; category_ids?: number[]; type?: TransactionType; start_date?: string; end_date?: string; tagIds?: number[] } = {}): Promise<Transaction[]> {
    let items = getStore<Transaction>('transactions');
    if (filters.account_id !== undefined) items = items.filter(t => t.account_id === filters.account_id);
    if (filters.category_id !== undefined) items = items.filter(t => t.category_id === filters.category_id);
    if (filters.category_ids && filters.category_ids.length > 0) {
      const catSet = new Set(filters.category_ids);
      items = items.filter(t => catSet.has(t.category_id));
    }
    if (filters.type !== undefined) items = items.filter(t => t.type === filters.type);
    if (filters.start_date !== undefined) items = items.filter(t => t.date >= filters.start_date!);
    if (filters.end_date !== undefined) items = items.filter(t => t.date <= filters.end_date!);
    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasUntagged = filters.tagIds.includes(-1);
      const regularIds = filters.tagIds.filter(id => id !== -1);
      const links = getStore<TransactionTag>('transaction_tags');
      const tagSet = new Set(regularIds);
      const taggedTxIds = new Set(
        links.filter(l => tagSet.has(l.tag_id)).map(l => l.transaction_id)
      );
      const untaggedTxIds = new Set(
        links.map(l => l.transaction_id)
      );
      items = items.filter(t => {
        if (hasUntagged && !untaggedTxIds.has(t.id)) return true;
        if (regularIds.length > 0 && taggedTxIds.has(t.id)) return true;
        return false;
      });
    }
    return items.sort((a, b) => b.date.localeCompare(a.date));
  },
  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const items = getStore<Transaction>('transactions');
    const item: Transaction = { ...data, id: nextId(items), created_at: now(), updated_at: null };
    items.push(item);
    setStore('transactions', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const items = getStore<Transaction>('transactions');
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data, updated_at: now() };
    setStore('transactions', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Transaction>('transactions');
    setStore('transactions', items.filter(t => t.id !== id));
    const tags = getStore<TransactionTag>('transaction_tags');
    setStore('transaction_tags', tags.filter(t => t.transaction_id !== id));
  },
  async deleteByAccountId(accountId: number): Promise<void> {
    const items = getStore<Transaction>('transactions');
    const deletedIds = new Set(items.filter(t => t.account_id === accountId).map(t => t.id));
    setStore('transactions', items.filter(t => t.account_id !== accountId));
    if (deletedIds.size > 0) {
      const tags = getStore<TransactionTag>('transaction_tags');
      setStore('transaction_tags', tags.filter(t => !deletedIds.has(t.transaction_id)));
    }
  },
  async deleteAllTransactions(): Promise<void> {
    setStore('transactions', []);
    setStore('transaction_tags', []);
  },
  async totalByPeriod(accountId: number | null, type: TransactionType, startDate: string, endDate: string): Promise<number> {
    return getStore<Transaction>('transactions')
      .filter(t => (accountId === null || t.account_id === accountId) && t.type === type && t.date >= startDate && t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);
  },
  async breakdownByCategories(accountId: number | null, type: TransactionType, startDate: string, endDate: string): Promise<{ category_id: number; name: string; icon: string; color: string; total: number }[]> {
    const transactions = getStore<Transaction>('transactions')
      .filter(t => (accountId === null || t.account_id === accountId) && t.type === type && t.date >= startDate && t.date <= endDate);
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

  async breakdownByCategoryAndTag(
    accountId: number,
    categoryId: number,
    type: TransactionType,
    startDate: string,
    endDate: string,
    tagIds?: number[]
  ): Promise<{ tag_id: number; name: string; total: number }[]> {
    const transactions = getStore<Transaction>('transactions')
      .filter(t => t.account_id === accountId && t.category_id === categoryId && t.type === type && t.date >= startDate && t.date <= endDate);
    const tags = getStore<Tag>('tags');
    const links = getStore<TransactionTag>('transaction_tags');
    const tagMap = new Map(tags.map(t => [t.id, t.name]));

    const hasFilter = tagIds && tagIds.length > 0;
    const filterRegular = hasFilter ? tagIds!.filter(id => id !== -1) : [];
    const filterUntagged = hasFilter ? tagIds!.includes(-1) : false;

    const tagged = new Map<number, number>();
    const untaggedTotal = { total: 0 };

    for (const t of transactions) {
      const txnTagIds = links.filter(l => l.transaction_id === t.id).map(l => l.tag_id);
      const isUntagged = txnTagIds.length === 0;

      if (hasFilter) {
        if (filterUntagged && !isUntagged) continue;
        if (filterRegular.length > 0 && isUntagged) continue;
        if (filterRegular.length > 0 && !filterRegular.some(id => txnTagIds.includes(id))) continue;
      }

      if (isUntagged) {
        untaggedTotal.total += t.amount;
      } else {
        const relevantTagIds = hasFilter ? txnTagIds.filter(id => filterRegular.includes(id)) : txnTagIds;
        for (const tagId of relevantTagIds) {
          tagged.set(tagId, (tagged.get(tagId) ?? 0) + t.amount);
        }
      }
    }

    const result: { tag_id: number; name: string; total: number }[] = [];
    for (const [tagId, total] of tagged) {
      result.push({ tag_id: tagId, name: tagMap.get(tagId) ?? '', total });
    }
    if (untaggedTotal.total > 0) {
      result.push({ tag_id: -1, name: 'Untagged', total: untaggedTotal.total });
    }
    return result;
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

  async createWithTags(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
    tagIds: number[]
  ): Promise<Transaction> {
    const tx = await webTransactionRepo.create(data);
    const links = getStore<TransactionTag>('transaction_tags');
    for (const tagId of tagIds) {
      links.push({ transaction_id: tx.id, tag_id: tagId });
    }
    setStore('transaction_tags', links);
    return tx;
  },

  async updateWithTags(
    id: number,
    data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>,
    tagIds: number[]
  ): Promise<void> {
    await webTransactionRepo.update(id, data);
    let links = getStore<TransactionTag>('transaction_tags');
    links = links.filter(l => l.transaction_id !== id);
    for (const tagId of tagIds) {
      links.push({ transaction_id: id, tag_id: tagId });
    }
    setStore('transaction_tags', links);
  },

  async getTagsByTransactionId(transactionId: number): Promise<number[]> {
    return getStore<TransactionTag>('transaction_tags')
      .filter(l => l.transaction_id === transactionId)
      .map(l => l.tag_id);
  },

  async getTagsByTransactionIds(
    transactionIds: number[]
  ): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
    if (transactionIds.length === 0) return [];
    const tags = getStore<Tag>('tags');
    return getStore<TransactionTag>('transaction_tags')
      .filter(l => transactionIds.includes(l.transaction_id))
      .map(l => {
        const tag = tags.find(t => t.id === l.tag_id);
        return { transaction_id: l.transaction_id, tag_id: l.tag_id, name: tag?.name ?? '' };
      });
  },

  async getCategoryUsageCounts(
    userId: number,
    type: TransactionType,
    startDate: string,
    accountId: number
  ): Promise<{ id: number; name: string; icon: string; color: string; type: TransactionType; count: number }[]> {
    const categories = getStore<Category>('categories')
      .filter(c => c.user_id === userId && c.type === type);
    const transactions = getStore<Transaction>('transactions')
      .filter(t => t.type === type && t.date >= startDate && t.account_id === accountId);
    const counts = new Map<number, number>();
    for (const t of transactions) {
      counts.set(t.category_id, (counts.get(t.category_id) ?? 0) + 1);
    }
    return categories
      .map(c => ({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type, count: counts.get(c.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  },
};

export const webTagRepo = {
  async list(userId: number): Promise<Tag[]> {
    return getStore<Tag>('tags')
      .filter(t => t.user_id === userId)
      .sort((a, b) => a.id - b.id);
  },
  async create(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const items = getStore<Tag>('tags');
    const item: Tag = { ...data, id: nextId(items), created_at: now() };
    items.push(item);
    setStore('tags', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Tag, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Tag>('tags');
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('tags', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Tag>('tags');
    setStore('tags', items.filter(t => t.id !== id));
    const junction = getStore<TransactionTag>('transaction_tags');
    setStore('transaction_tags', junction.filter(jt => jt.tag_id !== id));
  },
  async deleteAll(): Promise<void> {
    setStore('tags', []);
    setStore('transaction_tags', []);
  },
  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    const items = getStore<Tag>('tags');
    const lower = name.toLowerCase();
    return items.some(t => {
      if (t.user_id !== userId) return false;
      if (t.name.toLowerCase() !== lower) return false;
      if (excludeId !== undefined && t.id === excludeId) return false;
      return true;
    });
  },
  async getByTransactionIds(transactionIds: number[]): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
    if (transactionIds.length === 0) return [];
    const junction = getStore<TransactionTag>('transaction_tags');
    const tags = getStore<Tag>('tags');
    const tagMap = new Map(tags.map(t => [t.id, t.name]));
    return junction
      .filter(jt => transactionIds.includes(jt.transaction_id))
      .map(jt => ({ transaction_id: jt.transaction_id, tag_id: jt.tag_id, name: tagMap.get(jt.tag_id) ?? '' }));
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
  homeDefaultAccountId: null,
  homeDefaultPeriod: 'month',
  addDefaultAccountId: null,
  addShowLabels: true,
  addShowComments: true,
  addShowPhoto: true,
  hideBalances: false,
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
