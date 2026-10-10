import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub, setConfig } from './helpers/configStub';
import TransactionListBody from '../../src/components/TransactionListBody';

type Props = ComponentProps<typeof TransactionListBody>;

function makeList(): Props['list'] {
  return {
    filters: {
      sections: [],
      tagsByTransaction: new Map(),
      localTagIds: [],
      handleToggleTag: vi.fn(),
      handleClearTagFilter: vi.fn(),
      accountModalVisible: false,
      selectedAccountId: null,
      closeAccountModal: vi.fn(),
      selectAccount: vi.fn(),
      sortBy: 'date',
      sortDirection: 'desc',
      handleToggleSort: vi.fn(),
      handleToggleDirection: vi.fn(),
      filtered: [],
    },
    keyExtractor: (t: { id: number }) => String(t.id),
    handleTransactionPress: vi.fn(),
    deleteModalVisible: false,
    openDeleteModal: vi.fn(),
    closeDeleteModal: vi.fn(),
    confirmBulkDelete: vi.fn(),
  } as unknown as Props['list'];
}

function makeSelect(): Props['select'] {
  return {
    searchActive: false,
    searchText: '',
    setSearchText: vi.fn(),
    closeSearch: vi.fn(),
    selectMode: false,
    selectedIds: new Set<number>(),
    exitSelectMode: vi.fn(),
    allSelected: () => false,
    toggleSelectAll: vi.fn(),
  } as unknown as Props['select'];
}

function makeProps(over: Partial<Props> = {}): Props {
  return {
    list: makeList(),
    select: makeSelect(),
    categoriesById: new Map(),
    recurringNames: new Map(),
    loading: false,
    tags: [],
    accountsWithBalance: [],
    onSelectAccount: vi.fn(),
    emptyIcon: 'receipt-outline',
    emptyMessage: 'No transactions',
    controls: <Text>controls</Text>,
    fab: <Text>fab</Text>,
    ...over,
  };
}

describe('TransactionListBody', () => {
  beforeEach(() => {
    resetStub();
    setConfig({ language: 'en' });
  });

  it('renders the controls and the empty state when there are no sections', async () => {
    const view = await render(<TransactionListBody {...makeProps()} />);
    expect(view.getByText('controls')).toBeTruthy();
    expect(view.getByText('No transactions')).toBeTruthy();
  });

  it('renders the fab when not selecting', async () => {
    const view = await render(<TransactionListBody {...makeProps()} />);
    expect(view.getByText('fab')).toBeTruthy();
  });

  it('shows the selection bar instead of the fab in select mode', async () => {
    const props = makeProps();
    (props.select as { selectMode: boolean }).selectMode = true;
    (props.select as { selectedIds: Set<number> }).selectedIds = new Set([1]);
    const view = await render(<TransactionListBody {...props} />);
    expect(view.queryByText('fab')).toBeNull();
  });

  it('selects all filtered transactions when Select all is pressed', async () => {
    const props = makeProps();
    const toggleSelectAll = vi.fn();
    (props.select as { selectMode: boolean }).selectMode = true;
    (props.select as unknown as { toggleSelectAll: typeof toggleSelectAll }).toggleSelectAll = toggleSelectAll;
    (props.list as unknown as { filters: { filtered: unknown } }).filters.filtered = [{ id: 1 }, { id: 2 }];
    const view = await render(<TransactionListBody {...props} />);
    await fireEvent.press(view.getByText('Select all'));
    expect(toggleSelectAll).toHaveBeenCalledWith([1, 2]);
  });

  it('shows Deselect all when everything visible is selected', async () => {
    const props = makeProps();
    (props.select as { selectMode: boolean }).selectMode = true;
    (props.select as unknown as { allSelected: () => boolean }).allSelected = () => true;
    (props.list as unknown as { filters: { filtered: unknown } }).filters.filtered = [{ id: 1 }];
    const view = await render(<TransactionListBody {...props} />);
    expect(view.getByText('Deselect all')).toBeTruthy();
  });
});
