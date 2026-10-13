import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, userEvent } from '@testing-library/react-native';
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
    expect(view.getAllByText('Add transaction screen').length).toBeGreaterThan(0);
    expect(view.getAllByText('Recurring screen').length).toBeGreaterThan(0);
    expect(view.getAllByText('Default account').length).toBeGreaterThan(0);
    expect(view.getAllByText('Default period').length).toBeGreaterThan(0);
    expect(view.getByText('Hide account balances')).toBeTruthy();
    // Labels/Comments appear in both the Add transaction and the Recurring cards; Photo only in Add.
    expect(view.getAllByText('Labels')).toHaveLength(2);
    expect(view.getAllByText('Comments')).toHaveLength(2);
    expect(view.getAllByText('Photo')).toHaveLength(1);
    expect(view.getAllByRole('checkbox')).toHaveLength(5);
  });

  it('toggles the recurring optional fields', async () => {
    const view = await render(<PersonalizationScreen />);
    const boxes = view.getAllByRole('checkbox'); // Add: Labels, Comments, Photo — Recurring: Labels, Comments
    const ue = userEvent.setup();
    await ue.press(boxes[3]);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ recurringShowLabels: false });
    await ue.press(boxes[4]);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ recurringShowComments: false });
  });

  it('toggles hide balances', async () => {
    const view = await render(<PersonalizationScreen />);
    fireEvent(view.getByRole('switch', { name: 'Hide account balances' }), 'valueChange', true);
    expect(getConfigStub().updateConfig).toHaveBeenCalledWith({ hideBalances: true });
  });
});
