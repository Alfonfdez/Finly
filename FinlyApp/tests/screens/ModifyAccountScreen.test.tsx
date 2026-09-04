import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyAccountScreen from '../../src/screens/ModifyAccountScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Account } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = { accountId: 5 };

const mockAccountGet = vi.fn(async (_id: number) => null as Account | null);
const mockAccountExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockAccountUpdate = vi.fn(async (_id: number, data: unknown) => {});

vi.mock('reanimated-color-picker', () => ({
  default: ({ children }: { children?: ReactNode }) => children ?? null,
  Panel1: () => null,
  HueSlider: () => null,
  OpacitySlider: () => null,
  Preview: () => null,
}));

vi.mock('../../src/database', () => ({
  accountRepository: {
    getById: (id: number) => mockAccountGet(id),
    existsByName: (userId: number, name: string, excludeId?: number) =>
      mockAccountExists(userId, name, excludeId),
    update: (id: number, data: unknown) => mockAccountUpdate(id, data),
  },
}));

vi.mock('../../src/database/configDefaults', () => ({
  sanitizeDefaultAccounts: () => ({}),
}));

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useRoute: () => ({ params: routeParams }),
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(cb, [cb]);
    },
  };
});

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

const account: Account = {
  id: 5,
  user_id: 1,
  name: 'Cash',
  icon: 'wallet-outline',
  color: '#22D3EE',
  is_total: 0,
  initial_balance: 100,
  description: '',
  created_at: '2026-01-01 00:00:00',
} as Account;

describe('ModifyAccountScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockAccountGet.mockClear().mockResolvedValue(account);
    mockAccountExists.mockClear().mockResolvedValue(false);
    mockAccountUpdate.mockClear();
    setAppData({ accounts: [account] });
  });

  afterEach(() => {
    resetAppStub();
    vi.useRealTimers();
  });

  it('preloads the account into the form', async () => {
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');
    expect(view.getByText('Save')).toBeEnabled();
  });

  it('saves the edited account name and goes back', async () => {
    vi.useFakeTimers();
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');
    await fireEvent.changeText(view.getByPlaceholderText('Account name'), 'Cash2');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(view.getByText('Save')).toBeEnabled();
    await fireEvent.press(view.getByText('Save'));
    await waitFor(() => expect(mockAccountUpdate).toHaveBeenCalledTimes(1));
    expect(mockAccountUpdate).toHaveBeenCalledWith(5, expect.objectContaining({ name: 'Cash2' }));
    expect(nav.goBack).toHaveBeenCalled();
  });
});
