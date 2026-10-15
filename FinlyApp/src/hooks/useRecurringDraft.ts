import { useCallback, useEffect, useMemo, useState } from 'react';
import { RECURRENCE_FREQUENCIES, type RecurrenceDraft, type RecurrenceFrequency } from '../constants/types';
import { buildRecurrenceSchedule, fromDateOnly, toDateOnly } from '../utils/recurrence';
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
  initialRepeatLastDay?: boolean;
}

/**
 * Recurring-rule draft state shared by the create/edit forms: the
 * frequency/interval/end date/last-day/name, the end-date bounds and the
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
  initialRepeatLastDay,
}: UseRecurringDraftProps) {
  const [repeatFrequency, setRepeatFrequency] = useState<RecurrenceFrequency>(initialRepeatFrequency ?? RECURRENCE_FREQUENCIES.monthly);
  const [repeatInterval, setRepeatInterval] = useState(initialRepeatInterval ?? 1);
  const [repeatEnd, setRepeatEnd] = useState<Date | null>(initialRepeatEnd ?? null);
  const [repeatLastDay, setRepeatLastDay] = useState(initialRepeatLastDay ?? false);
  const [repeatName, setRepeatName] = useState(initialRepeatName ?? '');
  const [modalRepeatEndVisible, setModalRepeatEndVisible] = useState(false);

  // Earliest valid end date: the day after the first occurrence (which lands on the
  // last day of the start month for a "last day" rule).
  const repeatMinDate = useMemo(() => {
    const schedule = buildRecurrenceSchedule(day, repeatFrequency, repeatInterval, null, repeatLastDay);
    return dayAfter(fromDateOnly(schedule.start_date));
  }, [day, repeatFrequency, repeatInterval, repeatLastDay]);

  // Keep the end date valid: clear it if the start day moves to/after it.
  useEffect(() => {
    const start = fromDateOnly(buildRecurrenceSchedule(day, repeatFrequency, repeatInterval, null, repeatLastDay).start_date);
    if (repeatEnd && !isEndAfterStart(start, repeatEnd)) {
      setRepeatEnd(null);
    }
  }, [day, repeatFrequency, repeatInterval, repeatLastDay, repeatEnd]);

  const repeatNameError = useMemo<'required' | 'taken' | null>(() => {
    if (!ruleMode) return null;
    const trimmed = repeatName.trim();
    if (trimmed.length === 0) return 'required';
    const taken = (existingRepeatNames ?? []).some(n => n.trim().toLowerCase() === trimmed.toLowerCase());
    return taken ? 'taken' : null;
  }, [ruleMode, repeatName, existingRepeatNames]);

  const buildRecurrence = useCallback((): RecurrenceDraft => ({
    name: repeatName.trim(),
    frequency: repeatFrequency,
    interval: repeatInterval,
    endDate: repeatEnd ? toDateOnly(repeatEnd) : null,
    lastDay: repeatLastDay,
  }), [repeatName, repeatFrequency, repeatInterval, repeatEnd, repeatLastDay]);

  return {
    repeatFrequency, setRepeatFrequency,
    repeatInterval, setRepeatInterval,
    repeatEnd, setRepeatEnd,
    repeatLastDay, setRepeatLastDay,
    repeatName, setRepeatName,
    repeatMinDate,
    repeatNameError,
    modalRepeatEndVisible, setModalRepeatEndVisible,
    buildRecurrence,
  };
}
