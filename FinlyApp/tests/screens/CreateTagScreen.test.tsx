import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import CreateTagScreen from '../../src/screens/CreateTagScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import { TEST_IDS } from '../../src/constants/testIds';
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

  it('shows the empty-name hint without painting the fresh field red', async () => {
    const view = await render(<CreateTagScreen />);

    expect(view.getByText('Enter a tag name')).toBeTruthy();
    expect(StyleSheet.flatten(view.getByPlaceholderText('Tag name').props.style).borderColor).toBe('#334155');
  });

  it('reserves the hint band so Create never moves', async () => {
    const view = await render(<CreateTagScreen />);

    const slot = view.getByTestId(TEST_IDS.formHintSlot);
    expect(StyleSheet.flatten(slot.props.style).minHeight).toBeGreaterThan(0);
    expect(view.queryByTestId(TEST_IDS.formMutedSlot)).toBeNull();
  });

  it('reddens the field once the user leaves it empty', async () => {
    const view = await render(<CreateTagScreen />);
    const input = view.getByPlaceholderText('Tag name');

    await fireEvent.changeText(input, 'x');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#334155');

    await fireEvent.changeText(input, '');
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#F87171');
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

  it('does not create twice on a rapid double press', async () => {
    const view = await render(<CreateTagScreen />);
    fireEvent.changeText(view.getByPlaceholderText('Tag name'), 'NewTag');
    await waitFor(() => expect(view.getByText('Create')).toBeEnabled());

    let release!: () => void;
    mockTagCreate.mockImplementationOnce(() => new Promise<Tag>((resolve) => {
      release = () => resolve({ id: 2, user_id: 1, name: 'NewTag', created_at: '2026-01-01' });
    }));

    fireEvent.press(view.getByText('Create'));
    fireEvent.press(view.getByText('Create'));
    release();
    await waitFor(() => expect(mockTagCreate).toHaveBeenCalledTimes(1));
    expect(nav.goBack).toHaveBeenCalledTimes(1);
  });
});
