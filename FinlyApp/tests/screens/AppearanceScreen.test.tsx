import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import AppearanceScreen from '../../src/screens/settings/AppearanceScreen';
import { getConfigStub, resetStub } from '../component/helpers/configStub';

describe('AppearanceScreen', () => {
  beforeEach(() => {
    resetStub();
  });

  afterEach(() => {
    resetStub();
  });

  it('renders theme and text size options', async () => {
    const view = await render(<AppearanceScreen />);
    expect(view.getByText('Theme')).toBeTruthy();
    expect(view.getByText('Dark')).toBeTruthy();
    expect(view.getByText('Light')).toBeTruthy();
    expect(view.getByText('System')).toBeTruthy();
    expect(view.getByText('Text size')).toBeTruthy();
  });

  it('selects the light theme', async () => {
    const view = await render(<AppearanceScreen />);
    fireEvent.press(view.getByText('Light'));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ theme: 'light' });
  });
});
