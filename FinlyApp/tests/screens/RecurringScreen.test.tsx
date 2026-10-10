import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, userEvent } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import RecurringScreen from '../../src/screens/RecurringScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Category, RecurringRule } from '../../src/database/types';

// Renders the navigation header's `headerRight` inside the same render tree, so the
// Select/Search buttons can be pressed like on the other list screens.
let setHeaderNode: ((node: ReactNode) => void) | null = null;
const nav = {
  navigate: vi.fn(),
  setOptions: vi.fn((opts: { headerRight?: (() => ReactNode) | null }) => {
    setHeaderNode?.(opts.headerRight ? opts.headerRight() : null);
  }),
};

function HeaderHost() {
  const [node, setNode] = useState<ReactNode>(null);
  setHeaderNode = setNode;
  return <>{node}</>;
}

const mockList = vi.fn(async (_userId: number): Promise<RecurringRule[]> => []);
const mockSetActiveRule = vi.fn(async (_id: number, _active: boolean): Promise<number> => 0);
const mockCounts = vi.fn(async (_ids: number[]): Promise<Map<number, number>> => new Map());
const mockDeleteMany = vi.fn(async (_ids: number[]): Promise<void> => {});

vi.mock('../../src/database', () => ({
  recurringRepository: {
    list: (userId: number) => mockList(userId),
    countOccurrencesByRuleIds: (ids: number[]) => mockCounts(ids),
    deleteMany: (ids: number[]) => mockDeleteMany(ids),
  },
}));

vi.mock('../../src/database/recurringService', () => ({
  setRecurringRuleActive: (id: number, active: boolean) => mockSetActiveRule(id, active),
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
  skipped_from: null,
  active: 1,
  created_at: '2026-10-05',
  updated_at: null,
};

const renderWithHeader = () => render(<><HeaderHost /><RecurringScreen /></>);

describe('RecurringScreen', () => {
  beforeEach(() => {
    nav.navigate.mockClear();
    nav.setOptions.mockClear();
    mockList.mockReset().mockResolvedValue([rule]);
    mockSetActiveRule.mockClear();
    mockCounts.mockReset().mockResolvedValue(new Map());
    mockDeleteMany.mockClear();
    setAppData({ categoriesById: new Map([[1, category]]) });
  });

  afterEach(() => {
    setHeaderNode = null;
    resetAppStub();
  });

  it('renders the rule with its name, summary and active label', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    expect(view.getByText('Every month on day 5')).toBeTruthy();
    expect(view.getByText('Active')).toBeTruthy();
    expect(view.getByText('Next: November 5, 2026')).toBeTruthy();
    expect(view.getByText('Food · Created 5 Oct 2026 · 0 transactions')).toBeTruthy();
  });

  it('navigates to edit when the rule info is pressed', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    await fireEvent.press(view.getByText('Rent'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyRecurring', { ruleId: 1 });
  });

  it('shows "Ended" on the toggle and disables it when the rule has finished', async () => {
    mockList.mockResolvedValue([{ ...rule, end_date: '2026-09-30', next_due: '2026-10-01' }]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());
    // Both the next-due line and the toggle label read "Ended".
    expect(view.getAllByText('Ended')).toHaveLength(2);
    expect(view.getByLabelText('Ended').props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('ignores toggling an ended rule', async () => {
    mockList.mockResolvedValue([{ ...rule, end_date: '2026-09-30', next_due: '2026-10-01' }]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('switch')).toBeTruthy());
    await fireEvent(view.getByRole('switch'), 'valueChange', true);
    await fireEvent(view.getByRole('switch'), 'valueChange', false);
    expect(mockSetActiveRule).not.toHaveBeenCalled();
  });

  it('pauses through the service when the switch is turned off', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('switch')).toBeTruthy());
    await fireEvent(view.getByRole('switch'), 'valueChange', false);
    expect(mockSetActiveRule).toHaveBeenCalledWith(1, false);
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('resumes through the service when the switch is turned on', async () => {
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('switch')).toBeTruthy());
    await fireEvent(view.getByRole('switch'), 'valueChange', true);
    expect(mockSetActiveRule).toHaveBeenCalledWith(1, true);
    expect(nav.navigate).not.toHaveBeenCalled();
  });

  it('enters select mode and bulk-deletes the selected rule', async () => {
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));

    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());
    // The Select all row and the rule rows both show an unchecked checkbox.
    expect(view.getAllByText('checkbox-outline').length).toBeGreaterThan(0);
    await ue.press(view.getByLabelText('Rent'));
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
    await ue.press(view.getByText('Delete (1)'));
    await ue.press(await view.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockDeleteMany).toHaveBeenCalledWith([1]));
  });

  it('selects all visible rules and clears them again', async () => {
    mockList.mockResolvedValue([rule, { ...rule, id: 2, name: 'Gym' }]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());

    await ue.press(view.getByText('Select all'));
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());
    expect(view.getByText('Deselect all')).toBeTruthy();

    await ue.press(view.getByText('Deselect all'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());
  });

  it('filters the rules by name, category, comment and frequency', async () => {
    mockList.mockResolvedValue([{ ...rule, description: 'Landlord' }]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Search'));

    const input = await view.findByPlaceholderText('Search recurring');
    await ue.type(input, 'food'); // category match
    expect(view.getByText('Rent')).toBeTruthy();
    await ue.clear(input);
    await ue.type(input, 'landlord'); // comment match
    expect(view.getByText('Rent')).toBeTruthy();
    await ue.clear(input);
    await ue.type(input, 'monthly'); // frequency match
    expect(view.getByText('Rent')).toBeTruthy();
    await ue.clear(input);
    await ue.type(input, 'zzz');
    expect(view.queryByText('Rent')).toBeNull();
  });
});
