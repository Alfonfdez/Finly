import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StyleSheet } from 'react-native';
import { render, fireEvent, act } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import { DEBOUNCE_MS } from '../../src/constants/types';
import CommentInput from '../../src/components/CommentInput';
import { transactionRepository } from '../../src/database';

vi.mock('../../src/database', () => ({
  transactionRepository: {
    searchComments: vi.fn(),
  },
}));

const mockedSearchComments = vi.mocked(transactionRepository.searchComments);

async function renderInput(
  comment: string,
  onChange = vi.fn(),
  callbacks: { onFocus?: () => void; onBlur?: () => void } = {},
) {
  return await render(
    <CommentInput
      comment={comment}
      onChange={onChange}
      onFocus={callbacks.onFocus}
      onBlur={callbacks.onBlur}
    />,
  );
}

async function flushDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(DEBOUNCE_MS);
  });
}

async function focusInput(view: Awaited<ReturnType<typeof renderInput>>) {
  await act(async () => {
    fireEvent(view.getByLabelText('Comment input'), 'focus');
  });
}

describe('CommentInput', () => {
  beforeEach(() => {
    resetStub();
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    mockedSearchComments.mockReset();
    mockedSearchComments.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not search on mount with a pre-filled comment before focus', async () => {
    await renderInput('coffee');
    await flushDebounce();
    expect(mockedSearchComments).not.toHaveBeenCalled();
  });

  it('does not search while the trimmed comment is below the minimum length', async () => {
    await renderInput('a');
    await flushDebounce();
    expect(mockedSearchComments).not.toHaveBeenCalled();
  });

  it('ignores whitespace-only comments', async () => {
    await renderInput('   ');
    await flushDebounce();
    expect(mockedSearchComments).not.toHaveBeenCalled();
  });

  it('searches once the trimmed comment reaches the minimum length', async () => {
    const view = await renderInput('co');
    await focusInput(view);
    await flushDebounce();
    expect(mockedSearchComments).toHaveBeenCalledTimes(1);
    expect(mockedSearchComments).toHaveBeenCalledWith('co');
  });

  it('searches with the trimmed term', async () => {
    const view = await renderInput('  coff  ');
    await focusInput(view);
    await flushDebounce();
    expect(mockedSearchComments).toHaveBeenCalledWith('coff');
  });

  it('shows existing comments as suggestions after the debounce', async () => {
    mockedSearchComments.mockResolvedValue(['coffee', 'coffee shop']);
    const view = await renderInput('coff');
    expect(view.queryByText('coffee')).toBeNull();
    await focusInput(view);
    await flushDebounce();
    expect(view.getByText('Suggestions')).toBeTruthy();
    expect(view.getByText('Tap to reuse')).toBeTruthy();
    const suggestion = view.getByRole('button', { name: 'coffee' });
    expect(suggestion.props.accessibilityHint).toBe('Tap to reuse');
    expect(StyleSheet.flatten(suggestion.props.style).minHeight).toBe(44);
    expect(view.getByText('coffee shop')).toBeTruthy();
  });

  it('does not reopen suggestions when the debounce fires after blur', async () => {
    mockedSearchComments.mockResolvedValue(['coffee']);
    const view = await renderInput('cof');

    await focusInput(view);
    await act(async () => { fireEvent(view.getByLabelText('Comment input'), 'blur'); });
    await flushDebounce();

    expect(view.queryByText('coffee')).toBeNull();
  });

  it('selecting a suggestion fills the comment and clears the suggestions', async () => {
    mockedSearchComments.mockResolvedValue(['coffee', 'coffee shop']);
    const onChange = vi.fn();
    const view = await renderInput('cof', onChange);
    await focusInput(view);
    await flushDebounce();

    await act(async () => { fireEvent.press(view.getByText('coffee')); });
    expect(onChange).toHaveBeenCalledWith('coffee');
    expect(view.queryByText('coffee')).toBeNull();
    expect(view.queryByText('coffee shop')).toBeNull();
  });

  it('selects a suggestion on web when the input blurs on mousedown', async () => {
    mockedSearchComments.mockResolvedValue(['coffee']);
    const onChange = vi.fn();
    const view = await renderInput('cof', onChange);
    await focusInput(view);
    await flushDebounce();

    const suggestion = view.getByText('coffee');
    await act(async () => { fireEvent(suggestion, 'pressIn'); });
    await act(async () => { fireEvent(view.getByLabelText('Comment input'), 'blur'); });
    await act(async () => { fireEvent.press(suggestion); });
    expect(onChange).toHaveBeenCalledWith('coffee');
    expect(view.queryByText('coffee')).toBeNull();
  });

  it('keeps a suggestion tap from committing blur, then commits a later real blur', async () => {
    mockedSearchComments.mockResolvedValue(['coffee']);
    const onBlur = vi.fn();
    const view = await renderInput('cof', vi.fn(), { onBlur });
    await focusInput(view);
    await flushDebounce();

    const input = view.getByLabelText('Comment input');
    const suggestion = view.getByText('coffee');
    await act(async () => { fireEvent(suggestion, 'pressIn'); });
    await act(async () => { fireEvent(input, 'blur'); });
    await act(async () => { fireEvent.press(suggestion); });
    expect(onBlur).not.toHaveBeenCalled();

    await act(async () => { vi.advanceTimersByTime(0); });
    await act(async () => { fireEvent(input, 'blur'); });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('does not clip a legacy comment above the maximum', async () => {
    const comment = 'x'.repeat(4097);
    const view = await renderInput(comment);

    expect(view.getByLabelText('Comment input').props.maxLength).toBe(4097);
    expect(view.getByText('4097/4096')).toBeTruthy();
  });

  it('renders the character counter and the accessibility label', async () => {
    const view = await renderInput('hi');
    expect(view.getByText('2/4096')).toBeTruthy();
    expect(view.getByLabelText('Comment input')).toBeTruthy();
  });
});
