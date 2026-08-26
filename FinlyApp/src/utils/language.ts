import { LANGUAGES, type Language } from '../constants/languages';

export { LANGUAGES };
export type { Language };

export const isEnglish = (lang: Language) => lang === LANGUAGES.en;
export const isSpanish = (lang: Language) => lang === LANGUAGES.es;
export const isCatalan = (lang: Language) => lang === LANGUAGES.ca;
export const isFrench = (lang: Language) => lang === LANGUAGES.fr;
export const isGerman = (lang: Language) => lang === LANGUAGES.de;
export const isPortuguese = (lang: Language) => lang === LANGUAGES.pt;
export const isItalian = (lang: Language) => lang === LANGUAGES.it;
