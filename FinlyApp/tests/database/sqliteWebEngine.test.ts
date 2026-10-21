import { describe, it, expect, beforeAll } from 'vitest';
import {
  createSqlJsDatabase,
  SqlJsDatabase,
  type DatabaseStorage,
} from '../../src/database/sqliteWeb';
import { createSchema } from '../../src/database/migrations/001_initial';
import { seedDataInner } from '../../src/database/migrations/002_seed';
import { seedConfigInner } from '../../src/database/migrations/003_config';
import { DB_KEY_MAP } from '../../src/database/configDefaults';

class MemoryStorage implements DatabaseStorage {
  data: Uint8Array | null = null;
  setCount = 0;

  async get(): Promise<Uint8Array | null> {
    return this.data;
  }

  async set(data: Uint8Array): Promise<void> {
    this.data = data;
    this.setCount += 1;
  }
}

async function boot(): Promise<SqlJsDatabase> {
  const db = await createSqlJsDatabase(null, null);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await createSchema(db);
  await seedDataInner(db);
  await seedConfigInner(db);
  return db;
}

describe('sql.js web engine', () => {
  beforeAll(async () => {
    await createSqlJsDatabase(null, null);
  });

  it('runs queries and reports lastInsertRowId and changes', async () => {
    const db = await createSqlJsDatabase(null, null);
    await db.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    const result = await db.runAsync('INSERT INTO t (name) VALUES (?)', 'a');
    expect(result.lastInsertRowId).toBe(1);
    expect(result.changes).toBe(1);
    const row = await db.getFirstAsync<{ name: string }>('SELECT name FROM t WHERE id = ?', 1);
    expect(row?.name).toBe('a');
    db.close();
  });

  it('persists after each committed mutation and restores across a reload', async () => {
    const storage = new MemoryStorage();
    const first = await createSqlJsDatabase(null, storage);
    await first.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    await first.runAsync('INSERT INTO t (name) VALUES (?)', 'persisted');

    const second = await createSqlJsDatabase(storage.data, storage);
    const rows = await second.getAllAsync<{ name: string }>('SELECT name FROM t');
    expect(rows).toEqual([{ name: 'persisted' }]);
    first.close();
    second.close();
  });

  it('persists once per committed transaction, not per statement', async () => {
    const storage = new MemoryStorage();
    const db = await createSqlJsDatabase(null, storage);
    await db.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    storage.setCount = 0;
    await db.withTransactionAsync(async () => {
      await db.runAsync('INSERT INTO t (name) VALUES (?)', 'a');
      await db.runAsync('INSERT INTO t (name) VALUES (?)', 'b');
    });
    expect(storage.setCount).toBe(1);
    db.close();
  });

  it('never persists uncommitted transaction state', async () => {
    const storage = new MemoryStorage();
    const db = await createSqlJsDatabase(null, storage);
    await db.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)');
    await db.runAsync('INSERT INTO t (name) VALUES (?)', 'committed');

    await expect(
      db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO t (name) VALUES (?)', 'rolled back');
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(await db.getAllAsync<{ name: string }>('SELECT name FROM t')).toEqual([{ name: 'committed' }]);

    const reloaded = await createSqlJsDatabase(storage.data, storage);
    expect(await reloaded.getAllAsync<{ name: string }>('SELECT name FROM t')).toEqual([{ name: 'committed' }]);
    db.close();
    reloaded.close();
  });

  it('keeps persisting after a failed BEGIN (no counter leak)', async () => {
    const storage = new MemoryStorage();
    const db = await createSqlJsDatabase(null, storage);
    await db.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT)');

    await expect(
      db.withTransactionAsync(async () => {
        // A nested BEGIN throws before the counter is raised.
        await db.withTransactionAsync(async () => {});
      }),
    ).rejects.toThrow();

    storage.setCount = 0;
    await db.runAsync('INSERT INTO t DEFAULT VALUES');
    expect(storage.setCount).toBe(1);
    db.close();
  });

  it('retries a failed persist once and reports the final failure', async () => {
    class FlakyStorage extends MemoryStorage {
      calls = 0;
      failures: number;
      constructor(failures: number) {
        super();
        this.failures = failures;
      }
      override async set(data: Uint8Array): Promise<void> {
        this.calls += 1;
        if (this.failures > 0) {
          this.failures -= 1;
          throw new Error('quota');
        }
        await super.set(data);
      }
    }

    const transient = new FlakyStorage(1);
    const transientErrors: unknown[] = [];
    const db = await createSqlJsDatabase(null, transient, undefined, e => transientErrors.push(e));
    await db.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY)');
    expect(transient.calls).toBe(2);
    expect(transientErrors).toHaveLength(0);
    db.close();

    const broken = new FlakyStorage(Number.POSITIVE_INFINITY);
    const brokenErrors: unknown[] = [];
    const brokenDb = await createSqlJsDatabase(null, broken, undefined, e => brokenErrors.push(e));
    await brokenDb.execAsync('CREATE TABLE t (id INTEGER PRIMARY KEY)');
    expect(broken.calls).toBe(2);
    expect(brokenErrors).toHaveLength(1);
    brokenDb.close();
  });
  it('keeps foreign keys enabled after persisting (export must not reset the pragma)', async () => {
    const storage = new MemoryStorage();
    const db = await createSqlJsDatabase(null, storage);
    await db.execAsync('PRAGMA foreign_keys = ON;');
    await db.execAsync(
      'CREATE TABLE accounts (id INTEGER PRIMARY KEY, name TEXT);' +
        'CREATE TABLE transactions (id INTEGER PRIMARY KEY, account_id INTEGER REFERENCES accounts(id));',
    );
    await db.runAsync('INSERT INTO accounts (id, name) VALUES (1, ?)', 'a');
    const fk = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
    expect(fk?.foreign_keys).toBe(1);
    await expect(db.runAsync('INSERT INTO transactions (id, account_id) VALUES (1, ?)', 999)).rejects.toThrow();
    db.close();
  });

  it('boots the app schema and seeds the expected rows', async () => {
    const db = await boot();
    const count = (table: string): Promise<number> =>
      db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`).then(r => r?.n ?? 0);

    expect(await count('users')).toBe(1);
    expect(await count('accounts')).toBe(2);
    expect(await count('categories')).toBe(31);
    expect(await count('transactions')).toBe(0);
    expect(await count('tags')).toBe(0);
    expect(await count('transaction_tags')).toBe(0);

    const config = await db.getAllAsync<{ key: string }>('SELECT key FROM config');
    expect(config.map(r => r.key).sort()).toEqual(Object.keys(DB_KEY_MAP).sort());
    db.close();
  });
});
