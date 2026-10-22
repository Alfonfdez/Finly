import { DB_FILE_KEY, type DatabaseStorage } from '../sqliteWeb';

const DATABASE_NAME = 'Finly.db';
const STORE_NAME = 'sqlite';

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
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      // Fail closed: booting an empty database after a read failure would let the
      // next save overwrite the real (merely unreadable) data. Clear the cache so
      // a later attempt can retry instead of reusing a rejected promise forever.
      request.onerror = () => {
        open = null;
        reject(request.error ?? new Error('Failed to open IndexedDB'));
      };
    });
    open = handle;
  }
  return open.promise;
}

function objectStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDatabase().then(db => db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
}

export function createIndexedDbStorage(): DatabaseStorage {
  return {
    async get(): Promise<Uint8Array | null> {
      const store = await objectStore('readonly');
      return new Promise((resolve, reject) => {
        const request = store.get(DB_FILE_KEY);
        request.onsuccess = () => {
          const value = request.result;
          resolve(value instanceof Uint8Array ? value : null);
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
