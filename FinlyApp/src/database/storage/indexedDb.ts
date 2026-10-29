import type { DatabaseStorage } from '../sqliteWeb';
import { DATABASE_NAME, DB_FILE_KEY, DB_STORE_NAME } from '../../constants/storage';

interface OpenHandle {
  promise: Promise<IDBDatabase>;
}

let open: OpenHandle | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'));
  }
  if (!open) {
    const handle = {} as OpenHandle;
    handle.promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
          db.createObjectStore(DB_STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          open = null;
        };
        db.onclose = () => {
          open = null;
        };
        resolve(db);
      };
      // Fail closed: booting an empty database after a read failure would let the
      // next save overwrite the real (merely unreadable) data. Clear the cache so
      // a later attempt can retry instead of reusing a rejected promise forever.
      request.onerror = () => {
        open = null;
        reject(request.error ?? new Error('Failed to open IndexedDB'));
      };
      request.onblocked = () => {
        open = null;
        reject(new Error('IndexedDB open blocked'));
      };
    });
    open = handle;
  }
  return open.promise;
}

function objectStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDatabase().then(db => db.transaction(DB_STORE_NAME, mode).objectStore(DB_STORE_NAME));
}

/**
 * Only a missing value means "start from an empty database". A value of the wrong
 * type is corruption: booting empty would let the next save overwrite the real
 * (merely unreadable) snapshot.
 */
export function decodeStoredDatabase(value: unknown): Uint8Array | null {
  if (value == null) return null;
  if (value instanceof Uint8Array) return value;
  throw new Error('Stored database is not a Uint8Array');
}

export function createIndexedDbStorage(): DatabaseStorage {
  return {
    async get(): Promise<Uint8Array | null> {
      const store = await objectStore('readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(DB_FILE_KEY);
        request.onsuccess = () => {
          try {
            resolve(decodeStoredDatabase(request.result));
          } catch (error) {
            reject(error);
          }
        };
        request.onerror = () => reject(request.error ?? new Error('Failed to read IndexedDB'));
      });
    },
    async set(data: Uint8Array): Promise<void> {
      const store = await objectStore('readwrite');
      await new Promise<void>((resolve, reject) => {
        const transaction = store.transaction;
        const request = store.put(data, DB_FILE_KEY);
        // Resolve only when the transaction actually commits: a request can
        // succeed and still be aborted before the data is durable.
        // Let a same-tick request error win before we report success.
        transaction.oncomplete = () => queueMicrotask(() => resolve());
        transaction.onerror = () => reject(transaction.error ?? request.error ?? new Error('Failed to write IndexedDB'));
        transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB write aborted'));
      });
    },
  };
}
