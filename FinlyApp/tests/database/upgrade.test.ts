import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { initSqlJsOnce, resetMockDatabase } from './sqliteMock';

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

// The repositories reach expo-file-system through photoUtils/photoCleanup; the
// read paths under test never touch a real file.
vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;
    exists = false;
    constructor(uri: string) {
      this.uri = uri;
    }
    copy() {}
    delete() {}
  },
}));

// Evaluate the expo-sqlite mock factory now (registry intact) so its dynamic
// import of sqliteMock resolves to the same module instance the test file uses,
// even after vi.resetModules() clears the registry per test.
await import('expo-sqlite');

beforeAll(async () => {
  await initSqlJsOnce();
});

// The config keys a v2.1.0 (schema 3) database stores, with non-default values —
// frozen on purpose: the upgrade must cope with the schema-4 keys being absent.
const V210_CONFIG: [string, string][] = [
  ['theme', 'light'],
  ['first_day_of_week', '0'],
  ['currency', '$'],
  ['decimal_separator', '.'],
  ['language', 'ca'],
  ['text_size', 'large'],
  ['category_icon_shape', 'circle'],
  ['account_icon_shape', 'circle'],
  ['home_default_account_id', '1'],
  ['home_default_period', 'week'],
  ['add_default_account_id', '1'],
  ['add_show_labels', 'false'],
  ['add_show_comments', 'false'],
  ['add_show_photo', 'false'],
  ['hide_balances', 'true'],
];

async function tableExists(db: DatabaseHandle, name: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?`,
    name,
  );
  return (row?.n ?? 0) > 0;
}

async function columnNames(db: DatabaseHandle, table: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  return rows.map(r => r.name);
}

async function countRows(db: DatabaseHandle, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`);
  return row?.n ?? 0;
}

async function rawConfig(db: DatabaseHandle): Promise<Record<string, string>> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM config ORDER BY key');
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

/** Dump the schema-3 columns of every table, so the pre/post comparison ignores the added ones. */
async function dumpLegacy(db: DatabaseHandle) {
  return {
    users: await db.getAllAsync('SELECT id, name, email, avatar, currency, created_at FROM users ORDER BY id'),
    accounts: await db.getAllAsync('SELECT id, user_id, name, initial_balance, icon, color, description, is_total, created_at FROM accounts ORDER BY id'),
    categories: await db.getAllAsync('SELECT id, user_id, name, icon, color, type, created_at FROM categories ORDER BY id'),
    transactions: await db.getAllAsync('SELECT id, account_id, category_id, type, amount, description, photo, date, updated_at, created_at FROM transactions ORDER BY id'),
    tags: await db.getAllAsync('SELECT id, user_id, name, created_at FROM tags ORDER BY id'),
    transaction_tags: await db.getAllAsync('SELECT transaction_id, tag_id FROM transaction_tags ORDER BY transaction_id, tag_id'),
    config: await db.getAllAsync('SELECT key, value FROM config ORDER BY key'),
  };
}

/**
 * Build a v2.1.0-shaped database (schema 3: migrations 001-003 + data) on the
 * handle the app itself will use, so the real `initDatabase()` migrates it.
 */
