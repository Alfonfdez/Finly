import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyRecurringScreen from '../../src/screens/ModifyRecurringScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { setConfig, resetStub } from '../component/helpers/configStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Account, Category, RecurringRule, Tag } from '../../src/database/types';
import type { TransactionType } from '../../src/constants/types';

const nav = { navigate: vi.fn(), goBack: vi.fn(), setOptions: vi.fn() };
const routeParams: Record<string, unknown> = { ruleId: 1 };

const mockGetById = vi.fn(async (_id: number) => null as RecurringRule | null);
const mockGetTagIds = vi.fn(async (_id: number) => [] as number[]);
const mockRemove = vi.fn(async (_id: number) => {});
const mockList = vi.fn(async (_userId: number) => [] as RecurringRule[]);
const mockListOccurrenceDates = vi.fn(async (_id: number) => [] as string[]);
const mockGetTagsByTransactionId = vi.fn(async (_id: number) => [] as number[]);
const mockGetCategoryUsageCounts = vi.fn(
  async (_userId: number, _type: TransactionType, _start: string, _accountId: number) =>
    [] as { id: number; name: string; icon: string; color: string; count: number }[],
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
    list: (userId: number) => mockList(userId),
    listOccurrenceDates: (id: number) => mockListOccurrenceDates(id),
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

// Pin "today" so the skip-window warning is deterministic.
vi.mock('../../src/utils/recurrence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/utils/recurrence')>();
  return { ...actual, todayDateOnly: () => '2026-10-06' };
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

const account: Account = { id: 1, user_id: 1, name: 'Wallet', is_total: 0 } as Account;
const catFood: Category = { id: 1, user_id: 1, name: 'Food', type: 'expense' } as Category;

const rule: RecurringRule = {
  id: 1,
  user_id: 1,
  name: 'Rent',
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
  skipped_from: null,
  active: 1,
  created_at: '2026-10-05',
  updated_at: null,
};

const originalRAF = globalThis.requestAnimationFrame;

async function pickCalendarDay(view: Awaited<ReturnType<typeof render>>, label: string) {
  await fireEvent.press(view.getByLabelText('Select day'));
  await fireEvent.press(view.getByLabelText(label));
  await fireEvent.press(view.getByText('Ok'));
}

describe('ModifyRecurringScreen', () => {
  beforeEach(() => {
    nav.navigate.mockClear();
    nav.goBack.mockClear();
    mockGetById.mockReset().mockResolvedValue(rule);
    mockGetTagIds.mockReset().mockResolvedValue([]);
    mockRemove.mockClear();
    mockList.mockReset().mockResolvedValue([]);
    mockListOccurrenceDates.mockReset().mockResolvedValue([]);
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
    vi.restoreAllMocks();
    globalThis.requestAnimationFrame = originalRAF;
    resetAppStub();
    resetStub();
  });

  it('disables "Future + past" until it can affect the past', async () => {
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());

    const pastPill = view.getByRole('button', { name: 'Future + past' });
    expect(pastPill).toBeDisabled();
    expect(
      view.getByText('Also updates the transactions already created and fills in any missed occurrences. Existing dates are never changed or deleted.'),
    ).toBeTruthy();

    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');

    await waitFor(() =>
      expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled(),
    );
  });

  it('shows the ended message instead of a phantom next date for an ended rule', async () => {
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-10-01',
      end_date: '2026-10-05',
      next_due: '2026-10-06',
    });
    const view = await render(<ModifyRecurringScreen />);

    await waitFor(() =>
      expect(view.getByText('This rule has ended: no future transactions will be created.')).toBeTruthy(),
    );
    expect(view.queryByText('Next: October 7, 2026')).toBeNull();
  });

  it('skips today when extending a saved ended rule and today already has a transaction', async () => {
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-10-01',
      end_date: '2026-10-05',
      next_due: '2026-10-07',
    });
    mockListOccurrenceDates.mockResolvedValue(['2026-10-06']);
    const view = await render(<ModifyRecurringScreen />);

    await waitFor(() =>
      expect(view.getByText('This rule has ended: no future transactions will be created.')).toBeTruthy(),
    );

    await fireEvent.press(view.getByLabelText('End date'));
    await fireEvent.press(view.getByLabelText('10 October'));
    await fireEvent.press(view.getByText('Ok'));

    await waitFor(() => expect(view.getByText('Next: October 7, 2026')).toBeTruthy());
    expect(view.queryByText('Next: October 6, 2026')).toBeNull();
  });

  it('saves with "Future + past" and the edited fields when selected', async () => {
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());

    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');
    await waitFor(() => expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled());
    await fireEvent.press(view.getByRole('button', { name: 'Future + past' }));
    await fireEvent.press(view.getByText('Save'));

    await waitFor(() => expect(mockSaveEdit).toHaveBeenCalledTimes(1));
    const params = mockSaveEdit.mock.calls[0][0] as {
      scope: string;
      updated: { amount: number };
      pastPatch: { amount: number };
      recurrence: { frequency: string; interval: number; endDate: string | null };
    };
    expect(params.scope).toBe('futureAndPast');
    expect(params.updated.amount).toBe(120);
    expect(params.pastPatch.amount).toBe(120);
    expect(params.recurrence).toMatchObject({ frequency: 'monthly', interval: 1, endDate: null });
  });

  it('saves with "Future only" by default', async () => {
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());
    // Save only applies a real change.
    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');
    await fireEvent.press(view.getByText('Save'));

    await waitFor(() => expect(mockSaveEdit).toHaveBeenCalledTimes(1));
    const params = mockSaveEdit.mock.calls[0][0] as { scope: string };
    expect(params.scope).toBe('future');
  });

  it('warns before a "Future only" save skips occurrences (and does not save yet)', async () => {
    mockGetById.mockResolvedValue({ ...rule, start_date: '2026-08-05', next_due: '2026-09-05' });
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());

    // Save only applies a real change.
    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');

    // The save awaits the user's choice, so don't await the press itself.
    void fireEvent.press(view.getByText('Save'));

    await waitFor(() => expect(view.getByText('Skip occurrences?')).toBeTruthy());
    expect(mockSaveEdit).not.toHaveBeenCalled();
  });

  it('saves after the skip warning is confirmed', async () => {
    mockGetById.mockResolvedValue({ ...rule, start_date: '2026-08-05', next_due: '2026-09-05' });
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());

    // Save only applies a real change.
    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');

    void fireEvent.press(view.getByText('Save'));
    await waitFor(() => expect(view.getByText('Skip occurrences?')).toBeTruthy());
    await fireEvent.press(view.getByText('Skip them'));

    await waitFor(() => expect(mockSaveEdit).toHaveBeenCalledTimes(1));
    const params = mockSaveEdit.mock.calls[0][0] as { scope: string };
    expect(params.scope).toBe('future');
  });

  it('a fresh future rule moved to today updates the Summary and saves with "Future only"', async () => {
    mockGetById.mockResolvedValue({ ...rule, start_date: '2026-10-30', next_due: '2026-10-30' });
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Next: October 30, 2026')).toBeTruthy());

    await pickCalendarDay(view, '6 October');
    await waitFor(() => expect(view.getByText('Next: October 6, 2026')).toBeTruthy());
    expect(view.getByText('1 transaction will be created')).toBeTruthy();

    await fireEvent.press(view.getByText('Save'));
    await waitFor(() => expect(mockSaveEdit).toHaveBeenCalledTimes(1));
    const params = mockSaveEdit.mock.calls[0][0] as { scope: string; updated: { start_date?: string } };
    expect(params.scope).toBe('future');
    expect(params.updated.start_date).toBe('2026-10-06');
  });

  it('keeps Future + past disabled after a future edit when the rule already generated', async () => {
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-10-30',
      next_due: '2026-10-30',
    });
    mockListOccurrenceDates.mockResolvedValue(['2026-10-05']);

    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Start date')).toBeTruthy());

    await pickCalendarDay(view, '1 October');
    await waitFor(() =>
      expect(view.getByText('Changing the start date doesn\'t add earlier transactions.')).toBeTruthy(),
    );
    expect(view.getByRole('button', { name: 'Future + past' })).toBeDisabled();
  });

  it('Future + past counts only the occurrences not already generated', async () => {
    // Daily rule ended 3 Oct, extended to 10 Oct by a "Future only" save: that skipped
    // 4-5 Oct and generated today (6 Oct). Back-filling must report 2, not 3.
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-09-23',
      end_date: '2026-10-10',
      next_due: '2026-10-07',
      skipped_from: '2026-10-04',
    });
    mockListOccurrenceDates.mockResolvedValue([
      '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
      '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-06',
    ]);

    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());
    await waitFor(() => expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled());
    await fireEvent.press(view.getByRole('button', { name: 'Future + past' }));

    await waitFor(() => expect(view.getByText('Back-fill from: October 4, 2026')).toBeTruthy());
    await waitFor(() => expect(view.getByText('Adds 2 missed transactions')).toBeTruthy());
  });

  it('shows past transaction updates for a detail change under Future + past', async () => {
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-09-23',
      end_date: '2026-10-10',
      next_due: '2026-10-07',
    });
    mockListOccurrenceDates.mockResolvedValue([
      '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
      '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-06',
    ]);

    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());
    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');
    await waitFor(() => expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled());
    await fireEvent.press(view.getByRole('button', { name: 'Future + past' }));

    await waitFor(() => expect(view.getByText('Next: October 7, 2026')).toBeTruthy());
    await waitFor(() => expect(view.getByText('No transactions will be created now')).toBeTruthy());
    await waitFor(() => expect(view.getByText('Updates 12 past transactions')).toBeTruthy());
  });

  it('counts past updates only inside a later start date', async () => {
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-09-23',
      end_date: '2026-10-10',
      next_due: '2026-10-07',
    });
    mockListOccurrenceDates.mockResolvedValue([
      '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
      '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06',
    ]);

    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Start date')).toBeTruthy());
    await pickCalendarDay(view, '30 September');
    await fireEvent.changeText(view.getByPlaceholderText('0'), '120');
    await waitFor(() => expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled());
    await fireEvent.press(view.getByRole('button', { name: 'Future + past' }));

    await waitFor(() => expect(view.getByText('Updates 7 past transactions')).toBeTruthy());
    expect(view.queryByText('Updates 14 past transactions')).toBeNull();
  });

  it('hints that past occurrences are not recreated when the start moves earlier', async () => {
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Start date')).toBeTruthy());

    await pickCalendarDay(view, '1 October');
    await waitFor(() =>
      expect(view.getByText('Changing the start date doesn\'t add earlier transactions.')).toBeTruthy(),
    );
  });

  it('keeps Save disabled until something changes, and counts a scope-only change', async () => {
    // A previously skipped window is recoverable: "Future + past" can be chosen
    // without editing any field.
    mockGetById.mockResolvedValue({
      ...rule,
      frequency: 'daily',
      day_of_month: null,
      start_date: '2026-09-23',
      end_date: '2026-10-10',
      next_due: '2026-10-07',
      skipped_from: '2026-10-04',
    });
    mockListOccurrenceDates.mockResolvedValue(['2026-09-23', '2026-10-06']);

    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());
    await waitFor(() => expect(view.getByRole('button', { name: 'Future + past' })).toBeEnabled());

    expect(view.getByText('Save')).toBeDisabled();

    await fireEvent.press(view.getByRole('button', { name: 'Future + past' }));
    expect(view.getByText('Save')).toBeEnabled();

    await fireEvent.press(view.getByRole('button', { name: 'Future only' }));
    expect(view.getByText('Save')).toBeDisabled();
  });

  it('enables Save for each rule-only change and disables it again when reverted', async () => {
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Future + past')).toBeTruthy());
    expect(view.getByText('Save')).toBeDisabled();

    const nameInput = view.getByDisplayValue('Rent');
    await fireEvent.changeText(nameInput, 'Rent 2');
    await waitFor(() => expect(view.getByText('Save')).toBeEnabled());
    await fireEvent.changeText(nameInput, 'Rent');
    await waitFor(() => expect(view.getByText('Save')).toBeDisabled());

    await fireEvent.press(view.getByRole('button', { name: 'Weekly' }));
    await waitFor(() => expect(view.getByText('Save')).toBeEnabled());
    await fireEvent.press(view.getByRole('button', { name: 'Monthly' }));
    await waitFor(() => expect(view.getByText('Save')).toBeDisabled());

    await fireEvent.press(view.getByRole('button', { name: 'Increase' }));
    await waitFor(() => expect(view.getByText('Save')).toBeEnabled());
    await fireEvent.press(view.getByRole('button', { name: 'Decrease' }));
    await waitFor(() => expect(view.getByText('Save')).toBeDisabled());
  });

  it('keeps the delete modal open when removing the rule fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRemove.mockRejectedValueOnce(new Error('delete failed'));
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Save')).toBeTruthy());

    await fireEvent.press(view.getByTestId(TEST_IDS.formDelete));
    const confirm = await view.findByRole('button', { name: 'Delete' });
    await fireEvent.press(confirm);

    await waitFor(() => expect(mockRemove).toHaveBeenCalledTimes(1));
    expect(nav.goBack).not.toHaveBeenCalled();
    expect(view.getByRole('button', { name: 'Delete' })).toBeTruthy();
    expect(consoleError).toHaveBeenCalled();
  });

  it('ignores a second delete confirmation while the first is running', async () => {
    let finishRemove: (() => void) | undefined;
    mockRemove.mockImplementationOnce(() => new Promise<void>((resolve) => {
      finishRemove = resolve;
    }));
    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Save')).toBeTruthy());

    await fireEvent.press(view.getByTestId(TEST_IDS.formDelete));
    const confirm = await view.findByRole('button', { name: 'Delete' });
    fireEvent.press(confirm);
    await waitFor(() => expect(finishRemove).toBeDefined());
    fireEvent.press(confirm);

    expect(mockRemove).toHaveBeenCalledTimes(1);
    await act(async () => { finishRemove?.(); });
    await waitFor(() => expect(nav.goBack).toHaveBeenCalledTimes(1));
  });

  it('enables Save when the last-day checkbox changes on a month-end start', async () => {
    mockGetById.mockResolvedValue({
      ...rule,
      day_of_month: 30,
      start_date: '2026-04-30',
      next_due: '2026-05-30',
    });

    const view = await render(<ModifyRecurringScreen />);
    await waitFor(() => expect(view.getByText('Last day of the month')).toBeTruthy());
    expect(view.getByText('Save')).toBeDisabled();

    await fireEvent.press(view.getByText('Last day of the month'));
    await waitFor(() => expect(view.getByText('Save')).toBeEnabled());

    await fireEvent.press(view.getByText('Last day of the month'));
    await waitFor(() => expect(view.getByText('Save')).toBeDisabled());
  });
});
