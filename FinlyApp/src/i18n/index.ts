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
};

export function obtenerNombreCategoria(categoriaId: number): string {
  const key = CATEGORIA_I18N_KEYS[categoriaId];
  if (key) {
    return idiomaActual[key] as string;
  }
  return '';
}
