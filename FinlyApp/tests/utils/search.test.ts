import { describe, it, expect } from 'vitest';
import { searchTerms, matchesAllTerms } from '../../src/utils/search';

describe('searchTerms', () => {
  it('splits a query into lowercase terms', () => {
    expect(searchTerms('Lunch at the Office')).toEqual(['lunch', 'at', 'the', 'office']);
  });

  it('trims surrounding whitespace', () => {
    expect(searchTerms('  coffee  ')).toEqual(['coffee']);
  });

  it('ignores empty and whitespace-only queries', () => {
    expect(searchTerms('')).toEqual([]);
    expect(searchTerms('   ')).toEqual([]);
  });
});

describe('matchesAllTerms', () => {
  it('returns true for an empty or whitespace-only query', () => {
    expect(matchesAllTerms('', 'Baena')).toBe(true);
    expect(matchesAllTerms('   ', 'Baena')).toBe(true);
  });

  it('matches the haystack case-insensitively', () => {
    expect(matchesAllTerms('B', 'Baena')).toBe(true);
    expect(matchesAllTerms('Ba', 'Baena')).toBe(true);
    expect(matchesAllTerms('ba', 'Baena')).toBe(true);
    expect(matchesAllTerms('BA', 'Baena')).toBe(true);
  });

  it('matches substrings at any position', () => {
    expect(matchesAllTerms('aen', 'Baena')).toBe(true);
  });

  it('matches when case differs in a multi-word haystack', () => {
    expect(matchesAllTerms('coffee tea', 'Coffee and Tea at Central')).toBe(true);
  });

  it('requires every term to match (AND)', () => {
    expect(matchesAllTerms('bae na', 'Baena')).toBe(true);
    expect(matchesAllTerms('bae zz', 'Baena')).toBe(false);
  });

  it('matches when any haystack contains the term', () => {
    expect(matchesAllTerms('lunch', 'Groceries', 'Lunch at work')).toBe(true);
    expect(matchesAllTerms('lunch', 'Groceries', 'Work')).toBe(false);
  });

  it('returns false when no haystack matches', () => {
    expect(matchesAllTerms('zzz', 'Baena')).toBe(false);
  });
});