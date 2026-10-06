import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useTransactionForm, type TransactionDraft, type RecurrenceDraft } from '../../src/hooks/useTransactionForm';
import { buildAppMock, getAppStub, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Account, Category, Tag } from '../../src/database/types';
import type { TransactionType, RecurrenceFrequency } from '../../src/constants/types';
import { setConfig, resetStub } from '../component/helpers/configStub';

interface UseTransactionFormProps {
  initialType: TransactionType;
  initialAccountId: number | undefined;
  initialCategoryId: number | null;
  initialReorderedCategory: number | null;
  initialDay: Date;
  transactionId?: number;
  initialComment: string;
  initialPhotos: string[];
  initialAmount?: string;
  errorTitle: string;
  errorMessage: string;
  onSubmit: (data: TransactionDraft, tagIds: number[]) => Promise<void>;
  onSubmitRule?: (data: TransactionDraft, tagIds: number[], recurrence: RecurrenceDraft) => Promise<void>;
  resetTagsOnFirstFocus?: boolean;
  onError?: () => void;
  ruleMode?: boolean;
  initialTagIds?: number[];
  initialRuleNextDue?: string | null;
  initialRepeatFrequency?: RecurrenceFrequency;
  initialRepeatInterval?: number;
  initialRepeatEnd?: Date | null;
}

const mockGetTagsByTransactionId = vi.fn(async (_id: number) => [] as number[]);
const mockGetCategoryUsageCounts = vi.fn(
  async (_userId: number, _type: TransactionType, _start: string, _accountId: number) =>
    [] as { id: number; name: string; icon: string; color: string; count: number }[]
);
const mockTagCreate = vi.fn(async (_data: unknown) => ({
  id: 900,
  user_id: 1,
  name: 'NewTag',
  created_at: '2026-01-01 00:00:00',
}) as Tag);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    getTagsByTransactionId: (id: number) => mockGetTagsByTransactionId(id),
    getCategoryUsageCounts: (userId: number, type: TransactionType, start: string, accountId: number) =>
      mockGetCategoryUsageCounts(userId, type, start, accountId),
  },
  tagRepository: {
    create: (data: unknown) => mockTagCreate(data),
  },
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

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
// space-separated names to make name sort deterministic
const catFood: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;
const catHome: Category = { id: 2, user_id: 1, name: 'Home', type: 'expense' } as Category;
const catTravel: Category = { id: 3, user_id: 1, name: 'Travel', type: 'expense' } as Category;
const catIncome: Category = { id: 4, user_id: 1, name: 'Salary', type: 'income' } as Category;

function baseProps(overrides: Partial<UseTransactionFormProps> = {}): UseTransactionFormProps {
  return {
    initialType: 'expense',
    initialAccountId: 1,
    initialCategoryId: 1,
    initialReorderedCategory: null,
    initialDay: new Date(2026, 5, 15),
    initialComment: '',
    initialPhotos: [],
    errorTitle: 'Oops',
    errorMessage: 'Failed',
    onSubmit: vi.fn(async (_d: TransactionDraft, t: number[]) => {}),
    ...overrides,
  };
}

const originalRAF = globalThis.requestAnimationFrame;

async function setup(overrides: Partial<UseTransactionFormProps> = {}) {
  const props = baseProps(overrides);
  const { result } = await renderHook(() => useTransactionForm(props));
  return { result, props };
}

