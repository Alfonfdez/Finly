import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import { resetStub } from './helpers/configStub';
import ClearButton from '../../src/components/ClearButton';

describe('ClearButton', () => {
  beforeEach(() => {
    resetStub();
  });

  it('renders the close-circle icon', async () => {
    const view = await render(<ClearButton onPress={() => {}} accessibilityLabel="Clear" />);
    expect(view.getByText('close-circle')).toBeTruthy();
  });

  it('fires onPress when tapped', async () => {
    const onPress = vi.fn();
    const view = await render(<ClearButton onPress={onPress} accessibilityLabel="Clear" />);
    await fireEvent.press(view.getByText('close-circle'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the icon (reserved slot) but is inert when not visible', async () => {
    const onPress = vi.fn();
    const view = await render(<ClearButton onPress={onPress} accessibilityLabel="Clear" visible={false} />);
    const icon = view.getByText('close-circle', { includeHiddenElements: true });
    expect(icon).toBeTruthy();
    await fireEvent.press(icon);
    expect(onPress).not.toHaveBeenCalled();
  });
});
