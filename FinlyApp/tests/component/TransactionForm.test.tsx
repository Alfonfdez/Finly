import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import TransactionForm from '../../src/components/TransactionForm';
import { DEFAULT_CONFIG } from '../../src/database/configDefaults';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Config , Category , Account } from '../../src/database/types';
import { getConfigStub } from './helpers/configStub';
import type { RecurrenceScope } from '../../src/constants/types';
import { recurringCardErrorColors } from '../../src/components/componentStyles';

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

vi.mock('../../src/database', () => ({}));

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

const setType = vi.fn();
const setAmountRaw = vi.fn();
const setCategoryId = vi.fn();
const setDay = vi.fn();
const setComment = vi.fn();
const toggleTag = vi.fn();
const createTag = vi.fn();
const selectAccount = vi.fn();
const selectDate = vi.fn();
const formSubmit = vi.fn(async () => {});
const takePhoto = vi.fn();
const pickFromGallery = vi.fn();
const removePhoto = vi.fn();

const mockFormState = {
  type: 'expense' as const,
  amountRaw: '',
  numericAmount: null as number | null,
  accountId: 1 as number | undefined,
  categoryId: null as number | null,
  selectedTags: [] as number[],
  comment: '',
  photos: [] as string[],
  canSubmit: false,
  config: { ...DEFAULT_CONFIG } as Config,
  repeatName: '',
  repeatNameErrorDisplay: null as 'required' | 'taken' | null,
  repeatNameError: null as 'required' | 'taken' | null,
  day: new Date(2026, 8, 1),
  repeatFrequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  repeatInterval: 1,
  repeatEnd: null as Date | null,
  repeatLastDay: false,
  repeatMinDate: new Date(2026, 8, 2),
};

vi.mock('../../src/hooks/useTransactionForm', () => ({
  useTransactionForm: () => ({
    type: mockFormState.type,
    setType,
    amountRaw: mockFormState.amountRaw,
    setAmountRaw,
    categoryId: mockFormState.categoryId,
    setCategoryId,
    day: mockFormState.day,
    setDay,
    selectedTags: mockFormState.selectedTags,
    comment: mockFormState.comment,
    setComment,
    submitting: false,
    photos: mockFormState.photos,
    modalAccountVisible: false,
    setModalAccountVisible: vi.fn(),
    modalCalendarVisible: false,
    setModalCalendarVisible: vi.fn(),
    calculatorVisible: false,
    setCalculatorVisible: vi.fn(),
    repeatFrequency: mockFormState.repeatFrequency,
    setRepeatFrequency: vi.fn(),
    repeatInterval: mockFormState.repeatInterval,
    setRepeatInterval: vi.fn(),
    repeatEnd: mockFormState.repeatEnd,
    setRepeatEnd: vi.fn(),
    repeatMinDate: mockFormState.repeatMinDate,
    repeatLastDay: mockFormState.repeatLastDay,
    setRepeatLastDay: vi.fn(),
    ruleUnmaterialized: false,
    ruleStartMovedEarlier: false,
    modalRepeatEndVisible: false,
    setModalRepeatEndVisible: vi.fn(),
    handleToggleTag: toggleTag,
    handleCreateTag: createTag,
    handleSelectAccount: selectAccount,
    handleSelectDate: selectDate,
    handleSubmit: formSubmit,
    handleTakePhoto: takePhoto,
    handlePickFromGallery: pickFromGallery,
    handleRemovePhoto: removePhoto,
    canSubmit: mockFormState.canSubmit,
    repeatName: mockFormState.repeatName,
    setRepeatName: vi.fn(),
    repeatNameError: mockFormState.repeatNameError,
    repeatNameErrorDisplay: mockFormState.repeatNameErrorDisplay,
    markNameTouched: vi.fn(),
    accountId: mockFormState.accountId,
    visibleCategories: [] as Category[],
    hasMore: false,
    selectedAccount: { id: 1, user_id: 1, name: 'Wallet', is_total: 0, created_at: '2026-01-01' } as Account,
    selectableAccounts: [] as Account[],
    numericAmount: mockFormState.numericAmount,
    inputRef: { current: null },
    scrollRef: { current: null },
    config: mockFormState.config,
    tags: [],
  }),
}));

