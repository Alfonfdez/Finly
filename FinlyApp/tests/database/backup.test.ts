import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { createSqlJsDatabase, type SqlJsDatabase } from '../../src/database/sqliteWeb';
import { createSchema } from '../../src/database/migrations/001_initial';
import { seedDataInner } from '../../src/database/migrations/002_seed';
import { seedConfigInner } from '../../src/database/migrations/003_config';
import { createRecurringSchema } from '../../src/database/migrations/004_recurring';
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
} from '../../src/database/backupService';

const dbHolder = vi.hoisted(() => ({ db: null as SqlJsDatabase | null }));

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

vi.mock('../../src/database/database', () => ({
  getDatabase: async () => dbHolder.db,
  SCHEMA_VERSION: 4,
}));

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses.
await import('expo-sqlite');

const SCHEMA_VERSION = 4;
const TABLES = [
  'users',
  'accounts',
  'categories',
  'transactions',
  'tags',
  'transaction_tags',
  'recurring_rules',
  'recurring_rule_tags',
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
  await createRecurringSchema(db);
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
    await createRecurringSchema(db);
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
    await createRecurringSchema(target);
    await applyBackup(target, snapshot);
    expect(await countRows(target, 'users')).toBe(1);
    expect(await countRows(target, 'accounts')).toBe(2);
    expect(await countRows(target, 'categories')).toBe(31);
    source.close();
    target.close();
  });

  it('round-trips recurring rules, their tags and generated transactions', async () => {
    const source = await boot();
    const tagId = (
      await source.runAsync("INSERT INTO tags (user_id, name, created_at) VALUES (1, 'home', '2026-01-01')")
    ).lastInsertRowId;
    const ruleId = (
      await source.runAsync(
        "INSERT INTO recurring_rules (user_id, name, type, account_id, category_id, amount, description, frequency, interval, weekday, day_of_month, month, start_date, end_date, next_due, active, created_at, updated_at) VALUES (1, 'Rent', 'expense', 1, 3, 100, 'Rent', 'monthly', 1, NULL, 2, NULL, '2026-01-02', NULL, '2026-03-02', 1, '2026-01-01', NULL)"
      )
    ).lastInsertRowId;
    await source.runAsync('INSERT INTO recurring_rule_tags (rule_id, tag_id) VALUES (?, ?)', ruleId, tagId);
    await source.runAsync(
      "INSERT INTO transactions (account_id, category_id, type, amount, description, date, created_at, recurring_rule_id, recurrence_date) VALUES (1, 3, 'expense', 100, 'Rent', '2026-01-02 00:00:00', '2026-01-02', ?, '2026-01-02')",
      ruleId
    );

    const snapshot = await buildBackup(source, SCHEMA_VERSION);
    const target = await boot();
    await applyBackup(target, snapshot);

    expect(await dump(target)).toEqual(await dump(source));
    expect(await countRows(target, 'recurring_rules')).toBe(1);
    expect(await countRows(target, 'recurring_rule_tags')).toBe(1);
    const tx = await target.getFirstAsync<{ recurring_rule_id: number; recurrence_date: string }>(
      'SELECT recurring_rule_id, recurrence_date FROM transactions'
    );
    expect(tx?.recurring_rule_id).toBe(ruleId);
    expect(tx?.recurrence_date).toBe('2026-01-02');
    source.close();
    target.close();
  });

  it('imports a pre-028 (schema 3) snapshot without the recurring collections', async () => {
    const source = await boot();
    const full = await buildBackup(source, SCHEMA_VERSION);
    const { recurring_rules: _rules, recurring_rule_tags: _links, ...data } = full.data;
    void _rules;
    void _links;
    const legacy = JSON.stringify({ ...full, schema: 3, data });

    const target = await boot();
    await applyBackup(target, parseBackup(legacy));
    expect(await countRows(target, 'users')).toBe(1);
    expect(await countRows(target, 'recurring_rules')).toBe(0);
    source.close();
    target.close();
  });
});

describe('backup validation', () => {
  it('rejects malformed JSON with the invalid_json code', () => {
    try {
      parseBackup('{not json');
      throw new Error('expected to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BackupValidationError);
      expect((error as BackupValidationError).code).toBe('invalid_json');
    }
  });

  it('rejects a wrong app/kind/formatVersion with the invalid_format code', () => {
    for (const overrides of [{ app: 'Other' }, { kind: 'dump' }, { formatVersion: 2 }]) {
      try {
        parseBackup(snapshotWith(overrides));
        throw new Error('expected to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(BackupValidationError);
        expect((error as BackupValidationError).code).toBe('invalid_format');
      }
    }
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

  it('nulls default-account config keys referencing missing or total accounts', async () => {
    const source = await boot();
    await source.runAsync(
      "INSERT INTO config (key, value) VALUES ('home_default_account_id', '424242') ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    await source.runAsync(
      "INSERT INTO config (key, value) VALUES ('add_default_account_id', '2') ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    const snapshot = await buildBackup(source, SCHEMA_VERSION);

    const target = await createSqlJsDatabase(null, null);
    await target.execAsync('PRAGMA foreign_keys = ON;');
    await createSchema(target);
    await createRecurringSchema(target);
    await applyBackup(target, snapshot);

    const rows = await target.getAllAsync<{ key: string; value: string }>(
      "SELECT key, value FROM config WHERE key IN ('home_default_account_id', 'add_default_account_id') ORDER BY key"
    );
    expect(rows).toEqual([
      { key: 'add_default_account_id', value: 'null' },
      { key: 'home_default_account_id', value: 'null' },
    ]);
    source.close();
    target.close();
  });

  it('keeps default-account config keys that reference existing accounts', async () => {
    const source = await boot();
    await source.runAsync(
      "INSERT INTO config (key, value) VALUES ('home_default_account_id', '1') ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    const snapshot = await buildBackup(source, SCHEMA_VERSION);

    const target = await createSqlJsDatabase(null, null);
    await target.execAsync('PRAGMA foreign_keys = ON;');
    await createSchema(target);
    await createRecurringSchema(target);
    await applyBackup(target, snapshot);

    const row = await target.getFirstAsync<{ value: string }>(
      "SELECT value FROM config WHERE key = 'home_default_account_id'"
    );
    expect(row?.value).toBe('1');
    source.close();
    target.close();
  });
});

describe('backup facades', () => {
  beforeEach(async () => {
    dbHolder.db = await boot();
  });

  it('rejects backups from a newer app version with the newer_version code without touching data', async () => {
    const db = dbHolder.db as SqlJsDatabase;
    const before = await countRows(db, 'accounts');
    await expect(importBackup(snapshotWith({ schema: 99 }))).rejects.toMatchObject({
      name: 'BackupValidationError',
      code: 'newer_version',
    });
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
