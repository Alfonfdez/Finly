import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import TransactionForm from '../../src/components/TransactionForm';
import { DEFAULT_CONFIG } from '../../src/database/configDefaults';
import type { Config } from '../../src/database/types';
import type { Category } from '../../src/database/types';
import type { Account } from '../../src/database/types';

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
  categoryId: null as number | null,
  selectedTags: [] as number[],
  comment: '',
  photos: [] as string[],
  canSubmit: false,
  config: { ...DEFAULT_CONFIG } as Config,
};

vi.mock('../../src/hooks/useTransactionForm', () => ({
  useTransactionForm: () => ({
    type: mockFormState.type,
    setType,
    amountRaw: mockFormState.amountRaw,
    setAmountRaw,
    categoryId: mockFormState.categoryId,
    setCategoryId,
    day: new Date(2026, 8, 1),
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
    handleToggleTag: toggleTag,
    handleCreateTag: createTag,
    handleSelectAccount: selectAccount,
    handleSelectDate: selectDate,
    handleSubmit: formSubmit,
    handleTakePhoto: takePhoto,
    handlePickFromGallery: pickFromGallery,
    handleRemovePhoto: removePhoto,
    canSubmit: mockFormState.canSubmit,
    visibleCategories: [] as Category[],
    hasMore: false,
    selectedAccount: { id: 1, user_id: 1, name: 'Wallet', is_total: 0, created_at: '2026-01-01' } as Account,
    selectableAccounts: [] as Account[],
    numericAmount: null as number | null,
    inputRef: { current: null },
    scrollRef: { current: null },
    config: mockFormState.config,
    tags: [],
  }),
}));

const catFood: Category = { id: 1, user_id: 1, name: 'Food', icon: 'cart', color: '#22D3EE', type: 'expense', created_at: '2026-01-01' };

function renderForm() {
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
    />
  );
}

describe('TransactionForm', () => {
  beforeEach(() => {
    mockFormState.type = 'expense';
    mockFormState.amountRaw = '';
    mockFormState.categoryId = null;
    mockFormState.comment = '';
    mockFormState.canSubmit = false;
    mockFormState.config = { ...DEFAULT_CONFIG };
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
    expect(view.getByText('Select a category and enter an amount')).toBeTruthy();
  });

  it('shows tag, comment and photo sections by default', async () => {
    const view = await renderForm();
    expect(view.getByText('Tags')).toBeTruthy();
    expect(view.getByText('Comment')).toBeTruthy();
    expect(view.getByText('Photo')).toBeTruthy();
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
});