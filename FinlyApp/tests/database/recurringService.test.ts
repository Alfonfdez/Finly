import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { DatabaseHandle } from '../../src/database/types';
import { initSqlJsOnce, resetMockDatabase, openDatabaseSync } from './sqliteMock';

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

beforeAll(async () => {
  await initSqlJsOnce();
});

async function boot() {
  vi.resetModules();
  resetMockDatabase();
  const db = openDatabaseSync('Finly.db') as DatabaseHandle;
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const { createSchema } = await import('../../src/database/migrations/001_initial');
  const { seedDataInner } = await import('../../src/database/migrations/002_seed');
  const { seedConfigInner } = await import('../../src/database/migrations/003_config');
  const { createRecurringSchema } = await import('../../src/database/migrations/004_recurring');
  await createSchema(db);
  await seedDataInner(db);
  await seedConfigInner(db);
  await createRecurringSchema(db);

  const { recurringRepo } = await import('../../src/database/repositories/recurringRepo');
  const { transactionRepo } = await import('../../src/database/repositories/transactionRepo');
  const { tagRepo } = await import('../../src/database/repositories/tagRepo');
  const { materializeDueRecurring, resumeRecurringRule } = await import('../../src/database/recurringService');
  return { db, recurringRepo, transactionRepo, tagRepo, materializeDueRecurring, resumeRecurringRule };
}

const baseRule = {
  user_id: 1,
  type: 'expense' as const,
  account_id: 1,
  category_id: 3,
  amount: 100,
  description: 'Rent',
  frequency: 'monthly' as const,
  interval: 1,
  weekday: null,
  day_of_month: 2,
  month: null,
  start_date: '2026-01-02',
  end_date: null,
  next_due: '2026-01-02',
  active: 1,
};

const APR_15 = new Date(2026, 3, 15, 12, 0, 0);

describe('materializeDueRecurring', () => {
  it('back-fills every missed monthly occurrence and advances next_due', async () => {
    const { recurringRepo, transactionRepo, tagRepo, materializeDueRecurring } = await boot();
    const tag = await tagRepo.create({ user_id: 1, name: 'Home' });
    await recurringRepo.createWithTags(baseRule, [tag.id]);

    const created = await materializeDueRecurring(APR_15);

    expect(created).toBe(4);
    const txs = await transactionRepo.list();
    expect(txs.map(t => t.recurrence_date).sort()).toEqual([
      '2026-01-02',
      '2026-02-02',
      '2026-03-02',
      '2026-04-02',
    ]);
    for (const tx of txs) {
      expect(await transactionRepo.getTagsByTransactionId(tx.id)).toEqual([tag.id]);
    }
    const [rule] = await recurringRepo.list(1);
    expect(rule.next_due).toBe('2026-05-02');
  });

  it('is idempotent across repeated runs', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring } = await boot();
    await recurringRepo.createWithTags(baseRule, []);

    await materializeDueRecurring(APR_15);
    const second = await materializeDueRecurring(APR_15);

    expect(second).toBe(0);
    expect(await transactionRepo.list()).toHaveLength(4);
  });

  it('skips paused rules', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await recurringRepo.setActive(rule.id, false);

    expect(await materializeDueRecurring(APR_15)).toBe(0);
    expect(await transactionRepo.list()).toHaveLength(0);
  });

  it('respects the end date', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring } = await boot();
    await recurringRepo.createWithTags({ ...baseRule, end_date: '2026-02-02' }, []);

    expect(await materializeDueRecurring(APR_15)).toBe(2);
    expect(await transactionRepo.list()).toHaveLength(2);
  });

  it('resuming skips the occurrences missed while paused', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, resumeRecurringRule } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await materializeDueRecurring(new Date(2026, 0, 15)); // creates 2026-01-02 only
    expect(await transactionRepo.list()).toHaveLength(1);

    await recurringRepo.setActive(rule.id, false);
    const created = await resumeRecurringRule(rule.id, APR_15);

    // First occurrence on/after Apr 15 is May 2 (future) → nothing created now.
    expect(created).toBe(0);
    const [resumed] = await recurringRepo.list(1);
    expect(resumed.active).toBe(1);
    expect(resumed.next_due).toBe('2026-05-02');
    // Feb/Mar/Apr were missed during the pause and are NOT created.
    expect(await transactionRepo.list()).toHaveLength(1);

    // The next reconciliation continues from the resumed cursor.
    expect(await materializeDueRecurring(new Date(2026, 5, 15))).toBe(2); // May 2 + Jun 2
  });

  it('resuming on a due day creates that occurrence', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, resumeRecurringRule } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await materializeDueRecurring(new Date(2026, 0, 15));
    await recurringRepo.setActive(rule.id, false);

    const created = await resumeRecurringRule(rule.id, new Date(2026, 4, 2)); // May 2 is due

    expect(created).toBe(1);
    expect(await transactionRepo.list()).toHaveLength(2);
    const [resumed] = await recurringRepo.list(1);
    expect(resumed.next_due).toBe('2026-06-02');
  });
});
