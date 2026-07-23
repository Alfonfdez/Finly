export type Language = 'es' | 'en' | 'ca';

export const LANGUAGES: Language[] = ['en', 'es', 'ca'];

export const isSpanish = (lang: Language) => lang === 'es';
export const isEnglish = (lang: Language) => lang === 'en';
export const isCatalan = (lang: Language) => lang === 'ca';
