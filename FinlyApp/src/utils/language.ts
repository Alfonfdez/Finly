export const LANGUAGES = {
  es: 'es',
  en: 'en',
  ca: 'ca',
} as const;

export type Language = keyof typeof LANGUAGES;

export const isCatalan = (lang: Language) => lang === LANGUAGES.ca;
