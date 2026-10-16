import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor, act, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyAccountScreen from '../../src/screens/ModifyAccountScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
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

// `useFocusLoad` is replaced with a controllable version so a re-focus refetch can be
// triggered on demand to prove it does not wipe what the user typed.
const { reloadRef } = vi.hoisted(() => ({
  reloadRef: { current: null as (() => Promise<void>) | null },
}));

vi.mock('../../src/hooks/useFocusLoad', async () => {
  const React = await import('react');
  return {
    useFocusLoad: <T,>(loader: () => Promise<T>, initial: T) => {
      const [data, setData] = React.useState<T>(initial);
      const [loading, setLoading] = React.useState(true);
      const loaderRef = React.useRef(loader);
      loaderRef.current = loader;
      const dataRef = React.useRef<T>(initial);
      const run = React.useCallback(async () => {
        const result = await loaderRef.current();
        if (result !== dataRef.current) {
          dataRef.current = result;
          setData(result);
        }
        setLoading(false);
      }, []);
      React.useEffect(() => { run(); }, [run]);
      reloadRef.current = run;
      return { data, setData, loading };
    },
  };
});

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

  it('preloads the account and keeps Save disabled until something changes', async () => {
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');
    expect(view.getByText('Save')).toBeDisabled();
  });

  it('enables Save only while the form differs from the loaded account', async () => {
    vi.useFakeTimers();
    const view = await render(<ModifyAccountScreen />);
    const nameInput = await view.findByDisplayValue('Cash');

    await fireEvent.changeText(nameInput, 'Cash2');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(view.getByText('Save')).toBeEnabled();

    await fireEvent.changeText(nameInput, 'Cash');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(view.getByText('Save')).toBeDisabled();
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

  it('keeps what the user typed when the account is refetched on focus', async () => {
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');

    await fireEvent.changeText(view.getByPlaceholderText('Account name'), 'Cash edited');

    await act(async () => {
      await reloadRef.current?.();
    });

    expect(view.getByDisplayValue('Cash edited')).toBeTruthy();
  });

  it('lays out the disabled-delete note, Delete, the reserved hint slot and Save in order', async () => {
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');
    await fireEvent.changeText(view.getByPlaceholderText('Account name'), '');

    const texts = view.getAllByText(/./).map((node) => String(node.props.children));
    const noteAt = texts.indexOf('You need at least one account, so this one cannot be deleted.');
    const deleteAt = texts.indexOf('Delete');
    const hintAt = texts.indexOf('Enter an account name');
    const saveAt = texts.indexOf('Save');

    expect(noteAt).toBeGreaterThan(-1);
    expect(noteAt).toBeLessThan(deleteAt);
    expect(deleteAt).toBeLessThan(hintAt);
    expect(hintAt).toBeLessThan(saveAt);
  });

  it('reserves the hint room so Delete and Save never move', async () => {
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');

    const slot = StyleSheet.flatten(view.getByTestId(TEST_IDS.formHintSlot).props.style) as { minHeight?: number };
    expect(slot.minHeight).toBeGreaterThan(0);
    expect(within(view.getByTestId(TEST_IDS.formHintSlot)).queryByText(/./)).toBeNull();
  });

  it('keeps the reserved muted band when the account can be deleted', async () => {
    setAppData({ accounts: [account, { ...account, id: 6, name: 'Bank' } as Account] });
    const view = await render(<ModifyAccountScreen />);
    await view.findByDisplayValue('Cash');

    const muted = view.getByTestId(TEST_IDS.formMutedSlot);
    expect(StyleSheet.flatten(muted.props.style).minHeight).toBeGreaterThan(0);
    expect(within(muted).queryByText(/./)).toBeNull();
    expect(view.getByTestId(TEST_IDS.formDelete)).toBeEnabled();
  });

  it('only reddens the name field once the user touched it', async () => {
    const view = await render(<ModifyAccountScreen />);
    const input = await view.findByDisplayValue('Cash');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#334155');

    await fireEvent.changeText(input, '');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#F87171');
  });
});
