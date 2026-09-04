import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CommentsScreen from '../../src/screens/CommentsScreen';
import { buildAppMock, resetAppStub } from '../component/helpers/appStub';

const getDistinctComments = vi.fn(async () => [] as { description: string; count: number }[]);

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
  });

  afterEach(() => {
    resetAppStub();
  });

  it('shows an empty state when there are no comments', async () => {
    const view = await render(<CommentsScreen />);
    expect(await view.findByText('No comments yet')).toBeTruthy();
  });

  it('lists loaded comments with their usage count', async () => {
    getDistinctComments.mockResolvedValue([{ description: 'Coffee', count: 2 }]);
    const view = await render(<CommentsScreen />);
    expect(await view.findByText('Coffee')).toBeTruthy();
    expect(view.getByText('Used in 2 transactions')).toBeTruthy();
  });

  it('opens the modify screen when a comment is pressed', async () => {
    getDistinctComments.mockResolvedValue([{ description: 'Coffee', count: 2 }]);
    const view = await render(<CommentsScreen />);
    await view.findByText('Coffee');
    fireEvent.press(view.getByText('Coffee'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyComment', { comment: 'Coffee' });
  });
});
