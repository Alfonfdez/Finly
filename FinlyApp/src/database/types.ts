import { TransactionType } from '../constants/types';

export interface User {
  id: number;
  name: string;
  email: string | null;
  avatar: string | null;
  currency: string;
  created_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  initial_balance: number;
  icon: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: number;
  user_id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
}
