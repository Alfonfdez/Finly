import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import TagsScreen from '../../src/screens/TagsScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Tag } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn() };

vi.mock('../../src/database', () => ({
  tagRepository: {},
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

const tag: Tag = { id: 1, user_id: 1, name: 'Travel' } as Tag;

describe('TagsScreen', () => {
  beforeEach(() => {
    nav.setOptions.mockClear();
    nav.navigate.mockClear();
    setAppData({ tags: [tag] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('renders the existing tags and the counter', async () => {
    const view = await render(<TagsScreen />);
    expect(view.getByText('Travel')).toBeTruthy();
    expect(view.getByText('1 of 50 tags')).toBeTruthy();
  });

  it('shows an empty state when there are no tags', async () => {
    setAppData({ tags: [] });
    const view = await render(<TagsScreen />);
    expect(view.getByText('No tags yet')).toBeTruthy();
  });

  it('opens the modify screen when a tag is pressed', async () => {
    const view = await render(<TagsScreen />);
    fireEvent.press(view.getByText('Travel'));
    expect(nav.navigate).toHaveBeenCalledWith('ModifyTag', { tagId: 1 });
  });
});
