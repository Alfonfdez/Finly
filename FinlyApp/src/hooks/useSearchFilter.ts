import { useMemo } from 'react';
import { matchesAllTerms } from '../utils/search';

export function useSearchFilter<T>(
  items: T[],
  query: string,
  getHaystacks: (item: T) => string[],
  keep?: (item: T) => boolean,
): T[] {
  return useMemo(() => {
    if (!query.trim()) return items;
    return items.filter(
      item => (keep ? keep(item) : false) || matchesAllTerms(query, ...getHaystacks(item)),
    );
  }, [items, query, getHaystacks, keep]);
}
