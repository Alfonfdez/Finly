import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, userEvent } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import AccountsScreen from '../../src/screens/AccountsScreen';
import { buildAppMock, resetAppStub } from '../component/helpers/appStub';
import type { Account } from '../../src/database/types';

const list = vi.fn(async (_u: number) => [] as Account[]);
const getBalances = vi.fn(async () => [] as { account_id: number; balance: number }[]);

vi.mock('../../src/database', () => ({
  accountRepository: {
    list: (u: number) => list(u),
    getBalances: () => getBalances(),
  },
}));

vi.mock('../../src/database/configDefaults', () => ({
  sanitizeDefaultAccounts: () => ({}),
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
    list.mockReset().mockResolvedValue([]);
    getBalances.mockReset().mockResolvedValue([]);
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

    await ue.press(view.getByText('Select all'));
    // The Total account is excluded, so only the two non-total accounts get selected.
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());
    expect(view.getByText('Deselect all')).toBeTruthy();
  });
});
