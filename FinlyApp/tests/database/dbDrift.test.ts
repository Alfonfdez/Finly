import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { SQLiteDatabase } from 'expo-sqlite';
import { initSqlJsOnce, resetMockDatabase } from './sqliteMock';
import { DB_KEY_MAP } from '../../src/database/configDefaults';
import type { User, Account, Category, Transaction, Tag, TransactionTag } from '../../src/database/types';
import {
  accountSchema,
  categorySchema,
  tagSchema,
  transactionSchema,
  transactionTagSchema,
  userSchema,
} from '../../src/database/schemas';

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses,
// even after vi.resetModules() clears the registry per test.
await import('expo-sqlite');

beforeAll(async () => {
  await initSqlJsOnce();
});

async function freshDb(): Promise<SQLiteDatabase> {
  vi.resetModules();
  resetMockDatabase();
  const { initDatabase } = await import('../../src/database/database');
  return (await initDatabase()) as unknown as SQLiteDatabase;
}

// Columns as declared in migrations/001_initial.ts: [name, declared type, NOT NULL?]
const EXPECTED_COLUMNS: Record<string, [string, string, number][]> = {
  users: [
    ['id', 'INTEGER', 0],
    ['name', 'TEXT', 1],
    ['email', 'TEXT', 0],
    ['avatar', 'TEXT', 0],
    ['currency', 'TEXT', 1],
    ['created_at', 'TEXT', 1],
  ],
  accounts: [
    ['id', 'INTEGER', 0],
    ['user_id', 'INTEGER', 1],
    ['name', 'TEXT', 1],
    ['initial_balance', 'REAL', 1],
    ['icon', 'TEXT', 1],
    ['color', 'TEXT', 1],
    ['description', 'TEXT', 0],
    ['is_total', 'INTEGER', 1],
    ['created_at', 'TEXT', 1],
  ],
  categories: [
    ['id', 'INTEGER', 0],
    ['user_id', 'INTEGER', 1],
    ['name', 'TEXT', 1],
    ['icon', 'TEXT', 1],
    ['color', 'TEXT', 1],
    ['type', 'TEXT', 1],
    ['created_at', 'TEXT', 1],
  ],
  transactions: [
    ['id', 'INTEGER', 0],
    ['account_id', 'INTEGER', 1],
    ['category_id', 'INTEGER', 1],
    ['type', 'TEXT', 1],
    ['amount', 'REAL', 1],
    ['description', 'TEXT', 0],
    ['photo', 'TEXT', 0],
    ['date', 'TEXT', 1],
    ['updated_at', 'TEXT', 0],
    ['created_at', 'TEXT', 1],
  ],
  tags: [
    ['id', 'INTEGER', 0],
    ['user_id', 'INTEGER', 1],
    ['name', 'TEXT', 1],
    ['created_at', 'TEXT', 0],
  ],
  transaction_tags: [
    ['transaction_id', 'INTEGER', 1],
    ['tag_id', 'INTEGER', 1],
  ],
  config: [
    ['key', 'TEXT', 0],
    ['value', 'TEXT', 1],
  ],
};

// Fully populated samples typed from src/database/types.ts: any field added to a
// migration but missed in the types, or vice versa, fails one of these assertions.
const TYPE_SAMPLES: Record<string, { sample: Record<string, unknown> }> = {
  users: {
    sample: { id: 0, name: '', email: null, avatar: null, currency: '', created_at: '' } satisfies User,
  },
  accounts: {
    sample: {
      id: 0,
      user_id: 0,
      name: '',
      initial_balance: 0,
      icon: '',
      color: '',
      description: '',
      is_total: 0,
      created_at: '',
    } satisfies Account,
  },
  categories: {
    sample: { id: 0, user_id: 0, name: '', icon: '', color: '', type: 'expense', created_at: '' } satisfies Category,
  },
  transactions: {
    sample: {
      id: 0,
      account_id: 0,
      category_id: 0,
      type: 'expense',
      amount: 0,
      description: null,
      photo: null,
      date: '',
      created_at: '',
      updated_at: null,
    } satisfies Transaction,
  },
  tags: {
    sample: { id: 0, user_id: 0, name: '', created_at: '' } satisfies Tag,
  },
  transaction_tags: {
    sample: { transaction_id: 0, tag_id: 0 } satisfies TransactionTag,
  },
};

