import type { TransactionType, Theme, FirstDay, DecimalSeparator, TextSize, Period, ConfigIconShape } from '../constants/types';
import type { Language } from '../constants/languages';

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
  description?: string;
  is_total?: number;
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
  photo: string | null;
  date: string;
  created_at: string;
  updated_at: string | null;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
}

export interface TransactionTag {
  transaction_id: number;
  tag_id: number;
}

export interface Config {
  theme: Theme;
  firstDayOfWeek: FirstDay;
  currency: string;
  decimalSeparator: DecimalSeparator;
  language: Language;
  textSize: TextSize;
  categoryIconShape: ConfigIconShape;
  accountIconShape: ConfigIconShape;
  homeDefaultAccountId: number | null;
  homeDefaultPeriod: Exclude<Period, 'custom'>;
  addDefaultAccountId: number | null;
  addShowLabels: boolean;
  addShowComments: boolean;
  addShowPhoto: boolean;
  hideBalances: boolean;
}
