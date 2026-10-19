import { openDatabaseSync } from 'expo-sqlite';
import { serializeTransactions } from './transactionQueue';
import type { DatabaseHandle } from './types';

export async function openEngine(name: string): Promise<DatabaseHandle> {
  return serializeTransactions(openDatabaseSync(name) as unknown as DatabaseHandle);
}
