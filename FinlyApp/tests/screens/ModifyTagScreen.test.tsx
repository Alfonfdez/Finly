import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, userEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyTagScreen from '../../src/screens/ModifyTagScreen';
import { buildAppMock, setAppData, resetAppStub } from '../component/helpers/appStub';
import type { Tag } from '../../src/database/types';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = { tagId: 1 };

const mockTagExists = vi.fn(async (_userId: number, name: string, _excludeId?: number) => false);
const mockTagDelete = vi.fn(async (_id: number) => {});

vi.mock('../../src/database', () => ({
  tagRepository: {
    existsByName: (userId: number, name: string, excludeId?: number) =>
      mockTagExists(userId, name, excludeId),
    delete: (id: number) => mockTagDelete(id),
  },
}));

vi.mock('@react-navigation/native', async () => {
  const React = await import('react');
  return {
    useNavigation: () => nav,
    useRoute: () => ({ params: routeParams }),
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

describe('ModifyTagScreen', () => {
  const ue = userEvent.setup();

  beforeEach(() => {
    nav.goBack.mockClear();
    mockTagDelete.mockClear();
    setAppData({ tags: [tag] });
  });

  afterEach(() => {
    resetAppStub();
  });

  it('preloads the tag name into the field', async () => {
    const view = await render(<ModifyTagScreen />);
    expect(view.getByDisplayValue('Travel')).toBeTruthy();
  });

  it('deletes the tag after confirmation and goes back', async () => {
    const view = await render(<ModifyTagScreen />);
    await ue.press(view.getByText('Delete tag'));
    const confirm = await view.findByRole('button', { name: 'Delete' });
    await ue.press(confirm);
    await waitFor(() => expect(mockTagDelete).toHaveBeenCalledWith(1));
    expect(nav.goBack).toHaveBeenCalled();
  });
});
