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
  CreateCategory: { type?: TransactionType };
  ModifyCategory: { categoryId: number };
  Accounts: undefined;
  CreateAccount: undefined;
  ModifyAccount: { accountId: number };
  Categories: undefined;
  Transactions: { categoryId?: number; type?: TransactionType; period?: Period; startDate?: string; endDate?: string; tagIds?: number[] } | undefined;
  AllTransactions: undefined;
  TransactionDetails: { transactionId: number };
  ModifyTransaction: { transactionId: number };
  Settings: undefined;
  Tags: undefined;
  CreateTag: undefined;
  ModifyTag: { tagId: number };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;
export type AddCategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'AddCategory'>;
export type CreateCategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateCategory'>;
export type ModifyCategoryScreenProps = NativeStackScreenProps<RootStackParamList, 'ModifyCategory'>;
export type CategoriesScreenProps = NativeStackScreenProps<RootStackParamList, 'Categories'>;
export type AccountsScreenProps = NativeStackScreenProps<RootStackParamList, 'Accounts'>;
export type CreateAccountScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateAccount'>;
export type ModifyAccountScreenProps = NativeStackScreenProps<RootStackParamList, 'ModifyAccount'>;
export type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Transactions'>;
export type AllTransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'AllTransactions'>;
export type TransactionDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'TransactionDetails'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;
export type TagsScreenProps = NativeStackScreenProps<RootStackParamList, 'Tags'>;
export type CreateTagScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateTag'>;
export type ModifyTagScreenProps = NativeStackScreenProps<RootStackParamList, 'ModifyTag'>;
