import { describe, it, expect, beforeAll, vi } from 'vitest';
import type { RecurringRule } from '../../src/database/types';
import type { RecurrenceScope } from '../../src/constants/types';
import {
  buildRecurrenceSchedule,
  fromDateOnly,
  listDueOccurrences,
  recurrencePreview,
  todayDateOnly,
} from '../../src/utils/recurrence';
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

const NOW = new Date(2026, 9, 13, 12, 0, 0); // 13 Oct 2026
const TODAY = todayDateOnly(NOW);
const PAST_PATCH = { account_id: 1, category_id: 3, amount: 100, description: 'Rent', type: 'expense' as const };

interface RuleOverrides {
  frequency?: RecurringRule['frequency'];
  interval?: number;
  day_of_month?: number | null;
  start_date?: string;
  end_date?: string | null;
  next_due?: string;
}

interface Scenario {
  label: string;
  /** The stored rule (a caught-up rule is materialized up to `caughtUpTo`). */
  rule: RuleOverrides;
  caughtUpTo?: Date;
  /** The recurrence after the edit. */
  edit: { frequency: RecurringRule['frequency']; interval: number; endDate: string | null };
  /** When the edit changes the start date. */
  startDate?: string;
  scope: RecurrenceScope;
  expectedNextDue: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: 'detail-only edit on a caught-up daily rule creates nothing',
    rule: { frequency: 'daily', day_of_month: null, start_date: '2026-10-01', next_due: '2026-10-01' },
    caughtUpTo: NOW,
    edit: { frequency: 'daily', interval: 1, endDate: null },
    scope: 'future',
    expectedNextDue: '2026-10-14',
  },
  {
    label: 'a denser schedule (monthly -> daily) takes effect today',
    rule: { frequency: 'monthly', day_of_month: 1, start_date: '2026-09-01', next_due: '2026-09-01' },
    caughtUpTo: NOW,
    edit: { frequency: 'daily', interval: 1, endDate: null },
    scope: 'future',
    expectedNextDue: '2026-10-14',
  },
  {
    label: 'extending the end date adds from today',
    rule: { frequency: 'daily', day_of_month: null, start_date: '2026-09-01', end_date: '2026-09-30', next_due: '2026-09-01' },
    caughtUpTo: NOW,
    edit: { frequency: 'daily', interval: 1, endDate: '2026-10-31' },
    scope: 'future',
    expectedNextDue: '2026-10-14',
  },
  {
    label: 'a fresh rule moved to today generates today',
    rule: { frequency: 'daily', day_of_month: null, start_date: '2026-10-30', next_due: '2026-10-30' },
    edit: { frequency: 'daily', interval: 1, endDate: null },
    startDate: '2026-10-13',
    scope: 'future',
    expectedNextDue: '2026-10-14',
  },
  {
    label: 'a fresh rule moved to a past date skips the past window',
    rule: { frequency: 'daily', day_of_month: null, start_date: '2026-10-30', next_due: '2026-10-30' },
    edit: { frequency: 'daily', interval: 1, endDate: null },
    startDate: '2026-10-10',
    scope: 'future',
    expectedNextDue: '2026-10-14',
  },
  {
    label: 'a fresh rule moved to a past date back-fills the window with Future + past',
    rule: { frequency: 'daily', day_of_month: null, start_date: '2026-10-30', next_due: '2026-10-30' },
    edit: { frequency: 'daily', interval: 1, endDate: null },
    startDate: '2026-10-10',
    scope: 'futureAndPast',
    expectedNextDue: '2026-10-14',
  },
];

describe('recurrencePreview matches the save (028 invariant)', () => {
  it.each(SCENARIOS)('$label', async (s) => {
    const { recurringRepo, transactionRepo, materializeDueRecurring, saveRecurringRuleEdit } = await boot();
    const rule = await recurringRepo.createWithTags({ ...baseRule, ...s.rule }, []);
    if (s.caughtUpTo) await materializeDueRecurring(s.caughtUpTo);

    const before = new Set(
      (await transactionRepo.list()).filter(t => t.recurring_rule_id === rule.id).map(t => t.recurrence_date),
    );

    const current = (await recurringRepo.getById(rule.id))!;
    // The Summary the form shows for this draft (see RepeatSection).
    const schedule = buildRecurrenceSchedule(
      fromDateOnly(s.startDate ?? current.start_date),
      s.edit.frequency,
      s.edit.interval,
      s.edit.endDate,
      false,
    );
    const cursor = current.next_due === current.start_date ? schedule.start_date : current.next_due;
    const preview = recurrencePreview(schedule, {
      today: TODAY,
      cursor,
      scope: s.scope,
      skippedFrom: current.skipped_from,
      previousSchedule: current,
    });

    await saveRecurringRuleEdit({
      ruleId: rule.id,
      updated: s.startDate ? { start_date: s.startDate } : {},
      recurrence: s.edit,
      scope: s.scope,
      pastPatch: PAST_PATCH,
      tagIds: [],
      now: NOW,
    });

    // Only the transactions the save created (ignore any pre-existing history).
    const created = (await transactionRepo.list())
      .filter(t => t.recurring_rule_id === rule.id && !before.has(t.recurrence_date))
      .map(t => t.recurrence_date)
      .sort();

    // What the Summary promised must be exactly what the save produced.
    expect(created).toEqual(listDueOccurrences(schedule, preview.firstDate, TODAY).occurrences);
    expect(created).toHaveLength(preview.count);
    expect((await recurringRepo.list(1))[0].next_due).toBe(s.expectedNextDue);
  });
});
