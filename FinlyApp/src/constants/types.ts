import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type Period = 'day' | 'week' | 'month' | 'year' | 'custom';

export type TransactionType = 'expense' | 'income';

export interface ChartData {
  name: string;
  color: string;
  total: number;
  percentage: number;
}

export type CategoryWithTotal = {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  total: number;
  percentage: number;
};

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { categoryId?: number; type?: TransactionType } | undefined;
  AddCategory: { type: TransactionType };
  Transactions: { categoryId?: number; type?: TransactionType } | undefined;
  Settings: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;
export type AddCategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'AddCategory'>;
export type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Transactions'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
