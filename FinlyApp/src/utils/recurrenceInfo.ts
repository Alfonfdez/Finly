import { t } from '../i18n';
import { RECURRENCE_SCOPES, type RecurrenceScope } from '../constants/types';
import { formatDateLong } from './formatters';
import { fromDateOnly, planEdit, recurrenceDayPattern, recurrencePreview, type RecurrenceSchedule } from './recurrence';
import { recurrenceSummary } from './recurrenceSummary';
import type { Language } from './language';

export interface RecurrenceInfoLines {
  /** Human-readable frequency + end-date summary. */
  summary: string;
  /** First (create) or next (edit) transaction line. */
  firstLine: string;
  /** How many transactions will be created / skipped / back-filled. */
  detailLines: string[];
}

export interface RecurrenceInfoOptions {
  /** Today as a date-only string. */
  today: string;
  /** The rule's cursor (see `ruleEditCursor`); null in create mode. */
  cursor: string | null;
  scope: RecurrenceScope;
  /** Earliest occurrence a previous "Future only" edit skipped. */
  skippedFrom?: string | null;
  /** The rule's schedule before the edit (to skip an already-generated today). */
  previousSchedule?: RecurrenceSchedule | null;
  /** Dates that already have a generated transaction, so they aren't counted as missed. */
  existingOccurrences?: ReadonlySet<string>;
  /** The rule is paused: nothing is created until it is resumed (see `planEdit`). */
  ruleActive?: boolean;
}

/**
 * One line stating the day each month's occurrence lands on, for the schedules whose
 * day varies (monthly 29/30/31 or last-day, yearly February). `null` when it never
 * varies — the summary line already names the exact day. See spec 028 §4.
 */
function dayPatternLine(
  schedule: RecurrenceSchedule,
  labels: ReturnType<typeof t>,
): string | null {
  const pattern = recurrenceDayPattern(schedule);
  if (!pattern) return null;
  const februaryIndex = pattern.groups.findIndex(group => group.months.includes(2));
  return pattern.groups
    .map((group, index) => {
      const months = group.months.map(month => labels.months_short[month - 1]).join(', ');
      const leap = index === februaryIndex && pattern.leapDay != null
        ? ` ${labels.repeat_pattern_leap(pattern.leapDay)}`
        : '';
      return `${labels.repeat_pattern_group(group.day, months)}${leap}`;
    })
    .join(' · ');
}

/**
 * The three lines of the recurring "Summary" block (`RecurrenceInfo`): the frequency
 * summary, the first/next transaction date, and what the save will create/skip. Mirrors
 * `saveRecurringRuleEdit` (both go through `planEdit`), so the form can't drift from the write.
 */
export function recurrenceInfoLines(
  schedule: RecurrenceSchedule,
  options: RecurrenceInfoOptions,
  language: Language,
): RecurrenceInfoLines {
  const labels = t();
  const summary = recurrenceSummary(schedule, language);
  const formatOccurrence = (value: string) => formatDateLong(fromDateOnly(value), language);
  const patternLine = dayPatternLine(schedule, labels);
  const patternLines = patternLine ? [patternLine] : [];

  if (options.cursor == null) {
    const preview = recurrencePreview(schedule, { today: options.today });
    return {
      summary,
      firstLine: labels.repeat_first_transaction(formatOccurrence(preview.firstDate)),
      detailLines: [...patternLines, labels.recurring_info_count(preview.count)],
    };
  }

  const ruleActive = options.ruleActive ?? true;
  const plan = planEdit({
    schedule,
    previousSchedule: options.previousSchedule ?? null,
    cursor: options.cursor,
    scope: options.scope,
    today: options.today,
    skippedFrom: options.skippedFrom ?? null,
    existingOccurrences: options.existingOccurrences,
    ruleActive,
  });

  const firstLine = labels.recurring_info_next(formatOccurrence(plan.preview.firstDate));
  const detailLines: string[] = [...patternLines];
  if (!ruleActive) {
    // A paused rule creates nothing on save, whatever the scope; say so instead of
    // promising a back-fill (the "Future + past" save still rewrites its past rows).
    detailLines.push(labels.recurring_info_paused);
  } else if (options.scope === RECURRENCE_SCOPES.futureAndPast) {
    detailLines.push(plan.preview.count > 0 ? labels.recurring_info_backfill(plan.preview.count) : labels.recurring_info_count(0));
  } else {
    detailLines.push(labels.recurring_info_count(plan.preview.count));
    if (plan.skipWindow) detailLines.push(labels.recurring_info_skipped(plan.skipWindow.count));
  }

  return { summary, firstLine, detailLines };
}
