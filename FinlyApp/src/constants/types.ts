import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export const USER_ID = 1;

export const UNTAGGED_ID = -1;

export const TOTAL_ACCOUNT_FLAGS = {
  regular: 0,
  total: 1,
} as const;

export function isTotalAccount(account: { is_total?: number }): boolean {
  return (account.is_total ?? TOTAL_ACCOUNT_FLAGS.regular) === TOTAL_ACCOUNT_FLAGS.total;
}

export const OTHERS_CATEGORY_ID = 15;
export const OTHER_CATEGORY_ID = 18;
export const CATEGORY_USAGE_WINDOW_DAYS = 90;

export const DATE_MIN = '1900-01-01';
export const DATE_MAX = '2100-12-31';

export const MAX_VISIBLE_CATEGORIES = 7;
export const DEBOUNCE_MS = 300;
export const MAX_PHOTOS = 3;

/** Backup import guards (bytes, total rows, per-photo URI, config value). */
export const MAX_BACKUP_BYTES = 50 * 1024 * 1024;
export const MAX_BACKUP_ROWS = 250_000;
export const MAX_PHOTO_URI_LENGTH = 8 * 1024 * 1024;
export const MAX_CONFIG_VALUE_LENGTH = 100_000;

export const MAX_CATEGORY_NAME_LENGTH = 30;
export const MAX_ACCOUNT_NAME_LENGTH = 30;
export const MAX_TAG_NAME_LENGTH = 20;
export const MAX_CATEGORIES_PER_TYPE = 30;
export const MAX_TAGS = 100;
export const MAX_NOTE_LENGTH = 200;
export const MAX_COMMENT_LENGTH = 4096;
export const MIN_COMMENT_SUGGESTION_LENGTH = 2;
export const MAX_VISIBLE_TAGS = 3;
export const MAX_SUGGESTIONS = 5;
export const DECIMAL_PLACES = 2;

export const MAX_AMOUNT = 999999999.99;
export const MAX_AMOUNT_INTEGER_DIGITS = String(Math.trunc(MAX_AMOUNT)).length;

export const UNTAGGED_LABEL = 'Untagged';
export const DELETE_ALL_CONFIRMATION = 'DELETE';

export const TRANSACTION_TYPES = {
  expense: 'expense',
  income: 'income',
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

export const RECURRENCE_FREQUENCIES = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
} as const;

export type RecurrenceFrequency = keyof typeof RECURRENCE_FREQUENCIES;

export const RECURRENCE_SCOPES = {
  future: 'future',
  futureAndPast: 'futureAndPast',
} as const;

export type RecurrenceScope = keyof typeof RECURRENCE_SCOPES;

export const REPEAT_MIN_INTERVAL = 1;
export const REPEAT_MAX_INTERVAL = 99;
/** Rule names use up to two lines in lists and wrap in the details view; 30 keeps
 *  them the same length as account/category names and readable where they appear. */
export const REPEAT_NAME_MAX_LENGTH = 30;

/** Why a recurring rule name is not acceptable (produced by `useRecurringDraft`,
 *  consumed by the form's bottom hint). */
export const RECURRING_NAME_ERRORS = {
  required: 'required',
  taken: 'taken',
} as const;

export type RecurringNameError = keyof typeof RECURRING_NAME_ERRORS;

/** Intrinsic rule invariants rejected by the service (the form already prevents them). */
export const RECURRING_RULE_ERRORS = {
  nameRequired: 'nameRequired',
  intervalInvalid: 'intervalInvalid',
  endNotAfterStart: 'endNotAfterStart',
  tooManyOccurrences: 'tooManyOccurrences',
} as const;

export type RecurringRuleError = keyof typeof RECURRING_RULE_ERRORS;

/** `day_of_month` anchor meaning "the last day of the month" for a monthly/yearly rule. */
export const LAST_DAY_OF_MONTH = 31;
/** `recurring_rules.active` flag values (stored as an integer in SQLite). */
export const RULE_ACTIVE = 1;
export const RULE_INACTIVE = 0;

export type TransactionDraft = {
  account_id: number;
  category_id: number;
  type: TransactionType;
  amount: number;
  description: string | null;
  photo: string | null;
  date: string;
};

/** The recurrence fields shared by the form draft, the create params and the edit params. */
export type RecurrenceSpec = {
  frequency: RecurrenceFrequency;
  interval: number;
  endDate: string | null;
  /** Monthly/yearly: anchor on the last day of the month instead of the start day. */
  lastDay?: boolean;
};

export type RecurrenceDraft = RecurrenceSpec & {
  name: string;
};

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

/** Which transaction list a sort preference belongs to (they are stored separately). */
export const TRANSACTION_SORT_SCOPES = {
  transactions: 'transactions',
  allTransactions: 'allTransactions',
} as const;

export type TransactionSortScope = keyof typeof TRANSACTION_SORT_SCOPES;

export const RECURRING_SORT_BY = {
  nextDue: 'nextDue',
  name: 'name',
  amount: 'amount',
  created: 'created',
} as const;

export type RecurringSortBy = keyof typeof RECURRING_SORT_BY;

export const TAG_SORT_BY = {
  name: 'name',
  created: 'created',
  usage: 'usage',
} as const;

export type TagSortBy = keyof typeof TAG_SORT_BY;

export const COMMENT_SORT_BY = {
  name: 'name',
  lastUsed: 'lastUsed',
  usage: 'usage',
} as const;

export type CommentSortBy = keyof typeof COMMENT_SORT_BY;

/** Accounts screen sort fields. The Total account stays pinned first in every mode. */
export const ACCOUNT_SORT_BY = {
  name: 'name',
  balance: 'balance',
} as const;

export type AccountSortBy = keyof typeof ACCOUNT_SORT_BY;

/** Categories screen sort fields. The fallback categories (Others/Other) stay last. */
export const CATEGORY_SORT_BY = {
  name: 'name',
  usage: 'usage',
} as const;

export type CategorySortBy = keyof typeof CATEGORY_SORT_BY;

export const RECURRING_VIEWS = {
  all: 'all',
  oneTime: 'oneTime',
  recurring: 'recurring',
} as const;

export type RecurringView = keyof typeof RECURRING_VIEWS;

/** Rule states shown/filtered on the Recurring screen. A rule is `ended` when it has
 *  no occurrence left within its end date; otherwise `active` or `paused`. */
export const RECURRING_STATUSES = {
  active: 'active',
  paused: 'paused',
  ended: 'ended',
} as const;

export type RecurringStatus = keyof typeof RECURRING_STATUSES;

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

export const FOOTER_LAYOUTS = {
  row: 'row',
  single: 'single',
  stacked: 'stacked',
  compact: 'compact',
} as const;

export type FooterLayout = (typeof FOOTER_LAYOUTS)[keyof typeof FOOTER_LAYOUTS];

export interface CategoryWithTotal {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  total: number;
  percentage: number;
}

export const CATEGORY_TRANSFER_TARGETS = {
  delete: 'delete',
} as const;

export type TransferTargetId = number | (typeof CATEGORY_TRANSFER_TARGETS)[keyof typeof CATEGORY_TRANSFER_TARGETS];

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { categoryId?: number; type?: TransactionType } | undefined;
  AddCategory: { type: TransactionType };
  CreateCategory: { type?: TransactionType; fromTransaction?: boolean };
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
  Comments: undefined;
  ModifyComment: { comment: string };
  Recurring: undefined;
  CreateRecurring: undefined;
  ModifyRecurring: { ruleId: number };
};

export type NavigationProp<RouteName extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;
