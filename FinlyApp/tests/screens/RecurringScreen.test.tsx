import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import RecurringScreen from '../../src/screens/RecurringScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Category, RecurringRule } from '../../src/database/types';

const nav = { navigate: vi.fn(), setOptions: vi.fn() };

const mockList = vi.fn(async (_userId: number): Promise<RecurringRule[]> => []);
const mockSetActive = vi.fn(async (_id: number, _active: boolean): Promise<void> => {});
const mockResume = vi.fn(async (_id: number): Promise<number> => 0);
const mockCounts = vi.fn(async (_ids: number[]): Promise<Map<number, number>> => new Map());

vi.mock('../../src/database', () => ({
  recurringRepository: {
    list: (userId: number) => mockList(userId),
    setActive: (id: number, active: boolean) => mockSetActive(id, active),
    countOccurrencesByRuleIds: (ids: number[]) => mockCounts(ids),
  },
}));

vi.mock('../../src/database/recurringService', () => ({
  resumeRecurringRule: (id: number) => mockResume(id),
}));

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

const category: Category = {
  id: 1,
  user_id: 1,
  name: 'Food',
  icon: 'cart',
  color: '#22D3EE',
  type: 'expense',
  created_at: '2026-01-01',
};

const rule: RecurringRule = {
  id: 1,
  user_id: 1,
  name: 'Rent',
  type: 'expense',
  account_id: 1,
  category_id: 1,
  amount: 50,
  description: null,
  frequency: 'monthly',
  interval: 1,
  weekday: null,
  day_of_month: 5,
  month: null,
  start_date: '2026-10-05',
  end_date: null,
  next_due: '2026-11-05',
  active: 1,
  created_at: '2026-10-05',
  updated_at: null,
};

describe('RecurringScreen', () => {
  beforeEach(() => {
    nav.navigate.mockClear();
    mockList.mockReset().mockResolvedValue([rule]);
    mockSetActive.mockClear();
    mockResume.mockClear();
    mockCounts.mockReset().mockResolvedValue(new Map());
    setAppData({ categoriesById: new Map([[1, category]]) });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the rule with its name, summary and active label', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    expect(view.getByText('Food · Every month on day 5')).toBeTruthy();
    expect(view.getByText('Active')).toBeTruthy();
    expect(view.getByText('Next: November 5, 2026')).toBeTruthy();
    expect(view.getByText('Created October 5, 2026 · 0 transactions')).toBeTruthy();
  });

  it('navigates to edit when the rule info is pressed', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    await fireEvent.press(view.getByText('Rent'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyRecurring', { ruleId: 1 });
  });

  it('shows "Ended" when the rule has finished', async () => {
    mockList.mockResolvedValue([{ ...rule, end_date: '2026-09-30', next_due: '2026-10-01' }]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    expect(view.getByText('Ended')).toBeTruthy();
  });

  it('pauses through setActive when the switch is turned off', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('switch')).toBeTruthy());
    await fireEvent(view.getByRole('switch'), 'valueChange', false);
    expect(mockSetActive).toHaveBeenCalledWith(1, false);
    expect(mockResume).not.toHaveBeenCalled();
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('resumes through the skip-pause path when the switch is turned on', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('switch')).toBeTruthy());
    await fireEvent(view.getByRole('switch'), 'valueChange', true);
    expect(mockResume).toHaveBeenCalledWith(1);
    expect(mockSetActive).not.toHaveBeenCalled();
    expect(nav.navigate).not.toHaveBeenCalled();
  });
});
