import { describe, it, expect, beforeEach } from 'vitest';
import { recurrenceInfoLines } from '../../src/utils/recurrenceInfo';
import { setLanguage } from '../../src/i18n';
import { LANGUAGES } from '../../src/utils/language';
import type { RecurrenceSchedule } from '../../src/utils/recurrence';

function schedule(overrides: Partial<RecurrenceSchedule> = {}): RecurrenceSchedule {
  return {
    frequency: 'monthly',
    interval: 1,
    day_of_month: 6,
    start_date: '2026-01-06',
    ...overrides,
  };
}

describe('recurrenceInfoLines', () => {
  beforeEach(() => setLanguage('en'));

  it('create: first transaction date + how many will be created', () => {
    expect(recurrenceInfoLines(schedule(), { today: '2026-04-15', cursor: null, scope: 'future' }, LANGUAGES.en)).toEqual({
      summary: 'Every month on day 6',
      firstLine: 'First transaction: January 6, 2026',
      detailLines: ['4 transactions will be created'],
    });
  });

  it('create: warns instead of promising a count when the backlog exceeds the limit', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '1990-01-01' });
    const lines = recurrenceInfoLines(daily, { today: '2026-10-19', cursor: null, scope: 'future' }, LANGUAGES.en);

    expect(lines.detailLines).toEqual([
      'This rule would create more than 5000 transactions. Move the start date later or add an end date',
    ]);
  });

  it('edit (Future + past): warns when the back-fill exceeds the limit', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '1990-01-01' });
    const lines = recurrenceInfoLines(
      daily,
      { today: '2026-10-19', cursor: '1990-01-01', scope: 'futureAndPast' },
      LANGUAGES.en,
    );

    expect(lines.detailLines.at(-1)).toBe(
      'This rule would create more than 5000 transactions. Move the start date later or add an end date',
    );
  });
  it('create: nothing is created while the start is in the future', () => {
    const future = schedule({ start_date: '2026-05-06' });
    expect(recurrenceInfoLines(future, { today: '2026-04-15', cursor: null, scope: 'future' }, LANGUAGES.en)).toMatchObject({
      firstLine: 'First transaction: May 6, 2026',
      detailLines: ['No transactions will be created now'],
    });
  });

  it('edit (Future only): reports the skipped window', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '2026-09-01' });
    expect(recurrenceInfoLines(daily, { today: '2026-10-07', cursor: '2026-09-01', scope: 'future' }, LANGUAGES.en)).toEqual({
      summary: 'Every day',
      firstLine: 'Next: October 7, 2026',
      detailLines: ['1 transaction will be created', '36 occurrences will be skipped'],
    });
  });

  it('edit (Future + past): back-fills from the cursor', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '2026-09-01' });
    expect(recurrenceInfoLines(daily, { today: '2026-10-07', cursor: '2026-09-01', scope: 'futureAndPast' }, LANGUAGES.en)).toMatchObject({
      firstLine: 'Next: September 1, 2026',
      detailLines: ['Adds 37 missed transactions'],
    });
  });

  it('edit (Future only): a denser schedule applies from today', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '2026-09-01' });
    const previous = schedule({ frequency: 'monthly', day_of_month: 1, start_date: '2026-09-01' });
    expect(recurrenceInfoLines(
      daily,
      { today: '2026-10-06', cursor: '2026-11-01', scope: 'future', previousSchedule: previous },
      LANGUAGES.en,
    )).toMatchObject({
      firstLine: 'Next: October 6, 2026',
      detailLines: ['1 transaction will be created'],
    });
  });

  it('edit (Future + past): counts only the occurrences not already generated', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '2026-10-01', end_date: '2026-10-18' });
    // 1-11 Oct were generated, then a "Future only" edit skipped 12-13 and created 14 Oct.
    const existing = new Set([
      '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06',
      '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-14',
    ]);
    expect(recurrenceInfoLines(
      daily,
      {
        today: '2026-10-14',
        cursor: '2026-10-15',
        scope: 'futureAndPast',
        skippedFrom: '2026-10-12',
        existingOccurrences: existing,
      },
      LANGUAGES.en,
    )).toMatchObject({
      firstLine: 'Next: October 12, 2026',
      detailLines: ['Adds 2 missed transactions'],
    });
  });

  it('edit (Future + past): without the existing dates the raw schedule count is used', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '2026-10-01', end_date: '2026-10-18' });
    expect(recurrenceInfoLines(
      daily,
      { today: '2026-10-14', cursor: '2026-10-15', scope: 'futureAndPast', skippedFrom: '2026-10-12' },
      LANGUAGES.en,
    )).toMatchObject({
      detailLines: ['Adds 3 missed transactions'],
    });
  });

  it('localizes the lines', () => {
    setLanguage('es');
    expect(recurrenceInfoLines(schedule(), { today: '2026-04-15', cursor: null, scope: 'future' }, LANGUAGES.es)).toMatchObject({
      summary: 'Cada mes el día 6',
      firstLine: 'Primera transacción: 6 de enero de 2026',
      detailLines: ['Se crearán 4 transacciones'],
    });
  });

  it('adds the month-by-month line when the occurrence day varies', () => {
    const lastDay = schedule({ day_of_month: 31, start_date: '2026-10-31' });
    const lines = recurrenceInfoLines(lastDay, { today: '2026-10-17', cursor: null, scope: 'future' }, LANGUAGES.en);
    expect(lines.summary).toBe('Every month on the last day');
    expect(lines.detailLines).toEqual([
      '31 in Jan, Mar, May, Jul, Aug, Oct, Dec · 30 in Apr, Jun, Sep, Nov · 28 in Feb (29 in leap years)',
      'No transactions will be created now',
    ]);
  });

  it('adds the February leap-year line to a yearly last-day rule', () => {
    const february = schedule({ frequency: 'yearly', month: 2, day_of_month: 31, start_date: '2027-02-28' });
    const lines = recurrenceInfoLines(february, { today: '2026-10-17', cursor: null, scope: 'future' }, LANGUAGES.en);
    expect(lines.summary).toBe('Every year on the last day of February');
    expect(lines.detailLines[0]).toBe('28 in Feb (29 in leap years)');
  });

  it('keeps the day-only line when the day never varies', () => {
    const month15 = schedule({ day_of_month: 15, start_date: '2026-01-15' });
    expect(recurrenceInfoLines(month15, { today: '2026-10-17', cursor: null, scope: 'future' }, LANGUAGES.en).detailLines)
      .toEqual(['10 transactions will be created']);
  });

  it('paused rule: says nothing is created instead of promising a back-fill', () => {
    const monthly = schedule({ day_of_month: 6, start_date: '2026-01-06' });
    const lines = recurrenceInfoLines(
      monthly,
      { today: '2026-10-17', cursor: '2026-09-06', scope: 'futureAndPast', ruleActive: false },
      LANGUAGES.en,
    );
    expect(lines.detailLines).toEqual(['This rule is paused: no transactions are created until you resume it.']);
  });

  it('active rule with the same draft keeps the back-fill line', () => {
    const monthly = schedule({ day_of_month: 6, start_date: '2026-01-06' });
    const lines = recurrenceInfoLines(
      monthly,
      { today: '2026-10-17', cursor: '2026-09-06', scope: 'futureAndPast', ruleActive: true },
      LANGUAGES.en,
    );
    expect(lines.detailLines).toEqual(['Adds 2 missed transactions']);
  });

  it('edit (Future + past): asks for an earlier end date when one is already set', () => {
    const daily = schedule({ frequency: 'daily', day_of_month: null, start_date: '1990-01-01', end_date: '2005-12-31' });
    const lines = recurrenceInfoLines(
      daily,
      { today: '2026-10-19', cursor: '1990-01-01', scope: 'futureAndPast' },
      LANGUAGES.en,
    );

    expect(lines.detailLines.at(-1)).toBe(
      'This rule would create more than 5000 transactions. Move the start date later or set an earlier end date',
    );
  });
});
