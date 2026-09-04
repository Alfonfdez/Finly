import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/settings/SettingsScreen';
import type { NavigationProp } from '../../src/constants/types';

const nav = { navigate: vi.fn(), setOptions: vi.fn() };

describe('SettingsScreen', () => {
  beforeEach(() => {
    nav.navigate.mockClear();
    nav.setOptions.mockClear();
  });

  it('renders the settings subsections', async () => {
    const view = await render(<SettingsScreen navigation={nav as unknown as NavigationProp<'Settings'>} />);
    expect(view.getByText('Appearance')).toBeTruthy();
    expect(view.getByText('Regional')).toBeTruthy();
    expect(view.getByText('Personalization')).toBeTruthy();
    expect(view.getByText('Data')).toBeTruthy();
  });

  it('opens the Appearance screen', async () => {
    const view = await render(<SettingsScreen navigation={nav as unknown as NavigationProp<'Settings'>} />);
    fireEvent.press(view.getByText('Appearance'));
    expect(nav.navigate).toHaveBeenCalledWith('SettingsAppearance');
  });
});
