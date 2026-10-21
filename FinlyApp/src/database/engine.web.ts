import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm';
import { createIndexedDbStorage } from './storage/indexedDb';
import { createSqlJsDatabase } from './sqliteWeb';
import { serializeTransactions } from './transactionQueue';
import { showWebPersistAlert } from '../utils/errors';
import type { DatabaseHandle } from './types';

let saveErrorShown = false;

/** A failed write may lose the session on reload: warn once, with a way out. */
function handlePersistError(error: unknown): void {
  console.error('Failed to persist web database:', error);
  if (saveErrorShown) return;
  saveErrorShown = true;
  showWebPersistAlert();
}

export async function openEngine(_name: string): Promise<DatabaseHandle> {
  const storage = createIndexedDbStorage();
  const bytes = await storage.get();
  const database = await createSqlJsDatabase(bytes, storage, () => sqlWasmUrl, handlePersistError);
  return serializeTransactions(database);
}
