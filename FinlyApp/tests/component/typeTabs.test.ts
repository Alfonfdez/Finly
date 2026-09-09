import { describe, it, expect } from 'vitest';
import { typeTabs } from '../../src/components/TabBar';
import { TRANSACTION_TYPES } from '../../src/constants/types';

const labels = {
  tab_expenses: 'Expenses',
  tab_income: 'Income',
  a11y_show_expenses: 'Show expenses',
  a11y_show_income: 'Show income',
};

describe('typeTabs', () => {
  it('returns exactly two tabs in expense-then-income order', () => {
    const tabs = typeTabs(labels);
    expect(tabs).toHaveLength(2);
    expect(tabs[0].key).toBe(TRANSACTION_TYPES.expense);
    expect(tabs[1].key).toBe(TRANSACTION_TYPES.income);
  });

  it('maps labels and accessibility labels from the provided translations', () => {
    const tabs = typeTabs(labels);
    expect(tabs[0]).toEqual({
      key: TRANSACTION_TYPES.expense,
      label: 'Expenses',
      accessibilityLabel: 'Show expenses',
    });
    expect(tabs[1]).toEqual({
      key: TRANSACTION_TYPES.income,
      label: 'Income',
      accessibilityLabel: 'Show income',
    });
  });

  it('keeps runtime values decoupled from the label strings', () => {
    const tabs = typeTabs(labels);
    expect(tabs[0].key).toBe('expense');
    expect(tabs[1].key).toBe('income');
  });
});
