import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { createSqlJsDatabase, type SqlJsDatabase } from '../../src/database/sqliteWeb';
import { createSchema } from '../../src/database/migrations/001_initial';
import { seedDataInner } from '../../src/database/migrations/002_seed';
import { seedConfigInner } from '../../src/database/migrations/003_config';
import {
  BACKUP_FORMAT_VERSION,
  BackupValidationError,
  applyBackup,
  buildBackup,
  parseBackup,
  serializeBackup,
} from '../../src/database/backup';
import {
  exportBackup,
  importBackup,
  BackupValidationError as BackupServiceError,
} from '../../src/database/backupService';

const dbHolder = vi.hoisted(() => ({ db: null as SqlJsDatabase | null }));

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

vi.mock('../../src/database/database', () => ({
  getDatabase: async () => dbHolder.db,
  SCHEMA_VERSION: 3,
}));

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses.
await import('expo-sqlite');

const SCHEMA_VERSION = 3;
const TABLES = [
  'users',
  'accounts',
  'categories',
  'transactions',
  'tags',
  'transaction_tags',
  'config',
];

beforeAll(async () => {
  await createSqlJsDatabase(null, null);
});

async function boot(): Promise<SqlJsDatabase> {
  const db = await createSqlJsDatabase(null, null);
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await createSchema(db);
  await seedDataInner(db);
  await seedConfigInner(db);
  return db;
}

async function countRows(db: DatabaseHandle, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return row?.n ?? 0;
}

async function dump(db: DatabaseHandle): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    out[table] = await db.getAllAsync(`SELECT * FROM ${table} ORDER BY rowid`);
  }
  return out;
}

function snapshotWith(
  overrides: Partial<Record<'app' | 'kind' | 'formatVersion' | 'schema', unknown>> = {},
  data: Record<string, unknown> | null = null
): string {
  return JSON.stringify({
    app: 'Finly',
    kind: 'backup',
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    schema: SCHEMA_VERSION,
    data: data ?? { users: [], accounts: [], categories: [], transactions: [], tags: [], transaction_tags: [], config: [] },
    ...overrides,
  });
}

describe('backup snapshot', () => {
  it('builds a snapshot whose collections match the schema tables', async () => {
    const db = await boot();
    const snapshot = await buildBackup(db, SCHEMA_VERSION);
    expect(Object.keys(snapshot.data).sort()).toEqual([...TABLES].sort());
    expect(snapshot.app).toBe('Finly');
    expect(snapshot.kind).toBe('backup');
    expect(snapshot.formatVersion).toBe(BACKUP_FORMAT_VERSION);
    expect(snapshot.schema).toBe(SCHEMA_VERSION);
    db.close();
  });

  it('serialize/parse round-trips a snapshot byte-for-byte', async () => {
    const db = await boot();
    const snapshot = await buildBackup(db, SCHEMA_VERSION);
    const parsed = parseBackup(serializeBackup(snapshot));
    expect(parsed).toEqual(snapshot);
    db.close();
  });

  it('exports an empty database as valid', async () => {
    const db = await createSqlJsDatabase(null, null);
    await db.execAsync('PRAGMA foreign_keys = ON;');
    await createSchema(db);
    const snapshot = await buildBackup(db, SCHEMA_VERSION);
    for (const table of TABLES) {
      expect(snapshot.data[table as keyof typeof snapshot.data]).toEqual([]);
    }
    db.close();
  });
});