describe('useTransactionForm', () => {
  beforeEach(() => {
    mockGetTagsByTransactionId.mockReset().mockResolvedValue([]);
    mockGetCategoryUsageCounts.mockReset().mockResolvedValue([]);
    mockTagCreate.mockReset().mockResolvedValue({ id: 900, user_id: 1, name: 'NewTag', created_at: '2026-01-01 00:00:00' } as Tag);
    nav.goBack.mockClear();
    nav.navigate.mockClear();
    setConfig({ language: 'en' });
    setAppData({
      accounts: [account],
      categories: [catFood, catHome, catTravel, catIncome],
      categoriesById: new Map([
        [1, catFood],
        [2, catHome],
        [3, catTravel],
        [4, catIncome],
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
    vi.restoreAllMocks();
  });

  it('requires category, positive amount, day and account to submit', async () => {
    const { result } = await setup({
      initialAccountId: 1,
      initialCategoryId: 1,
      initialAmount: '12.5',
      initialDay: new Date(2026, 5, 15),
    });
    expect(result.current.canSubmit).toBe(true);
  });

  it('reports canSubmit false when the amount is missing', async () => {
    const { result } = await setup({
      initialAccountId: 1,
      initialCategoryId: 1,
      initialAmount: '',
    });
    expect(result.current.canSubmit).toBe(false);
  });

  it('reports canSubmit false when no account is selected', async () => {
    const { result } = await setup({
      initialAccountId: undefined,
      initialCategoryId: 1,
      initialAmount: '5',
    });
    expect(result.current.canSubmit).toBe(false);
  });

  it('parses the initial amount into a numeric value', async () => {
    const { result } = await setup({ initialAmount: '12.5' });
    expect(result.current.amountRaw).toBe('12.5');
    expect(result.current.numericAmount).toBe(12.5);
  });

  it('handleToggleTag toggles a selected tag', async () => {
    const { result } = await setup();
    await act(() => result.current.handleToggleTag(7));
    expect(result.current.selectedTags).toEqual([7]);
    await act(() => result.current.handleToggleTag(7));
    expect(result.current.selectedTags).toEqual([]);
  });

  it('handleSelectAccount selects the account and closes the modal', async () => {
    const { result } = await setup();
    await act(() => result.current.setModalAccountVisible(true));
    expect(result.current.modalAccountVisible).toBe(true);
    await act(() => result.current.handleSelectAccount(5));
    expect(result.current.accountId).toBe(5);
    expect(result.current.modalAccountVisible).toBe(false);
  });

  it('handleSelectDate sets the day and closes the calendar modal', async () => {
    const { result } = await setup();
    await act(() => result.current.setModalCalendarVisible(true));
    await act(() => result.current.handleSelectDate(new Date(2026, 7, 3)));
    expect(result.current.day.getDate()).toBe(3);
    expect(result.current.day.getMonth()).toBe(7);
    expect(result.current.modalCalendarVisible).toBe(false);
  });

  it('handleCreateTag creates a tag, refreshes and selects it', async () => {
    const { result, props } = await setup();
    setAppData({ tags: [] });
    let ok = false;
    await act(async () => {
      ok = await result.current.handleCreateTag('Travel');
    });
    expect(ok).toBe(true);
    expect(mockTagCreate).toHaveBeenCalledWith({ user_id: 1, name: 'Travel' });
    expect(getAppStub().refreshTags).toHaveBeenCalled();
    expect(result.current.selectedTags).toContain(900);
  });

  it('handleCreateTag returns false for a duplicate name', async () => {
    setAppData({ tags: [{ id: 5, user_id: 1, name: 'Travel', created_at: '2026-01-01 00:00:00' }] });
    const { result } = await setup();
    let ok = true;
    await act(async () => {
      ok = await result.current.handleCreateTag('travel');
    });
    expect(ok).toBe(false);
    expect(mockTagCreate).not.toHaveBeenCalled();
  });

  it('handleCreateTag returns false when creation fails', async () => {
    mockTagCreate.mockRejectedValue(new Error('db'));
    const { result } = await setup();
    let ok = true;
    await act(async () => {
      ok = await result.current.handleCreateTag('Travel');
    });
    expect(ok).toBe(false);
  });

  it('handleSubmit builds the draft, submits and navigates back', async () => {
    const { result, props } = await setup({ initialAmount: '9.99' });
    await act(() => result.current.handleToggleTag(3));
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    const [draft, tagIds] = (props.onSubmit as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(draft).toMatchObject({
      account_id: 1,
      category_id: 1,
      type: 'expense',
      amount: 9.99,
      description: null,
      photo: null,
    });
    expect(draft.date).toMatch(/^2026-06-15/);
    expect(tagIds).toEqual([3]);
    expect(nav.goBack).toHaveBeenCalledTimes(1);
    expect(getAppStub().refresh).toHaveBeenCalled();
  });

  it('handleSubmit is guarded when canSubmit is false', async () => {
    const { result, props } = await setup({ initialAccountId: undefined });
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(props.onSubmit).not.toHaveBeenCalled();
    expect(nav.goBack).not.toHaveBeenCalled();
  });

  it('includes skipFirst in the recurrence draft on submit', async () => {
    const onSubmitRule = vi.fn(async (_d: TransactionDraft, _t: number[], _r: RecurrenceDraft) => {});
    const { result } = await setup({ initialAmount: '10', onSubmitRule });
    await act(() => result.current.setRepeatEnabled(true));
    await act(() => result.current.setRepeatSkipFirst(true));
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmitRule).toHaveBeenCalledTimes(1);
    const [, , recurrence] = (onSubmitRule as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(recurrence).toMatchObject({ frequency: 'monthly', interval: 1, endDate: null, skipFirst: true });
  });

  it('blocks submit when the end date precedes the skipped first occurrence', async () => {
    const { result } = await setup({ initialAmount: '10', initialDay: new Date(2026, 5, 15) });
    await act(() => result.current.setRepeatEnabled(true));
    await act(() => result.current.setRepeatSkipFirst(true));

    // First occurrence is Jul 15; an end date before it is invalid.
    await act(() => result.current.setRepeatEnd(new Date(2026, 5, 20)));
    expect(result.current.canSubmit).toBe(false);

    // An end date on/after the first occurrence is allowed.
    await act(() => result.current.setRepeatEnd(new Date(2026, 6, 15)));
    expect(result.current.canSubmit).toBe(true);
  });

  it('reports recurringPastAffected only for past-affecting fields (rule mode)', async () => {
    const { result } = await setup({
      ruleMode: true,
      initialAmount: '100',
      initialCategoryId: 1,
      initialComment: 'Rent',
    });
    expect(result.current.recurringPastAffected).toBe(false);

    // Timing-only change does not affect past occurrences.
    await act(() => result.current.setRepeatFrequency('yearly'));
    expect(result.current.recurringPastAffected).toBe(false);

    // Amount change does.
    await act(() => result.current.setAmountRaw('120'));
    expect(result.current.recurringPastAffected).toBe(true);

    // Reverting it clears the flag again.
    await act(() => result.current.setAmountRaw('100'));
    expect(result.current.recurringPastAffected).toBe(false);

    // Type change does.
    await act(() => result.current.setType('income'));
    expect(result.current.recurringPastAffected).toBe(true);
  });

  it('offers the past scope when the rule has a missed window (rule mode)', async () => {
    const past = await setup({
      ruleMode: true,
      initialAmount: '100',
      initialCategoryId: 1,
      initialRuleNextDue: '2000-01-01',
    });
    expect(past.result.current.recurringPastAffected).toBe(true);

    const future = await setup({
      ruleMode: true,
      initialAmount: '100',
      initialCategoryId: 1,
      initialRuleNextDue: '2999-01-01',
    });
    expect(future.result.current.recurringPastAffected).toBe(false);
  });

  it('only offers the past scope when the new schedule has something to back-fill', async () => {
    const base = {
      ruleMode: true,
      initialAmount: '100',
      initialCategoryId: 1,
      initialRepeatFrequency: 'daily' as const,
      initialRepeatInterval: 1,
      initialDay: new Date(2026, 8, 1),
      initialRuleNextDue: '2026-10-01',
    };

    // Finished: the cursor is past the (unchanged) end date → nothing to back-fill.
    const finished = await setup({ ...base, initialRepeatEnd: new Date(2026, 8, 30) });
    expect(finished.result.current.recurringPastAffected).toBe(false);

    // Extending the end date opens a window → back-fill.
    const extended = await setup({ ...base, initialRepeatEnd: new Date(2026, 9, 31) });
    expect(extended.result.current.recurringPastAffected).toBe(true);
  });

  it('loads existing tags when a transaction id is provided', async () => {
    mockGetTagsByTransactionId.mockResolvedValue([11, 12]);
    const { result } = await setup({ transactionId: 42 });
    await act(async () => {});
    expect(mockGetTagsByTransactionId).toHaveBeenCalledWith(42);
    expect(result.current.selectedTags).toEqual([11, 12]);
  });

  it('loads category usage and orders visible categories by usage then name', async () => {
    mockGetCategoryUsageCounts.mockResolvedValue([
      { id: 2, name: 'Home', icon: 'home', color: '#fff', count: 9 },
      { id: 3, name: 'Travel', icon: 'plane', color: '#fff', count: 4 },
      { id: 1, name: 'Food', icon: 'fast', color: '#fff', count: 2 },
    ]);
    const { result } = await setup();
    await act(async () => {});
    // usage: 9, 4, 2 -> Home, Travel, Food
    expect(result.current.visibleCategories.map((c) => c.id)).toEqual([2, 3, 1]);
    expect(mockGetCategoryUsageCounts).toHaveBeenCalled();
  });
});
