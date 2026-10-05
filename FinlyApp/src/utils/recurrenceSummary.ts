import { t } from '../i18n';
import { RECURRENCE_FREQUENCIES } from '../constants/types';
import { formatDateLong, getMonthName } from './formatters';
import { fromDateOnly, type RecurrenceSchedule } from './recurrence';
import type { Language } from './language';

/** Human-readable summary of a recurrence schedule (e.g. "Every month on day 2"). */
export function recurrenceSummary(schedule: RecurrenceSchedule, language: Language): string {
  const labels = t();
  const interval = Math.max(1, schedule.interval || 1);
  let summary: string;

  switch (schedule.frequency) {
    case RECURRENCE_FREQUENCIES.weekly:
      summary = labels.repeat_every_week(interval);
      break;
    case RECURRENCE_FREQUENCIES.monthly:
      summary = `${labels.repeat_every_month(interval)} ${labels.repeat_on_day(schedule.day_of_month ?? 1)}`;
      break;
    case RECURRENCE_FREQUENCIES.yearly:
      summary = `${labels.repeat_every_year(interval)} ${getMonthName(schedule.month ?? 1)} ${labels.repeat_on_day(schedule.day_of_month ?? 1)}`;
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
