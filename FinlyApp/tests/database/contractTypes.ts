import type { Account, Category, Tag, Transaction } from '../../src/database/types';
import type { TransactionType } from '../../src/constants/types';
import type { Config } from '../../src/context/ConfigContext';
import type { CommentUsage } from '../../src/database/repositories/transactionRepo';

export type NewAccount = Omit<Account, 'id' | 'created_at'>;
export type NewCategory = Omit<Category, 'id' | 'created_at'>;
export type NewTag = Omit<Tag, 'id' | 'created_at'>;
export type NewTransaction = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
export type UpdateAccount = Partial<Omit<Account, 'id' | 'created_at'>>;
export type UpdateCategory = Partial<Omit<Category, 'id' | 'created_at'>>;
export type UpdateTag = Partial<Omit<Tag, 'id' | 'created_at'>>;
export type UpdateTransaction = Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;

export interface TransactionFilters {
  account_id?: number;
  category_id?: number;
  category_ids?: number[];
  type?: TransactionType;
  start_date?: string;
  end_date?: string;
  tagIds?: number[];
}

export interface CategoryUsageCount {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  count: number;
}

export interface TagLink {
  transaction_id: number;
  tag_id: number;
  name: string;
}

export interface ContractAccountRepo {
  list(userId: number): Promise<Account[]>;
  create(data: NewAccount): Promise<Account>;
  getById(id: number): Promise<Account | null>;
  update(id: number, data: UpdateAccount): Promise<void>;
  delete(id: number): Promise<void>;
  deleteAll(): Promise<void>;
  getBalances(): Promise<{ account_id: number; balance: number }[]>;
  existsByName(name: string, excludeId?: number): Promise<boolean>;
}

export interface ContractCategoryRepo {
  list(userId: number, type?: TransactionType): Promise<Category[]>;
  create(data: NewCategory): Promise<Category>;
  update(id: number, data: UpdateCategory): Promise<void>;
  delete(id: number): Promise<void>;
  reassignAndDelete(oldCategoryId: number, newCategoryId: number): Promise<void>;
  deleteAll(): Promise<void>;
  existsByName(name: string, excludeId?: number): Promise<boolean>;
}

export interface ContractTagRepo {
  list(userId: number): Promise<Tag[]>;
  create(data: NewTag): Promise<Tag>;
  update(id: number, data: UpdateTag): Promise<void>;
  delete(id: number): Promise<void>;
  deleteMany(ids: number[]): Promise<void>;
  deleteAll(): Promise<void>;
  existsByName(userId: number, name: string, excludeId?: number): Promise<boolean>;
}

export interface ContractTransactionRepo {
  list(filters?: TransactionFilters): Promise<Transaction[]>;
  getById(id: number): Promise<Transaction | null>;
  create(data: NewTransaction): Promise<Transaction>;
  update(id: number, data: UpdateTransaction): Promise<void>;
  delete(id: number): Promise<void>;
  deleteAllTransactions(): Promise<void>;
  totalByPeriod(
    accountId: number | null,
    type: TransactionType,
    startDate: string,
    endDate: string
  ): Promise<number>;
  searchComments(search: string): Promise<string[]>;
  getDistinctComments(): Promise<CommentUsage[]>;
  updateComment(oldComment: string, newComment: string): Promise<number>;
  deleteComment(comment: string): Promise<number>;
  deleteComments(comments: string[]): Promise<number>;
  countByDescription(comment: string): Promise<number>;
  breakdownByCategoriesAndTags(
    accountId: number | null,
    categoryIds: number[],
    type: TransactionType,
    startDate: string,
    endDate: string,
    tagIds?: number[]
  ): Promise<Map<number, { tag_id: number; name: string; total: number }[]>>;
  createWithTags(data: NewTransaction, tagIds: number[]): Promise<Transaction>;
  updateWithTags(id: number, data: UpdateTransaction, tagIds: number[]): Promise<void>;
  getTagsByTransactionId(transactionId: number): Promise<number[]>;
  getTagsByTransactionIds(transactionIds: number[]): Promise<TagLink[]>;
  getCategoryUsageCounts(
    userId: number,
    type: TransactionType,
    startDate: string,
    accountId: number
  ): Promise<CategoryUsageCount[]>;
}

export interface ContractConfigRepo {
  get(): Promise<Config>;
  save(partial: Partial<Config>): Promise<void>;
}

export interface ContractBackend {
  account: ContractAccountRepo;
  category: ContractCategoryRepo;
  tag: ContractTagRepo;
  transaction: ContractTransactionRepo;
  config: ContractConfigRepo;
}
