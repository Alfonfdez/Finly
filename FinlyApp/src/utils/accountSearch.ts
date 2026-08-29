import type { Account } from '../database/types';
import { getDisplayAccountName, getDisplayAccountDescription } from '../i18n';
import { matchesAllTerms } from './search';

export function matchesAccountSearch(account: Account, query: string): boolean {
  const displayName = getDisplayAccountName(account).toLowerCase();
  const description = getDisplayAccountDescription(account).toLowerCase();
  return matchesAllTerms(query, displayName, description);
}
