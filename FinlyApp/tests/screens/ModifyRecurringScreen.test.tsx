import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyRecurringScreen from '../../src/screens/ModifyRecurringScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { setConfig, resetStub } from '../component/helpers/configStub';
import type { Account, Category, RecurringRule, Tag } from '../../src/database/types';
import type { TransactionType } from '../../src/constants/types';

const nav = { navigate: vi.fn(), goBack: vi.fn(), setOptions: vi.fn() };
const routeParams: Record<string, unknown> = { ruleId: 1 };

const mockGetById = vi.fn(async (_id: number) => null as RecurringRule | null);
const mockGetTagIds = vi.fn(async (_id: number) => [] as number[]);
const mockRemove = vi.fn(async (_id: number) => {});
const mockGetTagsByTransactionId = vi.fn(async (_id: number) => [] as number[]);
const mockGetCategoryUsageCounts = vi.fn(
  async (_userId: number, _type: TransactionType, _start: string, _accountId: number) =>
    [] as { id: number; name: string; icon: string; color: string; count: number }[]
);
const mockTagCreate = vi.fn(async (_data: unknown) => ({ id: 900 }) as Tag);
const mockSaveEdit = vi.fn(async (_params: unknown) => 0);

vi.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: vi.fn(async () => ({ status: 'denied' })),
  launchCameraAsync: vi.fn(async () => ({ canceled: true, assets: [] })),
  requestMediaLibraryPermissionsAsync: vi.fn(async () => ({ status: 'denied' })),
  launchImageLibraryAsync: vi.fn(async () => ({ canceled: true, assets: [] })),
}));

vi.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///doc/' } },
  File: class MockFile {
    uri: string;
    copy = vi.fn();
    exists = false;
    delete = vi.fn();
    constructor(uri: string) {
      this.uri = uri;
    }
  },
}));

vi.mock('../../src/database', () => ({
  recurringRepository: {
    getById: (id: number) => mockGetById(id),
    getTagIds: (id: number) => mockGetTagIds(id),
    remove: (id: number) => mockRemove(id),
  },
  transactionRepository: {
    getTagsByTransactionId: (id: number) => mockGetTagsByTransactionId(id),
    getCategoryUsageCounts: (userId: number, type: TransactionType, start: string, accountId: number) =>
      mockGetCategoryUsageCounts(userId, type, start, accountId),
  },
  tagRepository: {
    create: (data: unknown) => mockTagCreate(data),
  },
}));

vi.mock('../../src/database/recurringService', () => ({
  saveRecurringRuleEdit: (params: unknown) => mockSaveEdit(params),
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

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const catFood: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;

const rule: RecurringRule = {
  id: 1,
  user_id: 1,
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

const originalRAF = globalThis.requestAnimationFrame;

describe('ModifyRecurringScreen', () => {
  beforeEach(() => {
    nav.navigate.mockClear();
    nav.goBack.mockClear();
    mockGetById.mockReset().mockResolvedValue(rule);
    mockGetTagIds.mockReset().mockResolvedValue([]);
    mockRemove.mockClear();
    mockGetTagsByTransactionId.mockReset().mockResolvedValue([]);
    mockGetCategoryUsageCounts.mockReset().mockResolvedValue([]);
    mockTagCreate.mockClear();
    mockSaveEdit.mockClear();
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

  it('disables "Future + past" and shows a hint until a past-affecting field changes', async () => {
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());

    const pastPill = view.getByRole('button', { name: 'Future + past' });
    expect(pastPill).toBeDisabled();
    expect(
      view.getByText('Only account, category, amount, comment, tags or type changes update past transactions'),
    ).toBeTruthy();

    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');

    await waitFor(() =>
      expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled(),
    );
    expect(
      view.queryByText('Only account, category, amount, comment, tags or type changes update past transactions'),
    ).toBeNull();
  });
});
