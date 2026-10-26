import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import RepeatSection from '../../src/components/RepeatSection';

// Pin "today" so the Summary block is deterministic (2026-10-06).
vi.mock('../../src/utils/recurrence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/recurrence')>();
  return { ...actual, todayDateOnly: () => '2026-10-06' };
});

type Props = ComponentProps<typeof RepeatSection>;

function renderSummary(overrides: Partial<Props>) {
  const props: Props = {
    frequency: 'daily',
    onChangeFrequency: vi.fn(),
    interval: 1,
    onChangeInterval: vi.fn(),
    startDay: new Date(2026, 9, 6),
    endDate: null,
    onOpenEndDate: vi.fn(),
    onClearEndDate: vi.fn(),
    name: 'Rent',
    onChangeName: vi.fn(),
    nameError: null,
    ...overrides,
  };
  return render(<RepeatSection {...props} />);
}

describe('recurring Summary block', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('create with a past start: first transaction + count', async () => {
    const view = await renderSummary({ frequency: 'monthly', startDay: new Date(2026, 8, 1) });
    expect(view.getByText('Summary')).toBeTruthy();
    expect(view.getByText('Every month on day 1')).toBeTruthy();
    expect(view.getByText('First transaction: September 1, 2026')).toBeTruthy();
    expect(view.getByText('2 transactions will be created')).toBeTruthy();
  });

  it('create with a future start: nothing is created now', async () => {
    const view = await renderSummary({ frequency: 'monthly', startDay: new Date(2026, 10, 1) });
    expect(view.getByText('First transaction: November 1, 2026')).toBeTruthy();
    expect(view.getByText('No transactions will be created now')).toBeTruthy();
  });

  it('edit (Future only): a denser schedule applies from today', async () => {
    const view = await renderSummary({
      frequency: 'daily',
      startDay: new Date(2026, 8, 1),
      ruleNextDue: '2026-11-01',
      previousSchedule: { frequency: 'monthly', interval: 1, day_of_month: 1, start_date: '2026-09-01', end_date: null },
    });
    expect(view.getByText('Every day')).toBeTruthy();
    expect(view.getByText('Next: October 6, 2026')).toBeTruthy();
    expect(view.getByText('1 transaction will be created')).toBeTruthy();
  });

  it('edit (Future only): reports the skipped window', async () => {
    const view = await renderSummary({
      frequency: 'daily',
      startDay: new Date(2026, 9, 1),
      ruleNextDue: '2026-10-30',
      ruleUnmaterialized: true,
    });
    expect(view.getByText('Next: October 6, 2026')).toBeTruthy();
    expect(view.getByText('1 transaction will be created')).toBeTruthy();
    expect(view.getByText('5 occurrences will be skipped')).toBeTruthy();
  });

  it('edit (Future + past): reports the back-filled window', async () => {
    const view = await renderSummary({
      frequency: 'monthly',
      startDay: new Date(2026, 0, 2),
      ruleNextDue: '2026-01-02',
      scope: 'futureAndPast',
    });
    expect(view.getByText('Back-fill from: January 2, 2026')).toBeTruthy();
    expect(view.getByText('Adds 10 missed transactions')).toBeTruthy();
  });

  it('edit: hints that past occurrences are not recreated', async () => {
    const view = await renderSummary({
      frequency: 'monthly',
      startDay: new Date(2026, 9, 1),
      ruleNextDue: '2026-11-05',
      ruleStartMovedEarlier: true,
    });
    expect(view.getByText('Changing the start date doesn\'t add earlier transactions.')).toBeTruthy();
  });
});
