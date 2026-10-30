import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react-native';
import LoadErrorState from '../../src/components/LoadErrorState';

describe('LoadErrorState', () => {
  it('renders the shared error copy and retries', async () => {
    const onRetry = vi.fn();
    const view = await render(<LoadErrorState onRetry={onRetry} />);

    expect(view.getByText('Error')).toBeTruthy();
    expect(view.getByText('Something went wrong. Please try again.')).toBeTruthy();
    await fireEvent.press(view.getByText('Try again'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
