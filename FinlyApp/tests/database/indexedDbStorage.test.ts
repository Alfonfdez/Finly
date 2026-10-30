import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { DB_FILE_KEY } from '../../src/database/sqliteWeb';
import { decodeStoredDatabase } from '../../src/database/storage/indexedDb';

type GlobalWithIdb = typeof globalThis & { indexedDB?: IDBFactory };

function freshIndexedDb(): void {
  (globalThis as GlobalWithIdb).indexedDB = new IDBFactory();
}

async function readStoredValue(): Promise<unknown> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('Finly.db', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('sqlite')) request.result.createObjectStore('sqlite');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return await new Promise((resolve) => {
    const request = db.transaction('sqlite', 'readonly').objectStore('sqlite').get(DB_FILE_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function objectStorePrototype(): Promise<Record<string, unknown>> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('Finly.db', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('sqlite')) request.result.createObjectStore('sqlite');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const store = db.transaction('sqlite', 'readonly').objectStore('sqlite');
  return Object.getPrototypeOf(store) as Record<string, unknown>;
}

async function loadStorage() {
  const { createIndexedDbStorage } = await import('../../src/database/storage/indexedDb');
  return createIndexedDbStorage();
}

describe('createIndexedDbStorage', () => {
  beforeEach(() => {
    // The module caches its open handle, so each test starts from a fresh module
    // and a fresh in-memory IndexedDB.
    vi.resetModules();
    freshIndexedDb();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('returns null before anything is stored', async () => {
    const storage = await loadStorage();
    expect(await storage.get()).toBeNull();
  });

  it('round-trips the database bytes', async () => {
    const storage = await loadStorage();
    await storage.set(new Uint8Array([1, 2, 3, 250]));

    const stored = await storage.get();
    expect(stored).toBeInstanceOf(Uint8Array);
    expect(Array.from(stored ?? [])).toEqual([1, 2, 3, 250]);
  });

  it('persists across storage instances (same database, one key)', async () => {
    const first = await loadStorage();
    await first.set(new Uint8Array([9, 9]));

    const second = await loadStorage();
    expect(Array.from((await second.get()) ?? [])).toEqual([9, 9]);

    await second.set(new Uint8Array([7]));
    expect(Array.from((await first.get()) ?? [])).toEqual([7]);
  });

  it('stores the snapshot under the sqlite database key', async () => {
    const storage = await loadStorage();
    await storage.set(new Uint8Array([4, 5]));

    expect(await readStoredValue()).toBeInstanceOf(Uint8Array);
  });

  it('fails closed when IndexedDB cannot be opened', async () => {
    const failingFactory = {
      open: () => {
        const request: { onerror?: (event: unknown) => void } = {};
        queueMicrotask(() => request.onerror?.({ target: request }));
        return request;
      },
    };
    (globalThis as unknown as { indexedDB: unknown }).indexedDB = failingFactory;
    const storage = await loadStorage();

    await expect(storage.get()).rejects.toThrow();
  });

  it('fails closed when reading the stored database fails', async () => {
    const storage = await loadStorage();
    const proto = (await objectStorePrototype()) as { get: (...args: unknown[]) => IDBRequest };
    const original = proto.get;
    proto.get = () => {
      const request = {} as IDBRequest & { onerror?: (event: unknown) => void };
      queueMicrotask(() => request.onerror?.({ target: request }));
      return request;
    };
    try {
      await expect(storage.get()).rejects.toThrow();
    } finally {
      proto.get = original;
    }
  });

  it('fails closed when indexedDB is unavailable', async () => {
    (globalThis as unknown as { indexedDB: IDBFactory | undefined }).indexedDB = undefined;
    const storage = await loadStorage();

    await expect(storage.get()).rejects.toThrow('IndexedDB is not available');
    await expect(storage.set(new Uint8Array([1]))).rejects.toThrow('IndexedDB is not available');
  });

  it('rejects a corrupt stored value instead of booting empty', async () => {
    const storage = await loadStorage();
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('Finly.db', 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('sqlite')) request.result.createObjectStore('sqlite');
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('sqlite', 'readwrite');
        tx.objectStore('sqlite').put('not-a-database', DB_FILE_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      };
      request.onerror = () => reject(request.error);
    });

    await expect(storage.get()).rejects.toThrow('Stored database is not a Uint8Array');
  });
});

describe('decodeStoredDatabase', () => {
  it('treats a missing snapshot as an empty database', () => {
    expect(decodeStoredDatabase(null)).toBeNull();
    expect(decodeStoredDatabase(undefined)).toBeNull();
  });

  it('returns a stored Uint8Array', () => {
    const bytes = new Uint8Array([1, 2, 3]);
    expect(decodeStoredDatabase(bytes)).toBe(bytes);
  });

  it('rejects other stored values', () => {
    expect(() => decodeStoredDatabase('not-a-database')).toThrow('Stored database is not a Uint8Array');
    expect(() => decodeStoredDatabase([1, 2, 3])).toThrow('Stored database is not a Uint8Array');
  });
});
