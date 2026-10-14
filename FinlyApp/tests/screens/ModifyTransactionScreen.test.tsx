import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyTransactionScreen from '../../src/screens/ModifyTransactionScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { setConfig, resetStub } from '../component/helpers/configStub';
import type { Account, Category, Transaction, Tag } from '../../src/database/types';
import type { TransactionType } from '../../src/constants/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = { transactionId: 11 };

const mockGetById = vi.fn(async (_id: number) => null as Transaction | null);
const mockGetTagsByTransactionId = vi.fn(async (_id: number) => [] as number[]);
const mockGetCategoryUsageCounts = vi.fn(
  async (_userId: number, _type: TransactionType, _start: string, _accountId: number) =>
    [] as { id: number; name: string; icon: string; color: string; count: number }[]
);
const mockTagCreate = vi.fn(async (_data: unknown) => ({ id: 900 }) as Tag);
const mockUpdateWithTags = vi.fn(async (_id: number, _data: unknown, _tagIds: number[]) => {});
const mockSearchComments = vi.fn(async (_value: string) => [] as string[]);

vi.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: vi.fn(async () => ({ status: 'denied' })),
  launchCameraAsync: vi.fn(async () => ({ canceled: true, assets: [] })),
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ status: 'denied' })),
  launchImageLibraryAsync: vi.fn(async () => ({ canceled: true, assets: [] })),
}));

const mockFsFile = vi.fn();
vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;
    copy = vi.fn();
    exists = false;
    delete = vi.fn();
    constructor(uri: string) {
      this.uri = uri;
      mockFsFile(uri);
    }
  },
}));

vi.mock('../../src/database', () => ({
  transactionRepository: {
    getById: (id: number) => mockGetById(id),
    getTagsByTransactionId: (id: number) => mockGetTagsByTransactionId(id),
    getCategoryUsageCounts: (userId: number, type: TransactionType, start: string, accountId: number) =>
      mockGetCategoryUsageCounts(userId, type, start, accountId),
    updateWithTags: (id: number, data: unknown, tagIds: number[]) => mockUpdateWithTags(id, data, tagIds),
    searchComments: (value: string) => mockSearchComments(value),
  },
  tagRepository: {
    create: (data: unknown) => mockTagCreate(data),
  },
}));

// `useFocusLoad` is replaced with a controllable version so a re-focus (returning from
// the rule editor) can re-run the screen's loader on demand — without touching the form's
// own focus effects, which leak async work if re-invoked by hand.
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
      React.useEffect(() => cb(), [cb]);
    },
  };
});

// Simulates returning to the screen (a re-focus), which re-runs the screen's loader.
// Wrapping the reload in `act` corrupts React's act scope for later interactions here,
// so the state updates are flushed with a macrotask instead.
async function refocus() {
  reloadRef.current?.();
  await new Promise(resolve => setTimeout(resolve, 0));
}

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const catFood: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;
const transaction: Transaction = {
  id: 11,
  account_id: 1,
  category_id: 1,
  type: 'expense',
  amount: 12.5,
  description: 'Dinner',
  photo: null,
  date: '2026-06-15 10:00:00',
  created_at: '2026-01-01 00:00:00',
  updated_at: null,
} as Transaction;

const originalRAF = globalThis.requestAnimationFrame;

