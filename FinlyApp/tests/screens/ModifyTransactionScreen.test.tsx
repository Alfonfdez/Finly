import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render } from '@testing-library/react-native';
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
    mockGetById.mockReset().mockResolvedValue(transaction);
    mockGetTagsByTransactionId.mockReset().mockResolvedValue([]);
    mockGetCategoryUsageCounts.mockReset().mockResolvedValue([]);
    mockTagCreate.mockClear();
    mockUpdateWithTags.mockClear();
    mockSearchComments.mockReset().mockResolvedValue([]);
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
});
