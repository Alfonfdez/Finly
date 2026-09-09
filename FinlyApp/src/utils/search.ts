export function searchTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesAllTerms(query: string, ...haystacks: string[]): boolean {
  const terms = searchTerms(query);
  if (terms.length === 0) return true;
  return terms.every(term => haystacks.some(haystack => haystack.toLowerCase().includes(term)));
}
