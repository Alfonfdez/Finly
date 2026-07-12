import { en, Idioma } from './en';
import { es } from './es';
import { ca } from './ca';

const idiomas: Record<string, Idioma> = { en, es, ca };

let idiomaActual: Idioma = en;

export function setIdioma(id: 'es' | 'en' | 'ca') {
  idiomaActual = idiomas[id] ?? en;
}

export function t(): Idioma {
  return idiomaActual;
}

// Map category IDs to i18n keys for mock categories
const CATEGORIA_I18N_KEYS: Record<number, keyof Idioma> = {
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

export function obtenerNombreCategoria(categoriaId: number): string {
  const key = CATEGORIA_I18N_KEYS[categoriaId];
  if (key) {
    return idiomaActual[key] as string;
  }
  return '';
}
