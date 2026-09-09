import { useMemo } from 'react';
import { matchesAllTerms } from '../utils/search';

export function useSearchFilter<T>(
  items: T[],
  query: string,
  getHaystacks: (item: T) => string[],
  keep?: (item: T) => boolean
): T[] {
  return useMemo(() => {
    if (!query.trim()) return items;
    return items.filter(
      item => (keep ? keep(item) : false) || matchesAllTerms(query, ...getHaystacks(item))
    );
    // getHaystacks/keep are pure selectors; only items/query drive memoization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);
}
