import { z } from 'zod';

import {
  CONFIG_ICON_SHAPES,
  DECIMAL_SEPARATORS,
  FIRST_DAYS,
  PERIODS,
  TEXT_SIZES,
  THEMES,
  TRANSACTION_TYPES,
} from '../constants/types';
import { LANGUAGES } from '../constants/languages';

const transactionTypeSchema = z.enum([TRANSACTION_TYPES.expense, TRANSACTION_TYPES.income]);
const themeSchema = z.enum([THEMES.dark, THEMES.light, THEMES.system]);
const textSizeSchema = z.enum([TEXT_SIZES.small, TEXT_SIZES.medium, TEXT_SIZES.large]);
const languageSchema = z.enum([LANGUAGES.es, LANGUAGES.en, LANGUAGES.ca]);
const iconShapeSchema = z.enum([CONFIG_ICON_SHAPES.square, CONFIG_ICON_SHAPES.circle]);
const firstDaySchema = z.union([z.literal(FIRST_DAYS.monday), z.literal(FIRST_DAYS.sunday)]);
const decimalSeparatorSchema = z.union([z.literal(DECIMAL_SEPARATORS.comma), z.literal(DECIMAL_SEPARATORS.dot)]);
const homePeriodSchema = z.enum([PERIODS.day, PERIODS.week, PERIODS.month, PERIODS.year]);

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
