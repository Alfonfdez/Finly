import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { initSqliteHarness, bootSqliteDb as boot } from './helpers/sqliteHarness';
import { recurrenceInfoLines } from '../../src/utils/recurrenceInfo';
import { ruleEditCursor, type RecurrenceSchedule } from '../../src/utils/recurrence';
import { LANGUAGES } from '../../src/utils/language';
import { setLanguage } from '../../src/i18n';
import type { RecurringRule, Transaction } from '../../src/database/types';

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

const TODAY = new Date(2026, 9, 6, 12, 0, 0);
const TODAY_STR = '2026-10-06';

const baseRule = {
  user_id: 1,
  name: 'Rule',
  type: 'expense' as const,
  account_id: 1,
  category_id: 3,
  amount: 100,
  description: 'Rule',
  frequency: 'daily' as const,
  interval: 1,
  weekday: null,
  day_of_month: null,
  month: null,
  start_date: '2026-09-01',
  end_date: null,
  next_due: '2026-09-01',
  active: 1,
};

const dailyActive = { ...baseRule, name: 'Daily active' };
const weeklyIncome = {
  ...baseRule,
  name: 'Weekly income',
  type: 'income' as const,
  category_id: 1,
  amount: 200,
  frequency: 'weekly' as const,
  weekday: 1,
  start_date: '2026-09-07',
  next_due: '2026-09-07',
};
const monthly31 = {
  ...baseRule,
  name: 'Monthly 31',
  category_id: 6,
  frequency: 'monthly' as const,
  day_of_month: 31,
  start_date: '2026-01-31',
  next_due: '2026-01-31',
};
const yearlyLeap = {
  ...baseRule,
  name: 'Yearly leap',
  type: 'income' as const,
  category_id: 8,
  amount: 300,
  frequency: 'yearly' as const,
  month: 2,
  day_of_month: 29,
  start_date: '2024-02-29',
  next_due: '2024-02-29',
};
const dailyEnded = {
  ...baseRule,
  name: 'Daily ended',
  start_date: '2026-09-01',
  end_date: '2026-09-30',
  next_due: '2026-09-01',
};

function scheduleOf(rule: RecurringRule, endDate: string | null = rule.end_date): RecurrenceSchedule {
  return {
    frequency: rule.frequency,
    interval: rule.interval,
    weekday: rule.weekday,
    day_of_month: rule.day_of_month,
    month: rule.month,
    start_date: rule.start_date,
    end_date: endDate,
  };
}

function hintFor(
  rule: RecurringRule,
  schedule: RecurrenceSchedule,
  scope: 'future' | 'futureAndPast',
  occurrenceDates: string[],
  pastDetailsChanged = false,
  today = TODAY_STR,
) {
  return recurrenceInfoLines(
    schedule,
    {
      today,
      cursor: ruleEditCursor(rule, schedule),
      scope,
      skippedFrom: rule.skipped_from,
      previousSchedule: rule,
      existingOccurrences: new Set(occurrenceDates),
      pastDetailsChanged,
      ruleActive: rule.active === 1,
    },
    LANGUAGES.en,
  );
}

async function ruleState(recurringRepo: { list: (userId: number) => Promise<RecurringRule[]>; listOccurrenceDates: (id: number) => Promise<string[]> }, id: number) {
  const rule = (await recurringRepo.list(1)).find(item => item.id === id);
  if (!rule) throw new Error(`Rule ${id} not found`);
  return { rule, dates: await recurringRepo.listOccurrenceDates(id) };
}

function transactionsFor(transactions: Transaction[], ruleId: number) {
  return transactions.filter(transaction => transaction.recurring_rule_id === ruleId);
}

