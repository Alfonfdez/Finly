import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import type { RecurringRuleInput } from '../../src/database/repositories/recurringRepo';
import { initSqliteHarness, bootSqliteDb as boot } from './helpers/sqliteHarness';

vi.mock('../../src/database/photoCleanup', () => ({
  collectTransactionPhotos: vi.fn(async () => []),
  collectAllTransactionPhotos: vi.fn(async () => []),
  deletePhotoUris: vi.fn(async () => {}),
}));

vi.mock('expo-sqlite', async () => {
  const mod = await import('./sqliteMock');
  return { openDatabaseSync: mod.openDatabaseSync };
});

await import('expo-sqlite');

beforeAll(initSqliteHarness);

const NOW = new Date(2026, 9, 19, 12);

/** A daily rule with ~290 due occurrences, so a reconciliation run is long enough to interleave. */
const dailyRule: RecurringRuleInput = {
  user_id: 1,
  name: 'Daily',
  type: 'expense',
  account_id: 1,
  category_id: 3,
  amount: 10,
  description: null,
  frequency: 'daily',
  interval: 1,
  weekday: null,
  day_of_month: null,
  month: null,
  start_date: '2026-01-01',
  end_date: null,
  next_due: '2026-01-01',
  active: 1,
};

async function count(db: DatabaseHandle, table: string): Promise<number> {
  const row = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) AS count FROM ${table}`);
  return row?.count ?? 0;
}

describe('transactions are serialized with the reconciliation run', () => {
  it('a factory reset waits for a running catch-up and wins', async () => {
    const { db, recurringRepo, materializeDueRecurring } = await boot();
    await recurringRepo.createWithTags(dailyRule, []);
    const { resetDatabase } = await import('../../src/database/database');

    const run = materializeDueRecurring(NOW);
    await expect(resetDatabase()).resolves.toBeUndefined();
    await run;

    expect(await count(db, 'transactions')).toBe(0);
    expect(await count(db, 'recurring_rules')).toBe(0);
    expect(await count(db, 'accounts')).toBe(2);
    expect(await count(db, 'categories')).toBe(31);
  });

  it('delete all data waits too and keeps the settings', async () => {
    const { db, recurringRepo, materializeDueRecurring } = await boot();
    const { configRepo } = await import('../../src/database/repositories/configRepo');
    await configRepo.save({ language: 'es' });
    await recurringRepo.createWithTags(dailyRule, []);
    const { clearDataKeepSettings } = await import('../../src/database/database');

    const run = materializeDueRecurring(NOW);
    await expect(clearDataKeepSettings()).resolves.toBeUndefined();
    await run;

    expect(await count(db, 'transactions')).toBe(0);
    expect(await count(db, 'recurring_rules')).toBe(0);
    expect(await count(db, 'accounts')).toBe(2);
    const language = await db.getFirstAsync<{ value: string }>("SELECT value FROM config WHERE key = 'language'");
    expect(language?.value).toBe('es');
  });

  it('a config save during the catch-up is not lost', async () => {
    const { db, recurringRepo, materializeDueRecurring } = await boot();
    const { configRepo } = await import('../../src/database/repositories/configRepo');
    await recurringRepo.createWithTags(dailyRule, []);

    const run = materializeDueRecurring(NOW);
    await expect(configRepo.save({ language: 'es' })).resolves.toBeUndefined();
    await run;

    const language = await db.getFirstAsync<{ value: string }>("SELECT value FROM config WHERE key = 'language'");
    expect(language?.value).toBe('es');
    expect(await count(db, 'transactions')).toBeGreaterThan(0);
  });

  it('a direct write waits for an open transaction instead of joining it', async () => {
    const { db } = await boot();
    const { getDatabase } = await import('../../src/database/database');
    const { tagRepo } = await import('../../src/database/repositories/tagRepo');
    const handle = await getDatabase();
    let release: (() => void) | undefined;
    let markStarted: (() => void) | undefined;
    const started = new Promise<void>((resolve) => { markStarted = resolve; });

    const tx = handle.withTransactionAsync(async () => {
      await handle.runAsync("INSERT INTO tags (user_id, name, created_at) VALUES (1, 'inside', '2026-10-19')");
      markStarted?.();
      await new Promise<void>((resolve) => { release = resolve; });
      throw new Error('rollback');
    });
    await started;

    const directWrite = tagRepo.create({ user_id: 1, name: 'direct' });
    release?.();
    await expect(tx).rejects.toThrow('rollback');
    await expect(directWrite).resolves.toBeDefined();

    const row = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM tags WHERE name = 'direct'");
    expect(row?.count).toBe(1);
  });

  it('an import during the catch-up completes without transaction errors', async () => {
    const { db, recurringRepo, materializeDueRecurring } = await boot();
    const { exportBackup, importBackup } = await import('../../src/database/backupService');
    await recurringRepo.createWithTags(dailyRule, []);
    const backup = await exportBackup();

    const run = materializeDueRecurring(NOW);
    await expect(importBackup(backup)).resolves.toBeUndefined();
    await run;

    // The importer and the reconciliation may finish in either order; what matters is
    // that both complete and the occurrence index is still unique.
    expect(await count(db, 'recurring_rules')).toBe(1);
    const duplicates = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) AS count FROM (
        SELECT recurring_rule_id, recurrence_date
        FROM transactions
        GROUP BY recurring_rule_id, recurrence_date
        HAVING COUNT(*) > 1
      )
    `);
    expect(duplicates?.count ?? 0).toBe(0);
  });
});
