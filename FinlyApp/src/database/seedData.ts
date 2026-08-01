import type { Account, Category, User } from './types';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export const SEED_USER_DATA: Omit<User, 'created_at'> = {
  id: 1, name: 'User', email: null, avatar: null, currency: DEFAULT_CURRENCY,
};

export const SEED_ACCOUNTS: Omit<Account, 'created_at'>[] = [
  { id: 1, user_id: 1, name: 'My Wallet', initial_balance: 0, icon: 'wallet-outline', color: '#22D3EE', description: 'Your default account for everyday transactions', is_total: 0 },
  { id: 2, user_id: 1, name: 'Total', initial_balance: 0, icon: 'layers-outline', color: '#475569', description: 'Combined balance and transactions from all your accounts', is_total: 1 },
];

export const SEED_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 1, user_id: 1, name: 'Salary', icon: 'briefcase-outline', color: '#22D3EE', type: 'income' },
  { id: 2, user_id: 1, name: 'Freelance', icon: 'code-slash-outline', color: '#A78BFA', type: 'income' },
  { id: 3, user_id: 1, name: 'Groceries', icon: 'basket-outline', color: '#F87171', type: 'expense' },
  { id: 4, user_id: 1, name: 'Transport', icon: 'bus-outline', color: '#FBBF24', type: 'expense' },
  { id: 5, user_id: 1, name: 'Leisure', icon: 'musical-notes-outline', color: '#F472B6', type: 'expense' },
  { id: 6, user_id: 1, name: 'Housing', icon: 'home-outline', color: '#60A5FA', type: 'expense' },
  { id: 7, user_id: 1, name: 'Health', icon: 'heart-outline', color: '#34D399', type: 'expense' },
  { id: 8, user_id: 1, name: 'Investments', icon: 'trending-up-outline', color: '#34D399', type: 'income' },
  { id: 9, user_id: 1, name: 'Travel', icon: 'airplane-outline', color: '#38BDF8', type: 'expense' },
  { id: 10, user_id: 1, name: 'Education', icon: 'school-outline', color: '#34D399', type: 'expense' },
  { id: 11, user_id: 1, name: 'Family', icon: 'people-outline', color: '#F472B6', type: 'expense' },
  { id: 12, user_id: 1, name: 'Shopping', icon: 'bag-outline', color: '#FBBF24', type: 'expense' },
  { id: 13, user_id: 1, name: 'Clothing', icon: 'shirt-outline', color: '#C084FC', type: 'expense' },
  { id: 14, user_id: 1, name: 'Workout', icon: 'barbell-outline', color: '#22D3EE', type: 'expense' },
  { id: 15, user_id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'expense' },
  { id: 16, user_id: 1, name: 'Entertainment', icon: 'film-outline', color: '#E879F9', type: 'expense' },
  { id: 17, user_id: 1, name: 'Gift', icon: 'gift-outline', color: '#FB7185', type: 'income' },
  { id: 18, user_id: 1, name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#94A3B8', type: 'income' },
  { id: 19, user_id: 1, name: 'Restaurants', icon: 'restaurant-outline', color: '#FB923C', type: 'expense' },
  { id: 20, user_id: 1, name: 'Rent', icon: 'key-outline', color: '#818CF8', type: 'expense' },
  { id: 21, user_id: 1, name: 'Games', icon: 'game-controller-outline', color: '#2DD4BF', type: 'expense' },
  { id: 22, user_id: 1, name: 'Gifts', icon: 'gift-outline', color: '#EC4899', type: 'expense' },
  { id: 23, user_id: 1, name: 'Subscriptions', icon: 'card-outline', color: '#10B981', type: 'expense' },
  { id: 24, user_id: 1, name: 'Pets', icon: 'paw-outline', color: '#F59E0B', type: 'expense' },
  { id: 25, user_id: 1, name: 'Insurance', icon: 'shield-checkmark-outline', color: '#6366F1', type: 'expense' },
  { id: 26, user_id: 1, name: 'Utilities', icon: 'flash-outline', color: '#EF4444', type: 'expense' },
  { id: 27, user_id: 1, name: 'Interest', icon: 'pulse-outline', color: '#0EA5E9', type: 'income' },
  { id: 28, user_id: 1, name: 'Sales', icon: 'cash-outline', color: '#EAB308', type: 'income' },
  { id: 29, user_id: 1, name: 'Refund', icon: 'return-down-back-outline', color: '#8B5CF6', type: 'income' },
  { id: 30, user_id: 1, name: 'Bonus', icon: 'trophy-outline', color: '#D946EF', type: 'income' },
  { id: 31, user_id: 1, name: 'Allowance', icon: 'wallet-outline', color: '#22C55E', type: 'income' },
];
