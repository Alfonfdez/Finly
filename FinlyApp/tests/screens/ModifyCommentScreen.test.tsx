import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import ModifyCommentScreen from '../../src/screens/ModifyCommentScreen';

const nav = { setOptions: vi.fn(), navigate: vi.fn(), goBack: vi.fn() };
const routeParams: Record<string, unknown> = { comment: 'Coffee' };

const mockCountByDescription = vi.fn(async (_description: string) => 0);
const mockUpdateComment = vi.fn(async (_from: string, _to: string) => {});
const mockDeleteComment = vi.fn(async (_comment: string) => {});

vi.mock('../../src/database', () => ({
  transactionRepository: {
    countByDescription: (description: string) => mockCountByDescription(description),
    updateComment: (from: string, to: string) => mockUpdateComment(from, to),
    deleteComment: (comment: string) => mockDeleteComment(comment),
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

describe('ModifyCommentScreen', () => {
  beforeEach(() => {
    nav.goBack.mockClear();
    mockCountByDescription.mockReset().mockResolvedValue(0);
    mockUpdateComment.mockClear();
    mockDeleteComment.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('preloads the comment and keeps Save disabled while unchanged', async () => {
    const view = await render(<ModifyCommentScreen />);
    expect(mockCountByDescription).toHaveBeenCalledWith('Coffee');
    const input = view.getByPlaceholderText('Comment');
    expect(input.props.value).toBe('Coffee');
    expect(view.getByText('Save')).toBeDisabled();
  });

  it('enables Save once the comment is edited and saves the new value', async () => {
    const view = await render(<ModifyCommentScreen />);
    const input = view.getByPlaceholderText('Comment');
    await fireEvent.changeText(input, 'Coffee with milk');
    expect(view.getByText('Save')).toBeEnabled();

    await fireEvent.press(view.getByText('Save'));
    expect(mockUpdateComment).toHaveBeenCalledWith('Coffee', 'Coffee with milk');
    expect(nav.goBack).toHaveBeenCalled();
  });

  it('opens the delete confirmation and deletes the comment', async () => {
    const view = await render(<ModifyCommentScreen />);
    await fireEvent.press(view.getByText('Delete comment'));
    await fireEvent.press(view.getByText('Delete'));

    expect(mockDeleteComment).toHaveBeenCalledWith('Coffee');
    expect(nav.goBack).toHaveBeenCalled();
  });
});