import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import TagsScreen from '../../src/screens/TagsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
import type { Tag } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn() };

const mockCountByTagIdsMap = vi.fn(async (_ids: number[]): Promise<Record<number, number>> => ({}));

vi.mock('../../src/database', () => ({
  tagRepository: {},
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
    mockCountByTagIdsMap.mockReset().mockResolvedValue({});
    setAppData({ tags: [tag(1, 'Travel')] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the existing tags and the counter', async () => {
    const view = await render(<TagsScreen />);
    expect(view.getByText('Travel')).toBeTruthy();
    expect(view.getByText('1 of 100 tags')).toBeTruthy();
    expect(view.getByText('Created 1 Jan 2026')).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.tagsList)).toBeTruthy();
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
  });
});
