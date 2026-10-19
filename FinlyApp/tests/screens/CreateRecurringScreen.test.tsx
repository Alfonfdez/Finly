import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CreateRecurringScreen from '../../src/screens/CreateRecurringScreen';
import { buildAppMock, getAppStub, setAppData, resetAppStub } from '../component/helpers/appStub';
import { setConfig, resetStub } from '../component/helpers/configStub';
import { t } from '../../src/i18n';
import { PERIODS } from '../../src/constants/types';
import type { Account, RecurringRule } from '../../src/database/types';

const mockList = vi.fn(async (_userId: number) => [] as RecurringRule[]);
const mockCreateRule = vi.fn(async (_params: unknown) => 0);

vi.mock('../../src/database', () => ({
  recurringRepository: {
    list: (userId: number) => mockList(userId),
  },
}));

vi.mock('../../src/database/recurringService', () => ({
  createRecurringRule: (params: unknown) => mockCreateRule(params),
}));

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

// The shared form has its own suite; here the screen's wiring is what matters.
let formProps: Record<string, unknown> = {};
vi.mock('../../src/components/TransactionForm', () => ({
  default: (props: Record<string, unknown>) => {
    formProps = props;
    return null;
  },
}));

const wallet: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const savings: Account = { id: 2, user_id: 1, name: 'Savings', is_total: 0 } as Account;

describe('CreateRecurringScreen', () => {
  beforeEach(() => {
    resetStub();
    mockList.mockReset().mockResolvedValue([]);
    mockCreateRule.mockClear();
    formProps = {};
    setAppData({
      accounts: [wallet, savings],
      activeAccount: null,
      activeType: 'expense',
      activePeriod: PERIODS.month,
      selectedDate: new Date(2026, 4, 3),
      customDate: { start: new Date(2026, 4, 3), end: new Date(2026, 4, 3) },
    });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('opens the shared form in rule mode with the recurring labels', async () => {
    await render(<CreateRecurringScreen />);

    expect(formProps.ruleMode).toBe(true);
    expect(formProps.submitLabel).toBe(t().recurring_submit);
    expect(formProps.errorTitle).toBe(t().recurring_error_title);
    expect(formProps.errorMessage).toBe(t().recurring_error_message);
    expect(formProps.resetTagsOnFirstFocus).toBe(true);
    expect(formProps.initialType).toBe('expense');
    expect(formProps.initialCategoryId).toBeNull();
  });

  it('uses the configured default account, falling back to the first non-Total one', async () => {
    await render(<CreateRecurringScreen />);
    expect(formProps.initialAccountId).toBe(1);

    setConfig({ createRecurringDefaultAccountId: 2 });
    await render(<CreateRecurringScreen />);
    expect(formProps.initialAccountId).toBe(2);
  });

  it('anchors on the custom period start when it is a single day, otherwise the selected day', async () => {
    setAppData({ activePeriod: PERIODS.custom });
    await render(<CreateRecurringScreen />);
    expect(formProps.initialDay).toEqual(new Date(2026, 4, 3));

    setAppData({
      customDate: { start: new Date(2026, 4, 1), end: new Date(2026, 4, 3) },
    });
    await render(<CreateRecurringScreen />);
    expect(formProps.initialDay).toEqual(new Date(2026, 4, 3));
  });

  it('loads the existing rule names for the uniqueness check', async () => {
    mockList.mockResolvedValue([
      { id: 1, name: 'Rent' } as RecurringRule,
      { id: 2, name: 'Gym' } as RecurringRule,
    ]);
    await render(<CreateRecurringScreen />);

    await waitFor(() => expect(formProps.existingRepeatNames).toEqual(['Rent', 'Gym']));
  });

  it('keeps rendering when the rule-name load fails', async () => {
    mockList.mockRejectedValue(new Error('offline'));
    await render(<CreateRecurringScreen />);

    expect(formProps.existingRepeatNames).toEqual([]);
  });

  it('maps the form submission to the service and switches the Home type', async () => {
    await render(<CreateRecurringScreen />);

    const data = { type: 'income', account_id: 2, category_id: 5, amount: 1234, description: 'Salary', date: '2026-05-03 00:00:00' };
    const recurrence = { name: 'Payday', frequency: 'monthly', interval: 2, endDate: '2027-05-03', lastDay: true };
    const submit = formProps.onSubmitRule as (
      data: unknown,
      tagIds: number[],
      recurrence: unknown,
    ) => Promise<void>;

    await submit(data, [7, 8], recurrence);

    expect(mockCreateRule).toHaveBeenCalledWith({
      name: 'Payday',
      type: 'income',
      account_id: 2,
      category_id: 5,
      amount: 1234,
      description: 'Salary',
      date: '2026-05-03 00:00:00',
      frequency: 'monthly',
      interval: 2,
      endDate: '2027-05-03',
      lastDay: true,
      tagIds: [7, 8],
    });
    expect(getAppStub().changeType).toHaveBeenCalledWith('income');
  });
});
