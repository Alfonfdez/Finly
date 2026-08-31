import { LANGUAGES, type Language } from '../constants/languages';

export { LANGUAGES };
export type { Language };

export const isCatalan = (lang: Language) => lang === LANGUAGES.ca;
