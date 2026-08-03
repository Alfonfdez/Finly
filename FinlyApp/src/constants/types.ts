import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const USER_ID = 1;

export const OTHERS_CATEGORY_ID = 15;
export const OTHER_CATEGORY_ID = 18;
export const CATEGORY_USAGE_WINDOW_DAYS = 90;

export const DATE_MIN = '1900-01-01';
export const DATE_MAX = '2100-12-31';

export const MAX_VISIBLE_CATEGORIES = 7;
export const DEBOUNCE_MS = 300;
export const MAX_PHOTOS = 3;

export const MAX_CATEGORY_NAME_LENGTH = 30;
export const MAX_ACCOUNT_NAME_LENGTH = 30;
export const MAX_TAG_NAME_LENGTH = 20;
export const MAX_NOTE_LENGTH = 200;
export const MAX_COMMENT_LENGTH = 4096;
export const MAX_VISIBLE_TAGS = 3;
export const MAX_SUGGESTIONS = 5;
export const DECIMAL_PLACES = 2;

export const UNTAGGED_LABEL = 'Untagged';
export const DELETE_ALL_CONFIRMATION = 'DELETE';

export const TRANSACTION_TYPES = {
  expense: 'expense',
  income: 'income',
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

export const TYPE_FILTERS = {
  all: 'all',
  ...TRANSACTION_TYPES,
} as const;

export type TransactionTypeFilter = keyof typeof TYPE_FILTERS;

export const PERIODS = {
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
  custom: 'custom',
} as const;

export type Period = keyof typeof PERIODS;

export const THEMES = {
  dark: 'dark',
  light: 'light',
  system: 'system',
} as const;

export type Theme = keyof typeof THEMES;

export const TEXT_SIZES = {
  small: 'small',
  medium: 'medium',
  large: 'large',
} as const;

export type TextSize = keyof typeof TEXT_SIZES;

export const SORT_BY = {
  date: 'date',
  amount: 'amount',
} as const;

export type SortBy = keyof typeof SORT_BY;

export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
} as const;

export type SortDirection = keyof typeof SORT_DIRECTIONS;

export const CALC_KEYS = {
  clear: 'C',
  equals: '=',
  backspace: '⌫',
  decimal: '.',
  add: '+',
  subtract: '-',
  multiply: '*',
  divide: '/',
} as const;

export const FIRST_DAYS = {
  monday: 1,
  sunday: 0,
} as const;

export type FirstDay = (typeof FIRST_DAYS)[keyof typeof FIRST_DAYS];

export const DECIMAL_SEPARATORS = {
  comma: ',',
  dot: '.',
} as const;

export type DecimalSeparator = (typeof DECIMAL_SEPARATORS)[keyof typeof DECIMAL_SEPARATORS];

export const BADGE_SHAPES = {
  circle: 'circle',
  rounded: 'rounded',
} as const;

export type BadgeShape = (typeof BADGE_SHAPES)[keyof typeof BADGE_SHAPES];

export const CONFIG_ICON_SHAPES = {
  square: 'square',
  circle: 'circle',
} as const;

export type ConfigIconShape = (typeof CONFIG_ICON_SHAPES)[keyof typeof CONFIG_ICON_SHAPES];

export type StringKeyOf<T> = { [K in keyof T]-?: T[K] extends string ? K : never }[keyof T];

export const CHART_TYPES = {
  donut: 'donut',
  bar: 'bar',
} as const;

export type ChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];

export interface CategoryWithTotal {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  total: number;
  percentage: number;
}

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
  SettingsAppearance: undefined;
  SettingsRegional: undefined;
  SettingsPersonalization: undefined;
  SettingsData: undefined;
  Tags: undefined;
  CreateTag: undefined;
  ModifyTag: { tagId: number };
};

export type NavigationProp<RouteName extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;
