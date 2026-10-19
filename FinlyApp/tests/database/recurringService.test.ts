import { describe, it, expect, beforeAll, vi } from 'vitest';
import { isRecurrenceEnded } from '../../src/utils/recurrence';
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

const APR_15 = new Date(2026, 3, 15, 12, 0, 0);

describe('createRecurringRule', () => {
  const params = {
    name: 'Rent',
    type: 'expense' as const,
    account_id: 1,
    category_id: 3,
    amount: 100,
    description: 'Rent',
    date: '2026-01-02 00:00:00',
    frequency: 'monthly' as const,
    interval: 1,
    endDate: null,
    tagIds: [],
  };

  it('creates a rule and materializes already-due occurrences', async () => {
    const { recurringRepo, transactionRepo, createRecurringRule } = await boot();
    const created = await createRecurringRule({ ...params, now: APR_15 });

    expect(created).toBe(4); // Jan-Apr 2
    const [rule] = await recurringRepo.list(1);
    expect(rule.name).toBe('Rent');
    expect(rule.next_due).toBe('2026-05-02');
    expect(await transactionRepo.list()).toHaveLength(4);
  });

  it('anchors a last-day rule on the last day of each month', async () => {
    const { recurringRepo, transactionRepo, createRecurringRule } = await boot();
    const created = await createRecurringRule({
      ...params,
      date: '2026-01-15 00:00:00',
      lastDay: true,
      now: APR_15,
    });

    expect(created).toBe(3); // Jan 31, Feb 28, Mar 31 (Apr 30 is still future)
    const [rule] = await recurringRepo.list(1);
    expect(rule.day_of_month).toBe(31);
    expect(rule.start_date).toBe('2026-01-31');
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toEqual(['2026-01-31', '2026-02-28', '2026-03-31']);
  });

  it('rejects a blank name, a bad interval or an end date not after the start', async () => {
    const { recurringRepo, createRecurringRule } = await boot();

    await expect(createRecurringRule({ ...params, name: '   ' })).rejects.toMatchObject({ code: 'nameRequired' });
    await expect(createRecurringRule({ ...params, interval: 0 })).rejects.toMatchObject({ code: 'intervalInvalid' });
    await expect(createRecurringRule({ ...params, endDate: '2026-01-02' })).rejects.toMatchObject({ code: 'endNotAfterStart' });

    // Nothing was written for any of the rejected drafts.
    expect(await recurringRepo.list(1)).toHaveLength(0);
  });
  it('refuses a backlog that cannot finish in one catch-up run', async () => {
    const { recurringRepo, createRecurringRule } = await boot();

    await expect(createRecurringRule({
      ...params,
      date: '1990-01-01 00:00:00',
      frequency: 'daily',
      now: APR_15,
    })).rejects.toMatchObject({ code: 'tooManyOccurrences' });

    expect(await recurringRepo.list(1)).toHaveLength(0);
  });

  it('backfills a years-long daily backlog in a single run', async () => {
    const { recurringRepo, transactionRepo, createRecurringRule } = await boot();

    const created = await createRecurringRule({
      ...params,
      date: '2014-01-08 00:00:00',
      frequency: 'daily',
      now: APR_15,
    });

    expect(created).toBe(4481); // 2014-01-08 .. 2026-04-15 inclusive
    const [rule] = await recurringRepo.list(1);
    expect(rule.next_due > '2026-04-15').toBe(true);
    expect(await transactionRepo.list()).toHaveLength(4481);
  });
});

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

  it('serializes overlapping runs so two triggers never duplicate occurrences', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring } = await boot();
    await recurringRepo.createWithTags(baseRule, []);

    const [first, second] = await Promise.all([
      materializeDueRecurring(APR_15),
      materializeDueRecurring(APR_15),
    ]);

    expect(first + second).toBe(4);
    expect(await transactionRepo.list()).toHaveLength(4);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-05-02');
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

  it('resuming one rule does not catch up other overdue rules', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, resumeRecurringRule } = await boot();
    const a = await recurringRepo.createWithTags({ ...baseRule, name: 'A' }, []);
    const b = await recurringRepo.createWithTags({ ...baseRule, name: 'B' }, []);
    await recurringRepo.setActive(a.id, false);

    // Resuming A jumps its cursor past the pause window, so nothing is created now.
    expect(await resumeRecurringRule(a.id, APR_15)).toBe(0);
    expect(await transactionRepo.list()).toHaveLength(0);
    expect((await recurringRepo.getById(a.id))?.next_due).toBe('2026-05-02');

    // B is still overdue and untouched; the normal reconciliation catches it up.
    expect((await recurringRepo.getById(b.id))?.next_due).toBe('2026-01-02');
    expect(await materializeDueRecurring(APR_15)).toBe(4); // Jan-Apr 2 for B
  });

  it('refuses to resume an ended rule', async () => {
    const { recurringRepo, transactionRepo, resumeRecurringRule } = await boot();
    const rule = await recurringRepo.createWithTags(
      { ...baseRule, frequency: 'daily', day_of_month: null, start_date: '2026-09-01', end_date: '2026-09-30', next_due: '2026-10-01' },
      [],
    );
    await recurringRepo.setActive(rule.id, false);

    const created = await resumeRecurringRule(rule.id, new Date(2026, 9, 5));

    expect(created).toBe(0);
    expect(await transactionRepo.list()).toHaveLength(0);
    const [after] = await recurringRepo.list(1);
    expect(after.active).toBe(0);
    expect(after.next_due).toBe('2026-10-01');
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
  const OCT_13 = new Date(2026, 9, 13, 12, 0, 0);

  it('editing an ended rule to extend its end date revives it', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30);

    const ended = (await recurringRepo.list(1))[0];
    expect(isRecurrenceEnded(ended, ended.next_due, '2026-10-05')).toBe(true);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });

    const revived = (await recurringRepo.list(1))[0];
    expect(isRecurrenceEnded(revived, revived.next_due, '2026-10-05')).toBe(false);
  });

  it('records the skipped window on a Future-only edit and recovers it with Future + past', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    expect(await materializeDueRecurring(OCT_5)).toBe(30); // Sep 1-30
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-01');

    // Extend to Oct 31, Future only -> skips Oct 1-4, creates Oct 5.
    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    const afterSkip = (await recurringRepo.list(1))[0];
    expect(afterSkip.next_due).toBe('2026-10-06');
    expect(afterSkip.skipped_from).toBe('2026-10-01');
    expect(await transactionRepo.list()).toHaveLength(31); // Sep 1-30 + Oct 5

    // Change of mind: Future + past back-fills Oct 1-4 and clears the record.
    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    const afterFill = (await recurringRepo.list(1))[0];
    expect(afterFill.skipped_from).toBeNull();
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toHaveLength(35); // Sep 1-30 + Oct 1-5
    expect(dates).toContain('2026-10-04');
  });

  it('clears skipped_from when the end date is shortened past the skipped window', async () => {
    const { recurringRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    await materializeDueRecurring(OCT_5);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    expect((await recurringRepo.list(1))[0].skipped_from).toBe('2026-10-01');

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-09-30' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    expect((await recurringRepo.list(1))[0].skipped_from).toBeNull();
  });

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

  it('a fresh future rule re-anchors from its new start date (moving it to today creates today)', async () => {
    const { recurringRepo, transactionRepo, saveRecurringRuleEdit } = await boot();
    // Created starting in the future: cursor === start_date, nothing generated yet.
    const rule = await recurringRepo.createWithTags(
      { ...baseRule, frequency: 'daily', day_of_month: null, start_date: '2026-10-30', next_due: '2026-10-30' },
      [],
    );

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { start_date: '2026-10-13' },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_13,
    });

    expect(created).toBe(1); // Oct 13 (today)
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toEqual(['2026-10-13']);
    const after = (await recurringRepo.list(1))[0];
    expect(after.start_date).toBe('2026-10-13');
    expect(after.next_due).toBe('2026-10-14');
  });

  it('a fresh rule moved to a past date skips the past window (recoverable) and starts from today', async () => {
    const { recurringRepo, transactionRepo, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(
      { ...baseRule, frequency: 'daily', day_of_month: null, start_date: '2026-10-30', next_due: '2026-10-30' },
      [],
    );

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { start_date: '2026-10-10' },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_13,
    });

    expect(created).toBe(1); // Oct 13 only (Oct 10-12 skipped)
    const dates = (await transactionRepo.list()).map(t => t.recurrence_date).sort();
    expect(dates).toEqual(['2026-10-13']);
    const after = (await recurringRepo.list(1))[0];
    expect(after.skipped_from).toBe('2026-10-10');
    expect(after.next_due).toBe('2026-10-14');
  });

  it('a denser schedule (monthly -> daily) takes effect today under "Future only"', async () => {
    const { recurringRepo, transactionRepo, saveRecurringRuleEdit } = await boot();
    // Caught up on the monthly schedule: cursor 1 Nov (future).
    const rule = await recurringRepo.createWithTags(
      { ...baseRule, frequency: 'monthly', day_of_month: 1, start_date: '2026-09-01', next_due: '2026-11-01' },
      [],
    );

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_13,
    });

    expect(created).toBe(1); // Oct 13 (today), not delayed to Nov 1
    expect((await transactionRepo.list()).map(t => t.recurrence_date)).toEqual(['2026-10-13']);
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-14');
  });

  it('an unchanged schedule does not re-create today under "Future only"', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(
      { ...baseRule, frequency: 'daily', day_of_month: null, start_date: '2026-10-01', next_due: '2026-10-01' },
      [],
    );
    expect(await materializeDueRecurring(OCT_13)).toBe(13); // Oct 1-13
    expect((await recurringRepo.list(1))[0].next_due).toBe('2026-10-14');

    const created = await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { amount: 120 },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 120, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_13,
    });

    expect(created).toBe(0);
    expect(await transactionRepo.list()).toHaveLength(13);
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

  it('futureAndPast bumps updated_at on the generated transactions (an open modify form refreshes)', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await materializeDueRecurring(APR_15);
    const before = new Map((await transactionRepo.list()).map(t => [t.id, t.updated_at]));

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
    expect(after.every(t => t.updated_at !== before.get(t.id))).toBe(true);
  });

  it('future only leaves the generated transactions\' updated_at untouched', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(baseRule, []);
    await materializeDueRecurring(APR_15);
    const before = new Map((await transactionRepo.list()).map(t => [t.id, t.updated_at]));

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { amount: 250 },
      recurrence: { frequency: 'monthly', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 250, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: APR_15,
    });

    const after = await transactionRepo.list();
    expect(after.every(t => t.updated_at === before.get(t.id))).toBe(true);
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
    const before = (await recurringRepo.list(1))[0];

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
    // The cursor is left where it was: the pause window stays skipped.
    const after = (await recurringRepo.list(1))[0];
    expect(after.next_due).toBe(before.next_due);
    expect(after.active).toBe(0);
  });

  it('resuming keeps a recoverable skip when the cursor does not move', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit, resumeRecurringRule } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);
    await materializeDueRecurring(OCT_5); // Sep 1-30

    // Future only, extending the end date: Oct 1-4 are skipped and recorded.
    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    });
    await recurringRepo.setActive(rule.id, false);

    // Paused and resumed on the same day: nothing was skipped by the pause, so the
    // earlier skipped window is still recoverable.
    const created = await resumeRecurringRule(rule.id, OCT_5);
    expect(created).toBe(0); // the cursor (Oct 6) is still in the future
    const resumed = (await recurringRepo.list(1))[0];
    expect(resumed.next_due).toBe('2026-10-06');
    expect(resumed.skipped_from).toBe('2026-10-01');
    expect(await transactionRepo.list()).toHaveLength(31); // Sep 1-30 + Oct 5

    // Resumed later the cursor jumps over the pause window, so the recorded skip can
    // no longer be back-filled faithfully: it is dropped (the resumed day is created).
    await resumeRecurringRule(rule.id, new Date(2026, 9, 10));
    const later = (await recurringRepo.list(1))[0];
    expect(later.next_due).toBe('2026-10-11');
    expect(later.skipped_from).toBeNull();
  });

  it('rejects an invalid interval on an edit without touching the rule', async () => {
    const { recurringRepo, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailySep, []);

    await expect(saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 0, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' },
      tagIds: [],
      now: OCT_5,
    })).rejects.toMatchObject({ code: 'intervalInvalid' });

    const [stored] = await recurringRepo.list(1);
    expect(stored.interval).toBe(1);
  });
});

