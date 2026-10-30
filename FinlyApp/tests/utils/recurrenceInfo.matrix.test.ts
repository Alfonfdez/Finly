import { describe, it, expect, beforeEach } from 'vitest';
import { recurrenceInfoLines } from '../../src/utils/recurrenceInfo';
import { setLanguage } from '../../src/i18n';
import { LANGUAGES } from '../../src/utils/language';
import { toDateOnly, type RecurrenceSchedule } from '../../src/utils/recurrence';

const TODAY = '2026-10-06';

function schedule(overrides: Partial<RecurrenceSchedule> = {}): RecurrenceSchedule {
  return {
    frequency: 'daily',
    interval: 1,
    day_of_month: null,
    start_date: '2026-09-01',
    end_date: null,
    ...overrides,
  };
}

function dailyRange(start: string, end: string): Set<string> {
  const dates = new Set<string>();
  const [startYear, startMonth, startDay] = start.split('-').map(Number);
  const [endYear, endMonth, endDay] = end.split('-').map(Number);
  const cursor = new Date(startYear, startMonth - 1, startDay);
  const last = new Date(endYear, endMonth - 1, endDay);
  while (cursor <= last) {
    dates.add(toDateOnly(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

describe('recurrenceInfoLines matrix', () => {
  beforeEach(() => setLanguage('en'));

  it('create daily rule', () => {
    expect(recurrenceInfoLines(schedule(), { today: TODAY, cursor: null, scope: 'future' }, LANGUAGES.en)).toEqual({
      summary: 'Every day',
      firstLine: 'First transaction: September 1, 2026',
      detailLines: ['36 transactions will be created'],
    });
  });

  it('create future daily rule', () => {
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-10-20' }),
      { today: TODAY, cursor: null, scope: 'future' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'First transaction: October 20, 2026',
      detailLines: ['No transactions will be created now'],
    });
  });

  it('create monthly 31st rule with the day pattern', () => {
    expect(recurrenceInfoLines(
      schedule({ frequency: 'monthly', day_of_month: 31, start_date: '2026-01-31' }),
      { today: TODAY, cursor: null, scope: 'future' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every month on the last day',
      firstLine: 'First transaction: January 31, 2026',
      detailLines: [
        '31 in Jan, Mar, May, Jul, Aug, Oct, Dec · 30 in Apr, Jun, Sep, Nov · 28 in Feb (29 in leap years)',
        '9 transactions will be created',
      ],
    });
  });

  it('create yearly leap-day rule', () => {
    expect(recurrenceInfoLines(
      schedule({ frequency: 'yearly', month: 2, day_of_month: 29, start_date: '2024-02-29' }),
      { today: TODAY, cursor: null, scope: 'future' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every year on February 29',
      firstLine: 'First transaction: February 29, 2024',
      detailLines: ['28 in Feb (29 in leap years)', '3 transactions will be created'],
    });
  });

  it('create weekly rule', () => {
    expect(recurrenceInfoLines(
      schedule({ frequency: 'weekly', day_of_month: null, start_date: '2026-09-07' }),
      { today: TODAY, cursor: null, scope: 'future' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every week on Monday',
      firstLine: 'First transaction: September 7, 2026',
      detailLines: ['5 transactions will be created'],
    });
  });

  it('future only reports the skipped window', () => {
    expect(recurrenceInfoLines(
      schedule(),
      { today: TODAY, cursor: '2026-09-01', scope: 'future' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 6, 2026',
      detailLines: ['1 transaction will be created', '35 occurrences will be skipped'],
    });
  });

  it('future + past starts at the back-fill date', () => {
    expect(recurrenceInfoLines(
      schedule(),
      { today: TODAY, cursor: '2026-09-01', scope: 'futureAndPast' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Back-fill from: September 1, 2026',
      detailLines: ['Adds 36 missed transactions'],
    });
  });

  it('future + past counts only missing occurrences', () => {
    expect(recurrenceInfoLines(
      schedule(),
      {
        today: TODAY,
        cursor: '2026-09-01',
        scope: 'futureAndPast',
        existingOccurrences: dailyRange('2026-09-01', '2026-10-05'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Back-fill from: September 1, 2026',
      detailLines: ['Adds 1 missed transaction'],
    });
  });

  it('type-only future + past reports updated past transactions', () => {
    expect(recurrenceInfoLines(
      schedule(),
      {
        today: TODAY,
        cursor: '2026-10-07',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-09-01', '2026-10-06'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now', 'Updates 36 past transactions'],
    });
  });

  it('counts only occurrences inside a later start window', () => {
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-10-19' }),
      {
        today: '2026-10-26',
        cursor: '2026-10-27',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-10-01', '2026-10-26'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 27, 2026',
      detailLines: ['No transactions will be created now', 'Updates 8 past transactions'],
    });
  });

  it('counts only occurrences inside a shortened end window', () => {
    expect(recurrenceInfoLines(
      schedule({ end_date: '2026-10-10' }),
      {
        today: '2026-10-26',
        cursor: '2026-10-27',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-10-01', '2026-10-26'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day until October 10, 2026',
      firstLine: 'This rule has ended: no future transactions will be created.',
      detailLines: ['Updates 10 past transactions'],
    });
  });

  it('future only never reports past updates', () => {
    expect(recurrenceInfoLines(
      schedule(),
      {
        today: TODAY,
        cursor: '2026-10-07',
        scope: 'future',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-09-01', '2026-10-06'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now'],
    });
  });

  it('ended rule shows the ended message', () => {
    expect(recurrenceInfoLines(
      schedule({ end_date: '2026-09-30' }),
      { today: TODAY, cursor: '2026-10-01', scope: 'future' },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day until September 30, 2026',
      firstLine: 'This rule has ended: no future transactions will be created.',
      detailLines: [],
    });
  });

  it('extending an ended rule with future only skips the missed days', () => {
    const previous = schedule({ end_date: '2026-09-30' });
    expect(recurrenceInfoLines(
      schedule({ end_date: '2026-10-31' }),
      {
        today: TODAY,
        cursor: '2026-10-01',
        scope: 'future',
        previousSchedule: previous,
        existingOccurrences: dailyRange('2026-09-01', '2026-09-30'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day until October 31, 2026',
      firstLine: 'Next: October 6, 2026',
      detailLines: ['1 transaction will be created', '5 occurrences will be skipped'],
    });
  });

  it('extending an ended rule with future + past back-fills it', () => {
    const previous = schedule({ end_date: '2026-09-30' });
    expect(recurrenceInfoLines(
      schedule({ end_date: '2026-10-31' }),
      {
        today: TODAY,
        cursor: '2026-10-01',
        scope: 'futureAndPast',
        previousSchedule: previous,
        existingOccurrences: dailyRange('2026-09-01', '2026-09-30'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day until October 31, 2026',
      firstLine: 'Back-fill from: October 1, 2026',
      detailLines: ['Adds 6 missed transactions'],
    });
  });

  it('extending a shortened rule does not re-create an already-generated today', () => {
    const previous = schedule({ end_date: '2026-09-30' });
    expect(recurrenceInfoLines(
      schedule({ end_date: '2026-10-31' }),
      {
        today: TODAY,
        cursor: '2026-10-07',
        scope: 'future',
        previousSchedule: previous,
        existingOccurrences: dailyRange('2026-09-01', '2026-10-06'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day until October 31, 2026',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['No transactions will be created now'],
    });
  });

  it('future + past reports back-fill and past updates together', () => {
    expect(recurrenceInfoLines(
      schedule(),
      {
        today: TODAY,
        cursor: '2026-09-01',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-09-01', '2026-09-30'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Back-fill from: September 1, 2026',
      detailLines: ['Adds 6 missed transactions', 'Updates 30 past transactions'],
    });
  });

  it('paused rule keeps the paused message and can still report past updates', () => {
    expect(recurrenceInfoLines(
      schedule(),
      {
        today: TODAY,
        cursor: '2026-09-01',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-09-01', '2026-10-06'),
        ruleActive: false,
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 6, 2026',
      detailLines: [
        'This rule is paused: no transactions are created until you resume it.',
        'Updates 36 past transactions',
      ],
    });
  });

  it('ended rule can still report past updates', () => {
    expect(recurrenceInfoLines(
      schedule({ end_date: '2026-09-30' }),
      {
        today: TODAY,
        cursor: '2026-10-01',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-09-01', '2026-09-30'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day until September 30, 2026',
      firstLine: 'This rule has ended: no future transactions will be created.',
      detailLines: ['Updates 30 past transactions'],
    });
  });
});

describe('recurrenceInfoLines scenario chains', () => {
  beforeEach(() => setLanguage('en'));

  it('future start with Future + past creates nothing and shows no update line', () => {
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-11-01' }),
      {
        today: '2026-10-26',
        cursor: '2026-11-01',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: new Set(),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: November 1, 2026',
      detailLines: ['No transactions will be created now'],
    });
  });

  it('start moved earlier includes all existing transactions in the update window', () => {
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-09-01' }),
      {
        today: '2026-10-26',
        cursor: '2026-10-27',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-10-01', '2026-10-26'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 27, 2026',
      detailLines: ['No transactions will be created now', 'Updates 26 past transactions'],
    });
  });

  it('removing an end date includes all existing transactions in the update window', () => {
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-10-01', end_date: null }),
      {
        today: '2026-10-26',
        cursor: '2026-10-27',
        scope: 'futureAndPast',
        pastDetailsChanged: true,
        existingOccurrences: dailyRange('2026-10-01', '2026-10-26'),
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 27, 2026',
      detailLines: ['No transactions will be created now', 'Updates 26 past transactions'],
    });
  });

  it('monthly to daily Future only starts at today', () => {
    const previous = schedule({ frequency: 'monthly', day_of_month: 1, start_date: '2026-09-01' });
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-09-01' }),
      {
        today: '2026-10-06',
        cursor: '2026-11-01',
        scope: 'future',
        previousSchedule: previous,
        existingOccurrences: new Set(['2026-09-01', '2026-10-01']),
        pastDetailsChanged: true,
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 6, 2026',
      detailLines: ['1 transaction will be created'],
    });
  });

  it('monthly to daily Future + past recovers the skipped window', () => {
    const previous = schedule({ frequency: 'monthly', day_of_month: 1, start_date: '2026-09-01' });
    expect(recurrenceInfoLines(
      schedule({ start_date: '2026-09-01' }),
      {
        today: '2026-10-06',
        cursor: '2026-11-01',
        scope: 'futureAndPast',
        skippedFrom: '2026-09-01',
        previousSchedule: previous,
        existingOccurrences: new Set(['2026-09-01', '2026-10-01']),
        pastDetailsChanged: true,
      },
      LANGUAGES.en,
    )).toEqual({
      summary: 'Every day',
      firstLine: 'Back-fill from: September 1, 2026',
      detailLines: ['Adds 34 missed transactions', 'Updates 2 past transactions'],
    });
  });
});
