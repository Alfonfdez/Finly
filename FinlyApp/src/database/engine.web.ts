import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm';
import { createIndexedDbStorage } from './storage/indexedDb';
import { createSqlJsDatabase } from './sqliteWeb';
import { serializeTransactions } from './transactionQueue';
import type { DatabaseHandle } from './types';

export async function openEngine(_name: string): Promise<DatabaseHandle> {
  const storage = createIndexedDbStorage();
  const bytes = await storage.get();
  const database = await createSqlJsDatabase(bytes, storage, () => sqlWasmUrl);
  return serializeTransactions(database);
}