const catFood: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#22D3EE', type: 'expense', created_at: '2026-01-01' };

function renderForm(overrides: {
  initialDay?: Date;
  ruleMode?: boolean;
  transactionId?: number;
  initialRuleNextDue?: string | null;
  repeatScope?: RecurrenceScope;
  deleteLabel?: string;
  onDeletePress?: () => void;
} = {}) {
  return render(
    <TransactionForm
      initialType="expense"
      initialAccountId={1}
      initialCategoryId={null}
      initialReorderedCategory={null}
      initialDay={new Date(2026, 8, 1)}
      initialComment=""
      initialPhotos={[]}
      submitLabel="Save"
      errorTitle="Error"
      errorMessage="Something went wrong"
      onSubmit={formSubmit}
      {...overrides}
    />,
  );
}

describe('TransactionForm', () => {
  beforeEach(() => {
    mockFormState.type = 'expense';
    mockFormState.amountRaw = '';
    mockFormState.numericAmount = null;
    mockFormState.accountId = 1;
    mockFormState.categoryId = null;
    mockFormState.comment = '';
    mockFormState.canSubmit = false;
    mockFormState.config = { ...DEFAULT_CONFIG };
    mockFormState.repeatNameErrorDisplay = null;
    mockFormState.repeatNameError = null;
    mockFormState.repeatName = '';
    mockFormState.day = new Date(2026, 8, 1);
    mockFormState.repeatFrequency = 'monthly';
    mockFormState.repeatInterval = 1;
    mockFormState.repeatEnd = null;
    mockFormState.repeatLastDay = false;
    mockFormState.repeatMinDate = new Date(2026, 8, 2);
    nav.navigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the type tabs and section labels', async () => {
    const view = await renderForm();
    expect(view.getByText('Expenses')).toBeTruthy();
    expect(view.getByText('Income')).toBeTruthy();
    expect(view.getByText('Account')).toBeTruthy();
  });

  it('keeps the submit button disabled until the form can submit', async () => {
    const view = await renderForm();
    expect(view.getByText('Save')).toBeDisabled();
  });

  it('enables the submit button and submits when the form can submit', async () => {
    mockFormState.canSubmit = true;
    mockFormState.amountRaw = '10';
    mockFormState.categoryId = 1;
    const view = await renderForm();
    const saveButton = view.getByText('Save');
    expect(saveButton).toBeEnabled();
    fireEvent.press(saveButton);
    expect(formSubmit).toHaveBeenCalled();
  });

  it('shows a hint while the form is incomplete', async () => {
    const view = await renderForm();
    expect(view.getByText('Select a category. Enter a valid amount greater than 0.')).toBeTruthy();
  });

  it('lists every missing condition at once', async () => {
    mockFormState.repeatNameError = 'required';
    const view = await renderForm({ ruleMode: true });
    expect(
      view.getByText('Select a category. Enter a valid amount greater than 0. Enter a name for this recurring rule.'),
    ).toBeTruthy();
  });

  it('blocks Save when the rule backlog exceeds the catch-up limit', async () => {
    mockFormState.canSubmit = true;
    mockFormState.numericAmount = 10;
    mockFormState.amountRaw = '10';
    mockFormState.categoryId = 1;
    mockFormState.day = new Date(1990, 0, 1);
    mockFormState.repeatFrequency = 'daily';
    const view = await renderForm({ ruleMode: true, initialDay: new Date(1990, 0, 1) });

    expect(view.getByText(
      'This rule would create more than 5000 transactions. Move the start date later or add an end date.',
    )).toBeTruthy();
    expect(view.getByText('Save')).toBeDisabled();
    const card = StyleSheet.flatten(view.getByTestId(TEST_IDS.repeatOptions).props.style);
    const c = getConfigStub().activeColors;
    expect(card.borderColor).toBe(recurringCardErrorColors(c).borderColor);
  });

  it('turns the card red while an edit would exceed the catch-up limit', async () => {
    mockFormState.canSubmit = true;
    mockFormState.numericAmount = 10;
    mockFormState.amountRaw = '10';
    mockFormState.categoryId = 1;
    mockFormState.day = new Date(2005, 0, 1);
    mockFormState.repeatFrequency = 'daily';
    const view = await renderForm({
      ruleMode: true,
      initialDay: new Date(2005, 0, 1),
      initialRuleNextDue: '2005-01-01',
      repeatScope: 'futureAndPast',
    });

    expect(view.getByText('Save')).toBeDisabled();
    const card = StyleSheet.flatten(view.getByTestId(TEST_IDS.repeatOptions).props.style);
    const c = getConfigStub().activeColors;
    expect(card.borderColor).toBe(recurringCardErrorColors(c).borderColor);
  });

  it('asks for an earlier end date when the rule already has one', async () => {
    mockFormState.canSubmit = true;
    mockFormState.numericAmount = 10;
    mockFormState.amountRaw = '10';
    mockFormState.categoryId = 1;
    mockFormState.day = new Date(1990, 0, 1);
    mockFormState.repeatFrequency = 'daily';
    mockFormState.repeatEnd = new Date(2005, 11, 31);
    mockFormState.repeatMinDate = new Date(1990, 0, 2);
    const view = await renderForm({ ruleMode: true, initialDay: new Date(1990, 0, 1) });

    expect(view.getByText(
      'This rule would create more than 5000 transactions. Move the start date later or set an earlier end date.',
    )).toBeTruthy();
    expect(view.getByText('Save')).toBeDisabled();
  });
  it('shows the recurring name hint when the name is the only blocker', async () => {
    mockFormState.numericAmount = 10;
    mockFormState.amountRaw = '10';
    mockFormState.categoryId = 1;
    mockFormState.repeatNameError = 'required';
    const view = await renderForm({ ruleMode: true });
    expect(view.getByText('Enter a name for this recurring rule.')).toBeTruthy();
  });

  it('shows the taken-name hint in rule mode', async () => {
    mockFormState.numericAmount = 10;
    mockFormState.amountRaw = '10';
    mockFormState.categoryId = 1;
    mockFormState.repeatNameError = 'taken';
    const view = await renderForm({ ruleMode: true });
    expect(view.getByText('That name is already used by another recurring rule.')).toBeTruthy();
  });

  it('shows tag, comment and photo sections by default', async () => {
    const view = await renderForm();
    expect(view.getByText('Tags')).toBeTruthy();
    expect(view.getByText('Comment')).toBeTruthy();
    expect(view.getByText('Photo')).toBeTruthy();
  });

  it('flags an amount of 0 with a red border', async () => {
    mockFormState.amountRaw = '0';
    mockFormState.numericAmount = 0;
    const view = await renderForm();

    const input = view.getByPlaceholderText('0');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#F87171');
  });

  it('leaves an untouched amount neutral', async () => {
    const view = await renderForm();

    const input = view.getByPlaceholderText('0');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('transparent');
  });

  it('puts the delete action before the reserved hint slot and Save', async () => {
    const view = await renderForm({ deleteLabel: 'Delete', onDeletePress: () => {} });

    const texts = view.getAllByText(/./).map((node) => String(node.props.children));
    const deleteAt = texts.indexOf('Delete');
    const hintAt = texts.findIndex((text) => text.startsWith('Select a category'));
    const saveAt = texts.indexOf('Save');

    expect(deleteAt).toBeGreaterThan(-1);
    expect(deleteAt).toBeLessThan(hintAt);
    expect(hintAt).toBeLessThan(saveAt);

    const slot = StyleSheet.flatten(view.getByTestId(TEST_IDS.formHintSlot).props.style) as { minHeight?: number };
    expect(slot.minHeight).toBeGreaterThan(0);
    // The muted band above the destructive button is reserved as well.
    expect(view.getByTestId(TEST_IDS.formMutedSlot)).toBeTruthy();
  });

  it('reserves the hint slot even without a delete action', async () => {
    const view = await renderForm();

    const slot = StyleSheet.flatten(view.getByTestId(TEST_IDS.formHintSlot).props.style) as { minHeight?: number };
    expect(slot.minHeight).toBeGreaterThan(0);
    expect(view.queryByTestId(TEST_IDS.formMutedSlot)).toBeNull();
  });

  it('hides the comment section when addShowComments is off', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, addShowComments: false };
    const view = await renderForm();
    expect(view.queryByText('Comment')).toBeNull();
    expect(view.getByText('Tags')).toBeTruthy();
  });

  it('hides the tag section when addShowLabels is off', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, addShowLabels: false };
    const view = await renderForm();
    expect(view.queryByText('Tags')).toBeNull();
    expect(view.getByText('Comment')).toBeTruthy();
  });

  it('hides the photo section when addShowPhoto is off', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, addShowPhoto: false };
    const view = await renderForm();
    expect(view.queryByText('Photo')).toBeNull();
    expect(view.getByText('Comment')).toBeTruthy();
  });

  it('shows the create-category tile when there are no visible categories', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG };
    const view = await renderForm();
    expect(view.getByText('Create')).toBeTruthy();
  });

  it('labels the date field "Start date" and hides the photo section in rule mode', async () => {
    const view = await renderForm({ ruleMode: true });
    expect(view.getByText('Start date')).toBeTruthy();
    expect(view.queryByText('Day')).toBeNull();
    expect(view.queryByText('Photo')).toBeNull();
  });

  it('honours the create-rule flags when creating a rule', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, createRecurringShowComments: false, createRecurringShowLabels: false };
    const view = await renderForm({ ruleMode: true });
    expect(view.queryByText('Comment')).toBeNull();
    expect(view.queryByText('Tags')).toBeNull();
  });

  it('honours the edit-rule flags when editing a rule', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, editRecurringShowComments: false, editRecurringShowLabels: false };
    const view = await renderForm({ ruleMode: true, initialRuleNextDue: '2026-10-05' });
    expect(view.queryByText('Comment')).toBeNull();
    expect(view.queryByText('Tags')).toBeNull();
  });

  it('ignores the add-transaction flags in rule mode', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, addShowComments: false, addShowLabels: false };
    const view = await renderForm({ ruleMode: true });
    expect(view.getByText('Comment')).toBeTruthy();
    expect(view.getByText('Tags')).toBeTruthy();
  });

  it('honours the modify flags when editing a transaction', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, modifyShowComments: false, modifyShowLabels: false, modifyShowPhoto: false };
    const view = await renderForm({ transactionId: 5 });
    expect(view.queryByText('Comment')).toBeNull();
    expect(view.queryByText('Tags')).toBeNull();
    expect(view.queryByText('Photo')).toBeNull();
  });

  it('ignores the add-transaction flags when editing a transaction', async () => {
    mockFormState.config = { ...DEFAULT_CONFIG, addShowComments: false, addShowLabels: false, addShowPhoto: false };
    const view = await renderForm({ transactionId: 5 });
    expect(view.getByText('Comment')).toBeTruthy();
    expect(view.getByText('Tags')).toBeTruthy();
    expect(view.getByText('Photo')).toBeTruthy();
  });

  it('keeps the "Day" label and shows the photo section outside rule mode', async () => {
    const view = await renderForm();
    expect(view.getByText('Day')).toBeTruthy();
    expect(view.getByText('Photo')).toBeTruthy();
  });
});