async function bootV210(): Promise<DatabaseHandle> {
  vi.resetModules();
  resetMockDatabase();
  const { getDatabase } = await import('../../src/database/database');
  const db = await getDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const { createSchema } = await import('../../src/database/migrations/001_initial');
  const { seedDataInner } = await import('../../src/database/migrations/002_seed');
  await createSchema(db);
  await seedDataInner(db);

  for (const [key, value] of V210_CONFIG) {
    await db.runAsync('INSERT INTO config (key, value) VALUES (?, ?)', key, value);
  }

  await db.runAsync(`INSERT INTO tags (id, user_id, name) VALUES (1, 1, 'work'), (2, 1, 'essential')`);
  await db.runAsync(`
    INSERT INTO transactions (id, account_id, category_id, type, amount, description, photo, date, updated_at, created_at) VALUES
      (1, 1, 3, 'expense', 24.99, 'Lunch', NULL, '2026-10-05', NULL, '2026-10-05 12:00:00'),
      (2, 1, 1, 'income', 2057.21, NULL, NULL, '2026-10-01', NULL, '2026-10-01 09:00:00'),
      (3, 1, 12, 'expense', 51.04, NULL, '[{"uri":"file:///photo.jpg"}]', '2026-10-03', NULL, '2026-10-03 18:00:00'),
      (4, 1, 5, 'expense', 9.5, 'Cinema', NULL, '2026-09-28', NULL, '2026-09-28 21:00:00')
  `);
  await db.runAsync('INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (1, 1), (1, 2), (3, 1)');

  await db.execAsync('PRAGMA user_version = 3');
  return db;
}

/** The real migration, exactly as the app runs it on launch after the update. */
async function upgrade(): Promise<void> {
  const { initDatabase } = await import('../../src/database/database');
  await initDatabase();
}

