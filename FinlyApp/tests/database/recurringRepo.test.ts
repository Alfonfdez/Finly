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
  return { db, recurringRepo, transactionRepo, tagRepo };
}

const baseRule = {
  user_id: 1,
  name: 'Rent',
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

describe('recurringRepo', () => {
  it('creates a rule with tags and reads it back', async () => {
    const { recurringRepo, tagRepo } = await boot();
    const tag = await tagRepo.create({ user_id: 1, name: 'Home' });

    const rule = await recurringRepo.createWithTags(baseRule, [tag.id]);

    expect(rule.id).toBeGreaterThan(0);
    const list = await recurringRepo.list(1);
    expect(list).toHaveLength(1);
    expect(list[0].frequency).toBe('monthly');
    expect(list[0].day_of_month).toBe(2);

    const fetched = await recurringRepo.getById(rule.id);
    expect(fetched?.amount).toBe(100);
    expect(await recurringRepo.getTagIds(rule.id)).toEqual([tag.id]);
  });

  it('persists the name and counts generated transactions per rule', async () => {
    const { recurringRepo } = await boot();
    const rule = await recurringRepo.createWithTags({ ...baseRule, name: 'Groceries' }, []);
    expect((await recurringRepo.getById(rule.id))?.name).toBe('Groceries');
    expect((await recurringRepo.countOccurrencesByRuleIds([rule.id])).get(rule.id)).toBeUndefined();

    await recurringRepo.insertOccurrence(rule, '2026-01-02', []);
    await recurringRepo.insertOccurrence(rule, '2026-02-02', []);
    expect((await recurringRepo.countOccurrencesByRuleIds([rule.id])).get(rule.id)).toBe(2);
  });

  it('listDue returns only active rules due on/before today', async () => {
    const { recurringRepo } = await boot();
    const due = await recurringRepo.createWithTags({ ...baseRule, next_due: '2026-01-02' }, []);
    await recurringRepo.createWithTags({ ...baseRule, next_due: '2099-01-01' }, []);
    const paused = await recurringRepo.createWithTags({ ...baseRule, next_due: '2026-01-02' }, []);
    await recurringRepo.setActive(paused.id, false);

    const result = await recurringRepo.listDue('2026-06-01');
    expect(result.map(r => r.id)).toEqual([due.id]);
  });

  it('listDue excludes ended rules (cursor past the end date)', async () => {
    const { recurringRepo } = await boot();
    const ended = await recurringRepo.createWithTags({ ...baseRule, end_date: '2026-01-02', next_due: '2026-02-02' }, []);
    const running = await recurringRepo.createWithTags({ ...baseRule, end_date: '2026-12-02', next_due: '2026-02-02' }, []);

    const result = await recurringRepo.listDue('2026-06-01');
    expect(result.map(r => r.id)).toEqual([running.id]);
    expect(result.some(r => r.id === ended.id)).toBe(false);
  });

  it('updates next_due and active state', async () => {
    const { recurringRepo } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await recurringRepo.updateNextDue(rule.id, '2026-03-02');
    await recurringRepo.setActive(rule.id, false);
    const fetched = await recurringRepo.getById(rule.id);
    expect(fetched?.next_due).toBe('2026-03-02');
    expect(fetched?.active).toBe(0);
  });

  it('inserts an occurrence transaction with its link and tags', async () => {
    const { recurringRepo, transactionRepo, tagRepo } = await boot();
    const tag = await tagRepo.create({ user_id: 1, name: 'Home' });
    const rule = await recurringRepo.createWithTags(baseRule, [tag.id]);

    await recurringRepo.insertOccurrence(rule, '2026-01-02', [tag.id]);

    expect(await recurringRepo.hasOccurrence(rule.id, '2026-01-02')).toBe(true);
    const txs = await transactionRepo.list();
    expect(txs).toHaveLength(1);
    expect(txs[0].recurring_rule_id).toBe(rule.id);
    expect(txs[0].recurrence_date).toBe('2026-01-02');
    expect(txs[0].date).toBe('2026-01-02 00:00:00');
    expect(await transactionRepo.getTagsByTransactionId(txs[0].id)).toEqual([tag.id]);
  });

  it('the unique occurrence index blocks a duplicate transaction', async () => {
    const { db, recurringRepo } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await recurringRepo.insertOccurrence(rule, '2026-01-02', []);

    await expect(
      db.runAsync(
        'INSERT INTO transactions (account_id, category_id, type, amount, date, recurring_rule_id, recurrence_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        1, 3, 'expense', 1, '2026-01-02 00:00:00', rule.id, '2026-01-02'
      )
    ).rejects.toThrow();
  });

  it('bulk-updates past generated transactions', async () => {
    const { recurringRepo, transactionRepo, tagRepo } = await boot();
    const tag = await tagRepo.create({ user_id: 1, name: 'New' });
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await recurringRepo.insertOccurrence(rule, '2026-01-02', []);
    await recurringRepo.insertOccurrence(rule, '2026-02-02', []);

    await recurringRepo.updateGeneratedTransactions(rule.id, { amount: 120, description: 'Rent v2', tagIds: [tag.id] });

    const txs = await transactionRepo.list();
    expect(txs).toHaveLength(2);
    expect(txs.every(t => t.amount === 120 && t.description === 'Rent v2')).toBe(true);
    for (const tx of txs) {
      expect(await transactionRepo.getTagsByTransactionId(tx.id)).toEqual([tag.id]);
    }
  });

  it('deleting a rule keeps its generated transactions but clears the link', async () => {
    const { recurringRepo, transactionRepo } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await recurringRepo.insertOccurrence(rule, '2026-01-02', []);

    await recurringRepo.remove(rule.id);

    const txs = await transactionRepo.list();
    expect(txs).toHaveLength(1);
    expect(txs[0].recurring_rule_id ?? null).toBeNull();
  });
});