describe('recurring rule hint lifecycle', () => {
  beforeEach(() => setLanguage('en'));

  it('keeps multiple rules independent across sequential type changes', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const daily = await recurringRepo.createWithTags(dailyActive, []);
    const weekly = await recurringRepo.createWithTags(weeklyIncome, []);
    const monthly = await recurringRepo.createWithTags(monthly31, []);
    const yearly = await recurringRepo.createWithTags(yearlyLeap, []);
    const ended = await recurringRepo.createWithTags(dailyEnded, []);

    await materializeDueRecurring(TODAY);
    const initial = await transactionRepo.list();
    const initialDaily = transactionsFor(initial, daily.id);
    const initialWeekly = transactionsFor(initial, weekly.id);
    const initialMonthly = transactionsFor(initial, monthly.id);
    const initialYearly = transactionsFor(initial, yearly.id);
    const initialEnded = transactionsFor(initial, ended.id);

    expect(initialDaily).toHaveLength(36);
    expect(initialWeekly).toHaveLength(5);
    expect(initialMonthly).toHaveLength(9);
    expect(initialYearly).toHaveLength(3);
    expect(initialEnded).toHaveLength(30);

    const beforeTypeChange = await ruleState(recurringRepo, daily.id);
    expect(hintFor(beforeTypeChange.rule, scheduleOf(beforeTypeChange.rule), 'future', beforeTypeChange.dates, true)).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now'],
    });

    await saveRecurringRuleEdit({
      ruleId: daily.id,
      updated: { type: 'income', category_id: 1, amount: 120, description: 'Daily income' },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 1, amount: 120, description: 'Daily income', type: 'income' },
      tagIds: [],
      now: TODAY,
    });

    const afterFutureOnly = await ruleState(recurringRepo, daily.id);
    expect(afterFutureOnly.rule.type).toBe('income');
    expect(afterFutureOnly.rule.amount).toBe(120);
    expect(transactionsFor(await transactionRepo.list(), daily.id).every(transaction => transaction.type === 'expense')).toBe(true);

    const othersAfterFutureOnly = await transactionRepo.list();
    expect(transactionsFor(othersAfterFutureOnly, weekly.id)).toHaveLength(initialWeekly.length);
    expect(transactionsFor(othersAfterFutureOnly, monthly.id)).toHaveLength(initialMonthly.length);
    expect(transactionsFor(othersAfterFutureOnly, yearly.id)).toHaveLength(initialYearly.length);
    expect(transactionsFor(othersAfterFutureOnly, ended.id)).toHaveLength(initialEnded.length);

    expect(hintFor(afterFutureOnly.rule, scheduleOf(afterFutureOnly.rule), 'futureAndPast', afterFutureOnly.dates, true)).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now', 'Updates 36 past transactions'],
    });

    await saveRecurringRuleEdit({
      ruleId: daily.id,
      updated: { type: 'expense', category_id: 3, amount: 100, description: 'Daily active' },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Daily active', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });

    const afterPast = await ruleState(recurringRepo, daily.id);
    expect(afterPast.rule.type).toBe('expense');
    expect(afterPast.rule.amount).toBe(100);
    expect(transactionsFor(await transactionRepo.list(), daily.id).every(transaction => transaction.type === 'expense' && transaction.amount === 100)).toBe(true);
    expect(transactionsFor(await transactionRepo.list(), daily.id)).toHaveLength(initialDaily.length);
    expect(transactionsFor(await transactionRepo.list(), weekly.id)).toHaveLength(initialWeekly.length);
    expect(transactionsFor(await transactionRepo.list(), monthly.id)).toHaveLength(initialMonthly.length);
    expect(transactionsFor(await transactionRepo.list(), yearly.id)).toHaveLength(initialYearly.length);
    expect(transactionsFor(await transactionRepo.list(), ended.id)).toHaveLength(initialEnded.length);
  });

  it('handles an ended rule extension and a later Future + past recovery', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailyEnded, []);
    await materializeDueRecurring(TODAY);

    const before = await ruleState(recurringRepo, rule.id);
    const extendedSchedule = scheduleOf(before.rule, '2026-10-31');
    expect(hintFor(before.rule, extendedSchedule, 'future', before.dates)).toEqual({
      summary: 'Every day until October 31, 2026',
      firstLine: 'Next: October 6, 2026',
      detailLines: ['1 transaction will be created', '5 occurrences will be skipped'],
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });

    const afterSkip = await ruleState(recurringRepo, rule.id);
    expect(afterSkip.rule.next_due).toBe('2026-10-07');
    expect(afterSkip.rule.skipped_from).toBe('2026-10-01');
    expect(afterSkip.dates).toHaveLength(31);
    expect(transactionsFor(await transactionRepo.list(), rule.id)).toHaveLength(31);

    expect(hintFor(afterSkip.rule, extendedSchedule, 'futureAndPast', afterSkip.dates)).toEqual({
      summary: 'Every day until October 31, 2026',
      firstLine: 'Back-fill from: October 1, 2026',
      detailLines: ['Adds 5 missed transactions'],
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });

    const afterFill = await ruleState(recurringRepo, rule.id);
    expect(afterFill.rule.next_due).toBe('2026-10-07');
    expect(afterFill.rule.skipped_from).toBeNull();
    expect(afterFill.dates).toHaveLength(36);
    expect(transactionsFor(await transactionRepo.list(), rule.id)).toHaveLength(36);
  });

  it('updates only transactions inside a later start window', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const today26 = new Date(2026, 9, 26, 12, 0, 0);
    const today26Str = '2026-10-26';
    const rule = await recurringRepo.createWithTags(
      { ...dailyActive, name: 'Late start', start_date: '2026-10-01', next_due: '2026-10-01' },
      [],
    );
    expect(await materializeDueRecurring(today26)).toBe(26);

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { start_date: '2026-10-19' },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: today26,
    });

    const afterStart = await ruleState(recurringRepo, rule.id);
    expect(afterStart.rule.start_date).toBe('2026-10-19');
    expect(afterStart.dates).toHaveLength(26);
    expect(hintFor(afterStart.rule, scheduleOf(afterStart.rule), 'futureAndPast', afterStart.dates, true, today26Str)).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 27, 2026',
      detailLines: ['No transactions will be created now', 'Updates 8 past transactions'],
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: { category_id: 4, amount: 150, description: 'Updated' },
      recurrence: { frequency: 'daily', interval: 1, endDate: null },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 4, amount: 150, description: 'Updated', type: 'expense' },
      tagIds: [],
      now: today26,
    });

    const transactions = await transactionRepo.list();
    const byDate = new Map(transactions.map(transaction => [transaction.recurrence_date, transaction]));
    for (let day = 1; day <= 18; day += 1) {
      const key = `2026-10-${String(day).padStart(2, '0')}`;
      expect(byDate.get(key)?.category_id).toBe(3);
      expect(byDate.get(key)?.amount).toBe(100);
    }
    for (let day = 19; day <= 26; day += 1) {
      const key = `2026-10-${String(day).padStart(2, '0')}`;
      expect(byDate.get(key)?.category_id).toBe(4);
      expect(byDate.get(key)?.amount).toBe(150);
    }
    expect(transactions.filter(transaction => transaction.recurring_rule_id === rule.id)).toHaveLength(26);
  });

  it('reports updates for monthly and yearly edge schedules', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const monthly = await recurringRepo.createWithTags(monthly31, []);
    const yearly = await recurringRepo.createWithTags(yearlyLeap, []);
    await materializeDueRecurring(TODAY);

    const monthlyBefore = await ruleState(recurringRepo, monthly.id);
    const yearlyBefore = await ruleState(recurringRepo, yearly.id);

    expect(hintFor(monthlyBefore.rule, scheduleOf(monthlyBefore.rule), 'futureAndPast', monthlyBefore.dates, true)).toEqual({
      summary: 'Every month on the last day',
      firstLine: 'Next: October 31, 2026',
      detailLines: [
        '31 in Jan, Mar, May, Jul, Aug, Oct, Dec · 30 in Apr, Jun, Sep, Nov · 28 in Feb (29 in leap years)',
        'No transactions will be created now',
        'Updates 9 past transactions',
      ],
    });

    expect(hintFor(yearlyBefore.rule, scheduleOf(yearlyBefore.rule), 'futureAndPast', yearlyBefore.dates, true)).toEqual({
      summary: 'Every year on February 29',
      firstLine: 'Next: February 28, 2027',
      detailLines: [
        '28 in Feb (29 in leap years)',
        'No transactions will be created now',
        'Updates 3 past transactions',
      ],
    });

    await saveRecurringRuleEdit({
      ruleId: monthly.id,
      updated: { amount: 150 },
      recurrence: { frequency: 'monthly', interval: 1, endDate: null, lastDay: true },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 6, amount: 150, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });
    await saveRecurringRuleEdit({
      ruleId: yearly.id,
      updated: { amount: 350 },
      recurrence: { frequency: 'yearly', interval: 1, endDate: null },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 8, amount: 350, description: 'Rule', type: 'income' },
      tagIds: [],
      now: TODAY,
    });

    const transactions = await transactionRepo.list();
    expect(transactionsFor(transactions, monthly.id).every(transaction => transaction.amount === 150)).toBe(true);
    expect(transactionsFor(transactions, yearly.id).every(transaction => transaction.amount === 350)).toBe(true);
    expect(transactionsFor(transactions, monthly.id)).toHaveLength(9);
    expect(transactionsFor(transactions, yearly.id)).toHaveLength(3);
  });

  it('handles repeated end-date edits without recreating past transactions', async () => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags(dailyActive, []);
    await materializeDueRecurring(TODAY);

    const before = await ruleState(recurringRepo, rule.id);
    expect(hintFor(before.rule, scheduleOf(before.rule, '2026-10-10'), 'future', before.dates)).toEqual({
      summary: 'Every day until October 10, 2026',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now'],
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-10' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });

    const shortened = await ruleState(recurringRepo, rule.id);
    expect(hintFor(shortened.rule, scheduleOf(shortened.rule, '2026-09-30'), 'future', shortened.dates)).toEqual({
      summary: 'Every day until September 30, 2026',
      firstLine: 'This rule has ended: no future transactions will be created.',
      detailLines: [],
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-09-30' },
      scope: 'future',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });

    const ended = await ruleState(recurringRepo, rule.id);
    expect(hintFor(ended.rule, scheduleOf(ended.rule, '2026-10-31'), 'futureAndPast', ended.dates)).toEqual({
      summary: 'Every day until October 31, 2026',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now'],
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: {},
      recurrence: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
      scope: 'futureAndPast',
      pastPatch: { account_id: 1, category_id: 3, amount: 100, description: 'Rule', type: 'expense' },
      tagIds: [],
      now: TODAY,
    });

    const revived = await ruleState(recurringRepo, rule.id);
    expect(revived.rule.end_date).toBe('2026-10-31');
    expect(revived.dates).toHaveLength(36);
    expect(transactionsFor(await transactionRepo.list(), rule.id)).toHaveLength(36);
  });
});