describe('upgrade from a v2.1.0 database (schema 3 -> 4)', () => {
  let db: DatabaseHandle;

  beforeEach(async () => {
    db = await bootV210();
  });

  it('starts from a faithful schema-3 database', async () => {
    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBe(3);

    expect(await tableExists(db, 'recurring_rules')).toBe(false);
    expect(await tableExists(db, 'recurring_rule_tags')).toBe(false);
    const columns = await columnNames(db, 'transactions');
    expect(columns).not.toContain('recurring_rule_id');
    expect(columns).not.toContain('recurrence_date');

    // Only the 15 schema-3 config rows exist.
    expect(Object.keys(await rawConfig(db))).toHaveLength(15);
  });

  it('migrates to schema 4 and adds the recurring tables, columns and index', async () => {
    await upgrade();

    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBe(4);
    expect(await tableExists(db, 'recurring_rules')).toBe(true);
    expect(await tableExists(db, 'recurring_rule_tags')).toBe(true);

    const columns = await columnNames(db, 'transactions');
    expect(columns).toContain('recurring_rule_id');
    expect(columns).toContain('recurrence_date');

    const index = await db.getFirstAsync<{ n: number }>(
      `SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'index' AND name = 'ux_transactions_recurrence'`,
    );
    expect(index?.n).toBe(1);

    // The added columns are NULL on every existing row.
    const legacyRows = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM transactions WHERE recurring_rule_id IS NULL AND recurrence_date IS NULL',
    );
    expect(legacyRows?.n).toBe(4);
  });

  it('leaves every pre-existing row byte-identical', async () => {
    const before = await dumpLegacy(db);
    await upgrade();
    expect(await dumpLegacy(db)).toEqual(before);

    expect(await countRows(db, 'users')).toBe(1);
    expect(await countRows(db, 'accounts')).toBe(2);
    expect(await countRows(db, 'categories')).toBe(31);
    expect(await countRows(db, 'tags')).toBe(2);
    expect(await countRows(db, 'transactions')).toBe(4);
    expect(await countRows(db, 'transaction_tags')).toBe(3);
  });

  it('keeps the legacy config values and defaults the new keys', async () => {
    await upgrade();
    const { configRepo } = await import('../../src/database/repositories/configRepo');
    const config = await configRepo.get();

    expect(config).toMatchObject({
      theme: 'light',
      firstDayOfWeek: 0,
      currency: '$',
      decimalSeparator: '.',
      language: 'ca',
      textSize: 'large',
      categoryIconShape: 'circle',
      accountIconShape: 'circle',
      homeDefaultAccountId: 1,
      homeDefaultPeriod: 'week',
      addDefaultAccountId: 1,
      addShowLabels: false,
      addShowComments: false,
      addShowPhoto: false,
      hideBalances: true,
      // New in schema 4: absent from the table, so they fall back to the defaults.
      modifyShowLabels: true,
      modifyShowComments: true,
      modifyShowPhoto: true,
      createRecurringDefaultAccountId: null,
      createRecurringShowLabels: true,
      createRecurringShowComments: true,
      editRecurringShowLabels: true,
      editRecurringShowComments: true,
    });

    // The migration does not backfill the new rows — they are merged at read time.
    expect(Object.keys(await rawConfig(db))).toHaveLength(15);
  });

  it('reads every legacy row back through the repositories', async () => {
    await upgrade();
    const { transactionRepo } = await import('../../src/database/repositories/transactionRepo');
    const { accountRepo } = await import('../../src/database/repositories/accountRepo');
    const { categoryRepo } = await import('../../src/database/repositories/categoryRepo');
    const { tagRepo } = await import('../../src/database/repositories/tagRepo');
    const { recurringRepo } = await import('../../src/database/repositories/recurringRepo');

    const transactions = await transactionRepo.list({});
    expect(transactions).toHaveLength(4);
    expect(await accountRepo.list(1)).toHaveLength(2);
    expect(await categoryRepo.list(1)).toHaveLength(31);
    expect(await tagRepo.list(1)).toHaveLength(2);
    expect(await recurringRepo.list(1)).toHaveLength(0);

    const photoTx = transactions.find(t => t.id === 3);
    expect(photoTx?.photo).toBe('[{"uri":"file:///photo.jpg"}]');
    expect(photoTx?.amount).toBe(51.04);
  });

  it('creates nothing on the first reconciliation', async () => {
    await upgrade();
    const { materializeDueRecurring } = await import('../../src/database/recurringService');
    expect(await materializeDueRecurring(new Date(2026, 9, 5))).toBe(0);
    expect(await countRows(db, 'transactions')).toBe(4);
  });

  it('backs up the upgraded database and still accepts a pre-028 snapshot', async () => {
    await upgrade();
    const { buildBackup, serializeBackup, parseBackup } = await import('../../src/database/backup');

    const snapshot = await buildBackup(db, 4);
    expect(snapshot.schema).toBe(4);
    expect(snapshot.data.transactions).toHaveLength(4);
    expect(snapshot.data.recurring_rules).toEqual([]);
    expect(snapshot.data.recurring_rule_tags).toEqual([]);
    expect(parseBackup(serializeBackup(snapshot)).data.transactions).toHaveLength(4);

    // A schema-3 snapshot (no recurring collections) is still accepted.
    const { recurring_rules: _rules, recurring_rule_tags: _links, ...data } = snapshot.data;
    void _rules;
    void _links;
    expect(parseBackup(JSON.stringify({ ...snapshot, schema: 3, data })).data.transactions).toHaveLength(4);
  });

  it('is idempotent: migrating again changes nothing', async () => {
    await upgrade();
    const after = await dumpLegacy(db);
    await upgrade();

    const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBe(4);
    expect(await dumpLegacy(db)).toEqual(after);
  });

  it('can create and materialize a recurring rule after the upgrade', async () => {
    await upgrade();
    const { createRecurringRule } = await import('../../src/database/recurringService');

    const created = await createRecurringRule({
      name: 'Rent',
      type: 'expense',
      account_id: 1,
      category_id: 6,
      amount: 800,
      description: null,
      date: '2026-10-01',
      frequency: 'monthly',
      interval: 1,
      endDate: null,
      tagIds: [],
      now: new Date(2026, 9, 5),
    });
    expect(created).toBe(1);

    const tx = await db.getFirstAsync<{ recurring_rule_id: number; recurrence_date: string }>(
      'SELECT recurring_rule_id, recurrence_date FROM transactions WHERE recurring_rule_id IS NOT NULL',
    );
    expect(tx?.recurring_rule_id).toBeGreaterThan(0);
    expect(tx?.recurrence_date).toBe('2026-10-01');
    expect(await countRows(db, 'transactions')).toBe(5);
  });
});
