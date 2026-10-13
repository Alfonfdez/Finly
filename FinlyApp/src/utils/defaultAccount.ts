import type { Account } from '../database/types';
import { isTotalAccount } from '../constants/types';

/**
 * Resolves the account a transaction/rule form opens with: the configured
 * default when it references an existing non-Total account, otherwise the
 * account active on Home, otherwise the first non-Total account.
 */
export function resolveDefaultAccountId(
  preferredId: number | null,
  accountsWithBalance: (Account & { balance: number })[],
  activeAccount: Account | null,
  accounts: Account[],
): number | undefined {
  if (preferredId !== null) {
    const found = accountsWithBalance.find(a => a.id === preferredId && !isTotalAccount(a));
    if (found) return found.id;
  }
  if (activeAccount && !isTotalAccount(activeAccount)) return activeAccount.id;
  return accounts.find(a => !isTotalAccount(a))?.id;
}
