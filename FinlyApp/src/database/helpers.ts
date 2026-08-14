export const UNTAGGED_ID = -1;

export function isTotalAccount(account: { is_total?: number }): boolean {
  return (account.is_total ?? 0) === 1;
}
