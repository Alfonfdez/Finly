import sqlWasmUrl from 'sql.js/dist/sql-wasm-browser.wasm';
import { createIndexedDbStorage } from './storage/indexedDb';
import { createSqlJsDatabase } from './sqliteWeb';
import type { DatabaseHandle } from './types';

export async function openEngine(_name: string): Promise<DatabaseHandle> {
  const storage = createIndexedDbStorage();
  const bytes = await storage.get();
  return createSqlJsDatabase(bytes, storage, () => sqlWasmUrl);
}
