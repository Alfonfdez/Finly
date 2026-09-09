export { UNTAGGED_ID } from '../constants/types';

export function isTotalAccount(account: { is_total?: number }): boolean {
  return (account.is_total ?? 0) === 1;
}
