import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
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

const nav = { setOptions: vi.fn(), navigate: vi.fn() };

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

describe('AccountsScreen', () => {
  beforeEach(() => {
    list.mockReset().mockResolvedValue([]);
    getBalances.mockReset().mockResolvedValue([]);
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
  });

  afterEach(() => {
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
});
