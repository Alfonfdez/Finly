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

// Map category IDs to i18n keys for mock categories
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
  10: 'cat_videogame',
  11: 'cat_game',
  12: 'cat_restaurant',
  13: 'cat_education',
  14: 'cat_family',
  15: 'cat_shopping',
  16: 'cat_clothing',
  17: 'cat_exercise',
  18: 'cat_others',
  19: 'cat_entertainment',
  20: 'cat_gifts',
  21: 'cat_gift',
  22: 'cat_other',
  23: 'cat_interests',
};

export function getCategoryName(categoryId: number): string {
  const key = CATEGORY_I18N_KEYS[categoryId];
  if (key) {
    return currentLanguage[key] as string;
  }
  return '';
}
