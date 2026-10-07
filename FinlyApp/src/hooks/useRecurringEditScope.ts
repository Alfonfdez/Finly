import { useMemo } from 'react';
import type { RecurrenceFrequency, TransactionType } from '../constants/types';
import { parseAmountValue } from '../utils/amountInput';
import {
  buildRecurrenceSchedule,
  isSkippedWindowRecoverable,
  nextDueOnOrAfter,
  recurrenceSkipWindow,
  toDateOnly,
  todayDateOnly,
} from '../utils/recurrence';

interface UseRecurringEditScopeProps {
  ruleMode: boolean;
  /** The recurrence draft under edit. */
  day: Date;
  frequency: RecurrenceFrequency;
  interval: number;
  end: Date | null;
  /** The current transaction draft. */
  accountId: number | undefined;
  categoryId: number | null;
  amount: number | null;
  comment: string;
  type: TransactionType;
  tagIds: number[];
  /** The rule's original values. */
  initialAccountId?: number;
  initialCategoryId: number | null;
  initialAmount?: string;
  initialComment: string;
  initialType: TransactionType;
  initialTagIds?: number[];
  initialRuleNextDue?: string | null;
  initialRuleActive?: boolean;
  initialRuleSkippedFrom?: string | null;
}

/**
 * Drives the "Apply changes to" scope of a recurring-rule edit: whether
 * "Future + past" can affect the past, and the window "Future only" would skip.
 */
export function useRecurringEditScope({
  ruleMode,
  day,
  frequency,
  interval,
  end,
  accountId,
  categoryId,
  amount,
  comment,
  type,
  tagIds,
  initialAccountId,
  initialCategoryId,
  initialAmount,
  initialComment,
  initialType,
  initialTagIds,
  initialRuleNextDue,
  initialRuleActive,
  initialRuleSkippedFrom,
}: UseRecurringEditScopeProps) {
  // Does the draft affect the past — either by touching a field the "past ones"
  // scope rewrites, or by opening a missed window the new schedule would back-fill?
  const recurringPastAffected = useMemo(() => {
    if (!ruleMode) return false;
    const initialAmountNum = initialAmount !== undefined ? parseAmountValue(initialAmount) : null;
    const initialTags = [...(initialTagIds ?? [])].sort((a, b) => a - b);
    const currentTags = [...tagIds].sort((a, b) => a - b);
    const tagsChanged =
      initialTags.length !== currentTags.length || initialTags.some((v, i) => v !== currentTags[i]);
    const detailChanged =
      accountId !== initialAccountId ||
      categoryId !== initialCategoryId ||
      amount !== initialAmountNum ||
      (comment.trim() || null) !== (initialComment.trim() || null) ||
      type !== initialType ||
      tagsChanged;
    // A missed window exists only if the rule is active AND the NEW schedule actually
    // has an occurrence due in [cursor, today] (respecting the end date) — a finished
    // or paused rule stays disabled.
    let missedWindow = false;
    if (initialRuleNextDue != null && (initialRuleActive ?? true)) {
      const schedule = buildRecurrenceSchedule(day, frequency, interval, end ? toDateOnly(end) : null);
      const firstDue = nextDueOnOrAfter(schedule, initialRuleNextDue);
      missedWindow = firstDue <= todayDateOnly() && (schedule.end_date == null || firstDue <= schedule.end_date);
    }
    // A window a previous "Future only" edit skipped is recoverable via "Future + past".
    const skippedRecoverable = isSkippedWindowRecoverable(
      initialRuleSkippedFrom,
      end ? toDateOnly(end) : null,
      todayDateOnly(),
    );
    return detailChanged || missedWindow || skippedRecoverable;
  }, [
    ruleMode,
    accountId,
    initialAccountId,
    categoryId,
    initialCategoryId,
    amount,
    initialAmount,
    comment,
    initialComment,
    type,
    initialType,
    tagIds,
    initialTagIds,
    initialRuleNextDue,
    initialRuleActive,
    initialRuleSkippedFrom,
    day,
    frequency,
    interval,
    end,
  ]);

  // Window that "Future only" would skip for the current draft (used to warn on save).
  const recurringSkipWindow = useMemo(() => {
    if (!ruleMode || initialRuleNextDue == null) return null;
    const schedule = buildRecurrenceSchedule(day, frequency, interval, end ? toDateOnly(end) : null);
    return recurrenceSkipWindow(schedule, initialRuleNextDue, todayDateOnly());
  }, [ruleMode, initialRuleNextDue, day, frequency, interval, end]);

  return { recurringPastAffected, recurringSkipWindow };
}
