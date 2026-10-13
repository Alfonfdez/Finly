import { useMemo } from 'react';
import type { RecurrenceFrequency, TransactionType } from '../constants/types';
import { parseAmountValue } from '../utils/amountInput';
import {
  buildRecurrenceSchedule,
  isSkippedWindowRecoverable,
  nextDueOnOrAfter,
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
  /** Monthly/yearly: anchor on the last day of the month (affects the schedule used here). */
  lastDay?: boolean;
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
  /** The rule's cursor still equals its start (never generated/skipped): the new start anchors it. */
  ruleUnmaterialized?: boolean;
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
  lastDay = false,
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
  ruleUnmaterialized = false,
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
      const schedule = buildRecurrenceSchedule(day, frequency, interval, end ? toDateOnly(end) : null, lastDay);
      const cursor = ruleUnmaterialized ? schedule.start_date : initialRuleNextDue;
      const firstDue = nextDueOnOrAfter(schedule, cursor);
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
    ruleUnmaterialized,
    day,
    frequency,
    interval,
    end,
    lastDay,
  ]);

  return { recurringPastAffected };
}
