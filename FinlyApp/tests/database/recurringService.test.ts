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
  const { materializeDueRecurring, resumeRecurringRule, saveRecurringRuleEdit } = await import('../../src/database/recurringService');
  return { db, recurringRepo, transactionRepo, tagRepo, materializeDueRecurring, resumeRecurringRule, saveRecurringRuleEdit };
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

  it('materializes a past daily range up to the end date (Sep 1-30)', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring } = await boot();
    await recurringRepo.createWithTags(
      {
        ...baseRule,
        frequency: 'daily',
        interval: 1,
        day_of_month: null,
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        next_due: '2026-09-01',
      },
      [],
    );

    const created = await materializeDueRecurring(new Date(2026, 9, 5)); // Oct 5

    expect(created).toBe(30);
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toHaveLength(30);
    expect(dates[0]).toBe('2026-09-01');
    expect(dates[dates.length - 1]).toBe('2026-09-30');
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

  const dailySep = {
    ...baseRule,
    frequency: 'daily' as const,
    interval: 1,
    day_of_month: null,
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    next_due: '2026-09-01',
  };
  const OCT_5 = new Date(2026, 9, 5);

  it('extending the end date with futureAndPast back-fills the missed window', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-01');

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });

    expect(created).toBe(5); // Oct 1-5
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toHaveLength(35);
    expect(dates.slice(30)).toEqual(['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05']);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-06');
  });

  it('extending the end date with future only adds from today', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30);

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });

    expect(created).toBe(1); // Oct 5 only
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toHaveLength(31);
    expect(dates[dates.length - 1]).toBe('2026-10-05');
    expect(dates).not.toContain('2026-10-04');
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-06');
  });

  it('does not materialize a skipped first occurrence (next_due ahead of start_date)', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring } = await boot();
    await recurringRepo.createWithTags(
      { ...baseRule, start_date: '2026-04-15', day_of_month: 15, next_due: '2026-05-15' },
      [],
    );

    expect(await materializeDueRecurring(new Date(2026, 3, 15))).toBe(0); // Apr 15
    expect(await transactionRepo.list()).toHaveLength(0);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-05-15');

    expect(await materializeDueRecurring(new Date(2026, 4, 15))).toBe(1); // May 15
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-06-15');
  });

  it('editing a skip-first rule on its start day does not resurrect the skipped occurrence', async () => {
    const { recurringRepo, transactionRepo, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(
      { ...baseRule, start_date: '2026-04-15', day_of_month: 15, next_due: '2026-05-15' },
      [],
    );

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'monthly', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: new Date(2026, 3, 15), // Apr 15 = start day
    });

    expect(created).toBe(0);
    expect(await transactionRepo.list()).toHaveLength(0);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-05-15');
  });

  it('futureAndPast propagates a type change to generated transactions', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { type: 'income' },
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-09-30' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'income' },
      tagIds: [],
      now: OCT_5,
    });

    const txs = await transactionRepo.list();
    expect(txs).toHaveLength(30);
    expect(txs.every(t => t.type === 'income')).toBe(true);
  });

  it('a timing-only edit (daily -> yearly) leaves past transactions untouched', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30);
    const before = (await transactionRepo.list())
      .map(t => `${t.recurrence_date}:${t.amount}:${t.type}`)
      .sort();

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'yearly', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });

    const after = (await transactionRepo.list())
      .map(t => `${t.recurrence_date}:${t.amount}:${t.type}`)
      .sort();
    expect(after).toEqual(before);
    expect(after).toHaveLength(30);
  });

  it('shortening the end date after extending it never deletes generated transactions', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30); // Sep 1-30

    // Extend to Oct 31 -> back-fill Oct 1-5.
    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    expect(await transactionRepo.list()).toHaveLength(35);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-06');

    // Shorten back to Sep 30 -> nothing added, nothing deleted.
    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-09-30' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    const txs = await transactionRepo.list();
    expect(txs).toHaveLength(35);
    expect(txs.some(t => t.recurrence_date === '2026-10-01')).toBe(true);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-01');
  });

  it('futureAndPast rewrites past details; future leaves them unchanged', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await materializeDueRecurring(APR_15); // Jan-Apr 2 (4 rows, amount 100)
    expect((await transactionRepo.list()).every(t => t.amount === 100)).toBe(true);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { amount: 250 },
      recurrence: { frequency: 'monthly', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 250, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: APR_15,
    });
    expect((await transactionRepo.list()).every(t => t.amount === 100)).toBe(true);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { amount: 250 },
      recurrence: { frequency: 'monthly', interval: 1, endDate: null },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 250, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: APR_15,
    });
    const after = await transactionRepo.list();
    expect(after).toHaveLength(4);
    expect(after.every(t => t.amount === 250)).toBe(true);
  });

  it('futureAndPast rewrites past tag links', async () => {
    const { recurringRepo, transactionRepo, tagRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await materializeDueRecurring(APR_15);
    const tag = await tagRepo.create({ user_id: 1, name: 'New' });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'monthly', interval: 1, endDate: null },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [tag.id],
      now: APR_15,
    });

    for (const tx of await transactionRepo.list()) {
      expect(await transactionRepo.getTagsByTransactionId(tx.id)).toEqual([tag.id]);
    }
  });

  it('a frequency change with futureAndPast keeps past dates unchanged', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30);
    const before = (await transactionRepo.list()).map(t => t.recurrence_date).sort();

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'monthly', interval: 1, endDate: null },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });

    const after = (await transactionRepo.list()).map(t => t.recurrence_date);
    for (const date of before) {
      expect(after).toContain(date);
    }
  });

  it('saving the same edit twice is idempotent', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    await materializeDueRecurring(OCT_5);

    const edit = () =>
      saveRecurringRuleEdit({
        ruleId: rule.id,
        updated: {},
        recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
        scope: 'futureAndPast',
        pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
        tagIds: [],
        now: OCT_5,
      });

    await edit();
    const afterFirst = (await transactionRepo.list()).length;
    await edit();
    expect((await transactionRepo.list()).length).toBe(afterFirst);
  });

  it('a paused rule is not back-filled but its past details are updated', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    await materializeDueRecurring(OCT_5); // Sep 1-30
    await recurringRepo.setActive(rule.id, false);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { amount: 250 },
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 250, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });

    const txs = await transactionRepo.list();
    expect(txs).toHaveLength(30); // no back-fill while paused
    expect(txs.every(t => t.amount === 250)).toBe(true); // details still patched
  });
});
