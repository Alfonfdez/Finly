import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, userEvent } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import AccountsScreen from '../../src/screens/AccountsScreen';
import { buildAppMock, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub, setConfig } from '../component/helpers/configStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Account } from '../../src/database/types';

const list = vi.fn(async (_u: number) => [] as Account[]);
const getBalances = vi.fn(async () => [] as { account_id: number; balance: number }[]);
const deleteMany = vi.fn(async (_ids: number[]) => {});
const sanitizeDefaultAccounts = vi.fn((_config: unknown, _remaining: Account[]) => ({}));

vi.mock('../../src/database', () => ({
  accountRepository: {
    list: (u: number) => list(u),
    getBalances: () => getBalances(),
    deleteMany: (ids: number[]) => deleteMany(ids),
  },
}));

vi.mock('../../src/database/configDefaults', () => ({
  sanitizeDefaultAccounts: (config: unknown, remaining: Account[]) =>
    sanitizeDefaultAccounts(config, remaining),
}));

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

const renderWithHeader = () => render(<><HeaderHost /><AccountsScreen /></>);

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

function account(id: number, name: string): Account {
  return { id, user_id: 1, name, icon: 'wallet-outline', color: '#22D3EE', is_total: 0 } as Account;
}

const totalAccount: Account = {
  id: 9,
  user_id: 1,
  name: 'Total',
  icon: 'wallet-outline',
  color: '#22D3EE',
  is_total: 1,
} as Account;

