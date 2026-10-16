import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, userEvent, waitFor, fireEvent, within } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import ModifyTagScreen from '../../src/screens/ModifyTagScreen';
import { TEST_IDS } from '../../src/constants/testIds';
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
    await ue.press(view.getByTestId(TEST_IDS.formDelete));
    const confirm = await view.findByRole('button', { name: 'Delete' });
    await ue.press(confirm);
    await waitFor(() => expect(mockTagDelete).toHaveBeenCalledWith(1));
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('shows the empty-name hint in the slot above Save and reddens the field once touched', async () => {
    const view = await render(<ModifyTagScreen />);
    const input = await view.findByDisplayValue('Travel');

    expect(within(view.getByTestId(TEST_IDS.formHintSlot)).queryByText(/./)).toBeNull();

    await fireEvent.changeText(input, '');
    expect(within(view.getByTestId(TEST_IDS.formHintSlot)).getByText('Enter a tag name')).toBeTruthy();
    expect(StyleSheet.flatten(input.props.style).borderColor).toBe('#F87171');
  });

  it('keeps Save disabled until the name actually changes', async () => {
    const view = await render(<ModifyTagScreen />);
    const input = await view.findByDisplayValue('Travel');

    expect(view.getByText('Save')).toBeDisabled();

    await fireEvent.changeText(input, 'Travels');
    await waitFor(() => expect(view.getByText('Save')).toBeEnabled());

    await fireEvent.changeText(input, 'Travel');
    await waitFor(() => expect(view.getByText('Save')).toBeDisabled());
  });
});
