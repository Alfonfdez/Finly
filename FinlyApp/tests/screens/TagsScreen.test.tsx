import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, userEvent, waitFor } from '@testing-library/react-native';
import { useState, type ReactNode } from 'react';
import TagsScreen from '../../src/screens/TagsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub, setConfig } from '../component/helpers/configStub';
import { TEST_IDS } from '../../src/constants/testIds';
import { MAX_TAGS } from '../../src/constants/types';
import type { Tag } from '../../src/database/types';

let setHeaderNode: ((node: ReactNode) => void) | null = null;
const nav = {
  setOptions: vi.fn((opts: { headerRight?: (() => ReactNode) | null }) => {
    setHeaderNode?.(opts.headerRight ? opts.headerRight() : null);
  }),
  navigate: vi.fn(),
};

function HeaderHost() {
  const [node, setNode] = useState<ReactNode>(null);
  setHeaderNode = setNode;
  return <>{node}</>;
}

const renderWithHeader = () => render(<><HeaderHost /><TagsScreen /></>);

const mockCountByTagIdsMap = vi.fn(async (_ids: number[]): Promise<Record<number, number>> => ({}));
const mockDeleteMany = vi.fn(async (_ids: number[]) => {});

vi.mock('../../src/database', () => ({
  tagRepository: {
    deleteMany: (ids: number[]) => mockDeleteMany(ids),
  },
  transactionRepository: {
    countByTagIdsMap: (ids: number[]) => mockCountByTagIdsMap(ids),
  },
}));

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

const tag = (id: number, name: string, created_at = '2026-01-01 00:00:00'): Tag =>
  ({ id, user_id: 1, name, created_at }) as Tag;

describe('TagsScreen', () => {
  beforeEach(() => {
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    resetStub();
    mockCountByTagIdsMap.mockReset().mockResolvedValue({});
    mockDeleteMany.mockReset().mockResolvedValue(undefined);
    setAppData({ tags: [tag(1, 'Travel')] });
  });

  afterEach(() => {
    setHeaderNode = null;
    resetAppStub();
  });

  it('renders the existing tags and the counter', async () => {
    const view = await render(<TagsScreen />);
    expect(view.getByText('Travel')).toBeTruthy();
    expect(view.getByText('1 of 100 tags')).toBeTruthy();
    expect(view.getByText('Created 1 Jan 2026')).toBeTruthy();
    expect(view.getByText('time-outline', { includeHiddenElements: true })).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.tagsList)).toBeTruthy();
  });

  it('flags the counter once the tag limit is reached', async () => {
    setAppData({ tags: Array.from({ length: MAX_TAGS }, (_, i) => tag(i + 1, `Tag ${i + 1}`)) });
    const view = await render(<TagsScreen />);

    const counter = view.getByText(`${MAX_TAGS} of ${MAX_TAGS} tags`);
    const style = StyleSheet.flatten(counter.props.style) as { color?: string; fontWeight?: string };
    expect(style.color).toBe('#F87171');
    expect(style.fontWeight).toBe('700');
  });

  it('shows an empty state when there are no tags', async () => {
    setAppData({ tags: [] });
    const view = await render(<TagsScreen />);
    expect(view.getByText('No tags yet')).toBeTruthy();
    // The list must be unmounted when empty so no stale scroll area remains.
    expect(view.queryByTestId(TEST_IDS.tagsList)).toBeNull();
  });

  it('opens the modify screen when a tag is pressed', async () => {
    const view = await render(<TagsScreen />);
    fireEvent.press(view.getByText('Travel'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyTag', { tagId: 1 });
  });

  it('shows the usage count under each tag', async () => {
    mockCountByTagIdsMap.mockResolvedValue({ 1: 3 });
    const view = await render(<TagsScreen />);
    await waitFor(() => expect(view.getByText('Used in 3 transactions')).toBeTruthy());
  });

  it('sorts by usage when the Usage field is tapped', async () => {
    setAppData({ tags: [tag(1, 'Alpha'), tag(2, 'Beta')] });
    mockCountByTagIdsMap.mockResolvedValue({ 1: 1, 2: 5 });
    const view = await render(<TagsScreen />);
    await waitFor(() => expect(view.getByText('Used in 5 transactions')).toBeTruthy());

    const order = () => view.getAllByText(/^(Alpha|Beta)$/).map(n => String(n.props.children));
    // Default is Created ascending, ties broken by id.
    expect(order()).toEqual(['Alpha', 'Beta']);

    const ue = userEvent.setup();
    await ue.press(view.getByText('Usage'));
    await waitFor(() => expect(order()).toEqual(['Beta', 'Alpha']));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({
      tagsSortBy: 'usage',
      tagsSortDirection: 'desc',
    });
  });

  it('restores the persisted sort on mount', async () => {
    setAppData({ tags: [tag(1, 'Alpha'), tag(2, 'Beta')] });
    mockCountByTagIdsMap.mockResolvedValue({ 1: 1, 2: 5 });
    setConfig({ tagsSortBy: 'usage', tagsSortDirection: 'desc' });
    const view = await render(<TagsScreen />);
    await waitFor(() => expect(view.getByText('Used in 5 transactions')).toBeTruthy());

    expect(view.getAllByText(/^(Alpha|Beta)$/).map(n => String(n.props.children))).toEqual(['Beta', 'Alpha']);
  });

  it('deletes only selected tags still visible after searching', async () => {
    setAppData({ tags: [tag(1, 'Alpha'), tag(2, 'Beta')] });
    const view = await renderWithHeader();
    await view.findByText('Alpha');

    const ue = userEvent.setup();
    await ue.press(view.getByLabelText('Enter select mode'));
    await ue.press(view.getByText('Alpha'));
    await ue.press(view.getByText('Beta'));
    await waitFor(() => expect(view.getByText('Delete (2)')).toBeTruthy());

    await ue.press(view.getByLabelText('Search'));
    await ue.type(await view.findByPlaceholderText('Search tags'), 'Beta');
    await waitFor(() => expect(view.getByText('Delete (1)')).toBeTruthy());
    await ue.press(view.getByText('Delete (1)'));
    await ue.press(await view.findByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockDeleteMany).toHaveBeenCalledWith([2]));
  });
});
