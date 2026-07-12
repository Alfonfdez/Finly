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
