import { z } from 'zod';

import {
  CONFIG_ICON_SHAPES,
  DECIMAL_SEPARATORS,
  FIRST_DAYS,
  PERIODS,
  RECURRENCE_FREQUENCIES,
  TEXT_SIZES,
  THEMES,
  TRANSACTION_TYPES,
} from '../constants/types';
import { LANGUAGES } from '../constants/languages';

const transactionTypeSchema = z.enum([TRANSACTION_TYPES.expense, TRANSACTION_TYPES.income]);
const themeSchema = z.enum([THEMES.dark, THEMES.light, THEMES.system]);
const textSizeSchema = z.enum([TEXT_SIZES.small, TEXT_SIZES.medium, TEXT_SIZES.large]);
const languageSchema = z.enum([LANGUAGES.es, LANGUAGES.en, LANGUAGES.ca, LANGUAGES.gl, LANGUAGES.eu, LANGUAGES.fr, LANGUAGES.de, LANGUAGES.pt, LANGUAGES.it]);
const iconShapeSchema = z.enum([CONFIG_ICON_SHAPES.square, CONFIG_ICON_SHAPES.circle]);
const firstDaySchema = z.union([z.literal(FIRST_DAYS.monday), z.literal(FIRST_DAYS.sunday)]);
const decimalSeparatorSchema = z.union([z.literal(DECIMAL_SEPARATORS.comma), z.literal(DECIMAL_SEPARATORS.dot)]);
const homePeriodSchema = z.enum([PERIODS.day, PERIODS.week, PERIODS.month, PERIODS.year]);
const recurrenceFrequencySchema = z.enum([
  RECURRENCE_FREQUENCIES.daily,
  RECURRENCE_FREQUENCIES.weekly,
  RECURRENCE_FREQUENCIES.monthly,
  RECURRENCE_FREQUENCIES.yearly,
]);

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().nullable(),
  avatar: z.string().nullable(),
  currency: z.string(),
  created_at: z.string(),
});

export const accountSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  name: z.string(),
  initial_balance: z.number(),
  icon: z.string(),
  color: z.string(),
  description: z.string().optional(),
  is_total: z.number().int().optional(),
  created_at: z.string(),
});

export const categorySchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  type: transactionTypeSchema,
  created_at: z.string(),
});

export const transactionSchema = z.object({
  id: z.number().int(),
  account_id: z.number().int(),
  category_id: z.number().int(),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  description: z.string().nullable(),
  photo: z.string().nullable(),
  date: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  // Added in migration 004. Optional keeps pre-028 backups (no such keys) importable.
  recurring_rule_id: z.number().int().nullable().optional(),
  recurrence_date: z.string().nullable().optional(),
});

export const recurringRuleSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  name: z.string(),
  type: transactionTypeSchema,
  account_id: z.number().int(),
  category_id: z.number().int(),
  amount: z.number().positive(),
  description: z.string().nullable(),
  frequency: recurrenceFrequencySchema,
  interval: z.number().int().positive(),
  weekday: z.number().int().nullable(),
  day_of_month: z.number().int().nullable(),
  month: z.number().int().nullable(),
  start_date: z.string(),
  end_date: z.string().nullable(),
  next_due: z.string(),
  skipped_from: z.string().nullable(),
  active: z.number().int(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
});

export const recurringRuleTagSchema = z.object({
  rule_id: z.number().int(),
  tag_id: z.number().int(),
});

export const tagSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  name: z.string(),
  created_at: z.string(),
});

export const transactionTagSchema = z.object({
  transaction_id: z.number().int(),
  tag_id: z.number().int(),
});

export const configSchema = z.object({
  theme: themeSchema,
  firstDayOfWeek: firstDaySchema,
  currency: z.string(),
  decimalSeparator: decimalSeparatorSchema,
  language: languageSchema,
  textSize: textSizeSchema,
  categoryIconShape: iconShapeSchema,
  accountIconShape: iconShapeSchema,
  homeDefaultAccountId: z.number().int().positive().nullable(),
  homeDefaultPeriod: homePeriodSchema,
  addDefaultAccountId: z.number().int().positive().nullable(),
  addShowLabels: z.boolean(),
  addShowComments: z.boolean(),
  addShowPhoto: z.boolean(),
  hideBalances: z.boolean(),
});
