import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CreateTagScreen from '../../src/screens/CreateTagScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Tag } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };

const mockTagExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockTagCreate = vi.fn(async (_data: unknown) => ({ id: 2, user_id: 1, name: 'NewTag' }) as Tag);

vi.mock('../../src/database', () => ({
  tagRepository: {
    existsByName: (userId: number, name: string, excludeId?: number) =>
      mockTagExists(userId, name, excludeId),
    create: (data: unknown) => mockTagCreate(data),
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

describe('CreateTagScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockTagExists.mockClear();
    mockTagCreate.mockClear();
    mockTagExists.mockResolvedValue(false);
    setAppData({ tags: [] });
  });

  afterEach(() => {
    resetAppStub();
    vi.useRealTimers();
  });

  it('renders the name field and disables Create until a name is entered', async () => {
    const view = await render(<CreateTagScreen />);
    expect(view.getByPlaceholderText('Tag name')).toBeTruthy();
    expect(view.getByText('Create')).toBeDisabled();
  });

  it('creates the tag and goes back after the duplicate check passes', async () => {
    vi.useFakeTimers();
    const view = await render(<CreateTagScreen />);
    fireEvent.changeText(view.getByPlaceholderText('Tag name'), 'NewTag');
    await vi.advanceTimersByTimeAsync(300);
    await waitFor(() => {
      expect(view.getByText('Create')).toBeEnabled();
    });
    fireEvent.press(view.getByText('Create'));
    await waitFor(() => expect(mockTagCreate).toHaveBeenCalledTimes(1));
    expect(mockTagCreate).toHaveBeenCalledWith({ user_id: 1, name: 'NewTag' });
    expect(nav.goBack).toHaveBeenCalled();
  });
});
