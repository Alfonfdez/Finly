import type { User, Account, Category, Transaction, Tag, TransactionTag, Config } from './types';
import type { z } from 'zod';
import { TRANSACTION_TYPES, MAX_SUGGESTIONS, UNTAGGED_LABEL, type TransactionType } from '../constants/types';
import { UNTAGGED_ID, isTotalAccount } from './helpers';
import { DEFAULT_CONFIG, sanitizeConfig } from './configDefaults';
import {
  accountSchema,
  categorySchema,
  tagSchema,
  transactionSchema,
  transactionTagSchema,
  userSchema,
} from './schemas';
import { parseRows } from './validate';
import { dbTimestamp } from '../utils/formatters';
import { SEED_USER_DATA, SEED_ACCOUNTS, SEED_CATEGORIES } from './seedData';

const STORAGE_PREFIX = '@Finly/';

function getStore<T>(key: string, schema?: z.ZodType<T>): T[] {
  if (typeof localStorage === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (schema) return parseRows(schema, key, Array.isArray(parsed) ? parsed : []);
  return parsed as T[];
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
}

function nextId<T extends { id: number }>(items: T[]): number {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

function nameExists<T extends { id: number; name: string; user_id?: number }>(
  items: T[],
  name: string,
  opts: { userId?: number; excludeId?: number } = {}
): boolean {
  const lower = name.toLowerCase();
  return items.some(item => {
    if (opts.userId !== undefined && item.user_id !== opts.userId) return false;
    if (item.name.toLowerCase() !== lower) return false;
    if (opts.excludeId !== undefined && item.id === opts.excludeId) return false;
    return true;
  });
}

// --- Initialization ---
export async function initWebStorage(): Promise<void> {
  const users = getStore<User>('users', userSchema);
  if (users.length === 0) {
    seedWebData();
  } else {
    // Clean up orphaned transaction_tags entries (from pre-fix data)
    const transactions = getStore<Transaction>('transactions', transactionSchema);
    const txnIds = new Set(transactions.map(t => t.id));
    const tags = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
    const cleaned = tags.filter(t => txnIds.has(t.transaction_id));
    if (cleaned.length !== tags.length) {
      setStore('transaction_tags', cleaned);
    }
  }
}

function seedWebData(): void {
  const users: User[] = [{ ...SEED_USER_DATA, created_at: dbTimestamp() }];
  const accounts: Account[] = SEED_ACCOUNTS.map(a => ({ ...a, created_at: dbTimestamp() }));
  const categories: Category[] = SEED_CATEGORIES.map(c => ({ ...c, created_at: dbTimestamp() }));
  setStore('users', users);
  setStore('accounts', accounts);
  setStore('categories', categories);
  setStore('transactions', []);
  setStore<Tag>('tags', []);
  setStore<TransactionTag>('transaction_tags', []);
}

// --- Repositories (web) ---

export const webAccountRepo = {
  async list(userId: number): Promise<Account[]> {
    return getStore<Account>('accounts', accountSchema)
      .filter(c => c.user_id === userId)
      .sort((a, b) => {
        if (isTotalAccount(a) !== isTotalAccount(b)) return isTotalAccount(a) ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  },
  async create(data: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
    const items = getStore<Account>('accounts', accountSchema);
    const item: Account = { ...data, id: nextId(items), created_at: dbTimestamp() };
    items.push(item);
    setStore('accounts', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Account, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Account>('accounts', accountSchema);
    const idx = items.findIndex(c => c.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('accounts', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Account>('accounts', accountSchema);
    const target = items.find(c => c.id === id);
    if (!target || isTotalAccount(target)) return;
    setStore('accounts', items.filter(c => c.id !== id));
    const transactions = getStore<Transaction>('transactions', transactionSchema);
    const deletedIds = new Set(transactions.filter(t => t.account_id === id).map(t => t.id));
    setStore('transactions', transactions.filter(t => t.account_id !== id));
    if (deletedIds.size > 0) {
      const tags = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
      setStore('transaction_tags', tags.filter(t => !deletedIds.has(t.transaction_id)));
    }
  },
  async deleteAll(): Promise<void> {
    setStore('accounts', []);
  },
  async getById(id: number): Promise<Account | null> {
    return getStore<Account>('accounts', accountSchema).find(c => c.id === id) ?? null;
  },
  async getBalances(): Promise<{ account_id: number; balance: number }[]> {
    const accounts = getStore<Account>('accounts', accountSchema).filter(c => !isTotalAccount(c));
    const transactions = getStore<Transaction>('transactions', transactionSchema);
    const deltas = new Map<number, number>();
    for (const t of transactions) {
      const delta = t.type === TRANSACTION_TYPES.income ? t.amount : -t.amount;
      deltas.set(t.account_id, (deltas.get(t.account_id) ?? 0) + delta);
    }
    return accounts.map(a => ({ account_id: a.id, balance: a.initial_balance + (deltas.get(a.id) ?? 0) }));
  },
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    return nameExists(getStore<Account>('accounts', accountSchema), name, { excludeId });
  },
};

export const webCategoryRepo = {
  async list(userId: number, type?: TransactionType): Promise<Category[]> {
    let items = getStore<Category>('categories', categorySchema).filter(c => c.user_id === userId);
    if (type) items = items.filter(c => c.type === type);
    return items.sort((a, b) => a.name.localeCompare(b.name));
  },
  async create(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const items = getStore<Category>('categories', categorySchema);
    const item: Category = { ...data, id: nextId(items), created_at: dbTimestamp() };
    items.push(item);
    setStore('categories', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Category>('categories', categorySchema);
    const idx = items.findIndex(c => c.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('categories', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Category>('categories', categorySchema);
    setStore('categories', items.filter(c => c.id !== id));
    const transactions = getStore<Transaction>('transactions', transactionSchema);
    setStore('transactions', transactions.filter(t => t.category_id !== id));
  },
  async reassignAndDelete(oldCategoryId: number, newCategoryId: number): Promise<void> {
    const items = getStore<Category>('categories', categorySchema);
    setStore('categories', items.filter(c => c.id !== oldCategoryId));
    const transactions = getStore<Transaction>('transactions', transactionSchema);
    setStore('transactions', transactions.map(t =>
      t.category_id === oldCategoryId ? { ...t, category_id: newCategoryId } : t
    ));
  },
  async deleteAll(): Promise<void> {
    setStore('categories', []);
  },
  async existsByName(name: string, excludeId?: number): Promise<boolean> {
    return nameExists(getStore<Category>('categories', categorySchema), name, { excludeId });
  },
};

export const webTransactionRepo = {
  async list(filters: { account_id?: number; category_id?: number; category_ids?: number[]; type?: TransactionType; start_date?: string; end_date?: string; tagIds?: number[] } = {}): Promise<Transaction[]> {
    let items = getStore<Transaction>('transactions', transactionSchema);
    if (filters.account_id !== undefined) items = items.filter(t => t.account_id === filters.account_id);
    if (filters.category_id !== undefined) items = items.filter(t => t.category_id === filters.category_id);
    if (filters.category_ids && filters.category_ids.length > 0) {
      const catSet = new Set(filters.category_ids);
      items = items.filter(t => catSet.has(t.category_id));
    }
    if (filters.type !== undefined) items = items.filter(t => t.type === filters.type);
    const startDate = filters.start_date;
    if (startDate !== undefined) items = items.filter(t => t.date >= startDate);
    const endDate = filters.end_date;
    if (endDate !== undefined) items = items.filter(t => t.date <= endDate);
    if (filters.tagIds && filters.tagIds.length > 0) {
      const hasUntagged = filters.tagIds.includes(UNTAGGED_ID);
      const regularIds = filters.tagIds.filter(id => id !== UNTAGGED_ID);
      const links = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
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
  async getById(id: number): Promise<Transaction | null> {
    return getStore<Transaction>('transactions', transactionSchema).find(t => t.id === id) ?? null;
  },
  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const items = getStore<Transaction>('transactions', transactionSchema);
    const item: Transaction = { ...data, id: nextId(items), created_at: dbTimestamp(), updated_at: null };
    items.push(item);
    setStore('transactions', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const items = getStore<Transaction>('transactions', transactionSchema);
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data, updated_at: dbTimestamp() };
    setStore('transactions', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Transaction>('transactions', transactionSchema);
    setStore('transactions', items.filter(t => t.id !== id));
    const tags = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
    setStore('transaction_tags', tags.filter(t => t.transaction_id !== id));
  },
  async deleteAllTransactions(): Promise<void> {
    setStore('transactions', []);
    setStore('transaction_tags', []);
  },
  async totalByPeriod(accountId: number | null, type: TransactionType, startDate: string, endDate: string): Promise<number> {
    return getStore<Transaction>('transactions', transactionSchema)
      .filter(t => (accountId === null || t.account_id === accountId) && t.type === type && t.date >= startDate && t.date <= endDate)
      .reduce((sum, t) => sum + t.amount, 0);
  },
  async breakdownByCategoriesAndTags(
    accountId: number | null,
    categoryIds: number[],
    type: TransactionType,
    startDate: string,
    endDate: string,
    tagIds?: number[]
  ): Promise<Map<number, { tag_id: number; name: string; total: number }[]>> {
    const transactions = getStore<Transaction>('transactions', transactionSchema)
      .filter(t => (accountId === null || t.account_id === accountId)
        && categoryIds.includes(t.category_id)
        && t.type === type
        && t.date >= startDate
        && t.date <= endDate);
    const tags = getStore<Tag>('tags', tagSchema);
    const links = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
    const tagMap = new Map(tags.map(t => [t.id, t.name]));

    const hasFilter = tagIds && tagIds.length > 0;
    const filterRegular = hasFilter ? tagIds.filter(id => id !== UNTAGGED_ID) : [];
    const filterUntagged = hasFilter ? tagIds.includes(UNTAGGED_ID) : false;

    const tagged = new Map<number, Map<number, number>>();
    const untaggedByCategory = new Map<number, number>();

    for (const t of transactions) {
      const txnTagIds = links.filter(l => l.transaction_id === t.id).map(l => l.tag_id);
      const isUntagged = txnTagIds.length === 0;

      if (hasFilter) {
        const matches =
          (filterUntagged && isUntagged) ||
          (filterRegular.length > 0 && txnTagIds.some(id => filterRegular.includes(id)));
        if (!matches) continue;
      }

      if (isUntagged) {
        untaggedByCategory.set(t.category_id, (untaggedByCategory.get(t.category_id) ?? 0) + t.amount);
      } else {
        const relevantTagIds = hasFilter ? txnTagIds.filter(id => filterRegular.includes(id)) : txnTagIds;
        for (const tagId of relevantTagIds) {
          let catTags = tagged.get(t.category_id);
          if (!catTags) {
            catTags = new Map();
            tagged.set(t.category_id, catTags);
          }
          catTags.set(tagId, (catTags.get(tagId) ?? 0) + t.amount);
        }
      }
    }

    const result = new Map<number, { tag_id: number; name: string; total: number }[]>();
    for (const [catId, catTags] of tagged) {
      const list: { tag_id: number; name: string; total: number }[] = [];
      for (const [tagId, total] of catTags) {
        list.push({ tag_id: tagId, name: tagMap.get(tagId) ?? '', total });
      }
      result.set(catId, list);
    }
    for (const [catId, total] of untaggedByCategory) {
      if (total <= 0) continue;
      const list = result.get(catId) ?? [];
      list.push({ tag_id: UNTAGGED_ID, name: UNTAGGED_LABEL, total });
      result.set(catId, list);
    }
    return result;
  },
  async searchComments(search: string): Promise<string[]> {
    const items = getStore<Transaction>('transactions', transactionSchema);
    const lower = search.toLowerCase();
    return [...new Set(
      items
        .map(t => t.description)
        .filter((d): d is string => !!d && d.toLowerCase().includes(lower))
    )].sort((a, b) => a.localeCompare(b)).slice(0, MAX_SUGGESTIONS);
  },

  async createWithTags(
    data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>,
    tagIds: number[]
  ): Promise<Transaction> {
    const tx = await webTransactionRepo.create(data);
    const links = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
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
    let links = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
    links = links.filter(l => l.transaction_id !== id);
    for (const tagId of tagIds) {
      links.push({ transaction_id: id, tag_id: tagId });
    }
    setStore('transaction_tags', links);
  },

  async getTagsByTransactionId(transactionId: number): Promise<number[]> {
    return getStore<TransactionTag>('transaction_tags', transactionTagSchema)
      .filter(l => l.transaction_id === transactionId)
      .map(l => l.tag_id);
  },

  async getTagsByTransactionIds(
    transactionIds: number[]
  ): Promise<{ transaction_id: number; tag_id: number; name: string }[]> {
    if (transactionIds.length === 0) return [];
    const tags = getStore<Tag>('tags', tagSchema);
    return getStore<TransactionTag>('transaction_tags', transactionTagSchema)
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
    const categories = getStore<Category>('categories', categorySchema)
      .filter(c => c.user_id === userId && c.type === type);
    const transactions = getStore<Transaction>('transactions', transactionSchema)
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
    return getStore<Tag>('tags', tagSchema)
      .filter(t => t.user_id === userId)
      .sort((a, b) => a.id - b.id);
  },
  async create(data: Omit<Tag, 'id' | 'created_at'>): Promise<Tag> {
    const items = getStore<Tag>('tags', tagSchema);
    const item: Tag = { ...data, id: nextId(items), created_at: dbTimestamp() };
    items.push(item);
    setStore('tags', items);
    return item;
  },
  async update(id: number, data: Partial<Omit<Tag, 'id' | 'created_at'>>): Promise<void> {
    const items = getStore<Tag>('tags', tagSchema);
    const idx = items.findIndex(t => t.id === id);
    if (idx !== -1) items[idx] = { ...items[idx], ...data };
    setStore('tags', items);
  },
  async delete(id: number): Promise<void> {
    const items = getStore<Tag>('tags', tagSchema);
    setStore('tags', items.filter(t => t.id !== id));
    const junction = getStore<TransactionTag>('transaction_tags', transactionTagSchema);
    setStore('transaction_tags', junction.filter(jt => jt.tag_id !== id));
  },
  async deleteAll(): Promise<void> {
    setStore('tags', []);
    setStore('transaction_tags', []);
  },
  async existsByName(userId: number, name: string, excludeId?: number): Promise<boolean> {
    return nameExists(getStore<Tag>('tags', tagSchema), name, { userId, excludeId });
  },
};

const CONFIG_KEY = '@Finly/config';

export const webConfigRepo = {
  async get(): Promise<Config> {
    if (typeof localStorage === 'undefined') return DEFAULT_CONFIG;
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    try {
      return sanitizeConfig({ ...DEFAULT_CONFIG, ...JSON.parse(raw) });
    } catch {
      return DEFAULT_CONFIG;
    }
  },
  async save(partial: Partial<Config>): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const current = await webConfigRepo.get();
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...current, ...partial }));
  },
};
