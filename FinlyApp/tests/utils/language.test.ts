import { describe, it, expect } from 'vitest';
import { isCatalan, LANGUAGES } from '../../src/utils/language';
import type { Language } from '../../src/constants/languages';

describe('language helpers', () => {
  it('exposes all seven supported languages', () => {
    expect(Object.keys(LANGUAGES).sort()).toEqual(['ca', 'de', 'en', 'es', 'fr', 'it', 'pt']);
  });

  it('returns true for Catalan', () => {
    expect(isCatalan(LANGUAGES.ca)).toBe(true);
  });

  it('returns false for every other language', () => {
    const others = (Object.keys(LANGUAGES) as Language[]).filter(lang => lang !== LANGUAGES.ca);
    for (const lang of others) {
      expect(isCatalan(lang)).toBe(false);
    }
  });
});