describe('AccountsScreen', () => {
  beforeEach(() => {
    resetStub();
    list.mockReset().mockResolvedValue([]);
    getBalances.mockReset().mockResolvedValue([]);
    deleteMany.mockReset().mockResolvedValue(undefined);
    sanitizeDefaultAccounts.mockReset().mockReturnValue({});
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
  });

  afterEach(() => {
    setHeaderNode = null;
    resetAppStub();
  });

  it('shows the total and an empty state when there are no accounts', async () => {
    const view = await render(<AccountsScreen />);
    expect(await view.findByText('No accounts')).toBeTruthy();
    // The list must be unmounted when empty so no stale scroll area remains.
    expect(view.queryByTestId(TEST_IDS.accountsList)).toBeNull();
  });

  it('lists accounts with their computed balances', async () => {
    list.mockResolvedValue([account(1, 'Cash'), account(2, 'Savings')]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await render(<AccountsScreen />);
    expect(await view.findByText('Cash')).toBeTruthy();
    expect(view.getByText('Savings')).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.accountsList)).toBeTruthy();
  });

  it('shows the account note with up to three lines', async () => {
    list.mockResolvedValue([{ ...account(1, 'Wallet'), description: 'A long account note' }]);
    const view = await render(<AccountsScreen />);
    await view.findByText('Wallet');

    expect(view.getByText('A long account note').props.numberOfLines).toBe(3);
  });

  it('sorts by balance on demand with the Total account pinned first', async () => {
    list.mockResolvedValue([account(1, 'Wallet'), account(2, 'Cash'), totalAccount]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await render(<AccountsScreen />);
    await view.findByText('Wallet');

    const order = () => view.getAllByText(/^(Total|Wallet|Cash)$/).map(node => String(node.props.children));
    // Name ascending by default; the Total account always comes first.
    expect(order()).toEqual(['Total', 'Cash', 'Wallet']);

    await fireEvent.press(view.getByText('Balance', { exact: true }));
    await waitFor(() => expect(order()).toEqual(['Total', 'Wallet', 'Cash']));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({
      accountsSortBy: 'balance',
      accountsSortDirection: 'desc',
    });

    // Tapping the active field flips the direction.
    await fireEvent.press(view.getByText('Balance', { exact: true }));
    await waitFor(() => expect(order()).toEqual(['Total', 'Cash', 'Wallet']));
    expect(getConfigStub().updateConfig).toHaveBeenLastCalledWith({
      accountsSortBy: 'balance',
      accountsSortDirection: 'asc',
    });
  });

  it('restores the persisted sort on mount', async () => {
    setConfig({ accountsSortBy: 'balance', accountsSortDirection: 'desc' });
    list.mockResolvedValue([account(1, 'Wallet'), account(2, 'Cash'), totalAccount]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await render(<AccountsScreen />);
    await view.findByText('Wallet');

    expect(view.getAllByText(/^(Total|Wallet|Cash)$/).map(node => String(node.props.children)))
      .toEqual(['Total', 'Wallet', 'Cash']);
  });
  it('opens the modify screen when an account is pressed', async () => {
    list.mockResolvedValue([account(1, 'Cash'), account(2, 'Savings')]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await render(<AccountsScreen />);
    await view.findByText('Cash');
    fireEvent.press(view.getByText('Cash'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyAccount', { accountId: 1 });
  });

  it('keeps balances visible and selects from the leading checkbox', async () => {
    list.mockResolvedValue([totalAccount, account(1, 'Cash'), account(2, 'Savings')]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Cash')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());

    expect(view.getByText(/100,00/)).toBeTruthy();
    const boxes = view.getAllByText('checkbox-outline');
    await ue.press(boxes[1]);
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
  });

  it('selects all non-total accounts when Select all is pressed', async () => {
    list.mockResolvedValue([totalAccount, account(1, 'Cash'), account(2, 'Savings')]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Cash')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());

    // The balance header stays visible: the Select-all row sits under it.
    expect(view.getByText('Total:')).toBeTruthy();
    expect(view.getByText('Select all')).toBeTruthy();

    await ue.press(view.getByText('Select all'));
    // The Total account is excluded, so only the two non-total accounts get selected.
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());
    expect(view.getByText('Deselect all')).toBeTruthy();
  });

  it('deletes the visible selected accounts and updates default accounts', async () => {
    list.mockResolvedValue([
      totalAccount,
      account(1, 'Cash'),
      account(2, 'Savings'),
      account(3, 'Wallet'),
    ]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
      { account_id: 3, balance: 25 },
    ]);
    sanitizeDefaultAccounts.mockReturnValue({ homeDefaultAccountId: null });
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Cash')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await waitFor(() => expect(view.getByText('Delete (0)')).toBeTruthy());

    const boxes = view.getAllByText('checkbox-outline');
    await ue.press(boxes[1]);
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
    await ue.press(boxes[2]);
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());

    await ue.press(view.getByText('Delete (2)'));
    await waitFor(() => expect(view.getByText('Delete 2 accounts?', { exact: false })).toBeTruthy());
    await ue.press(view.getByText('Delete', { exact: true }));

    await waitFor(() => expect(deleteMany).toHaveBeenCalledWith([1, 2]));
    expect(sanitizeDefaultAccounts).toHaveBeenCalledTimes(1);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ homeDefaultAccountId: null });
  });

  it('blocks deleting every non-total account with the guard modal', async () => {
    list.mockResolvedValue([totalAccount, account(1, 'Cash'), account(2, 'Savings')]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Cash')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await ue.press(view.getByText('Select all'));
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());
    await ue.press(view.getByText('Delete (2)'));

    await waitFor(() => expect(view.getByText(
      'You need at least one account. Cannot delete all accounts.',
    )).toBeTruthy());
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('deletes only selected accounts still visible after searching', async () => {
    list.mockResolvedValue([totalAccount, account(1, 'Cash'), account(2, 'Savings')]);
    getBalances.mockResolvedValue([
      { account_id: 1, balance: 100 },
      { account_id: 2, balance: 50 },
    ]);
    const view = await renderWithHeader();
    await waitFor(() => expect(view.getByText('Cash')).toBeTruthy());

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    const boxes = view.getAllByText('checkbox-outline');
    await ue.press(boxes[1]);
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
    await ue.press(boxes[2]);
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());

    await ue.press(view.getByLabelText('Search'));
    await ue.type(await view.findByPlaceholderText('Search accounts'), 'Savings');
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
    await ue.press(view.getByText('Delete (1)'));
    await ue.press(await view.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(deleteMany).toHaveBeenCalledWith([2]));
  });
});
