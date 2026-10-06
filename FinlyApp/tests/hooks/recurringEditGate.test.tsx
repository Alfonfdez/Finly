import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useTransactionForm } from '../../src/hooks/useTransactionForm';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { setConfig, resetStub } from '../component/helpers/configStub';
import type { Account, Category, Tag } from '../../src/database/types';
import type { TransactionType } from '../../src/constants/types';

// Pin "today" so the gate matrix is deterministic (2026-10-06).
vi.mock('../../src/utils/recurrence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/recurrence')>();
  return { ...actual, todayDateOnly: () => '2026-10-06' };
});

const mockGetTagsByTransactionId = vi.fn(async (_id: number) => [] as number[]);
const mockGetCategoryUsageCounts = vi.fn(
  async (_userId: number, _type: TransactionType, _start: string, _accountId: number) =>
    [] as { id: number; name: string; icon: string; color: string; count: number }[]
);
const mockTagCreate = vi.fn(async (_data: unknown) => ({ id: 900 }) as Tag);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    getTagsByTransactionId: (id: number) => mockGetTagsByTransactionId(id),
    getCategoryUsageCounts: (userId: number, type: TransactionType, start: string, accountId: number) =>
      mockGetCategoryUsageCounts(userId, type, start, accountId),
  },
  tagRepository: { create: (data: unknown) => mockTagCreate(data) },
}));

const nav = { goBack: vi.fn(), navigate: vi.fn() };

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

type HookProps = Parameters<typeof useTransactionForm>[0];
type Hook = ReturnType<typeof useTransactionForm>;
type Edit = (h: Hook) => Promise<void> | void;

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const account2: Account = { id: 2, user_id: 1, name: 'Bank', is_total: 0 } as Account;
const catFood: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;
const catHome: Category = { id: 2, user_id: 1, name: 'Home', type: 'expense' } as Category;

const START = new Date(2026, 8, 1); // 1 Sep 2026

function ruleProps(overrides: Partial<HookProps> = {}): HookProps {
  return {
    ruleMode: true,
    initialType: 'expense',
    initialAccountId: 1,
    initialCategoryId: 1,
    initialReorderedCategory: null,
    initialDay: START,
    initialComment: '',
    initialPhotos: [],
    initialAmount: '100',
    initialRepeatFrequency: 'daily',
    initialRepeatInterval: 1,
    initialRepeatEnd: null,
    initialTagIds: [],
    initialRuleNextDue: null,
    initialRuleActive: true,
    errorTitle: 'Oops',
    errorMessage: 'Failed',
    onSubmit: vi.fn(),
    ...overrides,
  };
}

const originalRAF = globalThis.requestAnimationFrame;

async function gate(overrides: Partial<HookProps>, edit?: Edit): Promise<boolean> {
  const { result } = await renderHook(() => useTransactionForm(ruleProps(overrides)));
  if (edit) {
    await act(async () => {
      await edit(result.current);
    });
  }
  return result.current.recurringPastAffected;
}

// Rule states
const activeFuture = { initialRuleNextDue: '2026-10-07', initialRepeatEnd: new Date(2026, 9, 31) };
const noEnd = { initialRuleNextDue: '2026-10-07', initialRepeatEnd: null };
const finished = { initialRuleNextDue: '2026-10-01', initialRepeatEnd: new Date(2026, 8, 30) };
const overdue = { initialRuleNextDue: '2026-09-25', initialRepeatEnd: new Date(2026, 9, 31) };
const pausedOverdue = { ...overdue, initialRuleActive: false };

// Edits
const extendEnd: Edit = (h) => h.setRepeatEnd(new Date(2026, 10, 30));
const shortenEnd: Edit = (h) => h.setRepeatEnd(new Date(2026, 8, 15));
const setAmount: Edit = (h) => h.setAmountRaw('120');
const setCategory: Edit = (h) => h.setCategoryId(2);
const setType: Edit = (h) => h.setType('income');
const setComment: Edit = (h) => h.setComment('note');
const addTag: Edit = (h) => h.handleToggleTag(7);
const setAccount: Edit = (h) => h.handleSelectAccount(2);
const setFrequency: Edit = (h) => h.setRepeatFrequency('monthly');
const setInterval: Edit = (h) => h.setRepeatInterval(2);
const setDay: Edit = (h) => h.setDay(new Date(2026, 8, 15));

const SCENARIOS: [string, Partial<HookProps>, Edit | undefined, boolean][] = [
  ['active future / none', activeFuture, undefined, false],
  ['active future / extend end', activeFuture, extendEnd, false],
  ['active future / shorten end', activeFuture, shortenEnd, false],
  ['no end / none', noEnd, undefined, false],
  ['finished / none', finished, undefined, false],
  ['finished / extend end', finished, extendEnd, true],
  ['finished / shorten end', finished, shortenEnd, false],
  ['overdue / none', overdue, undefined, true],
  ['overdue / extend end', overdue, extendEnd, true],
  ['overdue / shorten end', overdue, shortenEnd, false],
  ['paused overdue / none', pausedOverdue, undefined, false],
  ['paused overdue / extend end', pausedOverdue, extendEnd, false],
  ['paused overdue / amount', pausedOverdue, setAmount, true],
  ['active future / amount', activeFuture, setAmount, true],
  ['active future / category', activeFuture, setCategory, true],
  ['active future / type', activeFuture, setType, true],
  ['active future / comment', activeFuture, setComment, true],
  ['active future / tags', activeFuture, addTag, true],
  ['active future / account', activeFuture, setAccount, true],
  ['active future / frequency', activeFuture, setFrequency, false],
  ['active future / interval', activeFuture, setInterval, false],
  ['active future / day', activeFuture, setDay, false],
  ['finished / frequency', finished, setFrequency, false],
  ['overdue / frequency', overdue, setFrequency, true],
];

describe('recurring edit gate — "Future + past" enabling logic', () => {
  beforeEach(() => {
    mockGetTagsByTransactionId.mockReset().mockResolvedValue([]);
    mockGetCategoryUsageCounts.mockReset().mockResolvedValue([]);
    mockTagCreate.mockReset().mockResolvedValue({ id: 900 } as Tag);
    nav.goBack.mockClear();
    nav.navigate.mockClear();
    setConfig({ language: 'en' });
    setAppData({
      accounts: [account, account2],
      categories: [catFood, catHome],
      categoriesById: new Map([
        [1, catFood],
        [2, catHome],
      ]),
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

  it.each(SCENARIOS)('%s', async (_label, state, edit, expected) => {
    expect(await gate(state, edit)).toBe(expected);
  });
});
