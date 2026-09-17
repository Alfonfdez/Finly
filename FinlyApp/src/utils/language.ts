import { LANGUAGES, type Language } from '../constants/languages';

export { LANGUAGES };
export type { Language };

export const isCatalan = (lang: Language) => lang === LANGUAGES.ca;
export const isGalician = (lang: Language) => lang === LANGUAGES.gl;
export const isBasque = (lang: Language) => lang === LANGUAGES.eu;
