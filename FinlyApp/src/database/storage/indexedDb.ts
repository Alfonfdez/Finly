import { DB_FILE_KEY, type DatabaseStorage } from '../sqliteWeb';

const DATABASE_NAME = 'Finly.db';
const STORE_NAME = 'sqlite';

interface OpenHandle {
  db: IDBDatabase | null;
  promise: Promise<IDBDatabase | null>;
}

let open: OpenHandle | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (!open) {
    const handle: OpenHandle = { db: null, promise: Promise.resolve(null) };
    handle.promise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        handle.db = request.result;
        resolve(request.result);
      };
      // Fail closed: booting an empty database after a read failure would let the
      // next save overwrite the real (merely unreadable) data.
      request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    });
    open = handle;
  }
  return open.promise;
}

function objectStore(mode: IDBTransactionMode): Promise<IDBObjectStore | null> {
  return openDatabase().then((db) => {
    if (!db) return null;
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
  });
}

export function createIndexedDbStorage(): DatabaseStorage {
  return {
    async get(): Promise<Uint8Array | null> {
      const store = await objectStore('readonly');
      if (!store) return null;
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
      if (!store) return;
      await new Promise<void>((resolve, reject) => {
        const request = store.put(data, DB_FILE_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error ?? new Error('Failed to write IndexedDB'));
      });
    },
  };
}