describe('ModifyTransactionScreen', () => {
  beforeEach(() => {
    reloadRef.current = null;
    mockGetById.mockReset().mockResolvedValue(transaction);
    mockGetTagsByTransactionId.mockReset().mockResolvedValue([]);
    mockGetCategoryUsageCounts.mockReset().mockResolvedValue([]);
    mockTagCreate.mockClear();
    mockUpdateWithTags.mockClear();
    mockSearchComments.mockReset().mockResolvedValue([]);
    nav.navigate.mockClear();
    setConfig({ language: 'en' });
    setAppData({
      accounts: [account],
      categories: [catFood],
      categoriesById: new Map([[1, catFood]]),
      tags: [],
    });
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(Date.now());
      return 0;
    }) as typeof globalThis.requestAnimationFrame;
  });

  afterEach(() => {
    globalThis.requestAnimationFrame = originalRAF;
    resetAppStub();
    resetStub();
  });

  it('preloads the transaction into the form and enables Save', async () => {
    const view = await render(<ModifyTransactionScreen />);
    expect(await view.findByText('Save')).toBeEnabled();
    expect(view.getByText('Account')).toBeTruthy();
  });

  it('loads the saved tags for the transaction', async () => {
    const view = await render(<ModifyTransactionScreen />);
    await view.findByText('Save');
    expect(mockGetTagsByTransactionId).toHaveBeenCalledWith(11);
  });

  it('shows the recurring notice and opens the rule editor for a recurring transaction', async () => {
    mockGetById.mockResolvedValue({ ...transaction, recurring_rule_id: 5 });
    const view = await render(<ModifyTransactionScreen />);
    await view.findByText('Save');
    expect(view.getByText('Recurring')).toBeTruthy();
    expect(
      view.getByText('This transaction was created by a recurring rule. Saving changes only affects this transaction, not the rule.')
    ).toBeTruthy();
    fireEvent.press(view.getByText('Edit recurring rule'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyRecurring', { ruleId: 5 });
  });

  it('hides the recurring notice for a plain transaction', async () => {
    const view = await render(<ModifyTransactionScreen />);
    await view.findByText('Save');
    expect(view.queryByText('Edit recurring rule')).toBeNull();
  });

  it('adopts the new values when the row changes underneath an untouched form', async () => {
    mockGetById.mockResolvedValue({ ...transaction, description: 'before', updated_at: '2026-10-14 10:00:00' });
    const view = await render(<ModifyTransactionScreen />);
    await view.findByText('Save');
    expect(view.getByDisplayValue('before')).toBeTruthy();

    // The rule was saved with "Future + past" while this form was open.
    mockGetById.mockResolvedValue({ ...transaction, description: 'after', updated_at: '2026-10-14 10:05:00' });
    await refocus();

    expect(await view.findByDisplayValue('after')).toBeTruthy();
    expect(view.queryByText(/updated by its recurring rule/)).toBeNull();
  });

  it('keeps the user input and warns when the row changes underneath a dirty form', async () => {
    mockGetById.mockResolvedValue({
      ...transaction,
      recurring_rule_id: 5,
      description: 'before',
      updated_at: '2026-10-14 10:00:00',
    });
    const view = await render(<ModifyTransactionScreen />);
    await view.findByText('Save');

    fireEvent.changeText(view.getByDisplayValue('before'), 'mine');

    mockGetById.mockResolvedValue({
      ...transaction,
      recurring_rule_id: 5,
      description: 'after',
      updated_at: '2026-10-14 10:05:00',
    });
    await refocus();

    expect(await view.findByText(/updated by its recurring rule/)).toBeTruthy();
    expect(view.getByDisplayValue('mine')).toBeTruthy();
  });

  it('adopts the rule values when the notice action is pressed', async () => {
    mockGetById.mockResolvedValue({
      ...transaction,
      recurring_rule_id: 5,
      description: 'before',
      updated_at: '2026-10-14 10:00:00',
    });
    const view = await render(<ModifyTransactionScreen />);
    await view.findByText('Save');

    fireEvent.changeText(view.getByDisplayValue('before'), 'mine');

    mockGetById.mockResolvedValue({
      ...transaction,
      recurring_rule_id: 5,
      description: 'after',
      updated_at: '2026-10-14 10:05:00',
    });
    await refocus();

    const button = await view.findByText("Use the rule's values");
    await act(async () => { fireEvent.press(button); });
    expect(await view.findByDisplayValue('after')).toBeTruthy();
    expect(view.queryByText(/updated by its recurring rule/)).toBeNull();
  });
});
