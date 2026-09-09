import type { Account, Category, User } from './types';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { PRIMARY, ACCENT, RED, AMBER, PINK, BLUE, GREEN, SLATE, SKY, PURPLE, FUCHSIA, ROSE, ORANGE, INDIGO, TEAL, PINK_DARK, EMERALD, YELLOW, DARK_INDIGO, RED_BRIGHT, SKY_BRIGHT, YELLOW_BRIGHT, VIOLET, MAGENTA, GREEN_BRIGHT, SLATE_DARK } from '../constants/colors';

export const SEED_USER_DATA: Omit<User, 'created_at'> = {
  id: 1, name: 'User', email: null, avatar: null, currency: DEFAULT_CURRENCY,
};

export const SEED_ACCOUNTS: Omit<Account, 'created_at'>[] = [
  { id: 1, user_id: 1, name: 'My Wallet', initial_balance: 0, icon: 'wallet-outline', color: PRIMARY, description: 'Your default account for everyday transactions', is_total: 0 },
  { id: 2, user_id: 1, name: 'Total', initial_balance: 0, icon: 'layers-outline', color: SLATE_DARK, description: 'Combined balance and transactions from all your accounts', is_total: 1 },
];

export const SEED_CATEGORIES: Omit<Category, 'created_at'>[] = [
  { id: 1, user_id: 1, name: 'Salary', icon: 'briefcase-outline', color: PRIMARY, type: 'income' },
  { id: 2, user_id: 1, name: 'Freelance', icon: 'code-slash-outline', color: ACCENT, type: 'income' },
  { id: 3, user_id: 1, name: 'Groceries', icon: 'basket-outline', color: RED, type: 'expense' },
  { id: 4, user_id: 1, name: 'Transport', icon: 'bus-outline', color: AMBER, type: 'expense' },
  { id: 5, user_id: 1, name: 'Leisure', icon: 'musical-notes-outline', color: PINK, type: 'expense' },
  { id: 6, user_id: 1, name: 'Housing', icon: 'home-outline', color: BLUE, type: 'expense' },
  { id: 7, user_id: 1, name: 'Health', icon: 'heart-outline', color: GREEN, type: 'expense' },
  { id: 8, user_id: 1, name: 'Investments', icon: 'trending-up-outline', color: GREEN, type: 'income' },
  { id: 9, user_id: 1, name: 'Travel', icon: 'airplane-outline', color: SKY, type: 'expense' },
  { id: 10, user_id: 1, name: 'Education', icon: 'school-outline', color: GREEN, type: 'expense' },
  { id: 11, user_id: 1, name: 'Family', icon: 'people-outline', color: PINK, type: 'expense' },
  { id: 12, user_id: 1, name: 'Shopping', icon: 'bag-outline', color: AMBER, type: 'expense' },
  { id: 13, user_id: 1, name: 'Clothing', icon: 'shirt-outline', color: PURPLE, type: 'expense' },
  { id: 14, user_id: 1, name: 'Workout', icon: 'barbell-outline', color: PRIMARY, type: 'expense' },
  { id: 15, user_id: 1, name: 'Others', icon: 'ellipsis-horizontal-outline', color: SLATE, type: 'expense' },
  { id: 16, user_id: 1, name: 'Entertainment', icon: 'film-outline', color: FUCHSIA, type: 'expense' },
  { id: 17, user_id: 1, name: 'Gift', icon: 'gift-outline', color: ROSE, type: 'income' },
  { id: 18, user_id: 1, name: 'Other', icon: 'ellipsis-horizontal-outline', color: SLATE, type: 'income' },
  { id: 19, user_id: 1, name: 'Restaurants', icon: 'restaurant-outline', color: ORANGE, type: 'expense' },
  { id: 20, user_id: 1, name: 'Rent', icon: 'key-outline', color: INDIGO, type: 'expense' },
  { id: 21, user_id: 1, name: 'Games', icon: 'game-controller-outline', color: TEAL, type: 'expense' },
  { id: 22, user_id: 1, name: 'Gifts', icon: 'gift-outline', color: PINK_DARK, type: 'expense' },
  { id: 23, user_id: 1, name: 'Subscriptions', icon: 'card-outline', color: EMERALD, type: 'expense' },
  { id: 24, user_id: 1, name: 'Pets', icon: 'paw-outline', color: YELLOW, type: 'expense' },
  { id: 25, user_id: 1, name: 'Insurance', icon: 'shield-checkmark-outline', color: DARK_INDIGO, type: 'expense' },
  { id: 26, user_id: 1, name: 'Utilities', icon: 'flash-outline', color: RED_BRIGHT, type: 'expense' },
  { id: 27, user_id: 1, name: 'Interest', icon: 'pulse-outline', color: SKY_BRIGHT, type: 'income' },
  { id: 28, user_id: 1, name: 'Sales', icon: 'cash-outline', color: YELLOW_BRIGHT, type: 'income' },
  { id: 29, user_id: 1, name: 'Refund', icon: 'return-down-back-outline', color: VIOLET, type: 'income' },
  { id: 30, user_id: 1, name: 'Bonus', icon: 'trophy-outline', color: MAGENTA, type: 'income' },
  { id: 31, user_id: 1, name: 'Allowance', icon: 'wallet-outline', color: GREEN_BRIGHT, type: 'income' },
];
