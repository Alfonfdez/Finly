import { en, Language } from './en';
import { es } from './es';
import { ca } from './ca';
import type { Language as LanguageType } from '../utils/language';

const languages: Record<string, Language> = { en, es, ca };

let currentLanguage: Language = en;

export function setLanguage(id: LanguageType) {
  currentLanguage = languages[id] ?? en;
}

export function t(): Language {
  return currentLanguage;
}

// Map category IDs to i18n keys for default categories
const CATEGORY_I18N_KEYS: Record<number, keyof Language> = {
  1: 'cat_salary',
  2: 'cat_freelance',
  3: 'cat_groceries',
  4: 'cat_transport',
  5: 'cat_leisure',
  6: 'cat_housing',
  7: 'cat_health',
  8: 'cat_investments',
  9: 'cat_travel',
  10: 'cat_education',
  11: 'cat_family',
  12: 'cat_shopping',
  13: 'cat_clothing',
  14: 'cat_workout',
  15: 'cat_others',
  16: 'cat_entertainment',
  17: 'cat_gift',
  18: 'cat_other',
  19: 'cat_restaurants',
  20: 'cat_rent',
  21: 'cat_games',
  22: 'cat_gifts',
  23: 'cat_subscriptions',
  24: 'cat_pets',
  25: 'cat_insurance',
  26: 'cat_utilities',
  27: 'cat_interest',
  28: 'cat_sales',
  29: 'cat_refund',
  30: 'cat_bonus',
  31: 'cat_allowance',
};

// Map account IDs to i18n keys for default accounts
const ACCOUNT_I18N_KEYS: Record<number, keyof Language> = {
  1: 'account_my_wallet',
  2: 'account_total',
};

// Map account IDs to i18n keys for default account descriptions
const ACCOUNT_DESCRIPTION_I18N_KEYS: Record<number, keyof Language> = {
  1: 'account_my_wallet_description',
  2: 'account_total_description',
};

export function getCategoryName(categoryId: number): string {
  const key = CATEGORY_I18N_KEYS[categoryId];
  if (key) {
    return currentLanguage[key] as string;
  }
  return '';
}

export function getDefaultEnglishName(categoryId: number): string | null {
  const key = CATEGORY_I18N_KEYS[categoryId];
  if (key && en[key]) {
    return en[key] as string;
  }
  return null;
}

export function getDisplayCategoryName(category: { id: number; name: string }): string {
  const defaultName = getDefaultEnglishName(category.id);
  if (defaultName && category.name === defaultName) {
    return getCategoryName(category.id);
  }
  return category.name;
}

export function getDefaultCategoryIdByName(name: string): number | null {
  const lower = name.trim().toLowerCase();
  for (const [id, key] of Object.entries(CATEGORY_I18N_KEYS)) {
    const currentName = currentLanguage[key] as string;
    if (currentName.toLowerCase() === lower) {
      return Number(id);
    }
  }
  return null;
}

export function getAccountName(accountId: number): string {
  const key = ACCOUNT_I18N_KEYS[accountId];
  if (key) {
    return currentLanguage[key] as string;
  }
  return '';
}

export function getDefaultEnglishAccountName(accountId: number): string | null {
  const key = ACCOUNT_I18N_KEYS[accountId];
  if (key && en[key]) {
    return en[key] as string;
  }
  return null;
}

export function getDisplayAccountName(account: { id: number; name: string }): string {
  const defaultName = getDefaultEnglishAccountName(account.id);
  if (defaultName && account.name === defaultName) {
    return getAccountName(account.id);
  }
  return account.name;
}

export function getDefaultAccountIdByName(name: string): number | null {
  const lower = name.trim().toLowerCase();
  for (const [id, key] of Object.entries(ACCOUNT_I18N_KEYS)) {
    const currentName = currentLanguage[key] as string;
    if (currentName.toLowerCase() === lower) {
      return Number(id);
    }
  }
  return null;
}

export function getDisplayAccountDescription(account: { id: number; description?: string }): string {
  if (!account.description) return '';
  const key = ACCOUNT_DESCRIPTION_I18N_KEYS[account.id];
  if (key && en[key] && account.description === en[key]) {
    return currentLanguage[key] as string;
  }
  return account.description;
}

export function getDefaultEnglishAccountDescription(accountId: number): string | null {
  const key = ACCOUNT_DESCRIPTION_I18N_KEYS[accountId];
  if (key && en[key]) {
    return en[key] as string;
  }
  return null;
}

export function getAccountDescription(accountId: number): string {
  const key = ACCOUNT_DESCRIPTION_I18N_KEYS[accountId];
  if (key) {
    return currentLanguage[key] as string;
  }
  return '';
}
