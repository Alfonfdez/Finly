import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react-native';
import { useRecurringEditScope } from '../../src/hooks/useRecurringEditScope';

// Pin "today" so the gate is deterministic (2026-10-06).
vi.mock('../../src/utils/recurrence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/recurrence')>();
  return { ...actual, todayDateOnly: () => '2026-10-06' };
});

const base = {
  ruleMode: true,
  day: new Date(2026, 0, 2),
  frequency: 'monthly' as const,
  interval: 1,
  end: null,
  accountId: 1,
  categoryId: 1,
  amount: 100,
  comment: '',
  type: 'expense' as const,
  tagIds: [] as number[],
  initialAccountId: 1,
  initialCategoryId: 1,
  initialAmount: '100',
  initialComment: '',
  initialType: 'expense' as const,
  initialTagIds: [] as number[],
  initialRuleNextDue: '2099-01-02',
  initialRuleActive: true,
  initialRuleSkippedFrom: null,
};

describe('useRecurringEditScope', () => {
  it('does not affect the past when nothing changed', async () => {
    const { result } = await renderHook(() => useRecurringEditScope(base));
    expect(result.current.recurringPastAffected).toBe(false);
  });

  it('affects the past when a rewritten detail changed', async () => {
    const { result } = await renderHook(() => useRecurringEditScope({ ...base, amount: 120 }));
    expect(result.current.recurringPastAffected).toBe(true);
  });

  it('affects the past when a skipped window is recoverable', async () => {
    const { result } = await renderHook(() =>
      useRecurringEditScope({ ...base, initialRuleSkippedFrom: '2026-10-01' }),
    );
    expect(result.current.recurringPastAffected).toBe(true);
  });

  it('uses the last-day schedule when checking the missed window', async () => {
    // Today is 2026-10-06. A monthly rule anchored on the 10th has next on Oct 10
    // (future → no missed window); the last-day variant is due Sep 30 (past → window).
    const args = { ...base, day: new Date(2026, 7, 10), initialRuleNextDue: '2026-09-30' };

    const byDay = await renderHook(() => useRecurringEditScope(args));
    expect(byDay.result.current.recurringPastAffected).toBe(false);

    const lastDay = await renderHook(() => useRecurringEditScope({ ...args, lastDay: true }));
    expect(lastDay.result.current.recurringPastAffected).toBe(true);
  });
});
