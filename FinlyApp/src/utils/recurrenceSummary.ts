import { t } from '../i18n';
import { RECURRENCE_FREQUENCIES, type RecurrenceFrequency } from '../constants/types';
import { formatDateLong, getMonthName } from './formatters';
import { fromDateOnly, type RecurrenceSchedule } from './recurrence';
import type { Language } from './language';

/** Localized labels per recurrence frequency (shared by the frequency chips and the rules list). */
export function recurrenceFrequencyLabels(labels: ReturnType<typeof t> = t()): Record<RecurrenceFrequency, string> {
  return {
    daily: labels.repeat_daily,
    weekly: labels.repeat_weekly,
    monthly: labels.repeat_monthly,
    yearly: labels.repeat_yearly,
  };
}

/** Human-readable summary of a recurrence schedule (e.g. "Every month on day 2"). */
export function recurrenceSummary(schedule: RecurrenceSchedule, language: Language): string {
  const labels = t();
  const interval = Math.max(1, schedule.interval || 1);
  let summary: string;

  switch (schedule.frequency) {
    case RECURRENCE_FREQUENCIES.weekly: {
      const weekday = schedule.weekday ?? fromDateOnly(schedule.start_date).getDay();
      summary = `${labels.repeat_every_week(interval)} ${labels.repeat_on_weekday(labels.weekdays[weekday] ?? '')}`;
      break;
    }
    case RECURRENCE_FREQUENCIES.monthly:
      summary = schedule.day_of_month === 31
        ? `${labels.repeat_every_month(interval)} ${labels.repeat_on_last_day}`
        : `${labels.repeat_every_month(interval)} ${labels.repeat_on_day(schedule.day_of_month ?? 1)}`;
      break;
    case RECURRENCE_FREQUENCIES.yearly:
      summary = schedule.day_of_month === 31
        ? `${labels.repeat_every_year(interval)} ${labels.repeat_on_month_last_day(getMonthName(schedule.month ?? 1))}`
        : `${labels.repeat_every_year(interval)} ${labels.repeat_on_month_day(getMonthName(schedule.month ?? 1), schedule.day_of_month ?? 1)}`;
      break;
    case RECURRENCE_FREQUENCIES.daily:
    default:
      summary = labels.repeat_every_day(interval);
      break;
  }

  if (schedule.end_date) {
    summary = `${summary} ${labels.repeat_until(formatDateLong(fromDateOnly(schedule.end_date), language))}`;
  }

  return summary;
}
