import { describe, it, expect, afterEach } from 'vitest';
import { recurrenceSummary } from '../../src/utils/recurrenceSummary';
import { setLanguage } from '../../src/i18n';
import { LANGUAGES } from '../../src/utils/language';
import type { RecurrenceSchedule } from '../../src/utils/recurrence';

function schedule(overrides: Partial<RecurrenceSchedule> = {}): RecurrenceSchedule {
  return {
    frequency: 'monthly',
    interval: 1,
    start_date: '2026-01-06',
    ...overrides,
  };
}

afterEach(() => setLanguage('en'));

describe('recurrenceSummary', () => {
  it('summarizes every frequency in English', () => {
    setLanguage('en');
    expect(recurrenceSummary(schedule({ frequency: 'daily' }), LANGUAGES.en)).toBe('Every day');
    expect(recurrenceSummary(schedule({ frequency: 'daily', interval: 2 }), LANGUAGES.en)).toBe('Every 2 days');
    expect(recurrenceSummary(schedule({ frequency: 'weekly', start_date: '2026-10-05' }), LANGUAGES.en)).toBe('Every week on Monday');
    expect(recurrenceSummary(schedule({ frequency: 'weekly', interval: 2, weekday: 4 }), LANGUAGES.en)).toBe('Every 2 weeks on Thursday');
    expect(recurrenceSummary(schedule({ frequency: 'monthly', day_of_month: 6 }), LANGUAGES.en)).toBe('Every month on day 6');
    expect(recurrenceSummary(schedule({ frequency: 'monthly', interval: 3, day_of_month: 2 }), LANGUAGES.en)).toBe('Every 3 months on day 2');
    expect(recurrenceSummary(schedule({ frequency: 'yearly', month: 10, day_of_month: 6 }), LANGUAGES.en)).toBe('Every year on October 6');
  });

  it('appends the end date in English', () => {
    setLanguage('en');
    const s = schedule({ frequency: 'yearly', month: 10, day_of_month: 6, end_date: '2026-10-30' });
    expect(recurrenceSummary(s, LANGUAGES.en)).toBe('Every year on October 6 until October 30, 2026');
  });

  it('uses the start-date weekday when weekday is not set', () => {
    setLanguage('en');
    const s = schedule({ frequency: 'weekly', start_date: '2026-10-05', weekday: null });
    expect(recurrenceSummary(s, LANGUAGES.en)).toBe('Every week on Monday');
  });

  it('reads naturally in Spanish with a lowercase month', () => {
    setLanguage('es');
    expect(recurrenceSummary(schedule({ frequency: 'weekly', start_date: '2026-10-05' }), LANGUAGES.es)).toBe('Cada semana el lunes');
    expect(recurrenceSummary(schedule({ frequency: 'monthly', day_of_month: 6 }), LANGUAGES.es)).toBe('Cada mes el día 6');
    const s = schedule({ frequency: 'yearly', month: 10, day_of_month: 6, end_date: '2026-10-30' });
    expect(recurrenceSummary(s, LANGUAGES.es)).toBe('Cada año el 6 de octubre hasta 30 de octubre de 2026');
  });

  it('formats the yearly phrase per language', () => {
    try {
      setLanguage('de');
      expect(recurrenceSummary(schedule({ frequency: 'yearly', month: 10, day_of_month: 6 }), LANGUAGES.de)).toBe('Jedes Jahr am 6. Oktober');
      setLanguage('fr');
      expect(recurrenceSummary(schedule({ frequency: 'yearly', month: 10, day_of_month: 6 }), LANGUAGES.fr)).toBe('Tous les ans le 6 octobre');
      setLanguage('ca');
      expect(recurrenceSummary(schedule({ frequency: 'yearly', month: 10, day_of_month: 6 }), LANGUAGES.ca)).toBe("Cada any el 6 d'octubre");
      setLanguage('ca');
      expect(recurrenceSummary(schedule({ frequency: 'yearly', month: 3, day_of_month: 6 }), LANGUAGES.ca)).toBe('Cada any el 6 de març');
    } finally {
      setLanguage('en');
    }
  });
});
