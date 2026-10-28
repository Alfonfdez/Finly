import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, userEvent } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import RecurringScreen from '../../src/screens/RecurringScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub, setConfig } from '../component/helpers/configStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Account, Category, RecurringRule } from '../../src/database/types';

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

const account = (overrides: Partial<Account>): Account => ({
  id: 1,
  user_id: 1,
  name: 'My Wallet',
  initial_balance: 0,
  icon: 'wallet-outline',
  color: '#22D3EE',
  is_total: 0,
  created_at: '2026-01-01',
  ...overrides,
});

const renderWithHeader = () => render(<><HeaderHost /><RecurringScreen /></>);

describe('RecurringScreen', () => {
  beforeEach(() => {
    nav.navigate.mockClear();
    nav.setOptions.mockClear();
    resetStub();
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
    expect(view.getByText('Food · 0 transactions')).toBeTruthy();
    expect(view.getByText('Created 5 Oct 2026')).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.recurringList)).toBeTruthy();
  });

  it('shows an empty state with the list unmounted when there are no rules', async () => {
    mockList.mockResolvedValue([]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('No recurring rules yet')).toBeTruthy());
    // The list must be unmounted when empty so no stale scroll area remains.
    expect(view.queryByTestId(TEST_IDS.recurringList)).toBeNull();
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

  it('ignores a second toggle while the write is in flight', async () => {
    let release!: () => void;
    mockSetActiveRule.mockImplementationOnce(() => new Promise<number>((resolve) => {
      release = () => resolve(0);
    }));

    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('switch')).toBeTruthy());

    fireEvent(view.getByRole('switch'), 'valueChange', false);
    await waitFor(() => expect(view.getByRole('switch').props.disabled).toBe(true));

    // A second tap (e.g. the opposite value) is ignored until the write settles.
    fireEvent(view.getByRole('switch'), 'valueChange', true);
    expect(mockSetActiveRule).toHaveBeenCalledTimes(1);

    release();
    await waitFor(() => expect(view.getByRole('switch').props.disabled).toBe(false));
    expect(mockSetActiveRule).toHaveBeenCalledTimes(1);
    expect(mockSetActiveRule).toHaveBeenCalledWith(1, false);
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

  it('drops hidden selections when the type tab changes', async () => {
    mockList.mockResolvedValue([
      { ...rule, id: 1, name: 'ExpenseRule', type: 'expense' },
      { ...rule, id: 2, name: 'IncomeRule', type: 'income' },
    ]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('ExpenseRule')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await ue.press(view.getByLabelText('ExpenseRule'));
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());

    await ue.press(view.getByText('Income'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());
    expect(view.queryByText('ExpenseRule')).toBeNull();
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it('selects a rule when its checkbox is pressed', async () => {
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Rent')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());

    const boxes = view.getAllByText('checkbox-outline');
    await ue.press(boxes[boxes.length - 1]);
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
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

    const input = await view.findByPlaceholderText('Search recurring rules');
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

  it('filters the rules by status', async () => {
    mockList.mockResolvedValue([
      { ...rule, id: 1, name: 'ActiveRule' },
      { ...rule, id: 2, name: 'PausedRule', active: 0 },
      { ...rule, id: 3, name: 'EndedRule', end_date: '2026-09-30', next_due: '2026-10-01' },
    ]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('ActiveRule')).toBeTruthy());
    expect(view.getByText('PausedRule')).toBeTruthy();
    expect(view.getByText('EndedRule')).toBeTruthy();

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('All')); // chip (empty = All)
    // Modal checkboxes render in order: All, Active, Paused, Ended.
    const boxes = view.getAllByRole('checkbox');
    await ue.press(boxes[2]); // Paused
    await ue.press(boxes[3]); // Ended
    await ue.press(view.getByText('Apply (2)'));

    await waitFor(() => expect(view.queryByText('ActiveRule')).toBeNull());
    expect(view.getByText('PausedRule')).toBeTruthy();
    expect(view.getByText('EndedRule')).toBeTruthy();
    expect(view.getByLabelText('Paused + Ended')).toBeTruthy();
    expect(getConfigStub().config.recurringStatusFilter).toEqual(['paused', 'ended']);
  });

  it('restores the persisted status filter', async () => {
    setConfig({ recurringStatusFilter: ['paused'] });
    mockList.mockResolvedValue([
      { ...rule, id: 1, name: 'ActiveRule' },
      { ...rule, id: 2, name: 'PausedRule', active: 0 },
    ]);

    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByRole('button', { name: 'Paused' })).toBeTruthy());
    expect(view.queryByText('ActiveRule')).toBeNull();
    expect(view.getByText('PausedRule')).toBeTruthy();
  });

  it('filters the rules by type through the type tabs', async () => {
    mockList.mockResolvedValue([
      { ...rule, id: 1, name: 'ExpenseRule', type: 'expense' },
      { ...rule, id: 2, name: 'IncomeRule', type: 'income' },
    ]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('ExpenseRule')).toBeTruthy());
    expect(view.getByText('IncomeRule')).toBeTruthy();

    const ue = userEvent.setup();
    await ue.press(view.getByText('Expenses'));
    await waitFor(() => expect(view.queryByText('IncomeRule')).toBeNull());
    expect(view.getByText('ExpenseRule')).toBeTruthy();

    await ue.press(view.getByText('Income'));
    await waitFor(() => expect(view.queryByText('ExpenseRule')).toBeNull());
    expect(view.getByText('IncomeRule')).toBeTruthy();
  });

  it('filters the rules by account, defaulting to the Total account', async () => {
    setAppData({
      accounts: [account({ id: 1, name: 'My Wallet' }), account({ id: 2, name: 'Total', is_total: 1 })],
      categoriesById: new Map([[1, category]]),
    });
    mockList.mockResolvedValue([
      { ...rule, id: 1, name: 'WalletRule', account_id: 1 },
      { ...rule, id: 2, name: 'OtherRule', account_id: 3 },
    ]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('WalletRule')).toBeTruthy());
    // Defaults to the Total account: every rule is listed.
    expect(view.getByText('OtherRule')).toBeTruthy();
    expect(view.getByLabelText('Total')).toBeTruthy();

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Total')); // open the account modal
    await ue.press(view.getByText('My Wallet')); // select the wallet row
    await ue.press(view.getByRole('button', { name: 'Select' })); // confirm

    await waitFor(() => expect(view.queryByText('OtherRule')).toBeNull());
    expect(view.getByText('WalletRule')).toBeTruthy();
  });

  it('reorders the rules when a sort field is pressed', async () => {
    mockList.mockResolvedValue([
      { ...rule, id: 1, name: 'Beta', next_due: '2026-11-01' },
      { ...rule, id: 2, name: 'Alpha', next_due: '2026-12-01' },
    ]);
    const view = await render(<RecurringScreen />);
    await waitFor(() => expect(view.getByText('Beta')).toBeTruthy());

    const order = () => view.getAllByText(/^(Alpha|Beta)$/).map(n => String(n.props.children));
    expect(order()).toEqual(['Beta', 'Alpha']); // default: next due ascending

    await fireEvent.press(view.getByText('Name'));
    await waitFor(() => expect(order()).toEqual(['Alpha', 'Beta']));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({
      recurringSortBy: 'name',
      recurringSortDirection: 'asc',
    });
  });
});
