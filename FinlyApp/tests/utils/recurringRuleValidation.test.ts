import { describe, expect, it } from 'vitest';
import { InvalidRecurringRuleError, validateRecurringRuleDraft } from '../../src/utils/recurringRuleValidation';
import { RECURRING_RULE_ERRORS } from '../../src/constants/types';

const valid = {
  name: 'Rent',
  startDate: '2026-01-02',
  endDate: null,
  interval: 1,
};

describe('validateRecurringRuleDraft', () => {
  it('accepts a valid draft', () => {
    expect(validateRecurringRuleDraft(valid)).toBeNull();
  });

  it('accepts an end date strictly after the start (date or datetime input)', () => {
    expect(validateRecurringRuleDraft({ ...valid, endDate: '2026-01-03' })).toBeNull();
    expect(validateRecurringRuleDraft({ ...valid, endDate: '2026-01-03 00:00:00' })).toBeNull();
    expect(validateRecurringRuleDraft({ ...valid, startDate: '2026-01-02 00:00:00', endDate: '2026-01-03' })).toBeNull();
  });

  it('rejects a blank or whitespace-only name', () => {
    expect(validateRecurringRuleDraft({ ...valid, name: '' })).toBe(RECURRING_RULE_ERRORS.nameRequired);
    expect(validateRecurringRuleDraft({ ...valid, name: '   ' })).toBe(RECURRING_RULE_ERRORS.nameRequired);
  });

  it('rejects an interval that is not a positive integer', () => {
    for (const interval of [0, -1, 1.5, Number.NaN]) {
      expect(validateRecurringRuleDraft({ ...valid, interval })).toBe(RECURRING_RULE_ERRORS.intervalInvalid);
    }
  });

  it('rejects an end date on or before the start', () => {
    expect(validateRecurringRuleDraft({ ...valid, endDate: '2026-01-02' })).toBe(RECURRING_RULE_ERRORS.endNotAfterStart);
    expect(validateRecurringRuleDraft({ ...valid, endDate: '2025-12-31' })).toBe(RECURRING_RULE_ERRORS.endNotAfterStart);
  });

  it('keeps a legacy name longer than the limit editable', () => {
    expect(validateRecurringRuleDraft({ ...valid, name: 'A'.repeat(80) })).toBeNull();
  });
});

describe('InvalidRecurringRuleError', () => {
  it('carries the code and a readable message', () => {
    const error = new InvalidRecurringRuleError(RECURRING_RULE_ERRORS.nameRequired);
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe(RECURRING_RULE_ERRORS.nameRequired);
    expect(error.message).toBe('Invalid recurring rule: nameRequired');
  });
});
