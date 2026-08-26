export const LANGUAGES = {
  es: 'es',
  en: 'en',
  ca: 'ca',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  it: 'it',
} as const;

export type Language = keyof typeof LANGUAGES;