// A rule is the template for its category's future transactions: moving the data must
// move the rule too, while a permanent delete takes the rule with the category.
describe('category deletion and recurring rules', () => {
  const newCategory = (name: string) => ({
    user_id: 1,
    name,
    icon: 'cart-outline',
    color: '#FF0000',
    type: 'expense' as const,
  });
  const futureRule = (categoryId: number) => ({
    ...baseRule,
    category_id: categoryId,
    start_date: '2030-01-02',
    next_due: '2030-01-02',
  });

  it('counts rules per category for the delete confirmation', async () => {
    const { recurringRepo } = await boot();
    await recurringRepo.createWithTags(futureRule(3), []);
    expect(await recurringRepo.countByCategoryIds([3])).toEqual({ 3: 1 });
    expect(await recurringRepo.countByCategoryIds([3, 4])).toEqual({ 3: 1 });
    expect(await recurringRepo.countByCategoryIds([])).toEqual({});
  });

  it('reassignAndDelete moves the category rules to the target', async () => {
    const { recurringRepo } = await boot();
    const { categoryRepo } = await import('../../src/database/repositories/categoryRepo');
    const from = await categoryRepo.create(newCategory('Move From'));
    const to = await categoryRepo.create(newCategory('Move To'));
    const rule = await recurringRepo.createWithTags(futureRule(from.id), []);

    await categoryRepo.reassignAndDelete(from.id, to.id);

    expect((await recurringRepo.getById(rule.id))?.category_id).toBe(to.id);
    expect(await categoryRepo.getById(from.id)).toBeNull();
  });

  it('permanently deleting a category deletes its rules', async () => {
    const { recurringRepo } = await boot();
    const { categoryRepo } = await import('../../src/database/repositories/categoryRepo');
    const cat = await categoryRepo.create(newCategory('Delete Me'));
    const rule = await recurringRepo.createWithTags(futureRule(cat.id), []);

    await categoryRepo.delete(cat.id);

    expect(await recurringRepo.getById(rule.id)).toBeNull();
  });

  it('bulkDeleteWithTargets moves or deletes rules per category', async () => {
    const { recurringRepo } = await boot();
    const { categoryRepo } = await import('../../src/database/repositories/categoryRepo');
    const movedFrom = await categoryRepo.create(newCategory('Bulk Move From'));
    const deleted = await categoryRepo.create(newCategory('Bulk Delete'));
    const target = await categoryRepo.create(newCategory('Bulk Target'));
    const movedRule = await recurringRepo.createWithTags(futureRule(movedFrom.id), []);
    const deletedRule = await recurringRepo.createWithTags(futureRule(deleted.id), []);

    await categoryRepo.bulkDeleteWithTargets([
      { id: movedFrom.id, targetId: target.id },
      { id: deleted.id, targetId: null },
    ]);

    expect((await recurringRepo.getById(movedRule.id))?.category_id).toBe(target.id);
    expect(await recurringRepo.getById(deletedRule.id)).toBeNull();
  });
});
