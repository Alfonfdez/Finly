import { describe, it, expect } from 'vitest';
import {
  getIconColorHintText,
  getNameHintText,
  getTransactionFormHintText,
  joinHints,
} from '../../src/utils/formHints';
import { RECURRING_NAME_ERRORS } from '../../src/constants/types';

const iconColorKeys = {
  empty: 'EMPTY',
  iconColor: 'ICON_COLOR',
  icon: 'ICON',
  color: 'COLOR',
};

describe('getIconColorHintText', () => {
  it('returns the empty hint when the name is blank', () => {
    expect(getIconColorHintText('', null, null, null, iconColorKeys)).toBe('EMPTY');
    expect(getIconColorHintText('   ', null, null, null, iconColorKeys)).toBe('EMPTY');
  });

  it('takes precedence with the name error over other hints', () => {
    expect(getIconColorHintText('Food', 'ERR', null, null, iconColorKeys)).toBe('ERR');
    expect(getIconColorHintText('Food', 'ERR', 'icon', '#fff', iconColorKeys)).toBe('ERR');
  });

  it('returns the icon+color hint when neither is chosen', () => {
    expect(getIconColorHintText('Food', null, null, null, iconColorKeys)).toBe('ICON_COLOR');
  });

  it('returns the icon hint when only a color is chosen', () => {
    expect(getIconColorHintText('Food', null, null, '#fff', iconColorKeys)).toBe('ICON');
  });

  it('returns the color hint when only an icon is chosen', () => {
    expect(getIconColorHintText('Food', null, 'fast-food', null, iconColorKeys)).toBe('COLOR');
  });

  it('returns null when icon and color are both chosen', () => {
    expect(getIconColorHintText('Food', null, 'fast-food', '#fff', iconColorKeys)).toBeNull();
  });
});

describe('getNameHintText', () => {
  it('returns the empty hint when the name is blank', () => {
    expect(getNameHintText('', null, 'EMPTY')).toBe('EMPTY');
    expect(getNameHintText(' \n ', null, 'EMPTY')).toBe('EMPTY');
  });

  it('returns the name error when present', () => {
    expect(getNameHintText('Food', 'ERR', 'EMPTY')).toBe('ERR');
  });

  it('returns null for a valid name', () => {
    expect(getNameHintText('Food', null, 'EMPTY')).toBeNull();
  });
});

describe('joinHints', () => {
  it('returns an empty string when nothing applies', () => {
    expect(joinHints([])).toBe('');
    expect(joinHints([null, undefined, '  '])).toBe('');
  });

  it('returns a single sentence without a period by default', () => {
    expect(joinHints(['A'])).toBe('A');
    expect(joinHints([null, 'A', ''])).toBe('A');
  });

  it('joins several sentences with ". "', () => {
    expect(joinHints(['A', 'B', 'C'])).toBe('A. B. C');
  });

  it('adds the final period only when asked', () => {
    expect(joinHints(['A', 'B'], { finalPeriod: true })).toBe('A. B.');
    expect(joinHints(['A'], { finalPeriod: true })).toBe('A.');
    expect(joinHints([], { finalPeriod: true })).toBe('');
  });
});

describe('getTransactionFormHintText', () => {
  const keys = {
    category: 'CATEGORY',
    amount: 'AMOUNT',
    account: 'ACCOUNT',
    repeatEnd: 'REPEAT_END',
    repeatName: 'NAME',
    repeatNameTaken: 'NAME_TAKEN',
    repeatTooMany: 'TOO_MANY',
  };

  const valid = {
    categoryId: 1,
    numericAmount: 10,
    accountId: 1,
    repeatEndConflict: false,
    ruleMode: false,
    repeatNameError: null,
  };

  it('returns an empty string when nothing blocks the save', () => {
    expect(getTransactionFormHintText(valid, keys)).toBe('');
  });

  it('lists the missing fields in display order with a final period', () => {
    expect(
      getTransactionFormHintText(
        { ...valid, categoryId: null, numericAmount: null, accountId: undefined },
        keys,
      ),
    ).toBe('CATEGORY. AMOUNT. ACCOUNT.');
  });

  it('flags an amount of zero', () => {
    expect(getTransactionFormHintText({ ...valid, numericAmount: 0 }, keys)).toBe('AMOUNT.');
  });

  it('flags a recurring end date before the first occurrence', () => {
    expect(getTransactionFormHintText({ ...valid, repeatEndConflict: true }, keys)).toBe('REPEAT_END.');
  });

  it('adds the rule name only in rule mode', () => {
    const ruleValues = { ...valid, ruleMode: true };

    expect(
      getTransactionFormHintText({ ...ruleValues, repeatNameError: RECURRING_NAME_ERRORS.required }, keys),
    ).toBe('NAME.');
    expect(
      getTransactionFormHintText({ ...ruleValues, repeatNameError: RECURRING_NAME_ERRORS.taken }, keys),
    ).toBe('NAME_TAKEN.');
    // Outside rule mode the name is not a blocker.
    expect(
      getTransactionFormHintText({ ...valid, repeatNameError: RECURRING_NAME_ERRORS.taken }, keys),
    ).toBe('');
  });

  it('flags a rule whose backlog exceeds the catch-up limit', () => {
    const ruleValues = { ...valid, ruleMode: true, repeatTooMany: true };

    expect(getTransactionFormHintText(ruleValues, keys)).toBe('TOO_MANY.');
    // Outside rule mode it is not a blocker.
    expect(getTransactionFormHintText({ ...valid, repeatTooMany: true }, keys)).toBe('');
    // Order: after the rule name.
    expect(getTransactionFormHintText({
      ...ruleValues,
      repeatEndConflict: true,
      repeatNameError: RECURRING_NAME_ERRORS.required,
    }, keys)).toBe('REPEAT_END. NAME. TOO_MANY.');
  });
  it('keeps the checklist order when several conditions apply', () => {
    expect(
      getTransactionFormHintText(
        {
          categoryId: null,
          numericAmount: 0,
          accountId: 1,
          repeatEndConflict: true,
          ruleMode: true,
          repeatNameError: RECURRING_NAME_ERRORS.required,
        },
        keys,
      ),
    ).toBe('CATEGORY. AMOUNT. REPEAT_END. NAME.');
  });
});