describe('backup round-trip', () => {
  it('restores every table exactly, including photo data URIs and tag links', async () => {
    const source = await boot();
    await source.runAsync(
      'INSERT INTO transactions (account_id, category_id, type, amount, description, photo, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      1,
      1,
      'expense',
      12.5,
      'Cafe',
      '["data:image/jpeg;base64,AAAA","data:image/png;base64,BBBB"]',
      '2026-08-08',
      '2026-08-08 10:00:00'
    );
    const tagId = (
      await source.runAsync("INSERT INTO tags (user_id, name, created_at) VALUES (1, 'work', '2026-08-08')")
    ).lastInsertRowId;
    const transactionId = (
      await source.getFirstAsync<{ id: number }>("SELECT id FROM transactions WHERE description = 'Cafe'")
    )?.id as number;
    await source.runAsync('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)', transactionId, tagId);

    const snapshot = await buildBackup(source, SCHEMA_VERSION);

    const target = await boot();
    await applyBackup(target, snapshot);

    expect(await dump(target)).toEqual(await dump(source));

    const photo = await target.getFirstAsync<{ photo: string | null }>('SELECT photo FROM transactions');
    expect(photo?.photo).toBe('["data:image/jpeg;base64,AAAA","data:image/png;base64,BBBB"]');
    expect(await countRows(target, 'transaction_tags')).toBe(1);
    source.close();
    target.close();
  });

  it('applies a snapshot to an empty database', async () => {
    const source = await boot();
    const snapshot = await buildBackup(source, SCHEMA_VERSION);
    const target = await createSqlJsDatabase(null, null);
    await target.execAsync('PRAGMA foreign_keys = ON;');
    await createSchema(target);
    await applyBackup(target, snapshot);
    expect(await countRows(target, 'users')).toBe(1);
    expect(await countRows(target, 'accounts')).toBe(2);
    expect(await countRows(target, 'categories')).toBe(31);
    source.close();
    target.close();
  });
});

describe('backup validation', () => {
  it('rejects malformed JSON', () => {
    expect(() => parseBackup('{not json')).toThrow(BackupValidationError);
  });

  it('rejects a wrong app/kind/formatVersion', () => {
    expect(() => parseBackup(snapshotWith({ app: 'Other' }))).toThrow(BackupValidationError);
    expect(() => parseBackup(snapshotWith({ kind: 'dump' }))).toThrow(BackupValidationError);
    expect(() => parseBackup(snapshotWith({ formatVersion: 2 }))).toThrow(BackupValidationError);
  });

  it('rejects rows that violate the row schemas', () => {
    const bad = snapshotWith({}, {
      users: [],
      accounts: [],
      categories: [],
      transactions: [{ id: 1, account_id: 1, category_id: 1, type: 'invalid', amount: -5, description: null, photo: null, date: '', created_at: '', updated_at: null }],
      tags: [],
      transaction_tags: [],
      config: [],
    });
    expect(() => parseBackup(bad)).toThrow(BackupValidationError);
  });

  it('rolls back on an FK-violating snapshot and leaves existing data unchanged', async () => {
    const source = await boot();
    const snapshot = await buildBackup(source, SCHEMA_VERSION);
    snapshot.data.transactions.push({
      id: 9999,
      account_id: 424242,
      category_id: 1,
      type: 'expense',
      amount: 5,
      description: 'orphan',
      photo: null,
      date: '2026-08-08',
      created_at: '2026-08-08',
      updated_at: null,
    });

    const target = await boot();
    await expect(applyBackup(target, snapshot)).rejects.toThrow();
    expect(await countRows(target, 'transactions')).toBe(0);
    expect(await countRows(target, 'accounts')).toBe(2);
    expect(await countRows(target, 'categories')).toBe(31);
    source.close();
    target.close();
  });
});

describe('backup facades', () => {
  beforeEach(async () => {
    dbHolder.db = await boot();
  });

  it('rejects backups from a newer app version without touching data', async () => {
    const db = dbHolder.db as SqlJsDatabase;
    const before = await countRows(db, 'accounts');
    await expect(importBackup(snapshotWith({ schema: 99 }))).rejects.toBeInstanceOf(BackupServiceError);
    expect(await countRows(db, 'accounts')).toBe(before);
  });

  it('round-trips through exportBackup/importBackup', async () => {
    const db = dbHolder.db as SqlJsDatabase;
    const before = await countRows(db, 'transactions');
    await db.runAsync(
      "INSERT INTO transactions (account_id, category_id, type, amount, date, created_at) VALUES (1, 1, 'expense', 10, '2026-08-08', '2026-08-08')"
    );
    const json = await exportBackup();
    await db.runAsync('DELETE FROM transactions');
    expect(await countRows(db, 'transactions')).toBe(0);
    await importBackup(json);
    expect(await countRows(db, 'transactions')).toBe(before + 1);
  });
});
