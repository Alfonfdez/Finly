import { colors } from '../constants/colors';
import { TransactionType } from '../constants/types';

export interface Account {
  id: number;
  name: string;
  icon: string;
  color: string;
  balance: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: number;
  accountId: number;
  categoryId: number;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
}

export const mockAccounts: Account[] = [
  { id: 1, name: 'Cash', icon: 'wallet-outline', color: colors.primary, balance: 0 },
  { id: 2, name: 'Bank', icon: 'business-outline', color: colors.accent, balance: 0 },
  { id: 3, name: 'Savings', icon: 'cash-outline', color: colors.green, balance: 0 },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Salary', icon: 'briefcase-outline', color: colors.primary, type: 'income' },
  { id: 2, name: 'Freelance', icon: 'code-slash-outline', color: colors.accent, type: 'income' },
  { id: 3, name: 'Food', icon: 'cart-outline', color: colors.red, type: 'expense' },
  { id: 4, name: 'Transport', icon: 'bus-outline', color: '#FBBF24', type: 'expense' },
  { id: 5, name: 'Leisure', icon: 'musical-notes-outline', color: '#F472B6', type: 'expense' },
  { id: 6, name: 'Housing', icon: 'home-outline', color: '#60A5FA', type: 'expense' },
  { id: 7, name: 'Health', icon: 'heart-outline', color: colors.green, type: 'expense' },
  { id: 8, name: 'Investments', icon: 'trending-up-outline', color: colors.accent, type: 'income' },
  { id: 9, name: 'Travel', icon: 'airplane-outline', color: '#38BDF8', type: 'expense' },
  { id: 10, name: 'Videogame', icon: 'game-controller-outline', color: '#A78BFA', type: 'expense' },
  { id: 11, name: 'Game', icon: 'dice-outline', color: '#FB923C', type: 'expense' },
  { id: 12, name: 'Restaurant', icon: 'restaurant-outline', color: '#F87171', type: 'expense' },
  { id: 13, name: 'Education', icon: 'school-outline', color: colors.green, type: 'expense' },
  { id: 14, name: 'Family', icon: 'people-outline', color: '#F472B6', type: 'expense' },
  { id: 15, name: 'Shopping', icon: 'bag-outline', color: '#FBBF24', type: 'expense' },
  { id: 16, name: 'Clothing', icon: 'shirt-outline', color: '#C084FC', type: 'expense' },
  { id: 17, name: 'Exercise', icon: 'fitness-outline', color: '#22D3EE', type: 'expense' },
  { id: 18, name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'expense' },
  { id: 19, name: 'Entertainment', icon: 'film-outline', color: '#E879F9', type: 'expense' },
  { id: 20, name: 'Gifts', icon: 'gift-outline', color: '#FB7185', type: 'expense' },
  { id: 21, name: 'Gift', icon: 'gift-outline', color: '#FB7185', type: 'income' },
  { id: 22, name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'income' },
  { id: 23, name: 'Interests', icon: 'wallet-outline', color: '#4ADE80', type: 'income' },
];

export const mockTransactions: Transaction[] = [
  { id: 1, accountId: 1, categoryId: 1, type: 'income', amount: 2100.00, description: 'July Salary', date: '2026-07-01' },
  { id: 2, accountId: 1, categoryId: 2, type: 'income', amount: 500.00, description: 'Web project', date: '2026-07-05' },
  { id: 3, accountId: 2, categoryId: 3, type: 'expense', amount: 85.50, description: 'Weekly groceries', date: '2026-07-03' },
  { id: 4, accountId: 2, categoryId: 4, type: 'expense', amount: 30.00, description: 'Gasoline', date: '2026-07-04' },
  { id: 5, accountId: 1, categoryId: 5, type: 'expense', amount: 45.00, description: 'Cinema', date: '2026-07-06' },
  { id: 6, accountId: 2, categoryId: 6, type: 'expense', amount: 650.00, description: 'July Rent', date: '2026-07-01' },
  { id: 7, accountId: 1, categoryId: 3, type: 'expense', amount: 42.30, description: 'Restaurant', date: '2026-07-07' },
  { id: 8, accountId: 2, categoryId: 7, type: 'expense', amount: 25.00, description: 'Pharmacy', date: '2026-07-08' },
  { id: 9, accountId: 3, categoryId: 8, type: 'income', amount: 200.00, description: 'Dividends', date: '2026-07-10' },
  { id: 10, accountId: 1, categoryId: 5, type: 'expense', amount: 12.50, description: 'Coffee shop', date: '2026-07-10' },
];
