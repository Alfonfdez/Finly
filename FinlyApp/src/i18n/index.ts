import { en, Language } from './en';
import { es } from './es';
import { ca } from './ca';

const languages: Record<string, Language> = { en, es, ca };

let currentLanguage: Language = en;

export function setLanguage(id: 'es' | 'en' | 'ca') {
  currentLanguage = languages[id] ?? en;
}

export function t(): Language {
  return currentLanguage;
}

// Map category IDs to i18n keys for default categories
const CATEGORY_I18N_KEYS: Record<number, keyof Language> = {
  1: 'cat_salary',
  2: 'cat_freelance',
  3: 'cat_food',
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
  14: 'cat_exercise',
  15: 'cat_others',
  16: 'cat_entertainment',
  17: 'cat_gift',
  18: 'cat_other',
};

// Map account IDs to i18n keys for default accounts
const ACCOUNT_I18N_KEYS: Record<number, keyof Language> = {
  1: 'account_my_wallet',
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

export function getAllDefaultCategoryNames(): Set<string> {
  const names = new Set<string>();
  const catKeys = Object.values(CATEGORY_I18N_KEYS);
  for (const lang of Object.values(languages)) {
    for (const key of catKeys) {
      names.add((lang[key] as string).toLowerCase());
    }
  }
  return names;
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

export function getAllDefaultAccountNames(): Set<string> {
  const names = new Set<string>();
  const accKeys = Object.values(ACCOUNT_I18N_KEYS);
  for (const lang of Object.values(languages)) {
    for (const key of accKeys) {
      names.add((lang[key] as string).toLowerCase());
    }
  }
  return names;
}
