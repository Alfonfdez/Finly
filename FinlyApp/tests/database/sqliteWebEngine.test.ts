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
      })
    ).rejects.toThrow('boom');

    expect(await db.getAllAsync<{ name: string }>('SELECT name FROM t')).toEqual([{ name: 'committed' }]);

    const reloaded = await createSqlJsDatabase(storage.data, storage);
    expect(await reloaded.getAllAsync<{ name: string }>('SELECT name FROM t')).toEqual([{ name: 'committed' }]);
    db.close();
    reloaded.close();
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
