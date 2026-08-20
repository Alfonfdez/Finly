import { en, type Language } from './en';
import { es } from './es';
import { ca } from './ca';
import type { Language as LanguageType } from '../constants/languages';
import type { StringKeyOf } from '../constants/types';

const languages: Record<string, Language> = { en, es, ca };

let currentLanguage: Language = en;

export function setLanguage(id: LanguageType) {
  currentLanguage = languages[id] ?? en;
}

export function t(): Language {
  return currentLanguage;
}

// Map category IDs to i18n keys for default categories.
// IMPORTANT: These IDs must stay in sync with 002_seed.sql.
// If you add/remove/reorder seed categories, update this map accordingly.
const CATEGORY_I18N_KEYS: Record<number, StringKeyOf<Language>> = {
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

// Map account IDs to i18n keys for default accounts.
// IMPORTANT: Must stay in sync with 002_seed.sql.
const ACCOUNT_I18N_KEYS: Record<number, StringKeyOf<Language>> = {
  1: 'account_my_wallet',
  2: 'account_total',
};

// Map account IDs to i18n keys for default account descriptions.
// IMPORTANT: Must stay in sync with 002_seed.sql.
const ACCOUNT_DESCRIPTION_I18N_KEYS: Record<number, StringKeyOf<Language>> = {
  1: 'account_my_wallet_description',
  2: 'account_total_description',
};

function createDefaultResolver(keysMap: Record<number, StringKeyOf<Language>>) {
  let nameLookup: Map<string, number> | null = null;
  let lookupLanguage: Language | null = null;

  function getName(id: number): string {
    const key = keysMap[id];
    return key ? currentLanguage[key] : '';
  }

  function getDefaultEnglishName(id: number): string | null {
    const key = keysMap[id];
    return key && en[key] ? en[key] : null;
  }

  function getDisplayName(entity: { id: number; name: string }): string {
    const defaultName = getDefaultEnglishName(entity.id);
    if (defaultName && entity.name === defaultName) {
      return getName(entity.id);
    }
    return entity.name;
  }

  function getIdByName(name: string): number | null {
    if (lookupLanguage !== currentLanguage) {
      nameLookup = new Map();
      for (const [id, key] of Object.entries(keysMap)) {
        const entry = currentLanguage[key].toLowerCase();
        if (!nameLookup.has(entry)) {
          nameLookup.set(entry, Number(id));
        }
      }
      lookupLanguage = currentLanguage;
    }
    const lookup = nameLookup;
    return lookup?.get(name.trim().toLowerCase()) ?? null;
  }

  return { getName, getDefaultEnglishName, getDisplayName, getIdByName };
}

const categoryResolver = createDefaultResolver(CATEGORY_I18N_KEYS);
const accountResolver = createDefaultResolver(ACCOUNT_I18N_KEYS);
const accountDescriptionResolver = createDefaultResolver(ACCOUNT_DESCRIPTION_I18N_KEYS);

export function getDefaultEnglishName(categoryId: number): string | null {
  return categoryResolver.getDefaultEnglishName(categoryId);
}

export function getDisplayCategoryName(category: { id: number; name: string }): string {
  return categoryResolver.getDisplayName(category);
}

export function getDefaultCategoryIdByName(name: string): number | null {
  return categoryResolver.getIdByName(name);
}

export function getAccountName(accountId: number): string {
  return accountResolver.getName(accountId);
}

export function getDefaultEnglishAccountName(accountId: number): string | null {
  return accountResolver.getDefaultEnglishName(accountId);
}

export function getDisplayAccountName(account: { id: number; name: string }): string {
  return accountResolver.getDisplayName(account);
}

export function getDefaultAccountIdByName(name: string): number | null {
  return accountResolver.getIdByName(name);
}

export function getDisplayAccountDescription(account: { id: number; description?: string }): string {
  if (!account.description) return '';
  return accountDescriptionResolver.getDisplayName({ id: account.id, name: account.description });
}

export function getDefaultEnglishAccountDescription(accountId: number): string | null {
  return accountDescriptionResolver.getDefaultEnglishName(accountId);
}

export function getAccountDescription(accountId: number): string {
  return accountDescriptionResolver.getName(accountId);
}