async function countRows(db: SQLiteDatabase, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return row?.n ?? 0;
}

async function columns(db: SQLiteDatabase, table: string): Promise<{ name: string; type: string; notnull: number }[]> {
  return db.getAllAsync<{ name: string; type: string; notnull: number }>(`PRAGMA table_info(${table})`);
}

describe('DB drift', () => {
  it('migrations produce the expected schema', async () => {
    const db = await freshDb();
    for (const [table, expected] of Object.entries(EXPECTED_COLUMNS)) {
      const info = await columns(db, table);
      expect(info.map(c => [c.name, c.type, c.notnull]), `table ${table}`).toEqual(expected);
    }
  });

  it('schema columns cover every field declared in types.ts', async () => {
    const db = await freshDb();
    for (const [table, { sample }] of Object.entries(TYPE_SAMPLES)) {
      const info = await columns(db, table);
      const names = new Set(info.map(c => c.name));
      for (const field of Object.keys(sample as Record<string, unknown>)) {
        expect(names.has(field), `missing column ${table}.${field}`).toBe(true);
      }
    }
    // config is key/value; assert the two columns exist and match DB_KEY_MAP keys
    const configInfo = await columns(db, 'config');
    const configNames = configInfo.map(c => c.name);
    expect(configNames).toEqual(['key', 'value']);
  });

  it('zod schema keys exactly match the migration columns', async () => {
    const db = await freshDb();
    const schemaByTable: Record<string, { shape: Record<string, unknown> }> = {
      users: userSchema,
      accounts: accountSchema,
      categories: categorySchema,
      transactions: transactionSchema,
      tags: tagSchema,
      transaction_tags: transactionTagSchema,
    };
    for (const [table, schema] of Object.entries(schemaByTable)) {
      const info = await columns(db, table);
      const schemaKeys = Object.keys(schema.shape).sort();
      const columnNames = info.map(c => c.name).sort();
      expect(schemaKeys, `zod schema keys vs columns for ${table}`).toEqual(columnNames);
    }
  });

  it('migrates to user_version 3 and seeds the expected rows', async () => {
    const db = await freshDb();
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBe(3);

    expect(await countRows(db, 'users')).toBe(1);
    expect(await countRows(db, 'accounts')).toBe(2);
    expect(await countRows(db, 'categories')).toBe(31);
    expect(await countRows(db, 'transactions')).toBe(0);
    expect(await countRows(db, 'tags')).toBe(0);
    expect(await countRows(db, 'transaction_tags')).toBe(0);

    const configRows = await db.getAllAsync<{ key: string }>('SELECT key FROM config');
    expect(configRows.map(r => r.key).sort()).toEqual(Object.keys(DB_KEY_MAP).sort());
  });

  it('initDatabase is idempotent across calls', async () => {
    const db = await freshDb();
    const { initDatabase } = await import('../../src/database/database');
    await initDatabase(); // user_version already 3: migrate returns early, no re-seed
    expect(await countRows(db, 'users')).toBe(1);
    expect(await countRows(db, 'accounts')).toBe(2);
    expect(await countRows(db, 'categories')).toBe(31);
  });

  it('web storage seeds the same entity counts as SQLite', async () => {
    localStorage.clear();
    const { initWebStorage } = await import('../../src/database/webStorage');
    await initWebStorage();

    const store = (key: string): unknown[] =>
      JSON.parse(localStorage.getItem('@Finly/' + key) ?? '[]') as unknown[];
    expect(store('users')).toHaveLength(1);
    expect(store('accounts')).toHaveLength(2);
    expect(store('categories')).toHaveLength(31);
    expect(store('transactions')).toHaveLength(0);
    expect(store('tags')).toHaveLength(0);
    expect(store('transaction_tags')).toHaveLength(0);

    await initWebStorage(); // re-init must not duplicate
    expect(store('accounts')).toHaveLength(2);
    expect(store('categories')).toHaveLength(31);
  });
});
