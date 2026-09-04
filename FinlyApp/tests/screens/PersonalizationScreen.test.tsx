import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import PersonalizationScreen from '../../src/screens/settings/PersonalizationScreen';
import { buildAppMock, resetAppStub } from '../component/helpers/appStub';
import { getConfigStub, resetStub } from '../component/helpers/configStub';

vi.mock('../../src/context/AppContext', () => ({
  useApp: () => buildAppMock(),
  AppProvider: ({ children }: { children: ReactNode }) => children as ReactNode,
}));

describe('PersonalizationScreen', () => {
  beforeEach(() => {
    resetStub();
  });

  afterEach(() => {
    resetStub();
    resetAppStub();
  });

  it('renders personalization and privacy options', async () => {
    const view = await render(<PersonalizationScreen />);
    expect(view.getAllByText('Home screen').length).toBeGreaterThan(0);
    expect(view.getAllByText('Default account').length).toBeGreaterThan(0);
    expect(view.getAllByText('Default period').length).toBeGreaterThan(0);
    expect(view.getByText('Hide account balances')).toBeTruthy();
    expect(view.getByText('Labels')).toBeTruthy();
    expect(view.getByText('Comments')).toBeTruthy();
    expect(view.getByText('Photo')).toBeTruthy();
  });

  it('toggles hide balances', async () => {
    const view = await render(<PersonalizationScreen />);
    fireEvent.press(view.getByLabelText('Hide account balances'));
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ hideBalances: true });
  });
});
