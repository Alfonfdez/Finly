import { describe, it, expect, beforeAll } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { createSqliteProxyCallback, runResultOf, type SqliteProxyCallback } from '../../src/database/drizzle/proxy';
import { createMockDatabaseSync, initSqlJsOnce } from './sqliteMock';

beforeAll(async () => {
  await initSqlJsOnce();
});

async function setup(): Promise<DatabaseHandle> {
  const db = createMockDatabaseSync();
  await db.execAsync(
    'CREATE TABLE items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, qty INTEGER NOT NULL DEFAULT 0)'
  );
  return db;
}

function callbackFor(db: DatabaseHandle): SqliteProxyCallback {
  return createSqliteProxyCallback(() => Promise.resolve(db));
}

describe('sqlite proxy adapter', () => {
  it('run executes a statement and reports lastInsertRowId and changes', async () => {
    const db = await setup();
    const cb = callbackFor(db);

    const inserted = await cb('INSERT INTO items (name, qty) VALUES (?, ?)', ['apple', 3], 'run');
    expect(runResultOf(inserted)).toEqual({ lastInsertRowId: 1, changes: 1 });

    const updated = await cb("UPDATE items SET qty = ? WHERE name = ?", [5, 'apple'], 'run');
    expect(runResultOf(updated)).toEqual({ lastInsertRowId: 1, changes: 1 });

    const deleted = await cb('DELETE FROM items WHERE name = ?', ['apple'], 'run');
    expect(runResultOf(deleted)).toEqual({ lastInsertRowId: 1, changes: 1 });
  });

  it('run reports zero changes when no row is affected', async () => {
    const db = await setup();
    const cb = callbackFor(db);
    const result = await cb('UPDATE items SET qty = ? WHERE name = ?', [9, 'missing'], 'run');
    expect(runResultOf(result).changes).toBe(0);
  });

  it('all returns rows as positional arrays', async () => {
    const db = await setup();
    const cb = callbackFor(db);
    await cb('INSERT INTO items (name, qty) VALUES (?, ?)', ['apple', 3], 'run');
    await cb('INSERT INTO items (name, qty) VALUES (?, ?)', ['pear', 2], 'run');

    const result = await cb('SELECT id, name, qty FROM items ORDER BY id', [], 'all');
    expect(result.rows).toEqual([[1, 'apple', 3], [2, 'pear', 2]]);
  });

  it('get returns a single positional row or null when absent', async () => {
    const db = await setup();
    const cb = callbackFor(db);

    const none = await cb('SELECT * FROM items WHERE id = ?', [99], 'get');
    expect(none.rows).toBeNull();

    await cb('INSERT INTO items (name, qty) VALUES (?, ?)', ['apple', 3], 'run');
    const one = await cb('SELECT id, name, qty FROM items WHERE id = ?', [1], 'get');
    expect(one.rows).toEqual([1, 'apple', 3]);
  });

  it('values returns rows as raw arrays', async () => {
    const db = await setup();
    const cb = callbackFor(db);
    await cb('INSERT INTO items (name, qty) VALUES (?, ?)', ['apple', 3], 'run');

    const result = await cb('SELECT name, qty FROM items', [], 'values');
    expect(result.rows).toEqual([['apple', 3]]);
  });

  it('propagates driver errors', async () => {
    const db = await setup();
    const cb = callbackFor(db);
    await expect(cb('SELECT * FROM missing_table', [], 'all')).rejects.toThrow();
  });

  it('runResultOf tolerates empty or malformed results', () => {
    expect(runResultOf({})).toEqual({ lastInsertRowId: 0, changes: 0 });
    expect(runResultOf({ rows: [] })).toEqual({ lastInsertRowId: 0, changes: 0 });
  });
});
