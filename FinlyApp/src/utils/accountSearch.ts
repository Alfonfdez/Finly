import type { Account } from '../database/types';
import { getDisplayAccountName, getDisplayAccountDescription } from '../i18n';

export function matchesAccountSearch(account: Account, query: string): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const displayName = getDisplayAccountName(account).toLowerCase();
  const description = getDisplayAccountDescription(account).toLowerCase();
  const haystacks = [displayName, description];

  return terms.every(term => haystacks.some(haystack => haystack.includes(term)));
}
