import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import HomeScreen from '../../src/screens/HomeScreen';
import { buildAppMock, setAppData, setAppState, resetAppStub } from '../component/helpers/appStub';
import type { Account } from '../../src/database/types';

vi.mock('react-native-svg', () => {
  const Container = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    default: (props: { children?: ReactNode }) => <Container {...props} />,
    Svg: (props: { children?: ReactNode }) => <Container {...props} />,
    G: ({ children }: { children?: ReactNode }) => <>{children}</>,
    Circle: () => null,
    Path: () => null,
  };
});

const breakdown = vi.fn(
  async () => new Map<number, { tag_id: number; name: string; total: number }[]>()
);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    breakdownByCategoriesAndTags: () => breakdown(),
  },
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

const account: Account = { id: 1, user_id: 1, name: 'Wallet', icon: 'wallet-outline', color: '#22D3EE', is_total: 0 } as Account;

describe('HomeScreen', () => {
  beforeEach(() => {
    breakdown.mockReset().mockResolvedValue(new Map());
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    setAppData({ accounts: [account], activeAccount: account });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('shows a loading state while no account is active', async () => {
    setAppState({ activeAccount: null, loading: true });
    const view = await render(<HomeScreen />);
    expect(view.queryByText('Wallet')).toBeNull();
  });

  it('renders the active account and transaction tabs once loaded', async () => {
    const view = await render(<HomeScreen />);
    expect(await view.findByText('Wallet')).toBeTruthy();
    expect(view.getAllByText('Expenses').length).toBeGreaterThan(0);
    expect(view.getAllByText('Income').length).toBeGreaterThan(0);
  });

  it('opens the Add transaction screen from the fab', async () => {
    const view = await render(<HomeScreen />);
    await view.findByText('Wallet');
    fireEvent.press(view.getByLabelText('Add expense or income'));
    expect(nav.navigate).toHaveBeenCalledWith('AddTransaction');
  });
});
