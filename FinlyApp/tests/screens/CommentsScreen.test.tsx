import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CommentsScreen from '../../src/screens/CommentsScreen';
import { buildAppMock, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub } from '../component/helpers/configStub';
import { TEST_IDS } from '../../src/constants/testIds';

const getDistinctComments = vi.fn(async () => [] as { description: string; count: number; lastUsed: string }[]);

vi.mock('../../src/database', () => ({
  transactionRepository: {
    getDistinctComments: () => getDistinctComments(),
  },
}));

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

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

describe('CommentsScreen', () => {
  beforeEach(() => {
    getDistinctComments.mockReset().mockResolvedValue([]);
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    resetStub();
  });

  afterEach(() => {
    resetAppStub();
  });

  it('shows an empty state when there are no comments', async () => {
    const view = await render(<CommentsScreen />);
    expect(await view.findByText('No comments yet')).toBeTruthy();
    expect(view.getByText('0 comments')).toBeTruthy();
    // The list must be unmounted when empty so no stale scroll area remains.
    expect(view.queryByTestId(TEST_IDS.commentsList)).toBeNull();
  });

  it('lists loaded comments with their usage count', async () => {
    getDistinctComments.mockResolvedValue([{ description: 'Coffee', count: 2, lastUsed: '2026-09-22' }]);
    const view = await render(<CommentsScreen />);
    expect(await view.findByText('Coffee')).toBeTruthy();
    expect(view.getByText('Used in 2 transactions')).toBeTruthy();
    expect(view.getByTestId(TEST_IDS.commentsList)).toBeTruthy();
  });

  it('shows when each comment was last used', async () => {
    getDistinctComments.mockResolvedValue([{ description: 'Coffee', count: 2, lastUsed: '2026-09-22' }]);
    const view = await render(<CommentsScreen />);
    expect(await view.findByText('Last used 22 Sep 2026')).toBeTruthy();
  });

  it('sorts by usage when the Usage field is tapped', async () => {
    getDistinctComments.mockResolvedValue([
      { description: 'Alpha', count: 1, lastUsed: '2026-09-01' },
      { description: 'Beta', count: 5, lastUsed: '2026-09-02' },
    ]);
    const view = await render(<CommentsScreen />);
    await view.findByText('Alpha');
    expect(view.getByText('Alpha').props.numberOfLines).toBe(2);

    const order = () => view.getAllByText(/^(Alpha|Beta)$/).map(n => String(n.props.children));
    expect(order()).toEqual(['Alpha', 'Beta']); // default: name ascending

    const ue = userEvent.setup();
    await ue.press(view.getByText('Usage'));
    await waitFor(() => expect(order()).toEqual(['Beta', 'Alpha']));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({
      commentsSortBy: 'usage',
      commentsSortDirection: 'desc',
    });
  });

  it('opens the modify screen when a comment is pressed', async () => {
    getDistinctComments.mockResolvedValue([{ description: 'Coffee', count: 2, lastUsed: '2026-09-22' }]);
    const view = await render(<CommentsScreen />);
    await view.findByText('Coffee');
    fireEvent.press(view.getByText('Coffee'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyComment', { comment: 'Coffee' });
  });
});
