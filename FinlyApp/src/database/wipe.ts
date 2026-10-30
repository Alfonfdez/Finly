import type { DatabaseHandle } from './types';

export interface WipeOptions {
  /** Keep the config key/value rows (Delete all data). */
  keepConfig: boolean;
  /** Keep the seeded user row (reset and delete-all). */
  keepUsers: boolean;
}

/**
 * FK-safe delete order shared by reset, delete-all and backup import. Call this
 * inside the caller's transaction; it does not open or commit one.
 */
export async function wipeUserData(
  database: DatabaseHandle,
  { keepConfig, keepUsers }: WipeOptions,
): Promise<void> {
  await database.runAsync('DELETE FROM transactions');
  await database.runAsync('DELETE FROM transaction_tags');
  await database.runAsync('DELETE FROM recurring_rule_tags');
  await database.runAsync('DELETE FROM recurring_rules');
  await database.runAsync('DELETE FROM tags');
  await database.runAsync('DELETE FROM categories');
  await database.runAsync('DELETE FROM accounts');
  if (!keepConfig) await database.runAsync('DELETE FROM config');
  if (!keepUsers) await database.runAsync('DELETE FROM users');
}
