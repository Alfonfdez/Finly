import { RECURRING_RULE_ERRORS, REPEAT_MAX_INTERVAL, type RecurringRuleError } from '../constants/types';
import { datePart } from './formatters';

export interface RecurringRuleDraft {
  name: string;
  /** The raw start date picked by the user (before the last-day adjustment). */
  startDate: string;
  endDate: string | null;
  interval: number;
}

/**
 * Intrinsic invariants of a recurring rule, checked by the service so a rule can
 * never be written invalid (even from an import or a future caller). The form
 * already enforces all of them and owns the name-uniqueness check.
 *
 * The name length is intentionally not enforced: a legacy rule already longer than
 * `REPEAT_NAME_MAX_LENGTH` must stay editable (the form flags it, it never clips it).
 */
export function validateRecurringRuleDraft(draft: RecurringRuleDraft): RecurringRuleError | null {
  if (draft.name.trim().length === 0) return RECURRING_RULE_ERRORS.nameRequired;
  if (!Number.isInteger(draft.interval) || draft.interval < 1 || draft.interval > REPEAT_MAX_INTERVAL) {
    return RECURRING_RULE_ERRORS.intervalInvalid;
  }
  if (draft.endDate != null && datePart(draft.endDate) <= datePart(draft.startDate)) {
    return RECURRING_RULE_ERRORS.endNotAfterStart;
  }
  return null;
}

/** Thrown by the service when a rule violates one of the invariants above. */
export class InvalidRecurringRuleError extends Error {
  readonly code: RecurringRuleError;

  constructor(code: RecurringRuleError) {
    super(`Invalid recurring rule: ${code}`);
    this.name = 'InvalidRecurringRuleError';
    this.code = code;
  }
}
