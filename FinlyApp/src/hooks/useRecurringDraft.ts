import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RecurrenceDraft, RecurrenceFrequency } from '../constants/types';
import { advanceOccurrence, buildRecurrenceSchedule, fromDateOnly, toDateOnly } from '../utils/recurrence';
import { dayAfter, isEndAfterStart } from '../utils/calendarBounds';

interface UseRecurringDraftProps {
  /** The selected transaction day, used as the schedule anchor. */
  day: Date;
  ruleMode: boolean;
  existingRepeatNames?: string[];
  initialRepeatFrequency?: RecurrenceFrequency;
  initialRepeatInterval?: number;
  initialRepeatEnd?: Date | null;
  initialRepeatName?: string;
}

/**
 * Recurring-rule draft state shared by the create/edit forms: the repeat toggle,
 * frequency/interval/end date/skip-first/name, the end-date bounds and the
 * name validation. Pure form state — no rule persistence.
 */
export function useRecurringDraft({
  day,
  ruleMode,
  existingRepeatNames,
  initialRepeatFrequency,
  initialRepeatInterval,
  initialRepeatEnd,
  initialRepeatName,
}: UseRecurringDraftProps) {
  const [repeatEnabled, setRepeatEnabled] = useState(ruleMode);
  const [repeatFrequency, setRepeatFrequency] = useState<RecurrenceFrequency>(initialRepeatFrequency ?? 'monthly');
  const [repeatInterval, setRepeatInterval] = useState(initialRepeatInterval ?? 1);
  const [repeatEnd, setRepeatEnd] = useState<Date | null>(initialRepeatEnd ?? null);
  const [repeatSkipFirst, setRepeatSkipFirst] = useState(false);
  const [repeatName, setRepeatName] = useState(initialRepeatName ?? '');
  const [modalRepeatEndVisible, setModalRepeatEndVisible] = useState(false);

  // Earliest valid end date: the first occurrence (which moves one interval ahead when skipping it).
  const repeatMinDate = useMemo(() => {
    if (!repeatSkipFirst) return dayAfter(day);
    const schedule = buildRecurrenceSchedule(day, repeatFrequency, repeatInterval);
    return fromDateOnly(advanceOccurrence(schedule, toDateOnly(day)));
  }, [day, repeatFrequency, repeatInterval, repeatSkipFirst]);

  // Keep the end date valid: clear it if the start day moves to/after it.
  useEffect(() => {
    if (repeatEnd && !isEndAfterStart(day, repeatEnd)) {
      setRepeatEnd(null);
    }
  }, [day, repeatEnd]);

  const repeatNameError = useMemo<'required' | 'taken' | null>(() => {
    if (!repeatEnabled && !ruleMode) return null;
    const trimmed = repeatName.trim();
    if (trimmed.length === 0) return 'required';
    const taken = (existingRepeatNames ?? []).some(n => n.trim().toLowerCase() === trimmed.toLowerCase());
    return taken ? 'taken' : null;
  }, [repeatEnabled, ruleMode, repeatName, existingRepeatNames]);

  const buildRecurrence = useCallback((): RecurrenceDraft => ({
    name: repeatName.trim(),
    frequency: repeatFrequency,
    interval: repeatInterval,
    endDate: repeatEnd ? toDateOnly(repeatEnd) : null,
    skipFirst: repeatSkipFirst,
  }), [repeatName, repeatFrequency, repeatInterval, repeatEnd, repeatSkipFirst]);

  return {
    repeatEnabled, setRepeatEnabled,
    repeatFrequency, setRepeatFrequency,
    repeatInterval, setRepeatInterval,
    repeatEnd, setRepeatEnd,
    repeatSkipFirst, setRepeatSkipFirst,
    repeatName, setRepeatName,
    repeatMinDate,
    repeatNameError,
    modalRepeatEndVisible, setModalRepeatEndVisible,
    buildRecurrence,
  };
}
